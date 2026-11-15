import fs from 'node:fs';
import path from 'node:path';

// Generador de activos 3D glTF 2.0 Binarios (.glb) para public/models/
// Construye mallas compuestas reales con normales, indices y materiales PBR
// compatibles con GLTFLoader, Blender, Windows 3D Viewer y Three.js Editor.

const OUT_DIR = path.resolve('packages/web-presentation/public/models');
fs.mkdirSync(OUT_DIR, { recursive: true });

function createBoxGeometryData(sx, sy, sz, ox = 0, oy = 0, oz = 0) {
  const hx = sx / 2;
  const hy = sy / 2;
  const hz = sz / 2;
  const faces = [
    { n: [0, 0, 1], v: [[-hx, -hy, hz], [hx, -hy, hz], [hx, hy, hz], [-hx, hy, hz]] },
    { n: [0, 0, -1], v: [[hx, -hy, -hz], [-hx, -hy, -hz], [-hx, hy, -hz], [hx, hy, -hz]] },
    { n: [0, 1, 0], v: [[-hx, hy, hz], [hx, hy, hz], [hx, hy, -hz], [-hx, hy, -hz]] },
    { n: [0, -1, 0], v: [[-hx, -hy, -hz], [hx, -hy, -hz], [hx, -hy, hz], [-hx, -hy, hz]] },
    { n: [1, 0, 0], v: [[hx, -hy, hz], [hx, -hy, -hz], [hx, hy, -hz], [hx, hy, hz]] },
    { n: [-1, 0, 0], v: [[-hx, -hy, -hz], [-hx, -hy, hz], [-hx, hy, hz], [-hx, hy, -hz]] }
  ];

  const positions = [];
  const normals = [];
  const indices = [];
  let vertOffset = 0;

  for (const f of faces) {
    for (const [vx, vy, vz] of f.v) {
      positions.push(vx + ox, vy + oy, vz + oz);
      normals.push(f.n[0], f.n[1], f.n[2]);
    }
    indices.push(
      vertOffset, vertOffset + 1, vertOffset + 2,
      vertOffset, vertOffset + 2, vertOffset + 3
    );
    vertOffset += 4;
  }

  return { positions, normals, indices };
}

function mergePrimitives(parts) {
  const positions = [];
  const normals = [];
  const indices = [];
  let vertOffset = 0;

  for (const p of parts) {
    const count = p.positions.length / 3;
    positions.push(...p.positions);
    normals.push(...p.normals);
    for (const idx of p.indices) {
      indices.push(idx + vertOffset);
    }
    vertOffset += count;
  }

  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < positions.length; i += 3) {
    min[0] = Math.min(min[0], positions[i]);
    min[1] = Math.min(min[1], positions[i + 1]);
    min[2] = Math.min(min[2], positions[i + 2]);
    max[0] = Math.max(max[0], positions[i]);
    max[1] = Math.max(max[1], positions[i + 1]);
    max[2] = Math.max(max[2], positions[i + 2]);
  }

  return { positions, normals, indices, min, max };
}

