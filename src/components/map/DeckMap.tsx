'use client';

import 'maplibre-gl/dist/maplibre-gl.css';

import type { PickingInfo } from '@deck.gl/core';
import { GeoJsonLayer } from '@deck.gl/layers';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { Backdrop, Box, CircularProgress, Typography } from '@mui/material';
import bbox from '@turf/bbox';
import { featureCollection } from '@turf/helpers';
import intersect from '@turf/intersect';
import type { Feature, FeatureCollection, GeoJsonProperties, MultiPolygon, Polygon } from 'geojson';
import type { BBox } from 'geojson';
import maplibregl from 'maplibre-gl';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { deriveLayers } from '@/components/reactflowDiagram/_actions/deriveLayers';
import { loadReactflowDiagram } from '@/components/reactflowDiagram/_actions/persistence';
import type { AppDispatch, RootState } from '@/store';
import { setLayers } from '@/store/layersSlice';

import { isValidUrl } from '../reactflowDiagram/nodes/SourceNode';
import { bboxesOverlap, EMPTY_FC, polygonFeatures } from './_actions/helpers';
import { renderTooltipContent } from './_actions/renderTooltip';
import ErrorDialog from './ErrorDialog';
import { MapContainer, MapWrapper, Tooltip } from './styles';

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
  const intersectionPromiseCacheRef = useRef<Map<string, Promise<FeatureCollection>>>(new Map());
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
          const props = info.object?.properties ?? {};

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
    for (const key of intersectionPromiseCacheRef.current.keys()) {
      const id = key.split('::')[0];
      if (!ids.has(id)) intersectionPromiseCacheRef.current.delete(key);
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

  const getIntersectionDataPromise = useCallback(
    (layerId: string, aUrl: string, bUrl: string): Promise<FeatureCollection> => {
      const a = (aUrl ?? '').trim();
      const b = (bUrl ?? '').trim();

      const key = `${layerId}::${a}||${b}`;
      const cached = intersectionPromiseCacheRef.current.get(key);
      if (cached) return cached;

      const promise = (async () => {
        const [aData, bData] = await Promise.all([
          getLayerDataPromise(`${layerId}-a`, a),
          getLayerDataPromise(`${layerId}-b`, b)
        ]);

        const aPolys = polygonFeatures(aData);
        const bPolys = polygonFeatures(bData);

        if (aPolys.length === 0 || bPolys.length === 0) return EMPTY_FC;

        const aItems = aPolys.map(feature => ({ feature, bb: bbox(feature) as BBox }));
        const bItems = bPolys.map(feature => ({ feature, bb: bbox(feature) as BBox }));

        const outFeatures: Feature[] = [];

        for (const aItem of aItems) {
          for (const bItem of bItems) {
            if (!bboxesOverlap(aItem.bb, bItem.bb)) continue;

            try {
              const out = intersect(
                featureCollection([
                  aItem.feature as Feature<Polygon | MultiPolygon, GeoJsonProperties>,
                  bItem.feature as Feature<Polygon | MultiPolygon, GeoJsonProperties>
                ])
              ) as Feature | null;

              if (out) outFeatures.push(out);
            } catch (err) {
              console.warn('[intersection] turf intersect failed', { layerId, err });
            }
          }
        }

        return outFeatures.length
          ? ({ type: 'FeatureCollection', features: outFeatures } as FeatureCollection)
          : EMPTY_FC;
      })();

      intersectionPromiseCacheRef.current.set(key, promise);
      return promise;
    },
    [getLayerDataPromise]
  );

  const deckLayers = useMemo(() => {
    const sorted = [...renderLayers].sort((a, b) => a.order - b.order);

    return sorted.map(layer => {
      const data =
        layer.kind === 'source'
          ? getLayerDataPromise(layer.id, layer.url)
          : getIntersectionDataPromise(layer.id, layer.a.url, layer.b.url);

      return new GeoJsonLayer({
        id: `geojson-${layer.id}`,
        data,
        pickable: true,
        filled: true,
        stroked: true,
        autoHighlight: true,
        pointRadiusMinPixels: 3,
        lineWidthMinPixels: 1
      });
    });
  }, [renderLayers, getLayerDataPromise, getIntersectionDataPromise]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;
    overlay.setProps({ layers: deckLayers });
  }, [deckLayers]);

  const anyHasData = renderLayers.some(layer =>
    layer.kind === 'source' ? layer.url.trim() : layer.a.url.trim() || layer.b.url.trim()
  );

  const loadingOpen = !mapReady || (pendingLoads > 0 && anyHasData);

  return (
    <MapWrapper>
      <MapContainer ref={containerRef} />
      <Tooltip ref={tooltipRef} />

      <Backdrop open={loadingOpen} sx={{ zIndex: theme => theme.zIndex.modal + 1 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <CircularProgress />
          <Typography color="white">
            {!mapReady ? 'Loading map…' : `Loading layers… (${pendingLoads})`}
          </Typography>
        </Box>
      </Backdrop>

      <ErrorDialog open={errorOpen} urls={badUrls} onClose={() => setErrorOpen(false)} />
    </MapWrapper>
  );
}
