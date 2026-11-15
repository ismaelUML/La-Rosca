import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FileSignature, Landmark, PhoneCall, Tv } from 'lucide-react';
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

// Despacho Presidencial 3D Interactivo en Casa Rosada ("El Sillon de Rivadavia"):
// Escena Three.js con modelos 3D multicapa, texturas PBR de caoba/SIOPEL/diarios
// y soporte de carga de activos .glb en public/models/.

interface DeskItemSpec {
  id: DeskInteractiveId;
  title: string;
  subtitle: string;
}

const DESK_ITEMS: DeskItemSpec[] = [
  {
    id: 'CARPETA_DNU',
    title: 'Carpeta de Decretos (DNU)',
    subtitle: 'Despacho de Medidas y Leyes'
  },
  {
    id: 'TELEFONO_ROJO',
    title: 'Teléfono Rojo Federal',
    subtitle: 'Cumbre de Gobernadores y Escudo'
  },
  {
    id: 'TERMINAL_BCRA',
    title: 'Terminal SIOPEL / BCRA',
    subtitle: 'Rueda Intradía del Dólar en Vivo'
  },
  {
    id: 'SALA_PRENSA',
    title: 'Atril y Sala de Prensa',
    subtitle: 'Conferencia / Cadena Nacional'
  }
];

function createInteractiveDeskObjects(group: THREE.Group, isTense: boolean): void {
  buildCarpetaDnuInteractive(group);
  buildTelefonoRojoInteractive(group, isTense);
  buildTerminalBcraInteractive(group);
  buildSalaPrensaInteractive(group);
}

const DESK_LIGHTING_BY_TENSION = {
  true: { bg: 0x14080c, winColor: 0x7f1d1d, winEmissive: 0xdc2626 },
  false: { bg: 0x070b13, winColor: 0x0c243c, winEmissive: 0x0284c7 }
} as const;

function buildPresidentialFlagsGroup(): THREE.Group {
  const group = new THREE.Group();
  const poleMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.85, roughness: 0.2 });
  const celesteMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.55 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55 });

  for (const fx of [-1.45, 1.45]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 2.55, 10), poleMat);
    pole.position.set(fx, 1.25, -1.55);
    const drapeLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.13, 1.45, 10), celesteMat);
    drapeLeft.position.set(fx - 0.05, 1.42, -1.52);
    const drapeMid = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.1, 1.42, 10), whiteMat);
    drapeMid.position.set(fx, 1.42, -1.49);
    group.add(pole, drapeLeft, drapeMid);
  }
  return group;
}

function buildCasaRosadaDeskScene(container: HTMLDivElement, isTense: boolean) {
  const palette = DESK_LIGHTING_BY_TENSION[String(isTense) as 'true' | 'false'];
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(palette.bg);

  const w = container.clientWidth || 640;
  const h = container.clientHeight || 235;
  const camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 100);
  camera.position.set(0, 3.25, 4.55);
  camera.lookAt(0, 1.15, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xfef3c7, 0x0f172a, 1.05));
  const deskLamp = new THREE.PointLight(0xfbbf24, 2.6, 15);
  deskLamp.position.set(-1.5, 3.2, 1.4);
  scene.add(deskLamp);

  const windowGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(7.2, 3.2),
    new THREE.MeshStandardMaterial({
      color: palette.winColor,
      emissive: palette.winEmissive,
      emissiveIntensity: 0.35
    })
  );
  windowGlow.position.set(0, 2.1, -2.2);
  scene.add(windowGlow);

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
      camera.position.x = Math.sin(t * 0.45) * 0.42;
      camera.lookAt(0, 1.15, 0);
      renderer.render(scene, camera);
    };
    tick();

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
      renderer.domElement.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('pointerup', onClick);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [isTense]);

  return (
    <div className="hoi-panel rounded-sm p-4 space-y-3 border border-[#8a6d33]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#263142] pb-2">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 block">
            BALCARCE 50 · SALA DE SITUACIÓN 3D INTERACTIVA
          </span>
          <h3 className="text-sm font-serif font-bold uppercase text-amber-100">
            El Sillón de Rivadavia y Mesa de Decisiones en Vivo
          </h3>
        </div>
        <span className="px-2.5 py-1 rounded-sm bg-[#090d14] border border-[#263142] text-[10px] font-mono text-sky-300">
          Tocá los modelos 3D sobre el escritorio o usá los comandos rápidos
        </span>
      </div>

      <div className="relative rounded-sm overflow-hidden border border-[#263142] bg-[#05080d]">
        <div ref={containerRef} className="w-full h-[215px]" />
        {hoveredDeskId ? (
          <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-sm bg-[#090d14]/95 border border-[#b89342] text-[11px] font-mono text-amber-200">
            Modelo 3D activo: <strong>{hoveredDeskId}</strong> (Clic para abrir)
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {DESK_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => triggerActionRef.current(item.id)}
            className="p-2.5 rounded-sm bg-[#090d14] hover:bg-[#141f31] border border-[#263142] hover:border-[#b89342] text-left transition space-y-0.5"
          >
            <div className="text-xs font-mono font-bold text-amber-200 flex items-center justify-between">
              <span>{item.title}</span>
              {item.id === 'CARPETA_DNU' ? <FileSignature className="w-3.5 h-3.5 text-sky-400" /> : null}
              {item.id === 'TELEFONO_ROJO' ? <PhoneCall className="w-3.5 h-3.5 text-rose-400" /> : null}
              {item.id === 'TERMINAL_BCRA' ? <Landmark className="w-3.5 h-3.5 text-emerald-400" /> : null}
              {item.id === 'SALA_PRENSA' ? <Tv className="w-3.5 h-3.5 text-amber-400" /> : null}
            </div>
            <div className="text-[10px] font-mono text-slate-400">{item.subtitle}</div>
          </button>
        ))}
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
