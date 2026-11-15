import * as THREE from 'three';
import { geoMercator } from 'd3-geo';
import * as topojson from 'topojson-client';
import type { ProvinceSummary } from '@argentina-sim/domain';
import { resolveFeatureProvinceId } from '../campaign/ArgentinaRealVectorMap.js';
import { getProvincePoliticalMeta, normalizeProvinceId } from './provincePoliticalMeta.js';

// Geometria 3D extruida de las 24 jurisdicciones argentinas con contorno tactico superior
// y normalizacion de IDs para que ninguna provincia quede sin malla ni metadatos.

export type Map3DMode =
  | 'LOYALTY'
  | 'FISCAL'
  | 'SECURITY'
  | 'GOVERNORS'
  | 'PARTIES'
  | 'DEPUTIES';

export interface ProvinceMeshMeta {
  provinceId: string;
  name: string;
  baseColor: number;
  baseHeight: number;
  centerX: number;
  centerZ: number;
}

const COLOR_GOOD = 0x10b981;
const COLOR_NEUTRAL = 0xd97706;
const COLOR_BAD = 0xe11d48;
const COLOR_FALLBACK = 0x3b4c66;

const BLOC_COLORS: Record<string, number> = {
  DERECHA: 0x2563eb,
  CENTRO: 0x14b8a6,
  IZQUIERDA: 0xe11d48
};

function buildMapProjection() {
  return geoMercator().center([-64, -39.5]).scale(78).translate([0, 0]);
}

function appendProjectedPoint(
  points: THREE.Vector2[],
  coord: number[],
  proj: (coords: [number, number]) => [number, number] | null
) {
  if (coord.length < 2) return;
  const projected = proj([coord[0]!, coord[1]!]);
  if (!projected) return;
  const x = projected[0];
  const y = -projected[1];
  const prev = points[points.length - 1];
  if (!prev || Math.hypot(x - prev.x, y - prev.y) > 0.035) {
    points.push(new THREE.Vector2(x, y));
  }
}

function projectRingPoints(
  ring: number[][],
  proj: (coords: [number, number]) => [number, number] | null
): THREE.Vector2[] {
  const points: THREE.Vector2[] = [];
  for (const coord of ring) {
    appendProjectedPoint(points, coord, proj);
  }
  return points;
}

function appendShapeHoles(
  shape: THREE.Shape,
  holes: number[][][],
  proj: (coords: [number, number]) => [number, number] | null
) {
  for (const hole of holes) {
    const holePts = projectRingPoints(hole, proj);
    if (holePts.length >= 3) shape.holes.push(new THREE.Path(holePts));
  }
}

function createShapeFromPolygon(
  rings: number[][][],
  proj: (coords: [number, number]) => [number, number] | null
): THREE.Shape | null {
  const outer = rings[0];
  if (!outer) return null;
  const pts = projectRingPoints(outer, proj);
  if (pts.length < 3) return null;
  const shape = new THREE.Shape(pts);
  appendShapeHoles(shape, rings.slice(1), proj);
  return shape;
}

function resolvePolygonCoordinatesList(geometry: { type: string; coordinates: any }): number[][][][] {
  if (geometry.type === 'Polygon') return [geometry.coordinates];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates;
  return [];
}

function extractGeometryShapes(
  geometry: { type: string; coordinates: any },
  proj: (coords: [number, number]) => [number, number] | null
): THREE.Shape[] {
  const polys = resolvePolygonCoordinatesList(geometry);
  const out: THREE.Shape[] = [];
  for (const poly of polys) {
    const s = createShapeFromPolygon(poly, proj);
    if (s) out.push(s);
  }
  return out;
}

function resolveLoyaltyColor(province?: ProvinceSummary): number {
  if (!province) return COLOR_FALLBACK;
  if (province.governorLoyaltyToPresident >= 60) return COLOR_GOOD;
  if (province.governorLoyaltyToPresident >= 45) return COLOR_NEUTRAL;
  return COLOR_BAD;
}

function resolveFiscalColor(province?: ProvinceSummary): number {
  if (!province) return COLOR_FALLBACK;
  if (province.quasiCurrencyIssued || province.fiscalBalancePct <= -2) return COLOR_BAD;
  if (province.fiscalBalancePct < -0.4) return COLOR_NEUTRAL;
  return COLOR_GOOD;
}

function countAlerts(province: ProvinceSummary): number {
  return province.problematicas ? province.problematicas.length : 0;
}

function resolveSecurityColor(province?: ProvinceSummary): number {
  if (!province) return COLOR_FALLBACK;
  const alerts = countAlerts(province);
  if (province.intervenida || alerts >= 4) return COLOR_BAD;
  return alerts >= 2 ? COLOR_NEUTRAL : COLOR_GOOD;
}

function resolveGovernorsColor(province?: ProvinceSummary): number {
  if (!province) return COLOR_FALLBACK;
  const meta = getProvincePoliticalMeta(province.id);
  return meta ? (BLOC_COLORS[meta.bloc] ?? COLOR_FALLBACK) : COLOR_FALLBACK;
}

function resolvePartiesColor(province?: ProvinceSummary): number {
  if (!province) return COLOR_FALLBACK;
  const meta = getProvincePoliticalMeta(province.id);
  return meta ? meta.partyColorHex : COLOR_FALLBACK;
}

const MODE_COLOR_RESOLVERS: Record<Map3DMode, (p?: ProvinceSummary) => number> = {
  LOYALTY: resolveLoyaltyColor,
  FISCAL: resolveFiscalColor,
  SECURITY: resolveSecurityColor,
  GOVERNORS: resolveGovernorsColor,
  PARTIES: resolvePartiesColor,
  DEPUTIES: resolveLoyaltyColor
};

