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
import { formatArNumber, formatArSigned } from '../../lib/formatters.js';

// Mapa 3D tactico de las 24 jurisdicciones en estetica Casa Rosada (obsidiana + rosado + crema),
// con anillos de radar rosados, pines proyectados 3D->2D y tarjeta federal en el lateral derecho.

interface Argentina3DMapCanvasProps {
  provinces: ProvinceSummary[];
  selectedProvinceId: string | null;
  panelOpen?: boolean;
  bottomLeftSlot?: React.ReactNode;
  capitalRemaining?: number;
  onSelectProvince: (provinceId: string) => void;
  onSendAtn?: (provinceId: string) => void;
  onPromiseWorks?: (provinceId: string) => void;
  onCallGovernor?: (provinceId: string) => void;
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
    { dotClass: 'bg-[#EB3F7D]', label: 'Afín (más de 60 %)' },
    { dotClass: 'bg-[#EFE9DA]', label: 'Negociable' },
    { dotClass: 'bg-[#5A3444]', label: 'Hostil (menos de 45 %)' }
  ],
  FISCAL: [
    { dotClass: 'bg-[#EB3F7D]', label: 'Equilibrio fiscal' },
    { dotClass: 'bg-[#EFE9DA]', label: 'Déficit leve' },
    { dotClass: 'bg-[#5A3444]', label: 'Crítico / Cuasimoneda' }
  ],
  SECURITY: [
    { dotClass: 'bg-[#EB3F7D]', label: 'Estable' },
    { dotClass: 'bg-[#EFE9DA]', label: 'Tensión media' },
    { dotClass: 'bg-[#5A3444]', label: 'Crítico / Intervenida' }
  ],
  DEPUTIES: [
    { dotClass: 'bg-[#EB3F7D]', label: 'Bancada afín' },
    { dotClass: 'bg-[#EFE9DA]', label: 'En duda' },
    { dotClass: 'bg-[#5A3444]', label: 'Oposición' }
  ],
  GOVERNORS: [
    { dotClass: 'bg-blue-500', label: 'Derecha' },
    { dotClass: 'bg-[#EFE9DA]', label: 'Centro' },
    { dotClass: 'bg-[#EB3F7D]', label: 'Izquierda' }
  ],
  PARTIES: [
    { dotClass: 'bg-sky-400', label: 'UxP/PJ' },
    { dotClass: 'bg-yellow-400', label: 'PRO' },
    { dotClass: 'bg-red-500', label: 'UCR' },
    { dotClass: 'bg-blue-600', label: 'HxC' },
    { dotClass: 'bg-emerald-500', label: 'Provinciales' },
    { dotClass: 'bg-[#EB3F7D]', label: 'LLA' }
  ]
};

const PINNED_PROVINCE_SPECS: Array<{ id: string; label: string; isCapital?: boolean }> = [
  { id: 'SALTA', label: 'SALTA' },
  { id: 'CHACO', label: 'CHACO' },
  { id: 'MISIONES', label: 'MISIONES' },
  { id: 'CABA', label: '★ CASA ROSADA · CABA', isCapital: true },
  { id: 'SANTA_FE', label: 'SANTA FE' },
  { id: 'CORDOBA', label: 'CÓRDOBA' },
  { id: 'PBA', label: 'BUENOS AIRES' },
  { id: 'MENDOZA', label: 'MENDOZA' },
  { id: 'RIO_NEGRO', label: 'RÍO NEGRO' },
  { id: 'CHUBUT', label: 'CHUBUT' },
  { id: 'SANTA_CRUZ', label: 'SANTA CRUZ' },
  { id: 'TIERRA_DEL_FUEGO', label: 'T. DEL FUEGO' }
];

function attachTacticalRadarRings(scene: THREE.Scene) {
  const ringRadii = [11, 18, 25, 33, 42];
  for (let i = 0; i < ringRadii.length; i++) {
    const r = ringRadii[i]!;
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xeb3f7d,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: i === ringRadii.length - 1 ? 0.34 : 0.16
    });
    const geo = new THREE.RingGeometry(r, r + 0.12, 80);
    const ring = new THREE.Mesh(geo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(-2, -0.02, 1);
    scene.add(ring);
  }
}

