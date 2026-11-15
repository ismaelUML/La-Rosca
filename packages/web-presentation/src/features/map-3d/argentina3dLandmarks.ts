import * as THREE from 'three';
import type { ProvinceSummary } from '@argentina-sim/domain';
import type { ProvinceMeshMeta } from './argentina3dGeometry.js';
import { buildNormalizedProvinceMap } from './argentina3dGeometry.js';
import {
  getCasaRosadaFacadeTexture,
  getCorrugatedSiloTexture,
  getTravertineStoneTexture
} from './proceduralPbrTextures.js';
import { loadGlbIntoAnchor } from './modelAssetLoader.js';

// Monumentos arquitectonicos e instalaciones industriales 3D de alta densidad:
// - Obelisco travertino + Casa Rosada con fachada neoclasica + Cupula del Congreso (AMBA)
// - Torre Derrick reticulada + Ciguena petrolera (Pumpjack animado) + Venteo (Vaca Muerta)
// - Terrazas de salmuera con diques de sal + Planta quimica paraboloide (Triangulo del Litio)
// - Bateria de silos conicos de chapa corrugada + Noria elevadora y puente (Nucleo Agro)
// - Parques eolicos dobles con gondola aerodinamica y palas ahusadas (Patagonia)
// - Represa hidroelectrica curva con embalse y vertedero (Cordillera y Litoral)

export interface AnimatedLandmarkRefs {
  overlayGroup: THREE.Group;
  windRotors: THREE.Object3D[];
  pumpBeams: THREE.Object3D[];
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

function buildCongresoDomeMini(): THREE.Group {
  const grp = new THREE.Group();
  const baseMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.45, metalness: 0.25 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.24, 0.34), baseMat);
  base.position.y = 0.12;

  const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.22, 16), baseMat);
  drum.position.y = 0.32;

  const pts = [
    new THREE.Vector2(0.14, 0),
    new THREE.Vector2(0.135, 0.12),
    new THREE.Vector2(0.1, 0.26),
    new THREE.Vector2(0.04, 0.36),
    new THREE.Vector2(0.0, 0.4)
  ];
  const domeMat = new THREE.MeshStandardMaterial({
    color: 0x14b8a6,
    roughness: 0.3,
    metalness: 0.65,
    emissive: 0x0f766e,
    emissiveIntensity: 0.3
  });
  const dome = new THREE.Mesh(new THREE.LatheGeometry(pts, 18), domeMat);
  dome.position.y = 0.42;

  const spire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.02, 0.16, 8),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.85, roughness: 0.2 })
  );
  spire.position.y = 0.88;

  grp.add(base, drum, dome, spire);
  return grp;
}

function createObeliscoAndRosadaNode(): THREE.Group {
  const node = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({
    map: getTravertineStoneTexture(),
    roughness: 0.35,
    metalness: 0.15
  });

  const plazaPlinth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.34, 0.12, 8),
    new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.6 })
  );
  plazaPlinth.position.set(0, 0.06, 0);

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.165, 1.78, 4), stoneMat);
  shaft.position.set(0, 0.98, 0);
  shaft.rotation.y = Math.PI / 4;

  const apex = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.34, 4), stoneMat);
  apex.position.set(0, 2.04, 0);
  apex.rotation.y = Math.PI / 4;

  const rod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.22, 6),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9 })
  );
  rod.position.set(0, 2.28, 0);

  const rosadaMat = new THREE.MeshStandardMaterial({
    map: getCasaRosadaFacadeTexture(),
    roughness: 0.42,
    metalness: 0.18
  });
  const rosadaMain = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.42, 0.34), rosadaMat);
  rosadaMain.position.set(0.62, 0.21, 0.26);
  const rosadaArch = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.48, 0.38), rosadaMat);
  rosadaArch.position.set(0.62, 0.24, 0.26);

  const congreso = buildCongresoDomeMini();
  congreso.position.set(-0.56, 0, 0.28);

  node.add(plazaPlinth, shaft, apex, rod, rosadaMain, rosadaArch, congreso);
  loadGlbIntoAnchor(node, 'custom/amba_monuments.glb');
  return node;
}

