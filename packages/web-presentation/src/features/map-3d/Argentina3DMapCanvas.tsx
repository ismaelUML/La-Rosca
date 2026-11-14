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
  scene.background = new THREE.Color(0x090d13);

  const width = container.clientWidth || 960;
  const height = container.clientHeight || 600;
  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 300);
  camera.position.set(10, 26, 28);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = Math.PI / 2.15;
  controls.minDistance = 12;
  controls.maxDistance = 65;
  controls.target.set(-1, 0, 1);

  scene.add(new THREE.AmbientLight(0x9fb3cc, 0.85));
  const keyLight = new THREE.DirectionalLight(0xfff1d6, 1.35);
  keyLight.position.set(18, 34, 22);
  scene.add(keyLight);

  const grid = new THREE.GridHelper(90, 45, 0x1c2636, 0x121923);
  grid.position.y = -0.05;
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
  if (isSelected) return { hex: 0xb89342, intensity: 0.35 };
  if (isHovered) return { hex: 0x3b82f6, intensity: 0.25 };
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
  onHoverId: (id: string | null) => void,
  onSelectId: (id: string) => void
) {
  const groupRef = useRef<THREE.Group | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const hoveredRef = useRef<string | null>(null);
  const selectedRef = useRef<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const { scene, camera, renderer, controls } = createSceneEnvironment(container);
    sceneRef.current = scene;

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
        onHoverId(nextId);
        updateGroupMaterials(groupRef.current, provincesRef.current, modeRef.current, nextId, selectedRef.current);
      }
      renderer.domElement.style.cursor = nextId ? 'pointer' : 'grab';
    };
    const onPointerUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) > 5) return;
      const hit = findIntersectedProvince(e, renderer.domElement, camera, groupRef.current);
      if (!hit) return;
      selectedRef.current = hit.provinceId;
      onSelectId(hit.provinceId);
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
  }, [containerRef, provincesRef, modeRef, onHoverId, onSelectId]);

  return { groupRef, sceneRef, hoveredRef, selectedRef };
}

export function Argentina3DMapCanvas({
  provinces,
  selectedProvinceId,
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

  const { groupRef, sceneRef, hoveredRef, selectedRef } = useArgentina3DSetup(
    containerRef,
    provincesRef,
    modeRef,
    setHoveredId,
    onSelectProvince
  );

  useEffect(() => {
    fetch('/geo/argentina-provinces.topojson')
      .then((res) => res.json())
      .then((data) => setTopoData(data))
      .catch(() => undefined);
  }, []);

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

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <div ref={containerRef} className="w-full h-full" />

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
