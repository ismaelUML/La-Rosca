import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CheckCircle2, FileCheck2, ShieldAlert, Sparkles } from 'lucide-react';
import { playUiSound } from '@/lib/gameFeedback';

// Recinto 3D del Congreso de la Nacion con camara orbital Three.js
// y modulo de Votacion en Particular (Capitulo por Capitulo) de proyectos de ley.

export interface Hemicycle3DSeatInput {
  index: number;
  x: number;
  y: number;
  vote: 'YES' | 'NO' | 'ABST';
  blocColor: string;
}

const VOTE_HEX_MAP: Record<'YES' | 'NO' | 'ABST', number> = {
  YES: 0x10b981,
  NO: 0xef4444,
  ABST: 0xf59e0b
};

function createHemicycleScene(container: HTMLDivElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x06090f);
  scene.fog = new THREE.FogExp2(0x06090f, 0.018);

  const w = container.clientWidth || 440;
  const h = container.clientHeight || 240;
  const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 180);
  camera.position.set(0, 14.5, 19.5);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI / 2.2;
  controls.minDistance = 9;
  controls.maxDistance = 34;
  controls.target.set(0, 1.2, -2.5);

  scene.add(new THREE.HemisphereLight(0xfef3c7, 0x0f172a, 0.95));
  const spot = new THREE.DirectionalLight(0xfffbeb, 1.45);
  spot.position.set(8, 22, 12);
  scene.add(spot);

  const floor = new THREE.Mesh(
    new THREE.CylinderGeometry(18, 18, 0.3, 48),
    new THREE.MeshStandardMaterial({ color: 0x0c1320, roughness: 0.78, metalness: 0.22 })
  );
  floor.position.set(0, -0.2, -2);
  scene.add(floor);

  const dais = new THREE.Mesh(
    new THREE.BoxGeometry(5.6, 1.35, 1.8),
    new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.45, metalness: 0.35 })
  );
  dais.position.set(0, 0.55, 2.2);
  scene.add(dais);

  const board = new THREE.Mesh(
    new THREE.BoxGeometry(8.5, 2.2, 0.2),
    new THREE.MeshStandardMaterial({
      color: 0x090d14,
      emissive: 0xb89342,
      emissiveIntensity: 0.22
    })
  );
  board.position.set(0, 2.8, 3.2);
  scene.add(board);

  return { scene, camera, renderer, controls };
}

function buildSeatMeshesGroup(seats: Hemicycle3DSeatInput[]): {
  group: THREE.Group;
  ledMeshes: THREE.Mesh[];
} {
  const group = new THREE.Group();
  const ledMeshes: THREE.Mesh[] = [];
  const deskGeo = new THREE.BoxGeometry(0.42, 0.34, 0.28);
  const orbGeo = new THREE.SphereGeometry(0.18, 10, 10);
  const deskMat = new THREE.MeshStandardMaterial({
    color: 0x451a03,
    roughness: 0.5,
    metalness: 0.3
  });

  for (const s of seats) {
    const sx = s.x * 0.075;
    const sz = s.y * 0.075 + 2.2;
    const dist = Math.hypot(sx, sz - 2.2);
    const tierY = Math.max(0, (dist - 4.5) * 0.26);

    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(sx, tierY + 0.17, sz);
    desk.lookAt(0, tierY, 2.2);
    group.add(desk);

    const orbMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      emissive: 0x0f172a,
      emissiveIntensity: 0.2,
      roughness: 0.2
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.set(sx, tierY + 0.46, sz);
    orb.userData = { vote: s.vote };
    group.add(orb);
    ledMeshes.push(orb);
  }

  return { group, ledMeshes };
}

function updateSeatLedMaterials(ledMeshes: THREE.Mesh[], revealedCount: number) {
  for (let i = 0; i < ledMeshes.length; i += 1) {
    const mesh = ledMeshes[i];
    if (!mesh) continue;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    const isRevealed = i < revealedCount;
    const vote = (mesh.userData as { vote: 'YES' | 'NO' | 'ABST' }).vote;
    const hex = isRevealed ? VOTE_HEX_MAP[vote] : 0x1e293b;
    mat.color.setHex(hex);
    mat.emissive.setHex(hex);
    mat.emissiveIntensity = isRevealed ? 0.85 : 0.12;
  }
}