function buildGlbBuffer(name, parts, rgba, metallic = 0.25, roughness = 0.45) {
  const merged = mergePrimitives(parts);
  const posArray = new Float32Array(merged.positions);
  const normArray = new Float32Array(merged.normals);
  const idxArray = new Uint16Array(merged.indices);

  const posBytes = Buffer.from(posArray.buffer);
  const normBytes = Buffer.from(normArray.buffer);
  const idxBytes = Buffer.from(idxArray.buffer);
  const idxPad = (4 - (idxBytes.length % 4)) % 4;
  const binChunk = Buffer.concat([posBytes, normBytes, idxBytes, Buffer.alloc(idxPad)]);

  const gltfJson = {
    asset: { version: '2.0', generator: 'ArgentinaSim-GLB-v1' },
    scene: 0,
    scenes: [{ name, nodes: [0] }],
    nodes: [{ name, mesh: 0 }],
    materials: [
      {
        name: `${name}_mat`,
        pbrMetallicRoughness: {
          baseColorFactor: rgba,
          metallicFactor: metallic,
          roughnessFactor: roughness
        }
      }
    ],
    meshes: [
      {
        name,
        primitives: [
          {
            attributes: { POSITION: 0, NORMAL: 1 },
            indices: 2,
            material: 0
          }
        ]
      }
    ],
    buffers: [{ byteLength: binChunk.length }],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: posBytes.length, target: 34962 },
      { buffer: 0, byteOffset: posBytes.length, byteLength: normBytes.length, target: 34962 },
      {
        buffer: 0,
        byteOffset: posBytes.length + normBytes.length,
        byteLength: idxBytes.length,
        target: 34963
      }
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: posArray.length / 3,
        type: 'VEC3',
        min: merged.min,
        max: merged.max
      },
      {
        bufferView: 1,
        componentType: 5126,
        count: normArray.length / 3,
        type: 'VEC3'
      },
      {
        bufferView: 2,
        componentType: 5123,
        count: idxArray.length,
        type: 'SCALAR'
      }
    ]
  };

  const jsonRaw = Buffer.from(JSON.stringify(gltfJson), 'utf8');
  const jsonPad = (4 - (jsonRaw.length % 4)) % 4;
  const jsonChunk = Buffer.concat([jsonRaw, Buffer.alloc(jsonPad, 0x20)]);

  const totalLength = 12 + 8 + jsonChunk.length + 8 + binChunk.length;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0); // 'glTF'
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLength, 8);

  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(jsonChunk.length, 0);
  jsonHeader.writeUInt32LE(0x4e4f534a, 4); // 'JSON'

  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(binChunk.length, 0);
  binHeader.writeUInt32LE(0x004e4942, 4); // 'BIN\0'

  return Buffer.concat([header, jsonHeader, jsonChunk, binHeader, binChunk]);
}

