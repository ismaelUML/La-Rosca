import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { ProvinceSummary } from '@argentina-sim/domain';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Compass,
  Flag,
  Landmark,
  Layers,
  ShieldCheck,
  UserCheck,
  Users
} from 'lucide-react';
import {
  buildArgentina3DGroup,
  buildNormalizedProvinceMap,
  resolveProvinceColor,
  type Map3DMode,
  type ProvinceMeshMeta
} from './argentina3dGeometry.js';
import {
  animateStrategicLandmarksFrame,
  applyNightSatelliteMode,
  buildStrategicLandmarksOverlay,
  type AnimatedLandmarkRefs
} from './argentina3dLandmarks.js';
import { getProvincePoliticalMeta, normalizeProvinceId } from './provincePoliticalMeta.js';
import { playUiSound } from '../../lib/gameFeedback.js';

// Mapa 3D tactico de las 24 jurisdicciones con mesa de operaciones naval/acero,
// anillos de radar estrategicos, contorno superior resaltado y normalizacion federal.

interface Argentina3DMapCanvasProps {
  provinces: ProvinceSummary[];
  selectedProvinceId: string | null;
  panelOpen?: boolean;
  onSelectProvince: (provinceId: string) => void;
  onSendAtn?: (provinceId: string) => void;
}

const MODE_OPTIONS: Array<{ id: Map3DMode; label: string; icon: React.ReactNode }> = [
  { id: 'LOYALTY', label: 'Lealtad', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  { id: 'GOVERNORS', label: 'Gobernadores', icon: <UserCheck className="w-3.5 h-3.5" /> },
  { id: 'PARTIES', label: 'Partidos', icon: <Flag className="w-3.5 h-3.5" /> },
  { id: 'FISCAL', label: 'Fiscal', icon: <Landmark className="w-3.5 h-3.5" /> },
  { id: 'SECURITY', label: 'Tensión', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  { id: 'DEPUTIES', label: 'Congreso', icon: <Users className="w-3.5 h-3.5" /> }
];

const LEGEND_BY_MODE: Record<Map3DMode, Array<{ dotClass: string; label: string }>> = {
  LOYALTY: [
    { dotClass: 'bg-emerald-500', label: 'Afín (>=60%)' },
    { dotClass: 'bg-amber-400', label: 'Negociable' },
    { dotClass: 'bg-rose-500', label: 'Hostil (<45%)' }
  ],
  FISCAL: [
    { dotClass: 'bg-emerald-500', label: 'Equilibrio' },
    { dotClass: 'bg-amber-400', label: 'Déficit leve' },
    { dotClass: 'bg-rose-500', label: 'Crítico / Cuasimoneda' }
  ],
  SECURITY: [
    { dotClass: 'bg-emerald-500', label: 'Estable' },
    { dotClass: 'bg-amber-400', label: 'Tensión media' },
    { dotClass: 'bg-rose-500', label: 'Crítico / Intervenida' }
  ],
  DEPUTIES: [
    { dotClass: 'bg-emerald-500', label: 'Bancada afín' },
    { dotClass: 'bg-amber-400', label: 'En duda' },
    { dotClass: 'bg-rose-500', label: 'Oposición' }
  ],
  GOVERNORS: [
    { dotClass: 'bg-blue-600', label: 'Derecha' },
    { dotClass: 'bg-teal-500', label: 'Centro' },
    { dotClass: 'bg-rose-600', label: 'Izquierda' }
  ],
  PARTIES: [
    { dotClass: 'bg-sky-500', label: 'UxP/PJ' },
    { dotClass: 'bg-yellow-400', label: 'PRO' },
    { dotClass: 'bg-red-600', label: 'UCR' },
    { dotClass: 'bg-blue-600', label: 'HxC' },
    { dotClass: 'bg-emerald-500', label: 'Provinciales' },
    { dotClass: 'bg-violet-500', label: 'LLA' }
  ]
};

function attachTacticalRadarRings(scene: THREE.Scene) {
  const ringRadii = [12, 22, 34, 48];
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xb89342,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.14
  });
  for (const r of ringRadii) {
    const geo = new THREE.RingGeometry(r, r + 0.11, 72);
    const ring = new THREE.Mesh(geo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(-2, -0.02, 2);
    scene.add(ring);
  }
}

function createSceneEnvironment(container: HTMLDivElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x06090f);
  scene.fog = new THREE.FogExp2(0x06090f, 0.0042);

  const width = container.clientWidth || 960;
  const height = container.clientHeight || 600;
  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 350);
  camera.position.set(16, 34, 45);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI / 2.15;
  controls.minDistance = 14;
  controls.maxDistance = 95;
  controls.target.set(-8, 0, 2);

  scene.add(new THREE.HemisphereLight(0xdbeafe, 0x0f172a, 0.88));
  const keyLight = new THREE.DirectionalLight(0xfff4db, 1.55);
  keyLight.position.set(26, 48, 24);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.left = -45;
  keyLight.shadow.camera.right = 45;
  keyLight.shadow.camera.top = 45;
  keyLight.shadow.camera.bottom = -45;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.52);
  rimLight.position.set(-28, 24, -24);
  scene.add(rimLight);

  const table = new THREE.Mesh(
    new THREE.PlaneGeometry(170, 170),
    new THREE.MeshStandardMaterial({ color: 0x070c14, roughness: 0.88, metalness: 0.14 })
  );
  table.rotation.x = -Math.PI / 2;
  table.position.y = -0.06;
  table.receiveShadow = true;
  scene.add(table);

  const grid = new THREE.GridHelper(130, 52, 0x26354a, 0x111a27);
  grid.position.y = -0.04;
  scene.add(grid);
  attachTacticalRadarRings(scene);

  return { scene, camera, renderer, controls };
}