export function Congress3DHemicycleCanvas({
  seats,
  revealedCount,
  chamberLabel,
  majorityNeeded,
  liveYes
}: {
  seats: Hemicycle3DSeatInput[];
  revealedCount: number;
  chamberLabel: string;
  majorityNeeded: number;
  liveYes: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ledsRef = useRef<THREE.Mesh[]>([]);
  const groupRef = useRef<THREE.Group | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const [autoOrbit, setAutoOrbit] = useState(true);
  const orbitRef = useRef(autoOrbit);
  orbitRef.current = autoOrbit;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const { scene, camera, renderer, controls } = createHemicycleScene(container);
    sceneRef.current = scene;

    let animId = 0;
    const tick = () => {
      animId = requestAnimationFrame(tick);
      if (orbitRef.current) {
        const t = performance.now() * 0.00045;
        camera.position.x = Math.sin(t) * 8.5;
        camera.position.z = 16.5 + Math.cos(t) * 2.5;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    tick();

    const obs = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w <= 0 || h <= 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    obs.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      obs.disconnect();
      controls.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (groupRef.current) scene.remove(groupRef.current);
    const built = buildSeatMeshesGroup(seats);
    groupRef.current = built.group;
    ledsRef.current = built.ledMeshes;
    scene.add(built.group);
    updateSeatLedMaterials(built.ledMeshes, revealedCount);
  }, [seats]);

  useEffect(() => {
    updateSeatLedMaterials(ledsRef.current, revealedCount);
  }, [revealedCount]);

  return (
    <div className="hoi-panel rounded-sm p-3.5 bg-[#070a10] border border-[#263142] flex flex-col justify-between space-y-2">
      <div className="flex items-center justify-between text-[11px] font-mono border-b border-[#1e293b] pb-1.5">
        <span className="text-amber-200 font-bold uppercase flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          {chamberLabel} · Vista 3D Orbital
        </span>
        <button
          type="button"
          onClick={() => setAutoOrbit((v) => !v)}
          className="px-2 py-0.5 rounded-sm bg-[#101826] border border-[#2d3c52] text-[10px] text-sky-300 hover:text-white"
        >
          {autoOrbit ? 'Pausar Cámara' : 'Paneo Orbital'}
        </button>
      </div>

      <div ref={containerRef} className="w-full h-[215px] rounded-sm overflow-hidden border border-[#1e293b]" />

      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
        <span>Arrastrá con el mouse para orbitar el recinto en 3D</span>
        <span className="text-emerald-300 font-bold">
          Afirmativos: {liveYes} / Mayoría {majorityNeeded}
        </span>
      </div>
    </div>
  );
}

type ChapterDecisionMode = 'ORIGINAL' | 'CONCESION_DIALOGUISTA' | 'SUPRIMIR_ARTICULO';

interface BillChapterSpec {
  id: string;
  title: string;
  articles: string;
  description: string;
  rebelDissentSeats: number;
}

const CHAPTER_SPECS: BillChapterSpec[] = [
  {
    id: 'CAP_1',
    title: 'Título I · Emergencia Ejecutiva y Facultades Delegadas',
    articles: 'Arts. 1° al 14°',
    description: 'Reorganización administrativa y delegación legislativa por 12 meses.',
    rebelDissentSeats: 6
  },
  {
    id: 'CAP_2',
    title: 'Título II · Reforma del Estado y Empresas Públicas',
    articles: 'Arts. 15° al 38°',
    description: 'Concesiones ferroviarias, capital privado en empresas estatales y auditoría.',
    rebelDissentSeats: 14
  },
  {
    id: 'CAP_3',
    title: 'Título III · Paquete Fiscal, Bienes Personales y Coparticipación',
    articles: 'Arts. 39° al 64°',
    description: 'Moratoria, blanqueo de capitales y distribución federal con gobernadores.',
    rebelDissentSeats: 11
  },
  {
    id: 'CAP_4',
    title: 'Título IV · Modernización Laboral y Desregulación Sectorial',
    articles: 'Arts. 65° al 92°',
    description: 'Fondo de cese optativo, período de prueba e incentivos al empleo registrado.',
    rebelDissentSeats: 9
  }
];

function computeChapterVotes(
  baseYes: number,
  rebelDissentSeats: number,
  decision: ChapterDecisionMode
): number {
  if (decision === 'CONCESION_DIALOGUISTA') return baseYes + 4;
  if (decision === 'SUPRIMIR_ARTICULO') return baseYes;
  return Math.max(0, baseYes - rebelDissentSeats);
}

function resolveChapterStatusBadge(
  decision: ChapterDecisionMode,
  chapterYes: number,
  majorityNeeded: number
): { label: string; cls: string } {
  if (decision === 'SUPRIMIR_ARTICULO') {
    return {
      label: 'RETIRADO POR EL EJECUTIVO',
      cls: 'bg-amber-950/50 text-amber-300 border-amber-700/70'
    };
  }
  if (chapterYes >= majorityNeeded) {
    return {
      label: decision === 'CONCESION_DIALOGUISTA' ? '✓ APROBADO CON MODIFICACIONES' : '✓ APROBADO TEXTO ORIGINAL',
      cls: 'bg-emerald-950/50 text-emerald-300 border-emerald-700/70'
    };
  }
  return {
    label: '✕ CAPÍTULO CAÍDO EN PARTICULAR',
    cls: 'bg-rose-950/50 text-rose-300 border-rose-700/70'
  };
}

export function BillChaptersParticularVotePanel({
  billTitle,
  baseYesVotes,
  majorityNeeded
}: {
  billTitle: string;
  baseYesVotes: number;
  majorityNeeded: number;
}) {
  const [decisions, setDecisions] = useState<Record<string, ChapterDecisionMode>>({
    CAP_1: 'ORIGINAL',
    CAP_2: 'ORIGINAL',
    CAP_3: 'ORIGINAL',
    CAP_4: 'ORIGINAL'
  });

  const handleSelectDecision = (capId: string, mode: ChapterDecisionMode) => {
    playUiSound('stamp');
    setDecisions((prev) => ({ ...prev, [capId]: mode }));
  };

  return (
    <div className="hoi-panel rounded-sm p-4 bg-[#070a10] border border-[#8a6d33] space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e293b] pb-2.5">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-amber-300">
            TRATAMIENTO EN PARTICULAR · ARTÍCULO POR ARTÍCULO
          </div>
          <h4 className="text-sm font-serif font-bold uppercase text-amber-100">
            Desglose por Capítulos: {billTitle}
          </h4>
        </div>
        <span className="px-2.5 py-1 rounded-sm bg-[#0c1119] border border-[#263142] text-[11px] font-mono text-slate-300">
          Mayoría en particular requerida: <strong className="text-amber-300">{majorityNeeded} votos</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CHAPTER_SPECS.map((cap) => {
          const decision = decisions[cap.id] ?? 'ORIGINAL';
          const chapterYes = computeChapterVotes(baseYesVotes, cap.rebelDissentSeats, decision);
          const badge = resolveChapterStatusBadge(decision, chapterYes, majorityNeeded);

          return (
            <div
              key={cap.id}
              className="p-3 rounded-sm bg-[#0c1119] border border-[#263142] space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-300">{cap.articles}</span>
                    <h5 className="text-xs font-serif font-bold text-slate-100">{cap.title}</h5>
                  </div>
                  <span className={`px-2 py-0.5 rounded-sm border text-[9px] font-mono font-bold shrink-0 ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{cap.description}</p>
              </div>

              <div className="space-y-2 pt-1.5 border-t border-[#1e293b]">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-amber-400" />
                    Disidencias dialoguistas: -{cap.rebelDissentSeats} bancas
                  </span>
                  <span className="text-slate-200 font-bold">
                    Votos capítulo: <strong className="text-amber-300">{chapterYes}</strong> / {majorityNeeded}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                  <button
                    type="button"
                    onClick={() => handleSelectDecision(cap.id, 'ORIGINAL')}
                    className={`py-1 px-1.5 rounded-sm border font-bold transition ${
                      decision === 'ORIGINAL'
                        ? 'bg-[#1d3250] text-amber-100 border-[#b89342]'
                        : 'bg-[#090d14] text-slate-400 border-[#263142]'
                    }`}
                  >
                    Texto Puro
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectDecision(cap.id, 'CONCESION_DIALOGUISTA')}
                    className={`py-1 px-1.5 rounded-sm border font-bold transition ${
                      decision === 'CONCESION_DIALOGUISTA'
                        ? 'bg-emerald-950/70 text-emerald-200 border-emerald-500'
                        : 'bg-[#090d14] text-slate-400 border-[#263142]'
                    }`}
                  >
                    Ceder Texto (+4)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectDecision(cap.id, 'SUPRIMIR_ARTICULO')}
                    className={`py-1 px-1.5 rounded-sm border font-bold transition ${
                      decision === 'SUPRIMIR_ARTICULO'
                        ? 'bg-amber-950/70 text-amber-200 border-amber-500'
                        : 'bg-[#090d14] text-slate-400 border-[#263142]'
                    }`}
                  >
                    Retirar Cap.
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
        <span className="inline-flex items-center gap-1.5">
          <FileCheck2 className="w-3.5 h-3.5 text-amber-300" />
          Si un capítulo cae por disidencias, podés ceder redacción con bloques dialoguistas para blindar el articulado.
        </span>
        <span className="inline-flex items-center gap-1 text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />Dictamen en particular activo
        </span>
      </div>
    </div>
  );
}