function buildPumpjackUnit(pumpBeams: THREE.Object3D[]): THREE.Group {
  const unit = new THREE.Group();
  const darkSteel = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.75, roughness: 0.3 });
  const yellowSteel = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6, roughness: 0.35 });

  const aFrame = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.52, 4), darkSteel);
  aFrame.position.set(0, 0.26, 0);

  const beamPivot = new THREE.Group();
  beamPivot.position.set(0, 0.5, 0);
  const walkingBeam = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.07, 0.08), yellowSteel);
  const horseHead = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 0.09, 12, 1, false, 0, Math.PI),
    yellowSteel
  );
  horseHead.position.set(0.3, -0.02, 0);
  horseHead.rotation.x = Math.PI / 2;
  beamPivot.add(walkingBeam, horseHead);
  pumpBeams.push(beamPivot);

  unit.add(aFrame, beamPivot);
  return unit;
}

function createVacaMuertaRigNode(flares: THREE.Mesh[], pumpBeams: THREE.Object3D[]): THREE.Group {
  const node = new THREE.Group();
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.28,
    metalness: 0.78
  });
  const wireMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.3,
    metalness: 0.8,
    wireframe: true
  });

  const pad = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.12, 0.82), steelMat);
  pad.position.set(0, 0.06, 0);

  const latticeTower = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.28, 1.65, 4, 6), wireMat);
  latticeTower.position.set(-0.18, 0.92, 0);
  latticeTower.rotation.y = Math.PI / 4;

  const drillPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.68, 8), steelMat);
  drillPipe.position.set(-0.18, 0.92, 0);

  const tankMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.55, roughness: 0.35 });
  const tank = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.28, 8, 12), tankMat);
  tank.rotation.z = Math.PI / 2;
  tank.position.set(-0.15, 0.22, 0.28);

  const flareStack = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 1.45, 8), steelMat);
  flareStack.position.set(0.32, 0.78, -0.22);

  const flare = new THREE.Mesh(
    new THREE.ConeGeometry(0.14, 0.38, 10),
    new THREE.MeshBasicMaterial({ color: 0xf97316 })
  );
  flare.position.set(0.32, 1.62, -0.22);
  flares.push(flare);

  const pumpjack = buildPumpjackUnit(pumpBeams);
  pumpjack.position.set(0.28, 0.12, 0.16);

  node.add(pad, latticeTower, drillPipe, tank, flareStack, flare, pumpjack);
  loadGlbIntoAnchor(node, 'custom/vaca_muerta.glb');
  return node;
}

function createLithiumSaltFlatNode(): THREE.Group {
  const node = new THREE.Group();
  const saltRimMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55 });
  const brineCyan = new THREE.MeshStandardMaterial({
    color: 0x06b6d4,
    roughness: 0.12,
    metalness: 0.5,
    emissive: 0x22d3ee,
    emissiveIntensity: 0.48
  });
  const brineEmerald = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    roughness: 0.14,
    metalness: 0.45,
    emissive: 0x34d399,
    emissiveIntensity: 0.42
  });

  const dikeA = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.1, 6), saltRimMat);
  dikeA.position.set(-0.26, 0.05, -0.14);
  const poolA = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.12, 6), brineCyan);
  poolA.position.set(-0.26, 0.06, -0.14);

  const dikeB = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.38, 0.1, 6), saltRimMat);
  dikeB.position.set(0.28, 0.05, 0.22);
  const poolB = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.12, 6), brineEmerald);
  poolB.position.set(0.28, 0.06, 0.22);

  const hangarRoof = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 0.48, 14, 1, false, 0, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.65, roughness: 0.3 })
  );
  hangarRoof.rotation.z = Math.PI / 2;
  hangarRoof.position.set(0.26, 0.12, -0.24);

  node.add(dikeA, poolA, dikeB, poolB, hangarRoof);
  loadGlbIntoAnchor(node, 'custom/litio_planta.glb');
  return node;
}

function createAgroSiloComplexNode(): THREE.Group {
  const node = new THREE.Group();
  const siloWallMat = new THREE.MeshStandardMaterial({
    map: getCorrugatedSiloTexture(),
    roughness: 0.32,
    metalness: 0.68
  });
  const roofMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.25,
    metalness: 0.78
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.35,
    metalness: 0.55
  });

  const offsets: Array<[number, number]> = [
    [-0.32, -0.16],
    [0, -0.16],
    [0.32, -0.16],
    [-0.16, 0.18],
    [0.16, 0.18]
  ];
  for (const [ox, oz] of offsets) {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.62, 16), siloWallMat);
    body.position.set(ox, 0.31, oz);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.145, 0.22, 16), roofMat);
    cone.position.set(ox, 0.73, oz);
    node.add(body, cone);
  }

  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.07, 0.08), goldMat);
  bridge.position.set(0, 0.86, -0.16);
  const elevatorTower = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.05, 0.14), goldMat);
  elevatorTower.position.set(-0.52, 0.52, -0.16);

  node.add(bridge, elevatorTower);
  loadGlbIntoAnchor(node, 'custom/complejo_agro.glb');
  return node;
}

