import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { ProvinceSummary } from '@argentina-sim/domain';
import {
  buildArgentina3DGroup,
  resolveProvinceColor,
  type Map3DMode,
  type ProvinceMeshMeta
} from './argentina3dGeometry.js';

interface Argentina3DMapCanvasProps {
  provinces: ProvinceSummary[];
  selectedProvinceId: string | null;
  panelOpen?: boolean;
  onSelectProvince: (provinceId: string) => void;
  onSendAtn?: (provinceId: string) => void;
}

const MODE_OPTIONS: Array<{ id: Map3DMode; label: string }> = [
  { id: 'LOYALTY', label: 'Lealtad' },
  { id: 'FISCAL', label: 'Fiscal / Cuasimonedas' },
  { id: 'DEPUTIES', label: 'Diputados' }
];

function createSceneEnvironment(container: HTMLDivElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x070a0f);

  const width = container.clientWidth || 960;
  const height = container.clientHeight || 600;
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 350);
  camera.position.set(14, 42, 46);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI / 2.15;
  controls.minDistance = 16;
  controls.maxDistance = 95;
  controls.target.set(-10, 0, 2);

  scene.add(new THREE.HemisphereLight(0xbcd0ea, 0x101824, 0.9));
  const keyLight = new THREE.DirectionalLight(0xfff1d6, 1.35);
  keyLight.position.set(22, 42, 26);
  scene.add(keyLight);

  const table = new THREE.Mesh(
    new THREE.PlaneGeometry(140, 140),
    new THREE.MeshStandardMaterial({ color: 0x090e15, roughness: 0.9, metalness: 0.1 })
  );
  table.rotation.x = -Math.PI / 2;
  table.position.y = -0.06;
  scene.add(table);

  const grid = new THREE.GridHelper(120, 50, 0x223044, 0x131b26);
  grid.position.y = -0.04;
  scene.add(grid);

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
  if (isSelected) return { hex: 0xc9a24d, intensity: 0.45 };
  if (isHovered) return { hex: 0x60a5fa, intensity: 0.32 };
  return { hex: 0x000000, intensity: 0 };
}

function updateGroupMaterials(
  group: THREE.Group | null,
  provinces: ProvinceSummary[],
  mode: Map3DMode,
  hoveredId: string | null,
  selectedId: string | null
) {
  if (!group) return;
  const provMap = new Map(provinces.map((p) => [p.id, p]));
  for (const child of group.children) {
    const mesh = child as THREE.Mesh;
    const meta = mesh.userData as ProvinceMeshMeta;
    const mat = mesh.material as THREE.MeshStandardMaterial;
    const emissive = resolveEmissiveState(meta.provinceId === selectedId, meta.provinceId === hoveredId);
    mat.color.setHex(resolveProvinceColor(provMap.get(meta.provinceId), mode));
    mat.emissive.setHex(emissive.hex);
    mat.emissiveIntensity = emissive.intensity;
  }
}

function HoveredProvincePill({ province }: { province: ProvinceSummary | undefined }) {
  if (!province) return null;
  return (
    <div className="pointer-events-none rounded-sm bg-[#11161f]/95 border border-[#283447] px-3 py-1.5 text-xs font-mono">
      <span className="font-bold text-amber-200">{province.name}</span>
      <span className="text-slate-400 ml-2">
        Dip. {province.nationalDeputiesCount} · Lealtad {province.governorLoyaltyToPresident}%
      </span>
    </div>
  );
}

function SelectedProvinceCard({
  province,
  onSendAtn,
  onClose
}: {
  province: ProvinceSummary | undefined;
  onSendAtn?: (provinceId: string) => void;
  onClose: () => void;
}) {
  if (!province) return null;
  return (
    <div className="pointer-events-auto w-72 rounded-sm bg-[#11161f]/95 border border-[#8a6d33] p-3.5 text-xs space-y-2">
      <div className="flex items-start justify-between gap-2 border-b border-[#263142] pb-2">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400">{province.region}</div>
          <div className="text-sm font-bold text-slate-100">{province.name}</div>
        </div>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-white font-mono text-xs">
          X
        </button>
      </div>
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
          onClick={() => onSendAtn(province.id)}
          className="hoi-btn-gold w-full py-1.5 rounded-sm text-[11px] font-bold uppercase tracking-wider"
        >
          Girar ATN (0.08% PBI)
        </button>
      ) : null}
    </div>
  );
}

