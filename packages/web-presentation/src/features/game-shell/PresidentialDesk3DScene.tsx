import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { PolicyAction, SimulationState } from '@argentina-sim/domain';
import type { InGameSidebarSection } from './GameSidebarLayout.js';
import { playUiSound } from '@/lib/gameFeedback';
import { BcraIntradayMarketModal } from './BcraIntradayMarketModal.js';
import { FederalSummitAndCrisisModal } from './FederalSummitAndCrisisModal.js';
import { PressAndDebateSimulatorModal } from './PressAndDebateSimulatorModal.js';
import {
  buildCarpetaDnuInteractive,
  buildMahoganyPresidentialDeskGroup,
  buildSalaPrensaInteractive,
  buildSillonDeRivadaviaGroup,
  buildTelefonoRojoInteractive,
  buildTerminalBcraInteractive,
  type DeskInteractiveId
} from './presidentialDesk3dModels.js';

// Despacho Presidencial 3D Interactivo ("El Sillon de Rivadavia"):
// Direccion de arte Casa Rosada (paredes rosadas, molduras crema, luz calida de velador,
// ResizeObserver sin franjas negras y etiquetas 3D->2D proyectadas sobre cada objeto).

interface DeskItemSpec {
  id: DeskInteractiveId;
  shortTag: string;
  title: string;
  anchorPos: [number, number, number];
}

const DESK_ITEMS: DeskItemSpec[] = [
  {
    id: 'CARPETA_DNU',
    shortTag: 'DNU · Medidas',
    title: 'Carpeta de Decretos',
    anchorPos: [-1.35, 1.38, 0.35]
  },
  {
    id: 'TELEFONO_ROJO',
    shortTag: 'Gobernadores',
    title: 'Teléfono Rojo Federal',
    anchorPos: [-0.2, 1.52, -0.15]
  },
  {
    id: 'TERMINAL_BCRA',
    shortTag: 'Mercados · MULC',
    title: 'Monitor BCRA',
    anchorPos: [1.25, 1.72, -0.18]
  },
  {
    id: 'SALA_PRENSA',
    shortTag: 'Prensa · Cadena',
    title: 'Atril y Ventana',
    anchorPos: [0.42, 1.65, 0.48]
  }
];

function createInteractiveDeskObjects(group: THREE.Group, isTense: boolean): void {
  buildCarpetaDnuInteractive(group);
  buildTelefonoRojoInteractive(group, isTense);
  buildTerminalBcraInteractive(group);
  buildSalaPrensaInteractive(group);
}

const DESK_LIGHTING_BY_TENSION = {
  true: { bg: 0x1a080f, wall: 0x6b2038, winEmissive: 0xbe123c },
  false: { bg: 0x12080d, wall: 0x5c2238, winEmissive: 0xeb3f7d }
} as const;

function buildPresidentialFlagsGroup(): THREE.Group {
  const group = new THREE.Group();
  const poleMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.2 });
  const celesteMat = new THREE.MeshStandardMaterial({ color: 0x7dd3fc, roughness: 0.55 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55 });

  for (const fx of [-1.55, 1.55]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 2.65, 10), poleMat);
    pole.position.set(fx, 1.3, -1.65);
    const drapeLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.13, 1.48, 10), celesteMat);
    drapeLeft.position.set(fx - 0.05, 1.46, -1.62);
    const drapeMid = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 1.44, 10), whiteMat);
    drapeMid.position.set(fx, 1.46, -1.59);
    group.add(pole, drapeLeft, drapeMid);
  }
  return group;
}

function buildCasaRosadaRoomArchitecture(wallHex: number, winEmissiveHex: number): THREE.Group {
  const room = new THREE.Group();
  const wallMat = new THREE.MeshStandardMaterial({ color: wallHex, roughness: 0.85, metalness: 0.04 });
  const trimMat = new THREE.MeshStandardMaterial({ color: 0xefe9da, roughness: 0.6 });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x1b0e13, roughness: 0.78 });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x160a14,
    emissive: winEmissiveHex,
    emissiveIntensity: 0.18,
    roughness: 0.25
  });

  const backWall = new THREE.Mesh(new THREE.PlaneGeometry(14, 6.2), wallMat);
  backWall.position.set(0, 2.4, -2.55);
  const molding = new THREE.Mesh(new THREE.BoxGeometry(14, 0.14, 0.08), trimMat);
  molding.position.set(0, 1.15, -2.5);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;

  const winFrame = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.9, 0.1), trimMat);
  winFrame.position.set(0, 2.65, -2.48);
  const winPane = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.6), glassMat);
  winPane.position.set(0, 2.65, -2.41);

  room.add(backWall, molding, floor, winFrame, winPane);
  return room;
}

