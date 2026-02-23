import type { BBox, Feature, FeatureCollection } from 'geojson';

export function polygonFeatures(fc: FeatureCollection): Feature[] {
  const out: Feature[] = [];
  for (const f of fc.features ?? []) {
    const geometry = f?.geometry;
    if (!geometry) continue;
    if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') out.push(f);
  }
  return out;
}

export function bboxesOverlap(aBbox: BBox, bBbox: BBox): boolean {
  return !(
    aBbox[2] < bBbox[0] ||
    aBbox[0] > bBbox[2] ||
    aBbox[3] < bBbox[1] ||
    aBbox[1] > bBbox[3]
  );
}

export const EMPTY_FC: FeatureCollection = { type: 'FeatureCollection', features: [] };