function createSceneEnvironment(container: HTMLDivElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x090407);
  scene.fog = new THREE.FogExp2(0x090407, 0.0036);

  const width = container.clientWidth || 960;
  const height = container.clientHeight || 600;
  const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 350);
  camera.position.set(2, 41, 49);

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
  controls.target.set(-1, 0, 5.5);

  scene.add(new THREE.HemisphereLight(0xfff5f8, 0x160910, 0.95));
  const keyLight = new THREE.DirectionalLight(0xfff9f4, 1.32);
  keyLight.position.set(22, 46, 26);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.left = -45;
  keyLight.shadow.camera.right = 45;
  keyLight.shadow.camera.top = 45;
  keyLight.shadow.camera.bottom = -45;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xeb3f7d, 0.36);
  rimLight.position.set(-28, 20, -24);
  scene.add(rimLight);

  const table = new THREE.Mesh(
    new THREE.PlaneGeometry(180, 180),
    new THREE.MeshStandardMaterial({ color: 0x0a0408, roughness: 0.94, metalness: 0.04 })
  );
  table.rotation.x = -Math.PI / 2;
  table.position.y = -0.06;
  table.receiveShadow = true;
  scene.add(table);

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
  if (isSelected) return { hex: 0xeb3f7d, intensity: 0.32 };
  if (isHovered) return { hex: 0xf472b6, intensity: 0.28 };
  return { hex: 0x1a0812, intensity: 0.08 };
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
  if (!meta) return new THREE.Vector3(panelOpen ? -5 : -1, 0, 5.5);
  return new THREE.Vector3(meta.centerX + (panelOpen ? -4 : 0), 0.5, meta.centerZ + 4.5);
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
      className="pointer-events-none fixed z-40 rounded bg-[#0e070b]/95 border border-[#EB3F7D] px-3 py-2 shadow-2xl"
    >
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-[#F5EFE6]">{province.name}</span>
        {polMeta ? (
          <span className="px-1.5 py-0.5 rounded bg-[#1d0f17] border border-white/15 text-[10px] font-mono text-[#EB3F7D]">
            {polMeta.partySigla}
          </span>
        ) : null}
      </div>
      <div className="text-[11px] font-mono text-[#EFE9DA] mt-0.5">{formatTooltipStats(province, mode)}</div>
    </div>
  );
}

