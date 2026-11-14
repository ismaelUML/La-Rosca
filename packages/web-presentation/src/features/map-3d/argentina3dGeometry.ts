import * as THREE from 'three';
import { geoMercator } from 'd3-geo';
import * as topojson from 'topojson-client';
import type { ProvinceSummary } from '@argentina-sim/domain';
import { resolveFeatureProvinceId } from '../campaign/ArgentinaRealVectorMap.js';

export type Map3DMode = 'LOYALTY' | 'FISCAL' | 'SECURITY' | 'DEPUTIES';

export interface ProvinceMeshMeta {
  provinceId: string;
  name: string;
  baseColor: number;
  baseHeight: number;
  centerX: number;
  centerZ: number;
}

const COLOR_GOOD = 0x158053;
const COLOR_NEUTRAL = 0xc7922c;
const COLOR_BAD = 0xc4314b;
const COLOR_FALLBACK = 0x334155;

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
  if (!prev || Math.hypot(x - prev.x, y - prev.y) > 0.04) {
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

function extractGeometryShapes(
  geometry: { type: string; coordinates: any },
  proj: (coords: [number, number]) => [number, number] | null
): THREE.Shape[] {
  const polys: number[][][][] =
    geometry.type === 'Polygon'
      ? [geometry.coordinates]
      : geometry.type === 'MultiPolygon'
        ? geometry.coordinates
        : [];
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

const MODE_COLOR_RESOLVERS: Record<Map3DMode, (p?: ProvinceSummary) => number> = {
  LOYALTY: resolveLoyaltyColor,
  FISCAL: resolveFiscalColor,
  SECURITY: resolveSecurityColor,
  DEPUTIES: resolveLoyaltyColor
};

export function resolveProvinceColor(province: ProvinceSummary | undefined, mode: Map3DMode): number {
  return MODE_COLOR_RESOLVERS[mode](province);
}

function resolveSecurityDepth(province: ProvinceSummary): number {
  const alerts = province.problematicas?.length ?? 0;
  return Math.min(4.2, 0.95 + alerts * 0.55);
}

function resolveFiscalDepth(province: ProvinceSummary): number {
  if (province.quasiCurrencyIssued) return 3.6;
  return Math.min(4.2, 0.95 + Math.abs(province.fiscalBalancePct) * 0.55);
}

export function resolveProvinceExtrudeDepth(province: ProvinceSummary | undefined, mode: Map3DMode): number {
  if (!province) return 0.95;
  if (mode === 'DEPUTIES') {
    return Math.min(4.6, 0.85 + province.nationalDeputiesCount * 0.065);
  }
  if (mode === 'FISCAL') return resolveFiscalDepth(province);
  if (mode === 'SECURITY') return resolveSecurityDepth(province);
  return 0.9 + (province.governorLoyaltyToPresident / 100) * 1.65;
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
    bevelSize: 0.08,
    bevelSegments: 3
  });
  const center = computeMeshHorizontalCenter(geometry);
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.44,
    metalness: 0.28
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

  const edges = new THREE.EdgesGeometry(geometry, 24);
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: 0xcbd5e1, transparent: true, opacity: 0.42 })
  );
  mesh.add(line);
  return mesh;
}

export function buildArgentina3DGroup(
  topoData: any,
  provinces: ProvinceSummary[],
  mode: Map3DMode
): THREE.Group {
  const group = new THREE.Group();
  const proj = buildMapProjection();
  const geoObj = topojson.feature(topoData, topoData.objects['ARG_adm1']) as any;
  const provMap = new Map(provinces.map((p) => [p.id, p]));

  for (const feat of geoObj.features) {
    const rawName = String(feat.properties?.NAME_1 ?? 'Provincia');
    const provId = resolveFeatureProvinceId({
      id: rawName,
      name: rawName,
      subRegion: '',
      pathD: ''
    });
    const shapes = extractGeometryShapes(feat.geometry, proj);
    if (shapes.length === 0) continue;
    const mesh = createExtrudedProvinceMesh(shapes, provMap.get(provId), provId, rawName, mode);
    group.add(mesh);
  }
  return group;
}
