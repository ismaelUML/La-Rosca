import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Cargador centralizado de modelos 3D glTF/GLB (Three.js GLTFLoader)
// con cache en memoria, validacion de generador y re-etiquetado de raycasting.

const gltfLoader = new GLTFLoader();
const MODEL_CACHE = new Map<string, GLTF>();
const PENDING_LOADS = new Map<string, Promise<GLTF | null>>();

export const BUILTIN_GLB_GENERATOR = 'ArgentinaSim-GLB-v1';

function enableMeshShadows(root: THREE.Object3D) {
  root.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.isMesh) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
  });
}

export function loadGlbAsset(modelPath: string): Promise<GLTF | null> {
  const cached = MODEL_CACHE.get(modelPath);
  if (cached) {
    return Promise.resolve(cached);
  }

  const inflight = PENDING_LOADS.get(modelPath);
  if (inflight) {
    return inflight;
  }

  const promise = new Promise<GLTF | null>((resolve) => {
    gltfLoader.load(
      modelPath,
      (gltf) => {
        enableMeshShadows(gltf.scene);
        MODEL_CACHE.set(modelPath, gltf);
        PENDING_LOADS.delete(modelPath);
        resolve(gltf);
      },
      undefined,
      () => {
        PENDING_LOADS.delete(modelPath);
        resolve(null);
      }
    );
  });

  PENDING_LOADS.set(modelPath, promise);
  return promise;
}

function isCustomExternalGlb(gltf: GLTF): boolean {
  const gen = gltf.asset?.generator ?? '';
  return Boolean(gen) && gen !== BUILTIN_GLB_GENERATOR;
}

export function loadGlbIntoAnchor(
  anchor: THREE.Group,
  modelPath: string,
  scale = 1
): void {
  loadGlbAsset(modelPath)
    .then((gltf) => {
      if (!gltf || !isCustomExternalGlb(gltf)) return;
      const clone = gltf.scene.clone(true);
      enableMeshShadows(clone);
      clone.scale.setScalar(scale);
      anchor.clear();
      anchor.add(clone);
    })
    .catch(() => undefined);
}