function findIntersectedProvince(
  event: PointerEvent,
  dom: HTMLElement,
  camera: THREE.Camera,
  group: THREE.Group | null
): ProvinceMeshMeta | null {
  if (!group) return null;
  const rect = dom.getBoundingClientRect();
  const pointer = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(group.children, false);
  const hitMesh = hits[0]?.object as THREE.Mesh | undefined;
  return (hitMesh?.userData as ProvinceMeshMeta | undefined) ?? null;
}

function resolveEmissiveState(isSelected: boolean, isHovered: boolean): { hex: number; intensity: number } {
  if (isSelected) return { hex: 0xfbbf24, intensity: 0.62 };
  if (isHovered) return { hex: 0x38bdf8, intensity: 0.52 };
  return { hex: 0x0f172a, intensity: 0.12 };
}

function resolveTargetLift(isSelected: boolean, isHovered: boolean): number {
  if (isSelected) return 0.95;
  if (isHovered) return 0.48;
  return 0;
}

function isMatchingProvince(idA: string | null | undefined, idB: string | null | undefined): boolean {
  if (!idA || !idB) return false;
  return normalizeProvinceId(idA) === normalizeProvinceId(idB);
}

function animateGroupFrame(
  group: THREE.Group | null,
  hoveredId: string | null,
  selectedId: string | null
) {
  if (!group) return;
  for (const child of group.children) {
    const mesh = child as THREE.Mesh;
    const meta = mesh.userData as ProvinceMeshMeta;
    const targetY = resolveTargetLift(
      isMatchingProvince(meta.provinceId, selectedId),
      isMatchingProvince(meta.provinceId, hoveredId)
    );
    mesh.position.y += (targetY - mesh.position.y) * 0.16;
  }
}

function updateGroupMaterials(
  group: THREE.Group | null,
  provinces: ProvinceSummary[],
  mode: Map3DMode,
  hoveredId: string | null,
  selectedId: string | null
) {
  if (!group) return;
  const provMap = buildNormalizedProvinceMap(provinces);
  for (const child of group.children) {
    const mesh = child as THREE.Mesh;
    const meta = mesh.userData as ProvinceMeshMeta;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    const emissive = resolveEmissiveState(
      isMatchingProvince(meta.provinceId, selectedId),
      isMatchingProvince(meta.provinceId, hoveredId)
    );
    mat.color.setHex(resolveProvinceColor(provMap.get(meta.provinceId), mode));
    mat.emissive.setHex(emissive.hex);
    mat.emissiveIntensity = emissive.intensity;
  }
}

function findSelectedMeshMeta(
  group: THREE.Group | null,
  selectedId: string | null
): ProvinceMeshMeta | null {
  if (!group || !selectedId) return null;
  const found = group.children.find((c) =>
    isMatchingProvince(((c as THREE.Mesh).userData as ProvinceMeshMeta).provinceId, selectedId)
  ) as THREE.Mesh | undefined;
  return found ? (found.userData as ProvinceMeshMeta) : null;
}