function resolveTogglePillCls(active: boolean, activeStyle: string): string {
  if (active) return activeStyle;
  return 'border-white/15 text-slate-300 bg-[#0d070a]/90 hover:border-[#EB3F7D]/60';
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
  const landmarkCls = resolveTogglePillCls(
    showLandmarks,
    'border-[#EB3F7D]/70 text-[#F5EFE6] bg-[#1a0b13]/95'
  );
  const nightCls = resolveTogglePillCls(
    nightMode,
    'border-[#EFE9DA]/60 text-[#EFE9DA] bg-[#1a0b13]/95'
  );

  return (
    <div className="pointer-events-auto flex flex-col items-end gap-1.5">
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        <button
          type="button"
          onClick={() => {
            playUiSound('tab');
            onResetView();
          }}
          title="Centrar cámara 3D sobre Argentina"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0e070b]/90 hover:bg-[#1a0c14] border border-white/15 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-200 transition"
        >
          <Compass className="w-3 h-3 text-[#EB3F7D]" />
          <span>Centrar</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playUiSound('tab');
            onToggleOpen();
          }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0e070b]/90 hover:bg-[#1a0c14] border border-[#EB3F7D]/55 text-[10px] font-mono font-bold uppercase tracking-wider text-[#F5EFE6] transition"
        >
          <Layers className="w-3 h-3 text-[#EB3F7D]" />
          <span>Capas: {activeOption.label}</span>
          {layersOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {layersOpen ? (
        <div className="flex flex-col items-end gap-1.5 rosca-panel-enter">
          <div className="flex flex-wrap justify-end items-center gap-1 rounded bg-[#0e070b]/95 border border-white/15 p-1 shadow-xl max-w-md">
            {MODE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  playUiSound('tab');
                  onSelectMode(opt.id);
                }}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition ${mapMode === opt.id
                    ? 'bg-[#EB3F7D] text-[#090407]'
                    : 'text-slate-300 hover:bg-white/5'
                  }`}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                playUiSound('tab');
                onToggleLandmarks();
              }}
              className={`px-2 py-1 rounded border text-[10px] font-mono font-bold uppercase tracking-wider transition ${landmarkCls}`}
            >
              Activos 3D
            </button>
            <button
              type="button"
              onClick={() => {
                playUiSound('tab');
                onToggleNightMode();
              }}
              className={`px-2 py-1 rounded border text-[10px] font-mono font-bold uppercase tracking-wider transition ${nightCls}`}
            >
              Satelital Nocturno
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SelectedProvinceStatGrid({ province }: { province: ProvinceSummary }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-[#090407]/85 border border-white/15 px-2.5 py-2">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">DIPUTADOS</div>
        <div className="font-display text-xl text-[#F5EFE6] mt-0.5">{province.nationalDeputiesCount}</div>
      </div>
      <div className="bg-[#090407]/85 border border-white/15 px-2.5 py-2">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">LEALTAD</div>
        <div className="font-display text-xl text-[#EB3F7D] mt-0.5">
          {formatArNumber(province.governorLoyaltyToPresident, 1)} %
        </div>
      </div>
      <div className="bg-[#090407]/85 border border-white/15 px-2.5 py-2">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">FISCAL</div>
        <div className="font-display text-xl text-[#F5EFE6] mt-0.5">
          {formatArSigned(province.fiscalBalancePct, 1)} %
        </div>
      </div>
      <div className="bg-[#090407]/85 border border-white/15 px-2.5 py-2">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">COPART.</div>
        <div className="font-display text-xl text-[#F5EFE6] mt-0.5">
          {formatArNumber(province.coparticipationDependencyPct, 0)} %
        </div>
      </div>
    </div>
  );
}

function ProvinceCallButton({
  capitalRemaining,
  onCallGovernor
}: {
  capitalRemaining: number;
  onCallGovernor?: () => void;
}) {
  if (!onCallGovernor) return null;
  const callDisabled = capitalRemaining <= 0;
  return (
    <button
      type="button"
      disabled={callDisabled}
      onClick={onCallGovernor}
      title="Llamar al gobernador para alinear bancas en Congreso (1 decisión)"
      className="py-1.5 px-2 bg-[#160b11] hover:bg-[#24101b] disabled:opacity-40 border border-[#EB3F7D]/55 text-[#EB3F7D] font-mono text-[10px] font-bold uppercase tracking-wider transition"
    >
      {callDisabled ? 'Sin capital' : 'Llamar · 1 dec.'}
    </button>
  );
}

function ProvinceSecondaryActionsRow({
  capitalRemaining,
  onPromiseWorks,
  onCallGovernor
}: {
  capitalRemaining: number;
  onPromiseWorks?: () => void;
  onCallGovernor?: () => void;
}) {
  if (!onPromiseWorks && !onCallGovernor) return null;
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {onPromiseWorks ? (
        <button
          type="button"
          onClick={onPromiseWorks}
          title="Comprometer obra federal (+5 lealtad, impacto 2 meses)"
          className="py-1.5 px-2 bg-[#160b11] hover:bg-[#24101b] border border-[#EFE9DA]/35 text-[#EFE9DA] font-mono text-[10px] font-bold uppercase tracking-wider transition"
        >
          Obra Federal
        </button>
      ) : null}
      <ProvinceCallButton capitalRemaining={capitalRemaining} onCallGovernor={onCallGovernor} />
    </div>
  );
}

function SelectedProvinceAtnButton({
  atnFlash,
  onSendAtn
}: {
  atnFlash: boolean;
  onSendAtn?: () => void;
}) {
  if (!onSendAtn) return null;
  const atnLabel = atnFlash ? 'ATN GIRADO (+LEALTAD)' : 'GIRAR ATN · 0,08 % PBI';
  return (
    <button
      type="button"
      onClick={onSendAtn}
      className="w-full py-2 bg-[#EB3F7D] hover:bg-[#f45b93] text-[#090407] font-mono text-[11px] font-extrabold uppercase tracking-wider transition active:scale-[0.98]"
    >
      {atnLabel}
    </button>
  );
}

function SelectedProvinceActionsBlock({
  atnFlash,
  capitalRemaining,
  onSendAtn,
  onPromiseWorks,
  onCallGovernor
}: {
  atnFlash: boolean;
  capitalRemaining: number;
  onSendAtn?: () => void;
  onPromiseWorks?: () => void;
  onCallGovernor?: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <SelectedProvinceAtnButton atnFlash={atnFlash} onSendAtn={onSendAtn} />
      <ProvinceSecondaryActionsRow
        capitalRemaining={capitalRemaining}
        onPromiseWorks={onPromiseWorks}
        onCallGovernor={onCallGovernor}
      />
    </div>
  );
}

function resolveProvinceDisplayMeta(province: ProvinceSummary) {
  const polMeta = getProvincePoliticalMeta(province.id);
  return {
    regionTag: polMeta ? `${province.region} · ${polMeta.partySigla}` : province.region,
    governorLine: polMeta ? `Gob. ${polMeta.governorName}` : ''
  };
}

function SelectedProvinceCard({
  province,
  atnFlash,
  capitalRemaining,
  onSendAtn,
  onPromiseWorks,
  onCallGovernor,
  onClose
}: {
  province: ProvinceSummary | undefined;
  atnFlash: boolean;
  capitalRemaining: number;
  onSendAtn?: () => void;
  onPromiseWorks?: () => void;
  onCallGovernor?: () => void;
  onClose: () => void;
}) {
  if (!province) return null;
  const meta = resolveProvinceDisplayMeta(province);
  const flashCls = atnFlash ? 'rosca-turn-flash' : '';

  return (
    <div
      className={`pointer-events-auto w-72 bg-[#0d060a]/92 border border-[#EB3F7D] p-4 space-y-3 shadow-2xl rosca-panel-enter ${flashCls}`}
    >
      <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-widest">
        <span className="text-[#EB3F7D]">{meta.regionTag}</span>
        <button
          type="button"
          onClick={onClose}
          title="Deseleccionar provincia"
          className="text-slate-300 hover:text-white tracking-widest"
        >
          SELECCIONADA ✕
        </button>
      </div>

      <div>
        <h3 className="font-display text-2xl leading-[0.98] uppercase tracking-wide text-[#F5EFE6]">
          {province.name}
        </h3>
        {meta.governorLine ? <p className="text-xs text-slate-300 mt-1">{meta.governorLine}</p> : null}
      </div>

      <SelectedProvinceStatGrid province={province} />

      <SelectedProvinceActionsBlock
        atnFlash={atnFlash}
        capitalRemaining={capitalRemaining}
        onSendAtn={onSendAtn}
        onPromiseWorks={onPromiseWorks}
        onCallGovernor={onCallGovernor}
      />
    </div>
  );
}

function projectSinglePin(
  mesh: THREE.Mesh,
  camera: THREE.PerspectiveCamera,
  width: number,
  height: number,
  el: HTMLButtonElement
) {
  const meta = mesh.userData as ProvinceMeshMeta;
  const vec = new THREE.Vector3(meta.centerX, meta.baseHeight + 0.35 + mesh.position.y, meta.centerZ);
  vec.project(camera);
  if (vec.z > 1 || vec.z < -1) {
    el.style.opacity = '0';
    return;
  }
  const px = (vec.x * 0.5 + 0.5) * width;
  const py = (-vec.y * 0.5 + 0.5) * height;
  el.style.opacity = '1';
  el.style.transform = `translate3d(${px.toFixed(1)}px, ${py.toFixed(1)}px, 0) translate(-50%, -100%)`;
}

function isContainerMeasurable(container: HTMLDivElement): boolean {
  return container.clientWidth > 0 && container.clientHeight > 0;
}

function updateProjectedPinPositions(
  group: THREE.Group | null,
  camera: THREE.PerspectiveCamera,
  container: HTMLDivElement,
  pinEls: Record<string, HTMLButtonElement | null>
) {
  if (!group || !isContainerMeasurable(container)) return;
  const w = container.clientWidth;
  const h = container.clientHeight;
  for (const child of group.children) {
    const mesh = child as THREE.Mesh;
    const el = pinEls[(mesh.userData as ProvinceMeshMeta).provinceId];
    if (el) projectSinglePin(mesh, camera, w, h, el);
  }
}

function resolvePinClass(isCapital: boolean, isSelected: boolean): string {
  if (isCapital) return 'bg-[#EB3F7D] text-[#090407] border-[#f472b6] font-extrabold shadow-lg';
  if (isSelected) return 'bg-[#EFE9DA] text-[#090407] border-[#EB3F7D] font-extrabold shadow-lg';
  return 'bg-[#090407]/85 text-[#F5EFE6] border-white/25 hover:border-[#EB3F7D]';
}

function ProvincePinButton({
  spec,
  prov,
  isSelected,
  pinRefs,
  onSelectProvince
}: {
  spec: { id: string; label: string; isCapital?: boolean };
  prov: ProvinceSummary;
  isSelected: boolean;
  pinRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
  onSelectProvince: (id: string) => void;
}) {
  const isBright = Boolean(spec.isCapital) || isSelected;
  const cls = resolvePinClass(Boolean(spec.isCapital), isSelected);
  const countCls = isBright ? 'opacity-80' : 'text-slate-300';

  return (
    <button
      ref={(el) => {
        pinRefs.current[spec.id] = el;
      }}
      type="button"
      onClick={() => {
        playUiSound('select');
        onSelectProvince(prov.id);
      }}
      style={{ left: 0, top: 0, opacity: 0 }}
      className={`pointer-events-auto absolute px-1.5 py-0.5 border text-[9px] font-mono uppercase tracking-wider whitespace-nowrap transition-colors ${cls}`}
    >
      {spec.label} <span className={countCls}>{prov.nationalDeputiesCount}</span>
    </button>
  );
}

function ProvinceFloatingPinsOverlay({
  provMap,
  selectedProvinceId,
  pinRefs,
  onSelectProvince
}: {
  provMap: Map<string, ProvinceSummary>;
  selectedProvinceId: string | null;
  pinRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>;
  onSelectProvince: (id: string) => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {PINNED_PROVINCE_SPECS.map((spec) => {
        const prov = provMap.get(spec.id);
        return prov ? (
          <ProvincePinButton
            key={spec.id}
            spec={spec}
            prov={prov}
            isSelected={isMatchingProvince(selectedProvinceId, spec.id)}
            pinRefs={pinRefs}
            onSelectProvince={onSelectProvince}
          />
        ) : null;
      })}
    </div>
  );
}

function MapLegendOverlay({
  mapMode,
  bottomLeftSlot
}: {
  mapMode: Map3DMode;
  bottomLeftSlot?: React.ReactNode;
}) {
  const legendItems = LEGEND_BY_MODE[mapMode];
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-20 flex flex-col items-start gap-2.5">
      <div className="space-y-1 bg-[#090407]/70 px-2.5 py-2 border border-white/10">
        <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#EB3F7D]">
          CÓMO LEER EL MAPA
        </div>
        <div className="text-[11px] font-semibold text-[#F5EFE6]">Altura = diputados</div>
        <div className="space-y-1 pt-0.5">
          {legendItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-[11px] text-slate-200">
              <span className={`w-2.5 h-2.5 border border-white/25 shrink-0 ${item.dotClass}`} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      {bottomLeftSlot}
    </div>
  );
}

function useArgentina3DSetup(
  containerRef: React.RefObject<HTMLDivElement | null>,
  provincesRef: React.MutableRefObject<ProvinceSummary[]>,
  modeRef: React.MutableRefObject<Map3DMode>,
  pinRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>,
  onHoverChangeRef: React.MutableRefObject<(id: string | null, pos: { x: number; y: number } | null) => void>,
  onSelectRef: React.MutableRefObject<(id: string) => void>
) {
  const groupRef = useRef<THREE.Group | null>(null);
  const landmarksRef = useRef<AnimatedLandmarkRefs | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const targetGoalRef = useRef(new THREE.Vector3(-1, 0, 5.5));
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
      updateProjectedPinPositions(groupRef.current, camera, container, pinRefs.current);
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
  }, [containerRef, provincesRef, modeRef, pinRefs, onHoverChangeRef, onSelectRef]);

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
  bottomLeftSlot,
  capitalRemaining = 3,
  onSelectProvince,
  onSendAtn,
  onPromiseWorks,
  onCallGovernor
}: Argentina3DMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pinRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [mapMode, setMapMode] = useState<Map3DMode>('LOYALTY');
  const [layersOpen, setLayersOpen] = useState(false);
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
    pinRefs,
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
  const handleWorksClick = buildAtnHandler(activeProvince, onPromiseWorks, setAtnFlash);
  const handleCallClick = buildAtnHandler(activeProvince, onCallGovernor, setAtnFlash);

  const handleResetView = () => {
    onSelectProvince('');
    targetGoalRef.current.set(panelOpen ? -5 : -1, 0, 5.5);
    if (cameraRef.current) cameraRef.current.position.set(2, 41, 49);
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none rosca-obsidian-stage">
      <div ref={containerRef} className="w-full h-full" />

      <ProvinceFloatingPinsOverlay
        provMap={provMap}
        selectedProvinceId={selectedProvinceId}
        pinRefs={pinRefs}
        onSelectProvince={onSelectProvince}
      />

      <HoveredCursorTooltip province={hoveredProvince} mode={mapMode} cursor={hoveredState.pos} />

      <MapLegendOverlay mapMode={mapMode} bottomLeftSlot={bottomLeftSlot} />

      <div className="pointer-events-none absolute top-3 right-5 z-20 flex flex-col items-end gap-2">
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

        <SelectedProvinceCard
          province={activeProvince}
          atnFlash={atnFlash}
          capitalRemaining={capitalRemaining}
          onSendAtn={handleAtnClick}
          onPromiseWorks={handleWorksClick}
          onCallGovernor={handleCallClick}
          onClose={() => onSelectProvince('')}
        />
      </div>
    </div>
  );
}
