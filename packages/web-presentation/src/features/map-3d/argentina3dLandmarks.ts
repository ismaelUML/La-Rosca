import * as THREE from 'three';
import type { ProvinceSummary } from '@argentina-sim/domain';
import type { ProvinceMeshMeta } from './argentina3dGeometry.js';
import { buildNormalizedProvinceMap } from './argentina3dGeometry.js';

// Activos estrategicos 3D sobre el tablero nacional:
// - Obelisco y Casa Rosada (CABA / PBA)
// - Torres de perforacion y venteo en Vaca Muerta (Neuquen, Rio Negro, Mendoza)
// - Piletones de evaporacion de litio en la Puna (Jujuy, Salta, Catamarca)
// - Silos y complejos portuarios agroexportadores (Santa Fe, Cordoba, Entre Rios)
// - Parques eolicos patagonicos con rotores animados (Chubut, Santa Cruz, Tierra del Fuego)
// - Gasoducto Perito Moreno y corredores logisticos nacionales con pulsos de flujo en vivo
// - Constelacion de luces urbanas satelitales y ondas de conflicto social

export interface AnimatedLandmarkRefs {
  overlayGroup: THREE.Group;
  windRotors: THREE.Object3D[];
  gasFlares: THREE.Mesh[];
  conflictRings: THREE.Mesh[];
  pipelinePulses: Array<{
    mesh: THREE.Mesh;
    curve: THREE.CatmullRomCurve3;
    speed: number;
    phase: number;
  }>;
  urbanLightNodes: THREE.Mesh[];
  anchorMap: Map<string, THREE.Group>;
}

function createObeliscoAndRosadaNode(): THREE.Group {
  const node = new THREE.Group();
  const shaftMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.25,
    metalness: 0.3,
    emissive: 0xfbbf24,
    emissiveIntensity: 0.35
  });
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.85, 0.24), shaftMat);
  shaft.position.set(0, 0.92, 0);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.42, 4), shaftMat);
  tip.position.set(0, 2.02, 0);
  tip.rotation.y = Math.PI / 4;

  const rosadaMat = new THREE.MeshStandardMaterial({
    color: 0xe11d48,
    roughness: 0.4,
    metalness: 0.2,
    emissive: 0x9f1239,
    emissiveIntensity: 0.45
  });
  const rosada = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.46, 0.38), rosadaMat);
  rosada.position.set(0.55, 0.23, 0.28);

  node.add(shaft, tip, rosada);
  return node;
}

function createVacaMuertaRigNode(flares: THREE.Mesh[]): THREE.Group {
  const node = new THREE.Group();
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.32,
    metalness: 0.72
  });
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.34, 1.55, 4), steelMat);
  tower.position.set(0, 0.78, 0);

  const base = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.22, 0.75), steelMat);
  base.position.set(0, 0.11, 0);

  const flareMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
  const flare = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), flareMat);
  flare.position.set(0, 1.66, 0);
  flares.push(flare);

  node.add(base, tower, flare);
  return node;
}

function createLithiumSaltFlatNode(): THREE.Group {
  const node = new THREE.Group();
  const poolMat = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    roughness: 0.15,
    metalness: 0.45,
    emissive: 0x22d3ee,
    emissiveIntensity: 0.55
  });
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 });

  const poolA = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.14, 0.55), poolMat);
  poolA.position.set(-0.22, 0.08, -0.15);
  const poolB = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.14, 0.48), poolMat);
  poolB.position.set(0.32, 0.08, 0.22);
  const plant = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.38, 0.32), rimMat);
  plant.position.set(0.28, 0.19, -0.25);

  node.add(poolA, poolB, plant);
  return node;
}

