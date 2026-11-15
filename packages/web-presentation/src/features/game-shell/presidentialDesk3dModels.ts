import * as THREE from 'three';
import {
  getBloombergTerminalTexture,
  getMahoganyWoodTexture,
  getNewspaperStackTexture
} from '../map-3d/proceduralPbrTextures.js';
import { loadGlbIntoAnchor } from '../map-3d/modelAssetLoader.js';

// Constructores 3D multicapa con texturas PBR y soporte .glb para el Despacho Presidencial:
// Sillon de Rivadavia, escritorio de caoba con escudo, carpeta DNU con estilografica,
// Telefono Rojo con tubo y dial, Terminal SIOPEL/BCRA con velas, y diarios con microfono.

export type DeskInteractiveId = 'CARPETA_DNU' | 'TELEFONO_ROJO' | 'TERMINAL_BCRA' | 'SALA_PRENSA';

export function buildSillonDeRivadaviaGroup(): THREE.Group {
  const anchor = new THREE.Group();
  anchor.position.set(0, 0.35, -1.25);

  const fallback = new THREE.Group();
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.78,
    roughness: 0.25
  });
  const velvetMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.55,
    metalness: 0.12
  });

  const backrestFrame = new THREE.Mesh(new THREE.BoxGeometry(1.42, 1.85, 0.18), goldMat);
  backrestFrame.position.set(0, 1.1, -0.22);
  fallback.add(backrestFrame);

  const backrestCushion = new THREE.Mesh(new THREE.BoxGeometry(1.18, 1.62, 0.22), velvetMat);
  backrestCushion.position.set(0, 1.08, -0.16);
  fallback.add(backrestCushion);

  const crownCrest = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.06, 10, 24), goldMat);
  crownCrest.position.set(0, 2.08, -0.2);
  fallback.add(crownCrest);

  const seatCushion = new THREE.Mesh(new THREE.BoxGeometry(1.32, 0.24, 0.95), velvetMat);
  seatCushion.position.set(0, 0.35, 0.22);
  fallback.add(seatCushion);

  for (const sx of [-0.62, 0.62]) {
    const armrest = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.88), goldMat);
    armrest.position.set(sx, 0.72, 0.2);
    const armPost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.38, 10), goldMat);
    armPost.position.set(sx, 0.52, 0.56);
    fallback.add(armrest, armPost);
  }

  anchor.add(fallback);
  loadGlbIntoAnchor(anchor, '/models/sillon_rivadavia.glb', 1);
  return anchor;
}

export function buildMahoganyPresidentialDeskGroup(): THREE.Group {
  const group = new THREE.Group();
  const woodTex = getMahoganyWoodTexture();
  const woodMat = new THREE.MeshStandardMaterial({
    map: woodTex,
    roughness: 0.32,
    metalness: 0.18
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.82,
    roughness: 0.22
  });

  const desktop = new THREE.Mesh(new THREE.BoxGeometry(4.65, 0.14, 1.98), woodMat);
  desktop.position.set(0, 0.97, 0.1);
  group.add(desktop);

  const body = new THREE.Mesh(new THREE.BoxGeometry(4.32, 0.9, 1.72), woodMat);
  body.position.set(0, 0.45, 0.1);
  group.add(body);

  const frontTrim = new THREE.Mesh(new THREE.BoxGeometry(4.38, 0.05, 0.04), brassMat);
  frontTrim.position.set(0, 0.86, 0.97);
  group.add(frontTrim);

  const shieldSeal = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.05, 20), brassMat);
  shieldSeal.rotation.x = Math.PI / 2;
  shieldSeal.position.set(0, 0.52, 0.97);
  group.add(shieldSeal);

  return group;
}

export function buildCarpetaDnuInteractive(root: THREE.Group): void {
  const anchor = new THREE.Group();
  anchor.position.set(-1.35, 1.04, 0.35);
  anchor.rotation.y = 0.18;
  anchor.userData = { deskId: 'CARPETA_DNU' as DeskInteractiveId };

  const fallback = new THREE.Group();
  const leatherMat = new THREE.MeshStandardMaterial({
    color: 0x172554,
    roughness: 0.38,
    metalness: 0.2,
    emissive: 0x1e3a8a,
    emissiveIntensity: 0.22
  });
  const paperMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.75 });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    metalness: 0.85,
    roughness: 0.2
  });

  const binderBase = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.06, 0.84), leatherMat);
  binderBase.position.y = 0.03;
  const pages = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.07, 0.76), paperMat);
  pages.position.set(0.02, 0.07, 0);
  const seal = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.02, 16), goldMat);
  seal.position.set(-0.22, 0.11, 0.05);

  const penBarrel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.024, 0.02, 0.58, 12),
    new THREE.MeshStandardMaterial({ color: 0x090d14, metalness: 0.7, roughness: 0.2 })
  );
  penBarrel.rotation.z = Math.PI / 2;
  penBarrel.rotation.y = -0.42;
  penBarrel.position.set(0.18, 0.13, 0.14);

  const stampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 0.06, 14), goldMat);
  stampBase.position.set(0.42, 0.09, -0.22);
  const stampHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.03, 0.16, 12), leatherMat);
  stampHandle.position.set(0.42, 0.19, -0.22);

  fallback.add(binderBase, pages, seal, penBarrel, stampBase, stampHandle);
  anchor.add(fallback);
  root.add(anchor);
  loadGlbIntoAnchor(anchor, '/models/carpeta_dnu.glb', 1);
}