function buildSingleWindTurbine(rotors: THREE.Object3D[], scale = 1): THREE.Group {
  const unit = new THREE.Group();
  const whiteMat = new THREE.MeshStandardMaterial({
    color: 0xf1f5f9,
    roughness: 0.22,
    metalness: 0.38
  });

  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.085, 1.38, 14), whiteMat);
  mast.position.set(0, 0.69, 0);

  const nacelle = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.18, 8, 12), whiteMat);
  nacelle.rotation.x = Math.PI / 2;
  nacelle.position.set(0, 1.38, 0.04);

  const hub = new THREE.Group();
  hub.position.set(0, 1.38, 0.18);
  const spinner = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 12), whiteMat);
  spinner.rotation.x = Math.PI / 2;
  hub.add(spinner);

  for (let i = 0; i < 3; i += 1) {
    const blade = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.68, 8), whiteMat);
    blade.scale.z = 0.28;
    blade.position.y = 0.34;
    const pivot = new THREE.Group();
    pivot.rotation.z = (i * Math.PI * 2) / 3;
    pivot.add(blade);
    hub.add(pivot);
  }
  rotors.push(hub);
  unit.add(mast, nacelle, hub);
  unit.scale.setScalar(scale);
  return unit;
}

function createPatagoniaWindTurbineNode(rotors: THREE.Object3D[]): THREE.Group {
  const node = new THREE.Group();
  const mainTurbine = buildSingleWindTurbine(rotors, 1);
  mainTurbine.position.set(-0.18, 0, 0);

  const secondaryTurbine = buildSingleWindTurbine(rotors, 0.78);
  secondaryTurbine.position.set(0.32, 0, -0.22);

  node.add(mainTurbine, secondaryTurbine);
  loadGlbIntoAnchor(node, 'custom/eolico_patagonia.glb');
  return node;
}

function createHydroAndCordilleraNode(): THREE.Group {
  const node = new THREE.Group();
  const concreteMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.5,
    metalness: 0.25
  });
  const waterMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.15,
    metalness: 0.45,
    emissive: 0x0369a1,
    emissiveIntensity: 0.45
  });

  const archWall = new THREE.Mesh(
    new THREE.CylinderGeometry(0.48, 0.42, 0.46, 18, 1, true, 0, Math.PI),
    concreteMat
  );
  archWall.position.set(0, 0.23, 0);

  const reservoir = new THREE.Mesh(
    new THREE.CylinderGeometry(0.44, 0.44, 0.36, 18, 1, false, 0, Math.PI),
    waterMat
  );
  reservoir.position.set(0, 0.18, 0);

  const powerhouse = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.2, 0.22), concreteMat);
  powerhouse.position.set(0, 0.1, 0.24);

  node.add(archWall, reservoir, powerhouse);
  loadGlbIntoAnchor(node, 'custom/represa_hidro.glb');
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
  flares: THREE.Mesh[],
  pumpBeams: THREE.Object3D[]
): THREE.Group {
  const builders: Record<LandmarkKind, () => THREE.Group> = {
    AMBA: createObeliscoAndRosadaNode,
    VACA_MUERTA: () => createVacaMuertaRigNode(flares, pumpBeams),
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
  const pumpBeams: THREE.Object3D[] = [];
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
      anchor.add(instantiateLandmarkByKind(kind, windRotors, gasFlares, pumpBeams));
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
    pumpBeams,
    gasFlares,
    conflictRings,
    pipelinePulses,
    urbanLightNodes,
    anchorMap
  };
}

function animateRotorsFlaresAndPumps(refs: AnimatedLandmarkRefs, clockSec: number) {
  for (const rotor of refs.windRotors) {
    rotor.rotation.z = clockSec * 2.8;
  }
  const pumpAngle = Math.sin(clockSec * 3.4) * 0.28;
  for (const beam of refs.pumpBeams) {
    beam.rotation.z = pumpAngle;
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
  animateRotorsFlaresAndPumps(refs, clockSec);
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