function createAgroSiloComplexNode(): THREE.Group {
  const node = new THREE.Group();
  const siloMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.35,
    metalness: 0.55,
    emissive: 0x78350f,
    emissiveIntensity: 0.28
  });
  const offsets: Array<[number, number]> = [
    [-0.28, -0.16],
    [0, -0.16],
    [0.28, -0.16],
    [-0.14, 0.18],
    [0.14, 0.18]
  ];
  for (const [ox, oz] of offsets) {
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.68, 12), siloMat);
    cyl.position.set(ox, 0.34, oz);
    node.add(cyl);
  }
  return node;
}

function createPatagoniaWindTurbineNode(rotors: THREE.Object3D[]): THREE.Group {
  const node = new THREE.Group();
  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.28,
    metalness: 0.35
  });
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.09, 1.35, 10), whiteMat);
  mast.position.set(0, 0.67, 0);

  const hub = new THREE.Group();
  hub.position.set(0, 1.34, 0.08);
  for (let i = 0; i < 3; i += 1) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.62, 0.02), whiteMat);
    blade.position.y = 0.28;
    const pivot = new THREE.Group();
    pivot.rotation.z = (i * Math.PI * 2) / 3;
    pivot.add(blade);
    hub.add(pivot);
  }
  rotors.push(hub);
  node.add(mast, hub);
  return node;
}

function createHydroAndCordilleraNode(): THREE.Group {
  const node = new THREE.Group();
  const damMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    roughness: 0.3,
    metalness: 0.45,
    emissive: 0x0284c7,
    emissiveIntensity: 0.35
  });
  const dam = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.42, 0.26), damMat);
  dam.position.set(0, 0.21, 0);
  node.add(dam);
  return node;
}

type LandmarkKind = 'AMBA' | 'VACA_MUERTA' | 'LITIO' | 'AGRO' | 'EOLICO' | 'HIDRO';

const PROVINCE_LANDMARK_KIND: Record<string, LandmarkKind> = {
  CABA: 'AMBA',
  PBA: 'AGRO',
  NEUQUEN: 'VACA_MUERTA',
  RIO_NEGRO: 'VACA_MUERTA',
  JUJUY: 'LITIO',
  SALTA: 'LITIO',
  CATAMARCA: 'LITIO',
  SANTA_FE: 'AGRO',
  CORDOBA: 'AGRO',
  ENTRE_RIOS: 'AGRO',
  LA_PAMPA: 'AGRO',
  SANTIAGO_DEL_ESTERO: 'AGRO',
  CHUBUT: 'EOLICO',
  SANTA_CRUZ: 'EOLICO',
  TIERRA_DEL_FUEGO: 'EOLICO',
  MENDOZA: 'HIDRO',
  SAN_JUAN: 'LITIO',
  MISIONES: 'HIDRO',
  CORRIENTES: 'HIDRO',
  TUCUMAN: 'AGRO'
};

function instantiateLandmarkByKind(
  kind: LandmarkKind,
  rotors: THREE.Object3D[],
  flares: THREE.Mesh[]
): THREE.Group {
  const builders: Record<LandmarkKind, () => THREE.Group> = {
    AMBA: createObeliscoAndRosadaNode,
    VACA_MUERTA: () => createVacaMuertaRigNode(flares),
    LITIO: createLithiumSaltFlatNode,
    AGRO: createAgroSiloComplexNode,
    EOLICO: () => createPatagoniaWindTurbineNode(rotors),
    HIDRO: createHydroAndCordilleraNode
  };
  return builders[kind]();
}

function isProvinceInConflict(prov: ProvinceSummary | undefined): boolean {
  if (!prov) return false;
  const alerts = prov.problematicas ? prov.problematicas.length : 0;
  return Boolean(prov.intervenida) || prov.governorLoyaltyToPresident < 42 || alerts >= 3;
}

