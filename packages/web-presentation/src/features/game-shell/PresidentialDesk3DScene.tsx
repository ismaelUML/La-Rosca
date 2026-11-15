import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { FileSignature, Landmark, Newspaper, PhoneCall, Tv } from 'lucide-react';
import type { PolicyAction, SimulationState } from '@argentina-sim/domain';
import type { InGameSidebarSection } from './GameSidebarLayout.js';
import { playUiSound } from '@/lib/gameFeedback';
import { BcraIntradayMarketModal } from './BcraIntradayMarketModal.js';
import { FederalSummitAndCrisisModal } from './FederalSummitAndCrisisModal.js';
import { PressAndDebateSimulatorModal } from './PressAndDebateSimulatorModal.js';

// Despacho Presidencial 3D Interactivo en Casa Rosada ("El Sillon de Rivadavia"):
// Escena Three.js con escritorio de caoba, ventanal hacia Plaza de Mayo y 4 objetos
// fisicos interactivos con raycasting (Carpeta DNU, Telefono Rojo, Terminal BCRA, Prensa).

type DeskInteractiveId = 'CARPETA_DNU' | 'TELEFONO_ROJO' | 'TERMINAL_BCRA' | 'SALA_PRENSA';

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

function createInteractiveDeskObjects(group: THREE.Group, isTense: boolean): THREE.Mesh[] {
  const interactives: THREE.Mesh[] = [];

  const folder = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.12, 0.85),
    new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      roughness: 0.4,
      metalness: 0.25,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.28
    })
  );
  folder.position.set(-1.35, 1.08, 0.35);
  folder.rotation.y = 0.18;
  folder.userData = { deskId: 'CARPETA_DNU' as DeskInteractiveId };
  group.add(folder);
  interactives.push(folder);

  const phone = new THREE.Mesh(
    new THREE.BoxGeometry(0.62, 0.34, 0.52),
    new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.28,
      metalness: 0.45,
      emissive: 0xef4444,
      emissiveIntensity: isTense ? 0.85 : 0.38
    })
  );
  phone.position.set(-0.2, 1.18, -0.15);
  phone.userData = { deskId: 'TELEFONO_ROJO' as DeskInteractiveId };
  group.add(phone);
  interactives.push(phone);

  const terminal = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 0.72, 0.16),
    new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.6,
      emissive: 0x10b981,
      emissiveIntensity: 0.52
    })
  );
  terminal.position.set(1.25, 1.38, -0.18);
  terminal.rotation.y = -0.28;
  terminal.userData = { deskId: 'TERMINAL_BCRA' as DeskInteractiveId };
  group.add(terminal);
  interactives.push(terminal);

  const pressPapers = new THREE.Mesh(
    new THREE.BoxGeometry(0.92, 0.18, 0.68),
    new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      roughness: 0.65,
      metalness: 0.1,
      emissive: 0xd97706,
      emissiveIntensity: 0.25
    })
  );
  pressPapers.position.set(0.38, 1.1, 0.48);
  pressPapers.rotation.y = -0.12;
  pressPapers.userData = { deskId: 'SALA_PRENSA' as DeskInteractiveId };
  group.add(pressPapers);
  interactives.push(pressPapers);

  return interactives;
}

const DESK_LIGHTING_BY_TENSION = {
  true: { bg: 0x14080c, winColor: 0x7f1d1d, winEmissive: 0xdc2626 },
  false: { bg: 0x070b13, winColor: 0x0c243c, winEmissive: 0x0284c7 }
} as const;

function buildCasaRosadaDeskScene(container: HTMLDivElement, isTense: boolean) {
  const palette = DESK_LIGHTING_BY_TENSION[String(isTense) as 'true' | 'false'];
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(palette.bg);

  const w = container.clientWidth || 640;
  const h = container.clientHeight || 235;
  const camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 100);
  camera.position.set(0, 3.35, 4.65);
  camera.lookAt(0, 1.15, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xfef3c7, 0x0f172a, 0.95));
  const deskLamp = new THREE.PointLight(0xfbbf24, 2.4, 14);
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

  const sillon = new THREE.Mesh(
    new THREE.BoxGeometry(1.35, 1.85, 0.45),
    new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.45, metalness: 0.25 })
  );
  sillon.position.set(0, 1.35, -1.15);
  scene.add(sillon);

  const desk = new THREE.Mesh(
    new THREE.BoxGeometry(4.4, 1.0, 1.85),
    new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.38, metalness: 0.28 })
  );
  desk.position.set(0, 0.5, 0.1);
  scene.add(desk);

  const rootGroup = new THREE.Group();
  const interactives = createInteractiveDeskObjects(rootGroup, isTense);
  scene.add(rootGroup);

  return { scene, camera, renderer, interactives };
}

function pickDeskObject(
  e: PointerEvent,
  dom: HTMLElement,
  camera: THREE.Camera,
  interactives: THREE.Mesh[]
): DeskInteractiveId | null {
  const rect = dom.getBoundingClientRect();
  const ptr = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    -((e.clientY - rect.top) / rect.height) * 2 + 1
  );
  const ray = new THREE.Raycaster();
  ray.setFromCamera(ptr, camera);
  const hits = ray.intersectObjects(interactives, false);
  const mesh = hits[0]?.object as THREE.Mesh | undefined;
  return (mesh?.userData as { deskId?: DeskInteractiveId } | undefined)?.deskId ?? null;
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
    const { scene, camera, renderer, interactives } = buildCasaRosadaDeskScene(container, isTense);

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
      const id = pickDeskObject(e, renderer.domElement, camera, interactives);
      setHoveredDeskId(id);
      renderer.domElement.style.cursor = id ? 'pointer' : 'default';
    };
    const onClick = (e: PointerEvent) => {
      const id = pickDeskObject(e, renderer.domElement, camera, interactives);
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
          Tocá los objetos 3D sobre el escritorio o usá los comandos rápidos
        </span>
      </div>

      <div className="relative rounded-sm overflow-hidden border border-[#263142] bg-[#05080d]">
        <div ref={containerRef} className="w-full h-[210px]" />
        {hoveredDeskId ? (
          <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-sm bg-[#090d14]/95 border border-[#b89342] text-[11px] font-mono text-amber-200">
            Objeto seleccionado: <strong>{hoveredDeskId}</strong> (Clic para abrir)
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
