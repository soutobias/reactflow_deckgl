'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { GeoJsonLayer } from '@deck.gl/layers';
import { MapboxOverlay } from '@deck.gl/mapbox';
import type { PickingInfo } from '@deck.gl/core';

import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';
import { setLayers } from '@/store/layersSlice';

import { Backdrop, Box, CircularProgress, Typography } from '@mui/material';

import { loadReactflowDiagram } from '@/components/reactflowDiagram/_actions/persistence';
import { deriveLayers } from '@/components/reactflowDiagram/_actions/deriveLayers';

import { EMPTY_FC, FeatureCollection, validateGeoJson } from './_actions/validateGeoJson';

import ErrorDialog from './ErrorDialog';
import { renderTooltipContent } from './_actions/renderTooltip';
import { isValidUrl } from '../reactflowDiagram/nodes/SourceNode';

export default function DeckMap() {
  const dispatch = useDispatch<AppDispatch>();
  const renderLayers = useSelector((s: RootState) => s.layers.layers);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const mapRef = useRef<maplibregl.Map | null>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [pendingLoads, setPendingLoads] = useState(0);

  const [badUrls, setBadUrls] = useState<string[]>([]);
  const [errorOpen, setErrorOpen] = useState(false);

  const dataPromiseCacheRef = useRef<Map<string, Promise<FeatureCollection>>>(new Map());
  const lastUrlRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (renderLayers.length > 0) return;
    const saved = loadReactflowDiagram();
    if (!saved) return;
    const derived = deriveLayers(saved.nodes, saved.edges);
    dispatch(setLayers(derived));
  }, [dispatch, renderLayers.length]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [0, 20],
      zoom: 2
    });

    const overlay = new MapboxOverlay({
      layers: [],
      getTooltip: undefined,
      onHover: (info: PickingInfo) => {
        const el = tooltipRef.current;
        if (!el) return;

        if (info.object && typeof info.x === 'number' && typeof info.y === 'number') {
          const props = (info.object as any)?.properties ?? {};

          el.style.display = 'block';
          el.style.left = `${info.x + 10}px`;
          el.style.top = `${info.y + 10}px`;

          renderTooltipContent(el, props);
        } else {
          el.style.display = 'none';
        }
      }
    });

    map.on('load', () => setMapReady(true));
    map.addControl(overlay);

    mapRef.current = map;
    overlayRef.current = overlay;

    return () => {
      overlay.finalize();
      map.remove();
      overlayRef.current = null;
      mapRef.current = null;
      setMapReady(false);
    };
  }, []);

  useEffect(() => {
    const ids = new Set(renderLayers.map(l => l.id));
    for (const key of dataPromiseCacheRef.current.keys()) {
      const id = key.split('::')[0];
      if (!ids.has(id)) dataPromiseCacheRef.current.delete(key);
    }
  }, [renderLayers]);

  const addBadUrl = useCallback((url: string) => {
    if (!url) return;
    setBadUrls(prev => {
      if (prev.includes(url)) return prev;
      const next = [...prev, url];
      setErrorOpen(true);
      return next;
    });
  }, []);

  const removeBadUrl = useCallback((url: string) => {
    setBadUrls(prev => prev.filter(u => u !== url));
  }, []);

  useEffect(() => {
    if (badUrls.length === 0) setErrorOpen(false);
  }, [badUrls.length]);

  const getLayerDataPromise = useCallback(
    (layerId: string, urlRaw: string): Promise<FeatureCollection> => {
      const url = (urlRaw ?? '').trim();

      const last = lastUrlRef.current.get(layerId);
      if (last !== undefined && last !== url) {
        dataPromiseCacheRef.current.delete(`${layerId}::${last}`);
        removeBadUrl(last);
      }
      lastUrlRef.current.set(layerId, url);

      const cacheKey = `${layerId}::${url}`;
      const cached = dataPromiseCacheRef.current.get(cacheKey);
      if (cached) return cached;

      const promise = (async () => {
        setPendingLoads(n => n + 1);
        try {
          if (!url) return EMPTY_FC;

          if (!isValidUrl(url)) {
            addBadUrl(url);
            return EMPTY_FC;
          }

          const absolute = new URL(url, window.location.href).toString();
          const res = await fetch(absolute);

          if (!res.ok) {
            addBadUrl(url);
            return EMPTY_FC;
          }

          let json: unknown;
          try {
            json = await res.json();
          } catch {
            addBadUrl(url);
            return EMPTY_FC;
          }

          const validity = validateGeoJson(json);
          if (!validity.ok) {
            addBadUrl(url);
            return EMPTY_FC;
          }

          removeBadUrl(url);
          return json as FeatureCollection;
        } catch {
          addBadUrl(url);
          return EMPTY_FC;
        } finally {
          setPendingLoads(n => Math.max(0, n - 1));
        }
      })();

      dataPromiseCacheRef.current.set(cacheKey, promise);
      return promise;
    },
    [addBadUrl, removeBadUrl]
  );

  const deckLayers = useMemo(() => {
    const sorted = [...renderLayers].sort((a, b) => a.order - b.order);

    return sorted.map(layer => {
      return new GeoJsonLayer({
        id: `geojson-${layer.id}`,
        data: getLayerDataPromise(layer.id, layer.url),
        pickable: true,
        filled: true,
        stroked: true,
        autoHighlight: true,
        pointRadiusMinPixels: 3,
        lineWidthMinPixels: 1
      });
    });
  }, [renderLayers, getLayerDataPromise]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    overlay.setProps({ layers: deckLayers });
  }, [deckLayers]);

  const loadingOpen =
    !mapReady || (pendingLoads > 0 && renderLayers.some(layer => layer.url?.trim()));

  return (
    <div style={{ position: 'relative', height: '100%' }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0 }} />

      <div
        ref={tooltipRef}
        style={{
          position: 'absolute',
          display: 'none',
          pointerEvents: 'none',
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '12px',
          padding: '10px',
          maxWidth: '360px',
          fontSize: '12px',
          whiteSpace: 'pre-wrap'
        }}
      />

      <Backdrop open={loadingOpen} sx={{ zIndex: theme => theme.zIndex.modal + 1 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <CircularProgress />
          <Typography color="white">
            {!mapReady ? 'Loading map…' : `Loading layers… (${pendingLoads})`}
          </Typography>
        </Box>
      </Backdrop>

      <ErrorDialog open={errorOpen} urls={badUrls} onClose={() => setErrorOpen(false)} />
    </div>
  );
}