const MODELS_SPECS = [
  {
    file: 'obelisco.glb',
    rgba: [0.91, 0.89, 0.85, 1.0],
    parts: [
      createBoxGeometryData(1.2, 0.25, 1.2, 0, 0.12, 0),
      createBoxGeometryData(0.55, 3.2, 0.55, 0, 1.8, 0),
      createBoxGeometryData(0.32, 0.65, 0.32, 0, 3.7, 0)
    ]
  },
  {
    file: 'casa_rosada.glb',
    rgba: [0.88, 0.45, 0.52, 1.0],
    parts: [
      createBoxGeometryData(2.3, 0.92, 1.18, 0, 0.46, 0),
      createBoxGeometryData(0.62, 1.18, 1.26, 0, 0.59, 0.04)
    ]
  },
  {
    file: 'congreso.glb',
    rgba: [0.18, 0.72, 0.58, 1.0],
    parts: [
      createBoxGeometryData(2.1, 0.65, 1.15, 0, 0.32, 0),
      createBoxGeometryData(0.75, 1.25, 0.75, 0, 1.1, 0)
    ]
  },
  {
    file: 'vaca_muerta_rig.glb',
    rgba: [0.95, 0.55, 0.12, 1.0],
    parts: [
      createBoxGeometryData(1.5, 0.25, 1.2, 0, 0.12, 0),
      createBoxGeometryData(0.55, 2.4, 0.55, -0.25, 1.3, 0),
      createBoxGeometryData(1.1, 0.3, 0.22, 0.55, 0.9, 0.2)
    ]
  },
  {
    file: 'litio_planta.glb',
    rgba: [0.14, 0.83, 0.93, 1.0],
    parts: [
      createBoxGeometryData(2.2, 0.16, 1.6, 0, 0.08, 0),
      createBoxGeometryData(0.95, 0.55, 0.62, 0, 0.35, -0.5)
    ]
  },
  {
    file: 'complejo_agro.glb',
    rgba: [0.85, 0.87, 0.9, 1.0],
    parts: [
      createBoxGeometryData(0.65, 1.45, 0.65, -0.8, 0.72, 0),
      createBoxGeometryData(0.65, 1.45, 0.65, 0, 0.72, 0),
      createBoxGeometryData(0.65, 1.45, 0.65, 0.8, 0.72, 0),
      createBoxGeometryData(2.2, 0.18, 0.24, 0, 1.65, 0)
    ]
  },
  {
    file: 'eolico_patagonia.glb',
    rgba: [0.95, 0.97, 0.99, 1.0],
    parts: [
      createBoxGeometryData(0.22, 2.65, 0.22, 0, 1.32, 0),
      createBoxGeometryData(0.28, 0.28, 0.65, 0, 2.68, 0.1),
      createBoxGeometryData(0.12, 1.8, 0.06, 0, 2.68, 0.42)
    ]
  },
  {
    file: 'represa_hidro.glb',
    rgba: [0.58, 0.64, 0.72, 1.0],
    parts: [
      createBoxGeometryData(2.4, 1.35, 0.55, 0, 0.68, 0),
      createBoxGeometryData(1.2, 0.48, 0.52, 0, 0.24, 0.45)
    ]
  },
  {
    file: 'sillon_rivadavia.glb',
    rgba: [0.05, 0.65, 0.91, 1.0],
    parts: [
      createBoxGeometryData(1.42, 1.85, 0.2, 0, 1.1, -0.2),
      createBoxGeometryData(1.32, 0.24, 0.95, 0, 0.35, 0.22)
    ]
  },
  {
    file: 'carpeta_dnu.glb',
    rgba: [0.11, 0.23, 0.54, 1.0],
    parts: [
      createBoxGeometryData(1.12, 0.08, 0.84, 0, 0.04, 0),
      createBoxGeometryData(0.58, 0.04, 0.04, 0.18, 0.12, 0.14)
    ]
  },
  {
    file: 'telefono_rojo.glb',
    rgba: [0.86, 0.15, 0.15, 1.0],
    parts: [
      createBoxGeometryData(0.58, 0.22, 0.48, 0, 0.11, 0),
      createBoxGeometryData(0.62, 0.09, 0.14, 0, 0.28, 0)
    ]
  },
  {
    file: 'terminal_bcra.glb',
    rgba: [0.06, 0.73, 0.51, 1.0],
    parts: [
      createBoxGeometryData(0.48, 0.04, 0.34, 0, 0.02, -0.08),
      createBoxGeometryData(1.18, 0.68, 0.07, 0, 0.48, -0.06),
      createBoxGeometryData(0.68, 0.04, 0.24, 0, 0.03, 0.24)
    ]
  },
  {
    file: 'pila_diarios.glb',
    rgba: [0.96, 0.94, 0.88, 1.0],
    parts: [
      createBoxGeometryData(0.86, 0.12, 0.64, 0, 0.06, 0),
      createBoxGeometryData(0.08, 0.36, 0.08, 0.28, 0.26, -0.06)
    ]
  },
  {
    file: 'atril_prensa.glb',
    rgba: [0.38, 0.16, 0.06, 1.0],
    parts: [
      createBoxGeometryData(1.62, 0.16, 0.96, 0, 0.08, 0),
      createBoxGeometryData(1.36, 1.18, 0.76, 0, 0.72, 0),
      createBoxGeometryData(1.56, 0.12, 0.92, 0, 1.34, 0.02)
    ]
  }
];

for (const spec of MODELS_SPECS) {
  const buf = buildGlbBuffer(spec.file.replace('.glb', ''), spec.parts, spec.rgba);
  fs.writeFileSync(path.join(OUT_DIR, spec.file), buf);
}

console.log(`Generated ${MODELS_SPECS.length} binary glTF 2.0 (.glb) models in ${OUT_DIR}`);