export function buildTelefonoRojoInteractive(root: THREE.Group, isTense: boolean): void {
  const anchor = new THREE.Group();
  anchor.position.set(-0.2, 1.04, -0.15);
  anchor.userData = { deskId: 'TELEFONO_ROJO' as DeskInteractiveId };

  const fallback = new THREE.Group();
  const redMat = new THREE.MeshStandardMaterial({
    color: 0xdc2626,
    roughness: 0.25,
    metalness: 0.42,
    emissive: 0xef4444,
    emissiveIntensity: isTense ? 0.72 : 0.28
  });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    metalness: 0.85,
    roughness: 0.2
  });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.36, 0.22, 18), redMat);
  base.position.y = 0.11;
  const dialFace = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 18), brassMat);
  dialFace.position.set(0, 0.21, 0.12);
  dialFace.rotation.x = 0.45;

  const handsetBar = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.56, 12), redMat);
  handsetBar.rotation.z = Math.PI / 2;
  handsetBar.position.set(0, 0.29, -0.02);

  const leftBell = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.12, 14), redMat);
  leftBell.position.set(-0.26, 0.25, -0.02);
  const rightBell = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.07, 0.12, 14), redMat);
  rightBell.position.set(0.26, 0.25, -0.02);

  fallback.add(base, dialFace, handsetBar, leftBell, rightBell);
  anchor.add(fallback);
  root.add(anchor);
  loadGlbIntoAnchor(anchor, '/models/telefono_rojo.glb', 1);
}

export function buildTerminalBcraInteractive(root: THREE.Group): void {
  const anchor = new THREE.Group();
  anchor.position.set(1.25, 1.04, -0.18);
  anchor.rotation.y = -0.28;
  anchor.userData = { deskId: 'TERMINAL_BCRA' as DeskInteractiveId };

  const fallback = new THREE.Group();
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.25,
    metalness: 0.65
  });
  const screenTex = getBloombergTerminalTexture();
  const screenMat = new THREE.MeshStandardMaterial({
    map: screenTex,
    emissiveMap: screenTex,
    emissive: 0xffffff,
    emissiveIntensity: 0.65,
    roughness: 0.18
  });

  const standBase = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.04, 0.34), frameMat);
  standBase.position.set(0, 0.02, -0.08);
  const standNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.42, 10), frameMat);
  standNeck.position.set(0, 0.22, -0.12);

  const monitorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.68, 0.07), frameMat);
  monitorFrame.position.set(0, 0.48, -0.06);
  const screenPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.6), screenMat);
  screenPlane.position.set(0, 0.48, -0.02);

  const keyboard = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.04, 0.24), frameMat);
  keyboard.position.set(0, 0.03, 0.24);

  fallback.add(standBase, standNeck, monitorFrame, screenPlane, keyboard);
  anchor.add(fallback);
  root.add(anchor);
  loadGlbIntoAnchor(anchor, '/models/terminal_bcra.glb', 1);
}

export function buildSalaPrensaInteractive(root: THREE.Group): void {
  const anchor = new THREE.Group();
  anchor.position.set(0.38, 1.04, 0.48);
  anchor.rotation.y = -0.12;
  anchor.userData = { deskId: 'SALA_PRENSA' as DeskInteractiveId };

  const fallback = new THREE.Group();
  const newsTex = getNewspaperStackTexture();
  const paperTopMat = new THREE.MeshStandardMaterial({
    map: newsTex,
    roughness: 0.72,
    metalness: 0.05
  });
  const paperSideMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 });
  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.82,
    roughness: 0.22
  });

  const bottomStack = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.07, 0.64), paperSideMat);
  bottomStack.position.y = 0.035;
  bottomStack.rotation.y = 0.08;

  const topEdition = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.05, 0.62), paperTopMat);
  topEdition.position.set(0, 0.095, 0);

  const micBase = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.05, 16), brassMat);
  micBase.position.set(0.28, 0.14, -0.12);
  const micStem = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.34, 10), brassMat);
  micStem.position.set(0.28, 0.3, -0.06);
  micStem.rotation.x = 0.32;
  const micFoam = new THREE.Mesh(
    new THREE.SphereGeometry(0.045, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 })
  );
  micFoam.position.set(0.28, 0.45, 0.0);

  fallback.add(bottomStack, topEdition, micBase, micStem, micFoam);
  anchor.add(fallback);
  root.add(anchor);
  loadGlbIntoAnchor(anchor, '/models/pila_diarios.glb', 1);
}