function attachConflictRippleRing(anchor: THREE.Group, rings: THREE.Mesh[]) {
  const mat = new THREE.MeshBasicMaterial({
    color: 0xf43f5e,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.75
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.74, 28), mat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.08;
  anchor.add(ring);
  rings.push(ring);
}

const MAJOR_URBAN_HUBS = new Set([
  'CABA',
  'PBA',
  'CORDOBA',
  'SANTA_FE',
  'MENDOZA',
  'TUCUMAN',
  'NEUQUEN'
]);

function attachUrbanNightLight(
  anchor: THREE.Group,
  provinceId: string,
  urbanLightNodes: THREE.Mesh[]
) {
  const radius = MAJOR_URBAN_HUBS.has(provinceId) ? 0.42 : 0.24;
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xfde047,
    transparent: true,
    opacity: 0.85
  });
  const glow = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 12), glowMat);
  glow.position.set(0, 0.14, 0);
  glow.visible = false;
  anchor.add(glow);
  urbanLightNodes.push(glow);
}

function buildCorridorCurve(
  ids: string[],
  metaMap: Map<string, ProvinceMeshMeta>
): THREE.CatmullRomCurve3 | null {
  const pts: THREE.Vector3[] = [];
  for (const id of ids) {
    const m = metaMap.get(id);
    if (m) {
      pts.push(new THREE.Vector3(m.centerX, m.baseHeight + 0.32, m.centerZ));
    }
  }
  return pts.length >= 2 ? new THREE.CatmullRomCurve3(pts) : null;
}

function addCorridorWithPulses(
  parent: THREE.Group,
  curve: THREE.CatmullRomCurve3,
  colorHex: number,
  pulseCount: number,
  speed: number,
  pulsesOut: AnimatedLandmarkRefs['pipelinePulses']
) {
  const tubeGeo = new THREE.TubeGeometry(curve, 44, 0.065, 8, false);
  const tubeMat = new THREE.MeshStandardMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: 0.65,
    roughness: 0.25,
    metalness: 0.5
  });
  parent.add(new THREE.Mesh(tubeGeo, tubeMat));

  const pulseMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
  for (let i = 0; i < pulseCount; i += 1) {
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), pulseMat);
    parent.add(sphere);
    pulsesOut.push({
      mesh: sphere,
      curve,
      speed,
      phase: i / pulseCount
    });
  }
}

function buildNationalCorridors(
  parent: THREE.Group,
  metaMap: Map<string, ProvinceMeshMeta>,
  pulsesOut: AnimatedLandmarkRefs['pipelinePulses']
) {
  const gasoducto = buildCorridorCurve(['NEUQUEN', 'LA_PAMPA', 'PBA', 'CABA', 'SANTA_FE'], metaMap);
  if (gasoducto) addCorridorWithPulses(parent, gasoducto, 0x06b6d4, 4, 0.24, pulsesOut);

  const rutaNorte = buildCorridorCurve(
    ['CABA', 'SANTA_FE', 'CORDOBA', 'SANTIAGO_DEL_ESTERO', 'TUCUMAN', 'SALTA', 'JUJUY'],
    metaMap
  );
  if (rutaNorte) addCorridorWithPulses(parent, rutaNorte, 0xf59e0b, 3, 0.16, pulsesOut);

  const rutaPatagonia = buildCorridorCurve(
    ['PBA', 'RIO_NEGRO', 'CHUBUT', 'SANTA_CRUZ', 'TIERRA_DEL_FUEGO'],
    metaMap
  );
  if (rutaPatagonia) addCorridorWithPulses(parent, rutaPatagonia, 0x38bdf8, 3, 0.15, pulsesOut);
}