function computeCameraTargetOffset(
  group: THREE.Group | null,
  selectedId: string | null,
  panelOpen: boolean
): THREE.Vector3 {
  const meta = findSelectedMeshMeta(group, selectedId);
  if (!meta) return new THREE.Vector3(panelOpen ? -10 : -2, 0, 2);
  return new THREE.Vector3(meta.centerX + (panelOpen ? -7 : 0), 0.5, meta.centerZ);
}

function formatGovernorTooltip(p: ProvinceSummary): string {
  const meta = getProvincePoliticalMeta(p.id);
  return meta ? `Gob. ${meta.governorName} · ${meta.bloc}` : `Lealtad ${p.governorLoyaltyToPresident}%`;
}

function formatPartyTooltip(p: ProvinceSummary): string {
  const meta = getProvincePoliticalMeta(p.id);
  return meta ? `${meta.partyName} (${meta.partySigla}) · Lealtad ${p.governorLoyaltyToPresident}%` : `Lealtad ${p.governorLoyaltyToPresident}%`;
}

function formatFiscalTooltip(p: ProvinceSummary): string {
  const quasi = p.quasiCurrencyIssued ? ' · Cuasimoneda' : '';
  return `Fiscal ${p.fiscalBalancePct}% · Copart. ${p.coparticipationDependencyPct}%${quasi}`;
}

function formatSecurityTooltip(p: ProvinceSummary): string {
  const alerts = p.problematicas?.length ?? 0;
  return `Problemáticas: ${alerts} · Lealtad ${p.governorLoyaltyToPresident}%`;
}

const TOOLTIP_FORMATTERS: Record<Map3DMode, (p: ProvinceSummary) => string> = {
  LOYALTY: (p) => `Lealtad ${p.governorLoyaltyToPresident}% · Dip. ${p.nationalDeputiesCount}`,
  DEPUTIES: (p) => `Diputados ${p.nationalDeputiesCount} · Lealtad ${p.governorLoyaltyToPresident}%`,
  FISCAL: formatFiscalTooltip,
  SECURITY: formatSecurityTooltip,
  GOVERNORS: formatGovernorTooltip,
  PARTIES: formatPartyTooltip
};

function formatTooltipStats(province: ProvinceSummary, mode: Map3DMode): string {
  return TOOLTIP_FORMATTERS[mode](province);
}

function HoveredCursorTooltip({
  province,
  mode,
  cursor
}: {
  province: ProvinceSummary | undefined;
  mode: Map3DMode;
  cursor: { x: number; y: number } | null;
}) {
  if (!province || !cursor) return null;
  const polMeta = getProvincePoliticalMeta(province.id);
  return (
    <div
      style={{ left: cursor.x + 14, top: cursor.y - 12 }}
      className="pointer-events-none fixed z-40 rounded-sm bg-[#090d14]/95 border border-[#8a6d33] px-3 py-2 shadow-2xl"
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-serif font-bold text-amber-100">{province.name}</span>
        {polMeta ? (
          <span className="px-1.5 py-0.5 rounded-sm bg-[#162234] border border-[#2d3c52] text-[9px] font-mono text-sky-300">
            {polMeta.partySigla}
          </span>
        ) : null}
      </div>
      <div className="text-[10px] font-mono text-amber-300 mt-0.5">{formatTooltipStats(province, mode)}</div>
    </div>
  );
}

function resolveTogglePillCls(active: boolean, activeStyle: string): string {
  if (active) return activeStyle;
  return 'border-[#2d3c52] text-slate-400 bg-[#0c1119]/95';
}

