export type FeatureCollection = { type: 'FeatureCollection'; features: any[] };

export const EMPTY_FC: FeatureCollection = { type: 'FeatureCollection', features: [] };

export function validateGeoJson(data: unknown): { ok: true } | { ok: false; message: string } {
  if (!data || typeof data !== 'object') return { ok: false, message: 'Not an object.' };

  const t = (data as any).type;

  if (t === 'FeatureCollection') {
    if (!Array.isArray((data as any).features)) {
      return { ok: false, message: 'FeatureCollection.features must be an array.' };
    }
    return { ok: true };
  }

  if (t === 'Feature') {
    if (!('geometry' in (data as any)))
      return { ok: false, message: 'Feature.geometry is missing.' };
    return { ok: true };
  }

  const allowedGeom = new Set([
    'Point',
    'MultiPoint',
    'LineString',
    'MultiLineString',
    'Polygon',
    'MultiPolygon',
    'GeometryCollection'
  ]);

  if (typeof t === 'string' && allowedGeom.has(t)) {
    if (t !== 'GeometryCollection' && !('coordinates' in (data as any))) {
      return { ok: false, message: `Geometry of type ${t} is missing coordinates.` };
    }
    return { ok: true };
  }

  return { ok: false, message: `Unknown GeoJSON type: ${String(t)}` };
}