function buildCasaRosadaDeskScene(container: HTMLDivElement, isTense: boolean) {
  const palette = DESK_LIGHTING_BY_TENSION[String(isTense) as 'true' | 'false'];
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(palette.bg);

  const w = container.clientWidth || 720;
  const h = container.clientHeight || 330;
  const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);
  camera.position.set(0, 2.95, 4.35);
  camera.lookAt(0, 1.15, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xffe9f0, 0x1b0c12, 1.15));
  const bankerLamp = new THREE.PointLight(0xffedd5, 3.2, 16);
  bankerLamp.position.set(-1.3, 3.2, 1.5);
  bankerLamp.castShadow = true;
  scene.add(bankerLamp);

  const pinkFill = new THREE.DirectionalLight(0xf9a8d4, 0.65);
  pinkFill.position.set(2.4, 2.8, 2.0);
  scene.add(pinkFill);

  scene.add(buildCasaRosadaRoomArchitecture(palette.wall, palette.winEmissive));
  scene.add(buildPresidentialFlagsGroup());
  scene.add(buildSillonDeRivadaviaGroup());
  scene.add(buildMahoganyPresidentialDeskGroup());

  const rootGroup = new THREE.Group();
  createInteractiveDeskObjects(rootGroup, isTense);
  scene.add(rootGroup);

  return { scene, camera, renderer, rootGroup };
}

function findDeskIdFromObject(obj: THREE.Object3D | null): DeskInteractiveId | null {
  let curr: THREE.Object3D | null = obj;
  while (curr) {
    const id = (curr.userData as { deskId?: DeskInteractiveId } | undefined)?.deskId;
    if (id) return id;
    curr = curr.parent;
  }
  return null;
}

function pickDeskObject(
  e: PointerEvent,
  dom: HTMLElement,
  camera: THREE.Camera,
  rootGroup: THREE.Group
): DeskInteractiveId | null {
  const rect = dom.getBoundingClientRect();
  const ptr = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    -((e.clientY - rect.top) / rect.height) * 2 + 1
  );
  const ray = new THREE.Raycaster();
  ray.setFromCamera(ptr, camera);
  const hits = ray.intersectObjects(rootGroup.children, true);
  return findDeskIdFromObject(hits[0]?.object ?? null);
}