export function resolveProvinceColor(province: ProvinceSummary | undefined, mode: Map3DMode): number {
  return MODE_COLOR_RESOLVERS[mode](province);
}

function resolveSecurityDepth(province: ProvinceSummary): number {
  const alerts = countAlerts(province);
  return Math.min(4.2, 0.95 + alerts * 0.55);
}

function resolveFiscalDepth(province: ProvinceSummary): number {
  if (province.quasiCurrencyIssued) return 3.6;
  return Math.min(4.2, 0.95 + Math.abs(province.fiscalBalancePct) * 0.55);
}

function resolveRawExtrudeDepth(province: ProvinceSummary | undefined, mode: Map3DMode): number {
  if (!province) return 1.15;
  if (mode === 'DEPUTIES') return Math.min(4.6, 0.85 + province.nationalDeputiesCount * 0.065);
  if (mode === 'FISCAL') return resolveFiscalDepth(province);
  if (mode === 'SECURITY') return resolveSecurityDepth(province);
  return 0.95 + (province.governorLoyaltyToPresident / 100) * 1.65;
}

export function resolveProvinceExtrudeDepth(province: ProvinceSummary | undefined, mode: Map3DMode): number {
  const depth = resolveRawExtrudeDepth(province, mode);
  if (province?.id === 'CABA') return Math.max(depth, 2.15);
  return depth;
}

function computeMeshHorizontalCenter(geometry: THREE.ExtrudeGeometry): { x: number; z: number } {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  if (!box) return { x: 0, z: 0 };
  return {
    x: (box.min.x + box.max.x) / 2,
    z: -(box.min.y + box.max.y) / 2
  };
}

function attachTopCapBorderContours(mesh: THREE.Mesh, shapes: THREE.Shape[], depth: number) {
  const topZ = depth + 0.145;
  const borderMat = new THREE.LineBasicMaterial({
    color: 0xe2e8f0,
    transparent: true,
    opacity: 0.72
  });
  for (const shape of shapes) {
    const pts2d = shape.getPoints();
    if (pts2d.length < 3) continue;
    const pts3d = pts2d.map((p) => new THREE.Vector3(p.x, p.y, topZ));
    const lineGeo = new THREE.BufferGeometry().setFromPoints(pts3d);
    mesh.add(new THREE.LineLoop(lineGeo, borderMat));
  }
}

function createExtrudedProvinceMesh(
  shapes: THREE.Shape[],
  province: ProvinceSummary | undefined,
  provinceId: string,
  name: string,
  mode: Map3DMode
): THREE.Mesh {
  const depth = resolveProvinceExtrudeDepth(province, mode);
  const color = resolveProvinceColor(province, mode);
  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.14,
    bevelSize: 0.075,
    bevelSegments: 3
  });
  const center = computeMeshHorizontalCenter(geometry);
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.38,
    metalness: 0.24
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.rotation.x = -Math.PI / 2;
  mesh.userData = {
    provinceId,
    name: province?.name ?? name,
    baseColor: color,
    baseHeight: depth,
    centerX: center.x,
    centerZ: center.z
  } satisfies ProvinceMeshMeta;

  const edges = new THREE.EdgesGeometry(geometry, 28);
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.32 })
  );
  mesh.add(line);
  attachTopCapBorderContours(mesh, shapes, depth);
  return mesh;
}

function createFallbackProvinceSummary(provId: string, rawName: string): ProvinceSummary {
  const meta = getProvincePoliticalMeta(provId);
  return {
    id: provId,
    name: rawName,
    region: 'NOA',
    nationalDeputiesCount: 7,
    reelectionAllowed: true,
    coparticipationDependencyPct: 80,
    governorLoyaltyToPresident: meta?.bloc === 'DERECHA' ? 68 : meta?.bloc === 'CENTRO' ? 56 : 40,
    quasiCurrencyIssued: false,
    fiscalBalancePct: 0.2,
    boletaUnicaActive: false,
    apparatusFiscalizacionPct: 55,
    keyEconomicDriver: meta ? `Gobernación ${meta.governorName} (${meta.partyName})` : 'Producción regional'
  };
}

export function buildNormalizedProvinceMap(provinces: ProvinceSummary[]): Map<string, ProvinceSummary> {
  const map = new Map<string, ProvinceSummary>();
  for (const p of provinces) {
    const normId = normalizeProvinceId(p.id);
    const normalizedProv = normId === p.id ? p : { ...p, id: normId };
    map.set(p.id, normalizedProv);
    map.set(normId, normalizedProv);
    if (normId === 'SANTIAGO_DEL_ESTERO') {
      map.set('SANTIAGO_ESTERO', normalizedProv);
    }
  }
  return map;
}

export function buildArgentina3DGroup(
  topoData: any,
  provinces: ProvinceSummary[],
  mode: Map3DMode
): THREE.Group {
  const group = new THREE.Group();
  const proj = buildMapProjection();
  const geoObj = topojson.feature(topoData, topoData.objects['ARG_adm1']) as any;
  const provMap = buildNormalizedProvinceMap(provinces);

  for (const feat of geoObj.features) {
    const rawName = String(feat.properties?.NAME_1 ?? 'Provincia');
    const resolvedId = resolveFeatureProvinceId({
      id: rawName,
      name: rawName,
      subRegion: '',
      pathD: ''
    });
    const provId = normalizeProvinceId(resolvedId);
    const shapes = extractGeometryShapes(feat.geometry, proj);
    if (shapes.length === 0) continue;
    const provSummary = provMap.get(provId) ?? createFallbackProvinceSummary(provId, rawName);
    const mesh = createExtrudedProvinceMesh(shapes, provSummary, provId, rawName, mode);
    group.add(mesh);
  }
  return group;
}