function MapLayerToolbar({
  mapMode,
  layersOpen,
  showLandmarks,
  nightMode,
  onToggleOpen,
  onToggleLandmarks,
  onToggleNightMode,
  onSelectMode,
  onResetView
}: {
  mapMode: Map3DMode;
  layersOpen: boolean;
  showLandmarks: boolean;
  nightMode: boolean;
  onToggleOpen: () => void;
  onToggleLandmarks: () => void;
  onToggleNightMode: () => void;
  onSelectMode: (mode: Map3DMode) => void;
  onResetView: () => void;
}) {
  const activeOption = MODE_OPTIONS.find((m) => m.id === mapMode) ?? MODE_OPTIONS[0]!;
  const legendItems = LEGEND_BY_MODE[mapMode];
  const landmarkCls = resolveTogglePillCls(
    showLandmarks,
    'border-[#b89342] text-amber-200 bg-[#172233]/95'
  );
  const nightCls = resolveTogglePillCls(
    nightMode,
    'border-sky-500 text-sky-200 bg-[#122036]/95'
  );

  return (
    <div className="pointer-events-auto flex flex-col items-end gap-1.5">
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <button
          type="button"
          onClick={() => {
            playUiSound('tab');
            onToggleLandmarks();
          }}
          title="Activar/ocultar monumentos 3D, Vaca Muerta, Litio, Eólicos y Gasoductos"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border text-[10px] font-mono font-bold uppercase tracking-wider shadow-xl transition ${landmarkCls}`}
        >
          <span>Activos 3D + Gasoducto</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playUiSound('tab');
            onToggleNightMode();
          }}
          title="Alternar modo satelital nocturno con constelación urbana"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border text-[10px] font-mono font-bold uppercase tracking-wider shadow-xl transition ${nightCls}`}
        >
          <span>Satelital Nocturno</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playUiSound('tab');
            onResetView();
          }}
          title="Recenter cámara 3D sobre el territorio nacional"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm bg-[#0c1119]/95 hover:bg-[#172233] border border-[#2d3c52] text-[10px] font-mono font-bold uppercase tracking-wider text-slate-200 shadow-xl"
        >
          <Compass className="w-3.5 h-3.5 text-sky-400" />
          <span>Centrar</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playUiSound('tab');
            onToggleOpen();
          }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-[#0c1119]/95 hover:bg-[#172233] border border-[#8a6d33] text-[11px] font-mono font-bold uppercase tracking-wider text-amber-200 shadow-xl"
        >
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Capas: {activeOption.label}</span>
          {layersOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {layersOpen ? (
        <div className="flex flex-col items-end gap-1.5 rosca-panel-enter">
          <div className="flex flex-wrap justify-end items-center gap-1 rounded-sm bg-[#0c1119]/95 border border-[#344661] p-1 shadow-xl max-w-md">
            {MODE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  playUiSound('tab');
                  onSelectMode(opt.id);
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider transition ${
                  mapMode === opt.id
                    ? 'bg-[#b89342] text-[#100e09] shadow'
                    : 'text-slate-300 hover:bg-[#1a2230]'
                }`}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 px-2.5 py-1 rounded-sm bg-[#0c1119]/90 border border-[#263142] text-[10px] font-mono text-slate-300">
            {legendItems.map((item) => (
              <span key={item.label} className="inline-flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${item.dotClass}`} /> {item.label}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SelectedProvinceHeader({
  province,
  onClose
}: {
  province: ProvinceSummary;
  onClose: () => void;
}) {
  const polMeta = getProvincePoliticalMeta(province.id);
  const sigla = polMeta ? ` · ${polMeta.partySigla}` : '';
  return (
    <div className="flex items-start justify-between gap-2 border-b border-[#263142] pb-2">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
          {province.region}{sigla}
        </div>
        <div className="text-sm font-serif font-bold text-slate-100">{province.name}</div>
        {polMeta ? <div className="text-[10px] font-mono text-slate-400">Gob. {polMeta.governorName}</div> : null}
      </div>
      <button type="button" onClick={onClose} className="text-slate-400 hover:text-white font-mono text-xs">
        Cerrar
      </button>
    </div>
  );
}

function SelectedProvinceCard({
  province,
  atnFlash,
  onSendAtn,
  onClose
}: {
  province: ProvinceSummary | undefined;
  atnFlash: boolean;
  onSendAtn?: () => void;
  onClose: () => void;
}) {
  if (!province) return null;

  return (
    <div
      className={`pointer-events-auto w-72 rounded-sm bg-[#0c1119]/95 border border-[#c9a24d] p-3.5 text-xs space-y-2 shadow-2xl rosca-panel-enter ${
        atnFlash ? 'rosca-turn-flash' : ''
      }`}
    >
      <SelectedProvinceHeader province={province} onClose={onClose} />
      <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
        <div className="text-slate-400">Diputados: <strong className="text-slate-100">{province.nationalDeputiesCount}</strong></div>
        <div className="text-slate-400">Lealtad: <strong className="text-amber-300">{province.governorLoyaltyToPresident}%</strong></div>
        <div className="text-slate-400">Fiscal: <strong className="text-slate-200">{province.fiscalBalancePct}%</strong></div>
        <div className="text-slate-400">Copart.: <strong className="text-slate-200">{province.coparticipationDependencyPct}%</strong></div>
      </div>
      <div className="text-[11px] text-slate-400">Motor: {province.keyEconomicDriver}</div>
      {onSendAtn ? (
        <button
          type="button"
          onClick={onSendAtn}
          className="hoi-btn-gold w-full py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-wider transition active:scale-[0.98]"
        >
          {atnFlash ? 'ATN Girado (+Lealtad)' : 'Girar ATN (0.08% PBI)'}
        </button>
      ) : null}
    </div>
  );
}

function useArgentina3DSetup(
  containerRef: React.RefObject<HTMLDivElement | null>,
  provincesRef: React.MutableRefObject<ProvinceSummary[]>,
  modeRef: React.MutableRefObject<Map3DMode>,
  onHoverChangeRef: React.MutableRefObject<(id: string | null, pos: { x: number; y: number } | null) => void>,
  onSelectRef: React.MutableRefObject<(id: string) => void>
) {
  const groupRef = useRef<THREE.Group | null>(null);
  const landmarksRef = useRef<AnimatedLandmarkRefs | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const targetGoalRef = useRef(new THREE.Vector3(-8, 0, 2));
  const hoveredRef = useRef<string | null>(null);
  const selectedRef = useRef<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const { scene, camera, renderer, controls } = createSceneEnvironment(container);
    sceneRef.current = scene;
    cameraRef.current = camera;
    controlsRef.current = controls;

    let animId = 0;
    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);
      controls.target.lerp(targetGoalRef.current, 0.12);
      animateGroupFrame(groupRef.current, hoveredRef.current, selectedRef.current);
      animateStrategicLandmarksFrame(landmarksRef.current, groupRef.current, performance.now() * 0.001);
      controls.update();
      renderer.render(scene, camera);
    };
    renderLoop();

    let downPos = { x: 0, y: 0 };
    const onPointerDown = (e: PointerEvent) => {
      downPos = { x: e.clientX, y: e.clientY };
    };
    const onPointerMove = (e: PointerEvent) => {
      const hit = findIntersectedProvince(e, renderer.domElement, camera, groupRef.current);
      const nextId = hit?.provinceId ?? null;
      const pos = nextId ? { x: e.clientX, y: e.clientY } : null;
      if (hoveredRef.current !== nextId) {
        hoveredRef.current = nextId;
        updateGroupMaterials(groupRef.current, provincesRef.current, modeRef.current, nextId, selectedRef.current);
      }
      onHoverChangeRef.current(nextId, pos);
      renderer.domElement.style.cursor = nextId ? 'pointer' : 'grab';
    };
    const onPointerLeave = () => {
      hoveredRef.current = null;
      onHoverChangeRef.current(null, null);
    };
    const onPointerUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) > 5) return;
      const hit = findIntersectedProvince(e, renderer.domElement, camera, groupRef.current);
      if (!hit) return;
      playUiSound('select');
      selectedRef.current = hit.provinceId;
      onSelectRef.current(hit.provinceId);
      updateGroupMaterials(groupRef.current, provincesRef.current, modeRef.current, hoveredRef.current, hit.provinceId);
    };

    const resizeObs = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w <= 0 || h <= 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObs.observe(container);

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerleave', onPointerLeave);
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    return () => {
      cancelAnimationFrame(animId);
      resizeObs.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerleave', onPointerLeave);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      controls.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [containerRef, provincesRef, modeRef, onHoverChangeRef, onSelectRef]);

  return { groupRef, landmarksRef, sceneRef, cameraRef, targetGoalRef, hoveredRef, selectedRef };
}