function projectDeskTagPositions(
  camera: THREE.PerspectiveCamera,
  container: HTMLDivElement,
  tagRefs: Record<string, HTMLButtonElement | null>
) {
  const w = container.clientWidth;
  const h = container.clientHeight;
  if (w <= 0 || h <= 0) return;

  for (const item of DESK_ITEMS) {
    const el = tagRefs[item.id];
    if (!el) continue;
    const vec = new THREE.Vector3(...item.anchorPos);
    vec.project(camera);
    const px = (vec.x * 0.5 + 0.5) * w;
    const py = (-vec.y * 0.5 + 0.5) * h;
    el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) translate(-50%, -100%)`;
  }
}

export function PresidentialDesk3DScene({
  state,
  speakerName,
  onNavigate,
  onDispatch
}: {
  state: SimulationState;
  speakerName: string;
  onNavigate: (sec: InGameSidebarSection) => void;
  onDispatch?: (action: PolicyAction) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tagRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [hoveredDeskId, setHoveredDeskId] = useState<DeskInteractiveId | null>(null);
  const [bcraOpen, setBcraOpen] = useState(false);
  const [summitOpen, setSummitOpen] = useState(false);
  const [pressOpen, setPressOpen] = useState(false);

  const isTense = state.labor.activeNationalStrike || state.inflation.realMonthlyIpcPct > 6;

  const triggerActionRef = useRef((id: DeskInteractiveId) => {
    playUiSound('select');
    if (id === 'CARPETA_DNU') onNavigate('MEDIDAS');
    if (id === 'TELEFONO_ROJO') setSummitOpen(true);
    if (id === 'TERMINAL_BCRA') setBcraOpen(true);
    if (id === 'SALA_PRENSA') setPressOpen(true);
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const { scene, camera, renderer, rootGroup } = buildCasaRosadaDeskScene(container, isTense);

    let animId = 0;
    const tick = () => {
      animId = requestAnimationFrame(tick);
      const t = performance.now() * 0.001;
      camera.position.x = Math.sin(t * 0.35) * 0.25;
      camera.lookAt(0, 1.15, 0);
      renderer.render(scene, camera);
      projectDeskTagPositions(camera, container, tagRefs.current);
    };
    tick();

    const resizeObs = new ResizeObserver(() => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      if (nw <= 0 || nh <= 0) return;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
    resizeObs.observe(container);

    const onMove = (e: PointerEvent) => {
      const id = pickDeskObject(e, renderer.domElement, camera, rootGroup);
      setHoveredDeskId(id);
      renderer.domElement.style.cursor = id ? 'pointer' : 'default';
    };
    const onClick = (e: PointerEvent) => {
      const id = pickDeskObject(e, renderer.domElement, camera, rootGroup);
      if (id) triggerActionRef.current(id);
    };

    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('pointerup', onClick);

    return () => {
      cancelAnimationFrame(animId);
      resizeObs.disconnect();
      renderer.domElement.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('pointerup', onClick);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [isTense]);

  return (
    <div className="hoi-panel rounded-lg p-4 space-y-3 border border-[#EB3F7D]/45">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#EB3F7D] block">
            BALCARCE 50 · SALA DE SITUACIÓN 3D
          </span>
          <h3 className="font-display text-lg uppercase tracking-wide text-[#F5EFE6]">
            El Sillón de Rivadavia
          </h3>
        </div>
        <span className="px-2.5 py-1 rounded bg-[#090407] border border-white/15 text-[10px] font-mono text-slate-300">
          Tocá directamente el Teléfono, Monitor, Carpeta o Atril
        </span>
      </div>

      <div className="relative rounded-lg overflow-hidden border border-white/15 bg-[#12080d]">
        <div ref={containerRef} className="w-full h-[300px] sm:h-[340px]" />

        {DESK_ITEMS.map((item) => {
          const isHovered = hoveredDeskId === item.id;
          return (
            <button
              key={item.id}
              ref={(el) => {
                tagRefs.current[item.id] = el;
              }}
              type="button"
              onMouseEnter={() => setHoveredDeskId(item.id)}
              onMouseLeave={() => setHoveredDeskId(null)}
              onClick={() => triggerActionRef.current(item.id)}
              style={{ left: 0, top: 0 }}
              className={`absolute z-10 px-2 py-1 border text-left transition-colors shadow-lg ${isHovered
                  ? 'bg-[#EB3F7D] text-[#090407] border-[#f472b6]'
                  : 'bg-[#090407]/88 text-[#F5EFE6] border-[#EB3F7D]/60 hover:bg-[#EB3F7D] hover:text-[#090407]'
                }`}
            >
              <div className="text-[9px] font-mono font-extrabold uppercase tracking-wider leading-none">
                {item.shortTag}
              </div>
              <div className="text-[10px] font-semibold leading-tight mt-0.5 opacity-90">
                {item.title}
              </div>
            </button>
          );
        })}
      </div>

      <BcraIntradayMarketModal
        open={bcraOpen}
        state={state}
        onDispatch={onDispatch}
        onClose={() => setBcraOpen(false)}
      />
      <FederalSummitAndCrisisModal
        open={summitOpen}
        state={state}
        onDispatch={onDispatch}
        onClose={() => setSummitOpen(false)}
      />
      <PressAndDebateSimulatorModal
        open={pressOpen}
        speakerName={speakerName}
        onClose={() => setPressOpen(false)}
      />
    </div>
  );
}