function useArgentina3DSetup(
  containerRef: React.RefObject<HTMLDivElement | null>,
  provincesRef: React.MutableRefObject<ProvinceSummary[]>,
  modeRef: React.MutableRefObject<Map3DMode>,
  onHoverRef: React.MutableRefObject<(id: string | null) => void>,
  onSelectRef: React.MutableRefObject<(id: string) => void>
) {
  const groupRef = useRef<THREE.Group | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const hoveredRef = useRef<string | null>(null);
  const selectedRef = useRef<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const { scene, camera, renderer, controls } = createSceneEnvironment(container);
    sceneRef.current = scene;
    controlsRef.current = controls;
    cameraRef.current = camera;

    let animId = 0;
    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);
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
      if (hoveredRef.current !== nextId) {
        hoveredRef.current = nextId;
        onHoverRef.current(nextId);
        updateGroupMaterials(groupRef.current, provincesRef.current, modeRef.current, nextId, selectedRef.current);
      }
      renderer.domElement.style.cursor = nextId ? 'pointer' : 'grab';
    };
    const onPointerUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) > 5) return;
      const hit = findIntersectedProvince(e, renderer.domElement, camera, groupRef.current);
      if (!hit) return;
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
    renderer.domElement.addEventListener('pointerup', onPointerUp);

    return () => {
      cancelAnimationFrame(animId);
      resizeObs.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      controls.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [containerRef, provincesRef, modeRef, onHoverRef, onSelectRef]);

  return { groupRef, sceneRef, controlsRef, cameraRef, hoveredRef, selectedRef };
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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [topoData, setTopoData] = useState<any>(null);

  const provincesRef = useRef(provinces);
  provincesRef.current = provinces;
  const modeRef = useRef(mapMode);
  modeRef.current = mapMode;
  const onHoverRef = useRef(setHoveredId);
  onHoverRef.current = setHoveredId;
  const onSelectRef = useRef(onSelectProvince);
  onSelectRef.current = onSelectProvince;

  const { groupRef, sceneRef, controlsRef, hoveredRef, selectedRef } = useArgentina3DSetup(
    containerRef,
    provincesRef,
    modeRef,
    onHoverRef,
    onSelectRef
  );

  useEffect(() => {
    fetch('/geo/argentina-provinces.topojson')
      .then((res) => res.json())
      .then((data) => setTopoData(data))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.target.set(panelOpen ? -12 : 0, 0, 2);
    controls.update();
  }, [panelOpen, controlsRef]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || !topoData) return;
    if (groupRef.current) scene.remove(groupRef.current);
    const nextGroup = buildArgentina3DGroup(topoData, provinces, mapMode);
    groupRef.current = nextGroup;
    scene.add(nextGroup);
    selectedRef.current = selectedProvinceId;
    updateGroupMaterials(nextGroup, provinces, mapMode, hoveredRef.current, selectedProvinceId);
  }, [topoData, mapMode, provinces, selectedProvinceId, groupRef, sceneRef, hoveredRef, selectedRef]);

  const activeProvince = provinces.find((p) => p.id === (selectedProvinceId ?? hoveredId));
  const hoveredProvince = provinces.find((p) => p.id === hoveredId);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <div ref={containerRef} className="w-full h-full" />

      <div className="pointer-events-none absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
        <HoveredProvincePill province={hoveredProvince} />
      </div>

      <div className="pointer-events-none absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2">
        <div className="pointer-events-auto flex items-center gap-1 rounded-sm bg-[#11161f]/95 border border-[#263142] p-1">
          {MODE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setMapMode(opt.id)}
              className={`px-2.5 py-1 rounded-sm text-[10px] font-mono font-bold uppercase tracking-wider transition ${
                mapMode === opt.id
                  ? 'bg-[#b89342] text-[#100e09]'
                  : 'text-slate-300 hover:bg-[#1a2230]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <SelectedProvinceCard
          province={activeProvince}
          onSendAtn={onSendAtn}
          onClose={() => onSelectProvince('')}
        />
      </div>
    </div>
  );
}