function lookupProvinceInMap(
  provMap: Map<string, ProvinceSummary>,
  id: string | null | undefined
): ProvinceSummary | undefined {
  if (!id) return undefined;
  return provMap.get(normalizeProvinceId(id));
}

function buildAtnHandler(
  activeProvince: ProvinceSummary | undefined,
  onSendAtn: ((provinceId: string) => void) | undefined,
  setAtnFlash: (val: boolean) => void
): (() => void) | undefined {
  if (!activeProvince || !onSendAtn) return undefined;
  return () => {
    playUiSound('atn');
    setAtnFlash(true);
    onSendAtn(activeProvince.id);
    window.setTimeout(() => setAtnFlash(false), 900);
  };
}

export function Argentina3DMapCanvas({
  provinces,
  selectedProvinceId,
  panelOpen = false,
  onSelectProvince,
  onSendAtn
}: Argentina3DMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mapMode, setMapMode] = useState<Map3DMode>('LOYALTY');
  const [layersOpen, setLayersOpen] = useState(true);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [nightMode, setNightMode] = useState(false);
  const [hoveredState, setHoveredState] = useState<{ id: string | null; pos: { x: number; y: number } | null }>({
    id: null,
    pos: null
  });
  const [atnFlash, setAtnFlash] = useState(false);
  const [topoData, setTopoData] = useState<any>(null);

  const provincesRef = useRef(provinces);
  provincesRef.current = provinces;
  const modeRef = useRef(mapMode);
  modeRef.current = mapMode;
  const onHoverChangeRef = useRef((id: string | null, pos: { x: number; y: number } | null) =>
    setHoveredState({ id, pos })
  );
  const onSelectRef = useRef(onSelectProvince);
  onSelectRef.current = onSelectProvince;

  const { groupRef, landmarksRef, sceneRef, cameraRef, targetGoalRef, hoveredRef, selectedRef } = useArgentina3DSetup(
    containerRef,
    provincesRef,
    modeRef,
    onHoverChangeRef,
    onSelectRef
  );

  useEffect(() => {
    fetch('/geo/argentina-provinces.topojson')
      .then((res) => res.json())
      .then((data) => setTopoData(data))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    targetGoalRef.current.copy(computeCameraTargetOffset(groupRef.current, selectedProvinceId, panelOpen));
  }, [panelOpen, selectedProvinceId, topoData, targetGoalRef, groupRef]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !topoData) return;
    if (groupRef.current) scene.remove(groupRef.current);
    if (landmarksRef.current) scene.remove(landmarksRef.current.overlayGroup);
    const nextGroup = buildArgentina3DGroup(topoData, provinces, mapMode);
    const nextLandmarks = buildStrategicLandmarksOverlay(nextGroup, provinces);
    nextLandmarks.overlayGroup.visible = showLandmarks;
    groupRef.current = nextGroup;
    landmarksRef.current = nextLandmarks;
    scene.add(nextGroup);
    scene.add(nextLandmarks.overlayGroup);
    applyNightSatelliteMode(scene, nextLandmarks, nightMode);
    selectedRef.current = selectedProvinceId;
    updateGroupMaterials(nextGroup, provinces, mapMode, hoveredRef.current, selectedProvinceId);
  }, [topoData, mapMode, provinces, selectedProvinceId, showLandmarks, nightMode, groupRef, landmarksRef, sceneRef, hoveredRef, selectedRef]);

  const provMap = buildNormalizedProvinceMap(provinces);
  const activeProvince = lookupProvinceInMap(provMap, selectedProvinceId || hoveredState.id);
  const hoveredProvince = lookupProvinceInMap(provMap, hoveredState.id);
  const handleAtnClick = buildAtnHandler(activeProvince, onSendAtn, setAtnFlash);

  const handleResetView = () => {
    onSelectProvince('');
    targetGoalRef.current.set(panelOpen ? -10 : -2, 0, 2);
    if (cameraRef.current) cameraRef.current.position.set(16, 34, 45);
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <div ref={containerRef} className="w-full h-full" />

      <HoveredCursorTooltip province={hoveredProvince} mode={mapMode} cursor={hoveredState.pos} />

      <div className="pointer-events-none absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
        <MapLayerToolbar
          mapMode={mapMode}
          layersOpen={layersOpen}
          showLandmarks={showLandmarks}
          nightMode={nightMode}
          onToggleOpen={() => setLayersOpen((o) => !o)}
          onToggleLandmarks={() => setShowLandmarks((v) => !v)}
          onToggleNightMode={() => setNightMode((n) => !n)}
          onSelectMode={setMapMode}
          onResetView={handleResetView}
        />
      </div>

      <div className="pointer-events-none absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2">
        <SelectedProvinceCard
          province={activeProvince}
          atnFlash={atnFlash}
          onSendAtn={handleAtnClick}
          onClose={() => onSelectProvince('')}
        />
      </div>
    </div>
  );
}
