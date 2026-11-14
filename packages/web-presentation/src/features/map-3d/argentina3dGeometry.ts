import * as THREE from 'three';
import { geoMercator } from 'd3-geo';
import * as topojson from 'topojson-client';
import type { ProvinceSummary } from '@argentina-sim/domain';
import { resolveFeatureProvinceId } from '../campaign/ArgentinaRealVectorMap.js';

export type Map3DMode = 'LOYALTY' | 'FISCAL' | 'DEPUTIES';

export interface ProvinceMeshMeta {
  provinceId: string;
  name: string;
  baseColor: number;
  baseHeight: number;
}

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
  if (!province) return 0x334155;
  if (province.governorLoyaltyToPresident >= 60) return 0x1e6f43;
  if (province.governorLoyaltyToPresident >= 45) return 0xb89342;
  return 0x93252d;
}

function resolveFiscalColor(province?: ProvinceSummary): number {
  if (!province) return 0x334155;
  if (province.quasiCurrencyIssued) return 0xc92a2a;
  if (province.fiscalBalancePct < -0.5) return 0xb8762c;
  return 0x1d6a5a;
}

function resolveDeputiesColor(province?: ProvinceSummary): number {
  const count = province?.nationalDeputiesCount ?? 5;
  if (count >= 25) return 0x2f74b5;
  if (count >= 12) return 0x245585;
  return 0x1b3b5c;
}

export function resolveProvinceColor(province: ProvinceSummary | undefined, mode: Map3DMode): number {
  if (mode === 'FISCAL') return resolveFiscalColor(province);
  if (mode === 'DEPUTIES') return resolveDeputiesColor(province);
  return resolveLoyaltyColor(province);
}

export function resolveProvinceExtrudeDepth(province: ProvinceSummary | undefined, mode: Map3DMode): number {
  if (!province) return 0.7;
  if (mode === 'DEPUTIES') {
    return Math.min(3.4, 0.55 + province.nationalDeputiesCount * 0.055);
  }
  if (mode === 'FISCAL') {
    return province.quasiCurrencyIssued ? 2.1 : 0.65 + Math.abs(province.fiscalBalancePct) * 0.35;
  }
  return 0.6 + (province.governorLoyaltyToPresident / 100) * 1.15;
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
    bevelThickness: 0.08,
    bevelSize: 0.06,
    bevelSegments: 2
  });
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.52,
    metalness: 0.25
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.userData = {
    provinceId,
    name: province?.name ?? name,
    baseColor: color,
    baseHeight: depth
  } satisfies ProvinceMeshMeta;

  const edges = new THREE.EdgesGeometry(geometry, 24);
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.45 })
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