export function buildStrategicLandmarksOverlay(
  provinceGroup: THREE.Group,
  provinces: ProvinceSummary[]
): AnimatedLandmarkRefs {
  const overlayGroup = new THREE.Group();
  const windRotors: THREE.Object3D[] = [];
  const gasFlares: THREE.Mesh[] = [];
  const conflictRings: THREE.Mesh[] = [];
  const pipelinePulses: AnimatedLandmarkRefs['pipelinePulses'] = [];
  const urbanLightNodes: THREE.Mesh[] = [];
  const anchorMap = new Map<string, THREE.Group>();
  const metaMap = new Map<string, ProvinceMeshMeta>();
  const provMap = buildNormalizedProvinceMap(provinces);

  for (const child of provinceGroup.children) {
    const mesh = child as THREE.Mesh;
    const meta = mesh.userData as ProvinceMeshMeta;
    metaMap.set(meta.provinceId, meta);

    const anchor = new THREE.Group();
    anchor.position.set(meta.centerX, meta.baseHeight + 0.16, meta.centerZ);
    anchorMap.set(meta.provinceId, anchor);

    const kind = PROVINCE_LANDMARK_KIND[meta.provinceId];
    if (kind) {
      anchor.add(instantiateLandmarkByKind(kind, windRotors, gasFlares));
    }
    if (isProvinceInConflict(provMap.get(meta.provinceId))) {
      attachConflictRippleRing(anchor, conflictRings);
    }
    attachUrbanNightLight(anchor, meta.provinceId, urbanLightNodes);
    overlayGroup.add(anchor);
  }

  buildNationalCorridors(overlayGroup, metaMap, pipelinePulses);

  return {
    overlayGroup,
    windRotors,
    gasFlares,
    conflictRings,
    pipelinePulses,
    urbanLightNodes,
    anchorMap
  };
}

function animateRotorsAndFlares(refs: AnimatedLandmarkRefs, clockSec: number) {
  for (const rotor of refs.windRotors) {
    rotor.rotation.z = clockSec * 2.8;
  }
  const flareScale = 0.85 + Math.sin(clockSec * 9.5) * 0.25;
  for (const flare of refs.gasFlares) {
    flare.scale.setScalar(flareScale);
  }
}

function animateRingsAndPulses(refs: AnimatedLandmarkRefs, clockSec: number) {
  const ringWave = 1 + ((clockSec * 1.1) % 1) * 0.9;
  for (const ring of refs.conflictRings) {
    ring.scale.setScalar(ringWave);
  }
  for (const item of refs.pipelinePulses) {
    const t = (clockSec * item.speed + item.phase) % 1;
    item.mesh.position.copy(item.curve.getPointAt(t));
  }
}

export function animateStrategicLandmarksFrame(
  refs: AnimatedLandmarkRefs | null,
  provinceGroup: THREE.Group | null,
  clockSec: number
) {
  if (!refs) return;
  animateRotorsAndFlares(refs, clockSec);
  animateRingsAndPulses(refs, clockSec);
  syncLandmarkAnchorHeights(refs, provinceGroup);
}

function syncLandmarkAnchorHeights(
  refs: AnimatedLandmarkRefs,
  provinceGroup: THREE.Group | null
) {
  if (!provinceGroup) return;
  for (const child of provinceGroup.children) {
    const mesh = child as THREE.Mesh;
    const meta = mesh.userData as ProvinceMeshMeta;
    const anchor = refs.anchorMap.get(meta.provinceId);
    if (anchor) {
      anchor.position.y = meta.baseHeight + 0.16 + mesh.position.y;
    }
  }
}

const NIGHT_ENVIRONMENT = {
  true: { bgHex: 0x020409, fogDensity: 0.0062 },
  false: { bgHex: 0x06090f, fogDensity: 0.0042 }
} as const;

export function applyNightSatelliteMode(
  scene: THREE.Scene | null,
  refs: AnimatedLandmarkRefs | null,
  nightMode: boolean
) {
  if (scene) {
    const env = NIGHT_ENVIRONMENT[String(nightMode) as 'true' | 'false'];
    scene.background = new THREE.Color(env.bgHex);
    scene.fog = new THREE.FogExp2(env.bgHex, env.fogDensity);
  }
  if (!refs) return;
  for (const node of refs.urbanLightNodes) {
    node.visible = nightMode;
  }
}
