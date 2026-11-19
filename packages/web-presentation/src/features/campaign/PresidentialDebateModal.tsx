import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Flame, Mic, Radio, Scale, Sparkles, Timer, Tv, X } from 'lucide-react';
import {
  evaluateDebateReplyOutcome,
  type CampaignSimulationState,
  type DebateImpactSummary,
  type DebateMode,
  type DebateRebuttalSpec,
  type DebateReplyOption,
  type DebateRivalSeat,
  type DebateSession
} from '@argentina-sim/domain';
import {
  DEBATE_PROMPTS_CATALOG,
  DEBATE_REBUTTALS_CATALOG
} from '@argentina-sim/infrastructure';
import { buildDebateSession } from '@argentina-sim/domain';
import { playUiSound } from '@/lib/gameFeedback';
import { ViewportModalPortal } from '@/components/ui/ViewportModalPortal';
import { getMahoganyWoodTexture } from '../map-3d/proceduralPbrTextures.js';
import type { MediaOutletLogoId } from '../party-setup/officialLogosCatalog.js';
import {
  OfficialInstitutionLogo,
  OfficialMediaLogo,
  OfficialPartyLogo
} from '../party-setup/OfficialLogoBadge.js';

// Simulador 3D de Debate Presidencial (Generales CNE 5 atriles / Balotaje cara a cara 2 atriles)
// con placa institucional previa, camara que sigue al orador, reloj de turno y Derecho a Replica.

const DEBATE_NETWORK_STRIP: MediaOutletLogoId[] = [
  'TV_PUBLICA',
  'TN',
  'LN_MAS',
  'C5N',
  'CRONICA_TV',
  'A24',
  'CANAL_26'
];

interface BuiltPodiumMesh {
  group: THREE.Group;
  ledMat: THREE.MeshStandardMaterial;
  xPos: number;
}

function buildPodiumArcPositions(count: number): Array<{ x: number; z: number; rotY: number }> {
  if (count <= 2) {
    return [
      { x: -1.45, z: 0.35, rotY: 0.22 },
      { x: 1.45, z: 0.35, rotY: -0.22 }
    ];
  }
  const slots: Array<{ x: number; z: number; rotY: number }> = [];
  for (let i = 0; i < count; i += 1) {
    const ratio = count > 1 ? i / (count - 1) : 0.5;
    const angle = (ratio - 0.5) * 1.15;
    slots.push({
      x: Math.sin(angle) * 3.85,
      z: -0.65 + (1 - Math.cos(angle)) * 1.55,
      rotY: -angle * 0.55
    });
  }
  return slots;
}

function buildSingleDebatePodium(
  seat: DebateRivalSeat,
  pos: { x: number; z: number; rotY: number },
  woodMat: THREE.MeshStandardMaterial,
  brassMat: THREE.MeshStandardMaterial
): BuiltPodiumMesh {
  const g = new THREE.Group();
  g.position.set(pos.x, 0, pos.z);
  g.rotation.y = pos.rotY;

  const base = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.12, 0.65), brassMat);
  base.position.y = 0.06;
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.76, 1.08, 0.5), woodMat);
  body.position.y = 0.66;
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.09, 0.6), woodMat);
  top.position.y = 1.24;
  top.rotation.x = 0.16;

  const colorInt = Number.parseInt(seat.partyColor.replace('#', ''), 16) || 0x38bdf8;
  const ledMat = new THREE.MeshStandardMaterial({
    color: colorInt,
    emissive: colorInt,
    emissiveIntensity: 0.35,
    roughness: 0.25
  });
  const frontLed = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.72, 0.04), ledMat);
  frontLed.position.set(0, 0.68, 0.26);

  const micStem = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.32, 8), brassMat);
  micStem.position.set(0.18, 1.38, 0.08);
  micStem.rotation.x = -0.35;

  g.add(base, body, top, frontLed, micStem);
  return { group: g, ledMat, xPos: pos.x };
}

function createDebateStudioScene(container: HTMLDivElement, podiums: DebateRivalSeat[]) {
  const width = Math.max(360, container.clientWidth);
  const height = 205;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060b14);
  scene.fog = new THREE.FogExp2(0x060b14, 0.052);

  const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 60);
  camera.position.set(0, 2.35, 6.4);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.replaceChildren(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xdbeafe, 0.65);
  const backdropLight = new THREE.PointLight(0x38bdf8, 1.7, 16);
  backdropLight.position.set(0, 3.2, -3.5);

  const speakerSpot = new THREE.SpotLight(0xfff1d6, 3.4, 14, 0.36, 0.45, 1.1);
  speakerSpot.position.set(0, 5.4, 2.8);
  scene.add(ambient, backdropLight, speakerSpot, speakerSpot.target);

  const stage = new THREE.Mesh(
    new THREE.CylinderGeometry(5.6, 5.9, 0.22, 48),
    new THREE.MeshStandardMaterial({ color: 0x101827, roughness: 0.3, metalness: 0.45 })
  );
  stage.position.y = -0.11;
  scene.add(stage);

  const backScreen = new THREE.Mesh(
    new THREE.CylinderGeometry(6.1, 6.1, 3.3, 36, 1, true, Math.PI * 0.72, Math.PI * 0.56),
    new THREE.MeshStandardMaterial({
      color: 0x0c1b36,
      emissive: 0x0f274c,
      emissiveIntensity: 0.7,
      side: THREE.BackSide
    })
  );
  backScreen.position.y = 1.65;
  scene.add(backScreen);

  const woodMat = new THREE.MeshStandardMaterial({ map: getMahoganyWoodTexture(), roughness: 0.35, metalness: 0.2 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4b26a, metalness: 0.85, roughness: 0.22 });
  const arc = buildPodiumArcPositions(podiums.length);
  const builtPodiums = podiums.map((seat, i) => {
    const built = buildSingleDebatePodium(seat, arc[i]!, woodMat, brassMat);
    scene.add(built.group);
    return built;
  });

  return { scene, camera, renderer, speakerSpot, builtPodiums };
}

function DebateStudio3DCanvas({
  podiums,
  activeSpeakerIdx,
  activeHeadline,
  shotSecondsLeft,
  isRebuttalMode,
  isMandatory
}: {
  podiums: DebateRivalSeat[];
  activeSpeakerIdx: number;
  activeHeadline: string;
  shotSecondsLeft: number;
  isRebuttalMode: boolean;
  isMandatory: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const speakerRef = useRef(activeSpeakerIdx);
  speakerRef.current = activeSpeakerIdx;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const { scene, camera, renderer, speakerSpot, builtPodiums } = createDebateStudioScene(container, podiums);

    let animId = 0;
    let camX = 0;
    const tick = () => {
      animId = requestAnimationFrame(tick);
      const targetIdx = speakerRef.current;
      const targetPodium = builtPodiums[targetIdx] ?? builtPodiums[0];
      const desiredX = targetPodium ? targetPodium.xPos : 0;
      camX += (desiredX * 0.55 - camX) * 0.06;

      builtPodiums.forEach((p, idx) => {
        p.ledMat.emissiveIntensity = idx === targetIdx ? 1.55 : 0.28;
      });

      speakerSpot.target.position.set(desiredX, 0.9, 0);
      camera.position.x = camX;
      camera.lookAt(desiredX * 0.4, 1.0, 0);
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [podiums]);

  const mins = Math.floor(shotSecondsLeft / 60);
  const secs = String(shotSecondsLeft % 60).padStart(2, '0');
  const timerBadgeCls = isRebuttalMode ? 'bg-rose-700 border-[#f472b6]' : 'bg-[#0b0508]/90 border-sky-400/70';

  return (
    <div className="relative rounded-sm overflow-hidden border border-[#EB3F7D]/55 bg-[#05080d]">
      <div ref={containerRef} className="w-full h-[205px]" />

      <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
        <span className="px-2 py-0.5 rounded-sm bg-rose-700 text-[10px] font-mono font-extrabold uppercase text-white flex items-center gap-1.5 shadow">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          {isMandatory ? 'CADENA CNE · DEBATE EN VIVO' : 'PRIME TIME TV · DEBATE EN VIVO'}
        </span>
        <span className={`px-2 py-0.5 rounded-sm border text-[10px] font-mono font-extrabold text-white inline-flex items-center gap-1 shadow ${timerBadgeCls}`}>
          <Timer className="w-3 h-3 text-[#f472b6]" />
          0{mins}:{secs}
        </span>
      </div>

      <div className="hidden sm:flex absolute top-2 right-2.5 items-center gap-1 bg-[#05080d]/85 border border-slate-700/80 px-1.5 py-1 rounded-sm">
        {DEBATE_NETWORK_STRIP.map((mediaId) => (
          <OfficialMediaLogo key={mediaId} media={mediaId} heightPx={16} />
        ))}
      </div>

      <div className="bg-gradient-to-r from-[#0f2544] via-[#173663] to-[#0b1b33] px-3 py-1.5 border-t border-amber-400/70 flex items-center justify-between text-xs font-mono">
        <span className="font-extrabold text-white uppercase tracking-wider truncate">
          {activeHeadline}
        </span>
        <span className="text-[10px] text-[#EFE9DA] shrink-0 ml-2">
          {isMandatory ? 'LEY 27.337' : 'ESPECIAL TV'}
        </span>
      </div>
    </div>
  );
}

function DebateNacionalIntroPlate({
  title,
  subtitle,
  isMandatory,
  onSkip
}: {
  title: string;
  subtitle: string;
  isMandatory: boolean;
  onSkip: () => void;
}) {
  const plateTag = isMandatory
    ? 'TRANSMISIÓN NACIONAL OBLIGATORIA · CNE'
    : 'ESPECIAL TELEVISIVO EN VIVO · COBERTURA MULTICANAL';
  return (
    <div className="rounded-sm bg-[#060b14] border-2 border-[#75aadb]/70 overflow-hidden shadow-2xl">
      <div className="h-2.5 w-full flex">
        <span className="flex-1 bg-[#75aadb]" />
        <span className="flex-1 bg-white" />
        <span className="flex-1 bg-[#75aadb]" />
      </div>

      <div className="p-6 sm:p-8 text-center space-y-5 bg-[radial-gradient(circle_at_top,rgba(117,170,219,0.22),#060b14_70%)]">
        {isMandatory ? (
          <div className="flex items-center justify-center gap-4">
            <OfficialInstitutionLogo institution="ESCUDO_NACIONAL" heightPx={66} />
            <OfficialInstitutionLogo institution="BOLETIN_OFICIAL" heightPx={44} />
          </div>
        ) : null}

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-sky-950/70 border border-sky-400/50 text-[10px] font-mono font-bold uppercase tracking-[0.22em] text-sky-200 animate-pulse">
            <Radio className="w-3.5 h-3.5 text-red-400" />
            {plateTag}
          </div>
          <h4 className="text-xl sm:text-2xl font-serif font-black uppercase tracking-wide text-white">
            {title}
          </h4>
          <p className="text-xs font-mono text-[#EFE9DA]">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
          {DEBATE_NETWORK_STRIP.map((m) => (
            <OfficialMediaLogo key={m} media={m} heightPx={20} />
          ))}
        </div>

        <div className="pt-1 flex justify-center">
          <button
            type="button"
            onClick={onSkip}
            className="px-4 py-1.5 rounded-sm bg-[#142033] hover:bg-[#1d2e48] border border-[#3a5275] text-[11px] font-mono font-bold uppercase tracking-wider text-sky-200 transition"
          >
            Ir al estudio del debate →
          </button>
        </div>
      </div>

      <div className="h-2.5 w-full flex">
        <span className="flex-1 bg-[#75aadb]" />
        <span className="flex-1 bg-white" />
        <span className="flex-1 bg-[#75aadb]" />
      </div>
    </div>
  );
}

function PodiumScoreboardRow({
  podiums,
  playerIndex,
  activeSpeakerIdx
}: {
  podiums: DebateRivalSeat[];
  playerIndex: number;
  activeSpeakerIdx: number;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
      {podiums.map((seat, idx) => {
        const isSpeaking = idx === activeSpeakerIdx;
        const isPlayer = idx === playerIndex;
        const borderCls = isSpeaking
          ? 'border-amber-400 bg-[#142136] shadow-[0_0_12px_rgba(245,158,11,0.3)]'
          : 'border-white/15 bg-[#0b0508] opacity-85';
        return (
          <div key={`${seat.partySigla}-${idx}`} className={`rounded-sm border p-2 flex items-center gap-2 transition ${borderCls}`}>
            <OfficialPartyLogo partyIdOrSigla={seat.partySigla} sizePx={24} fallbackColor={seat.partyColor} />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-[#F5EFE6] truncate">
                {seat.candidateName}
              </div>
              <div className="text-[9px] font-mono text-slate-400 truncate">
                {isPlayer ? `TÚ · ${seat.partySigla}` : `${seat.partySigla} (${seat.pollingPct}%)`}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RebuttalDrawer({
  rebuttals,
  rebuttalsLeft,
  alreadyUsedThisRound,
  onUseRebuttal
}: {
  rebuttals: DebateRebuttalSpec[];
  rebuttalsLeft: number;
  alreadyUsedThisRound: boolean;
  onUseRebuttal: (reb: DebateRebuttalSpec) => void;
}) {
  const disabled = rebuttalsLeft <= 0 || alreadyUsedThisRound;
  return (
    <div className="rounded-sm bg-rose-950/25 border border-rose-700/60 p-3 space-y-2">
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className="font-bold text-rose-300 uppercase flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-rose-400" />
          Derecho a Réplica ({rebuttalsLeft} disponibles)
        </span>
        <span className="text-[10px] text-slate-400">
          {alreadyUsedThisRound ? 'Ya usaste réplica en este bloque' : 'Dispará un cruce extra antes de responder'}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {rebuttals.slice(0, 3).map((r) => (
          <button
            key={r.id}
            type="button"
            disabled={disabled}
            onClick={() => onUseRebuttal(r)}
            className="p-2 rounded-sm bg-[#0e070b] hover:bg-[#231018] border border-rose-800/70 disabled:opacity-40 disabled:cursor-not-allowed text-left text-[11px] font-mono text-rose-200 transition"
          >
            <div className="font-bold truncate">{r.label}</div>
            <div className="text-[10px] text-emerald-300 mt-0.5">
              +{r.bonusConvDelta} Conv · +{r.bonusVoteDelta}% Voto
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function formatSigned(val: number, suffix = ''): string {
  const prefix = val >= 0 ? '+' : '';
  return `${prefix}${val.toFixed(1)}${suffix}`;
}

function DebateMetricsGrid({ totals }: { totals: DebateImpactSummary }) {
  return (
    <div className="grid grid-cols-4 gap-2 font-mono text-xs text-center">
      <div className="p-2 rounded-sm bg-[#11080d] border border-white/15">
        <span className="text-[10px] text-slate-400 block">IMAGEN POSITIVA</span>
        <strong className="text-emerald-400">{formatSigned(totals.imageDelta)}</strong>
      </div>
      <div className="p-2 rounded-sm bg-[#11080d] border border-white/15">
        <span className="text-[10px] text-slate-400 block">CONVENCIMIENTO</span>
        <strong className="text-[#f472b6]">{formatSigned(totals.convDelta)}</strong>
      </div>
      <div className="p-2 rounded-sm bg-[#11080d] border border-white/15">
        <span className="text-[10px] text-slate-400 block">INTENCIÓN VOTO</span>
        <strong className="text-sky-300">{formatSigned(totals.voteDelta, '%')}</strong>
      </div>
      <div className="p-2 rounded-sm bg-[#11080d] border border-white/15">
        <span className="text-[10px] text-slate-400 block">IMAGEN NEGATIVA</span>
        <strong className="text-rose-300">{formatSigned(totals.negDelta)}</strong>
      </div>
    </div>
  );
}

function DebateActiveRoundsBody({
  session,
  currentRound,
  rebuttalsLeft,
  usedRebuttalThisRound,
  onUseRebuttal,
  onSelectOption,
  onSkipDebate
}: {
  session: DebateSession;
  currentRound: DebateSession['rounds'][number];
  rebuttalsLeft: number;
  usedRebuttalThisRound: boolean;
  onUseRebuttal: (reb: DebateRebuttalSpec) => void;
  onSelectOption: (opt: DebateReplyOption) => void;
  onSkipDebate: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="p-3.5 rounded-sm bg-[#0b0508] border border-[#EB3F7D]/55/80 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-[#f472b6]">
          <span className="inline-flex items-center gap-1.5">
            <Mic className="w-3.5 h-3.5" />
            BLOQUE {currentRound.roundNumber} DE {session.rounds.length} · {currentRound.themeLabel.toUpperCase()}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sky-300">
            <OfficialPartyLogo
              partyIdOrSigla={currentRound.challenger.partySigla}
              sizePx={18}
              fallbackColor={currentRound.challenger.partyColor}
            />
            {currentRound.challenger.candidateName} ({currentRound.challenger.partySigla})
          </span>
        </div>
        <p className="text-xs sm:text-sm font-serif italic text-slate-100 leading-relaxed">
          {currentRound.questionText}
        </p>
      </div>

      <RebuttalDrawer
        rebuttals={session.rebuttals}
        rebuttalsLeft={rebuttalsLeft}
        alreadyUsedThisRound={usedRebuttalThisRound}
        onUseRebuttal={onUseRebuttal}
      />

      <div className="space-y-2">
        {currentRound.options.map((opt) => (
          <button
            key={opt.tone}
            type="button"
            onClick={() => onSelectOption(opt)}
            className="w-full p-3 rounded-sm bg-[#11080d] hover:bg-[#152030] border border-white/15 hover:border-[#EB3F7D] text-left space-y-1 transition"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
              <span className="font-bold text-[#EFE9DA] uppercase">{opt.toneLabel}</span>
              <span className="text-emerald-300">
                Img {formatSigned(opt.imageDelta)} · Conv {formatSigned(opt.convDelta)} · Voto {formatSigned(opt.voteDelta, '%')}
              </span>
            </div>
            <p className="text-xs text-slate-300">{opt.replyText}</p>
          </button>
        ))}
      </div>

      {session.isMandatory ? (
        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={onSkipDebate}
            className="px-3 py-1 rounded-sm bg-[#1a1114] hover:bg-[#2a151a] border border-rose-800/70 text-[10px] font-mono font-bold uppercase text-rose-300"
          >
            Dejar atril vacío y faltar al debate (-2,5 Img / -1,8% Voto)
          </button>
        </div>
      ) : null}
    </div>
  );
}

function DebateFinishedSummary({
  roundsCount,
  totals,
  onClose
}: {
  roundsCount: number;
  totals: DebateImpactSummary;
  onClose: () => void;
}) {
  return (
    <div className="p-4 rounded-sm bg-[#0b0508] border border-emerald-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="space-y-1">
        <div className="text-xs font-mono font-bold text-emerald-300 uppercase flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          Debate Presidencial Finalizado · Impacto Aplicado en Campaña
        </div>
        <p className="text-xs text-slate-300">
          Cerraste los {roundsCount} bloques ({totals.rebuttalsUsed} réplicas usadas) con saldo de {formatSigned(totals.voteDelta, '%')} en intención de voto.
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="hoi-btn-gold px-4 py-2 rounded-sm text-xs font-mono font-bold uppercase shrink-0"
      >
        Cerrar y Volver
      </button>
    </div>
  );
}

function DebateStudioStageWrapper({
  session,
  activeSpeakerIdx,
  headline,
  shotClock,
  usedRebuttalThisRound,
  totals,
  verdictBanner,
  finished,
  roundIdx,
  rebuttalsLeft,
  onUseRebuttal,
  onSelectOption,
  onSkipDebate,
  onClose
}: {
  session: DebateSession;
  activeSpeakerIdx: number;
  headline: string;
  shotClock: number;
  usedRebuttalThisRound: boolean;
  totals: DebateImpactSummary;
  verdictBanner: string | null;
  finished: boolean;
  roundIdx: number;
  rebuttalsLeft: number;
  onUseRebuttal: (reb: DebateRebuttalSpec) => void;
  onSelectOption: (opt: DebateReplyOption) => void;
  onSkipDebate: () => void;
  onClose: () => void;
}) {
  const currentRound = session.rounds[roundIdx] ?? session.rounds[0]!;
  return (
    <>
      <DebateStudio3DCanvas
        podiums={session.podiums}
        activeSpeakerIdx={activeSpeakerIdx}
        activeHeadline={headline}
        shotSecondsLeft={shotClock}
        isRebuttalMode={usedRebuttalThisRound}
        isMandatory={session.isMandatory}
      />
      <PodiumScoreboardRow podiums={session.podiums} playerIndex={session.playerPodiumIndex} activeSpeakerIdx={activeSpeakerIdx} />
      <DebateMetricsGrid totals={totals} />
      {verdictBanner ? (
        <div className="px-3 py-2 rounded-sm bg-sky-950/35 border border-sky-700/50 text-[11px] font-mono text-sky-200 flex items-center gap-2">
          <Tv className="w-3.5 h-3.5 text-[#f472b6] shrink-0" />
          <span className="truncate">{verdictBanner}</span>
        </div>
      ) : null}
      {finished ? (
        <DebateFinishedSummary roundsCount={session.rounds.length} totals={totals} onClose={onClose} />
      ) : (
        <DebateActiveRoundsBody
          session={session}
          currentRound={currentRound}
          rebuttalsLeft={rebuttalsLeft}
          usedRebuttalThisRound={usedRebuttalThisRound}
          onUseRebuttal={onUseRebuttal}
          onSelectOption={onSelectOption}
          onSkipDebate={onSkipDebate}
        />
      )}
    </>
  );
}

function accumulateDebateTotals(prev: DebateImpactSummary, evaluated: DebateReplyOption): DebateImpactSummary {
  return {
    imageDelta: Number((prev.imageDelta + evaluated.imageDelta).toFixed(1)),
    negDelta: Number((prev.negDelta + evaluated.negDelta).toFixed(1)),
    convDelta: Number((prev.convDelta + evaluated.convDelta).toFixed(1)),
    voteDelta: Number((prev.voteDelta + evaluated.voteDelta).toFixed(1)),
    relDelta: Number((prev.relDelta + evaluated.relDelta).toFixed(1)),
    intDelta: Number((prev.intDelta + evaluated.intDelta).toFixed(1)),
    rebuttalsUsed: prev.rebuttalsUsed,
    lastHeadline: evaluated.headline
  };
}

function resolveNextChallengerPodium(session: DebateSession, nextIdx: number): number {
  const nextChallenger = session.rounds[nextIdx]?.challenger;
  if (!nextChallenger) return 0;
  const idx = session.podiums.findIndex((p) => p.partySigla === nextChallenger.partySigla);
  return idx >= 0 ? idx : 0;
}

export interface PresidentialDebateModalProps {
  open: boolean;
  mode: DebateMode;
  state: CampaignSimulationState;
  onFinishDebate: (summary: DebateImpactSummary) => void;
  onSkipDebate: () => void;
  onClose: () => void;
}

const ZERO_DEBATE_TOTALS: DebateImpactSummary = {
  imageDelta: 0,
  negDelta: 0,
  convDelta: 0,
  voteDelta: 0,
  relDelta: 0,
  intDelta: 0,
  rebuttalsUsed: 0,
  lastHeadline: 'DEBATE PRESIDENCIAL FINALIZADO'
};

export function PresidentialDebateModal({
  open,
  mode,
  state,
  onFinishDebate,
  onSkipDebate,
  onClose
}: PresidentialDebateModalProps) {
  const [sessionNonce, setSessionNonce] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [roundIdx, setRoundIdx] = useState(0);
  const [rebuttalsLeft, setRebuttalsLeft] = useState(2);
  const [usedRebuttalThisRound, setUsedRebuttalThisRound] = useState(false);
  const [activeSpeakerIdx, setActiveSpeakerIdx] = useState(0);
  const [shotClock, setShotClock] = useState(90);
  const [headline, setHeadline] = useState('INICIO DE LA CADENA OBLIGATORIA DE DEBATE PRESIDENCIAL');
  const [verdictBanner, setVerdictBanner] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [totals, setTotals] = useState<DebateImpactSummary>(ZERO_DEBATE_TOTALS);

  const session: DebateSession = useMemo(
    () => buildDebateSession(state, mode, DEBATE_PROMPTS_CATALOG, DEBATE_REBUTTALS_CATALOG, sessionNonce),
    [state, mode, sessionNonce]
  );

  useEffect(() => {
    if (!open) return undefined;
    setShowIntro(true);
    setRoundIdx(0);
    setRebuttalsLeft(session.maxRebuttals);
    setUsedRebuttalThisRound(false);
    setActiveSpeakerIdx(0);
    setShotClock(90);
    setFinished(false);
    setVerdictBanner(null);
    setHeadline(`${session.title.toUpperCase()} · BLOQUE 1`);
    setTotals(ZERO_DEBATE_TOTALS);
    playUiSound('quorum');
    const timer = window.setTimeout(() => setShowIntro(false), 2300);
    return () => window.clearTimeout(timer);
  }, [open, session.title, session.maxRebuttals]);

  useEffect(() => {
    if (!open || showIntro || finished) return undefined;
    const t = window.setInterval(() => setShotClock((prev) => Math.max(0, prev - 1)), 1000);
    return () => window.clearInterval(t);
  }, [open, showIntro, finished]);

  if (!open) return null;

  const handleUseRebuttal = (reb: DebateRebuttalSpec) => {
    if (rebuttalsLeft <= 0 || usedRebuttalThisRound) return;
    playUiSound('quorum');
    setActiveSpeakerIdx(session.playerPodiumIndex);
    setShotClock(45);
    setRebuttalsLeft((prev) => prev - 1);
    setUsedRebuttalThisRound(true);
    setHeadline(reb.headline);
    setVerdictBanner(`⚡ DERECHO A RÉPLICA: ${reb.counterText}`);
    setTotals((prev) => ({
      ...prev,
      imageDelta: prev.imageDelta + reb.bonusImageDelta,
      negDelta: prev.negDelta + reb.riskNegDelta,
      convDelta: prev.convDelta + reb.bonusConvDelta,
      voteDelta: prev.voteDelta + reb.bonusVoteDelta,
      relDelta: prev.relDelta + 1.4,
      rebuttalsUsed: prev.rebuttalsUsed + 1,
      lastHeadline: reb.headline
    }));
  };

  const handleSelectOption = (rawOpt: DebateReplyOption) => {
    playUiSound('stamp');
    const evaluated = evaluateDebateReplyOutcome(state, rawOpt);
    const nextSummary = accumulateDebateTotals(totals, evaluated);
    setTotals(nextSummary);
    setHeadline(evaluated.headline);
    setVerdictBanner(`${evaluated.liveTag} · ${evaluated.headline}`);
    setActiveSpeakerIdx(session.playerPodiumIndex);

    if (roundIdx + 1 >= session.rounds.length) {
      setFinished(true);
      onFinishDebate(nextSummary);
      return;
    }

    const nextIdx = roundIdx + 1;
    setRoundIdx(nextIdx);
    setUsedRebuttalThisRound(false);
    setShotClock(90);
    window.setTimeout(() => setActiveSpeakerIdx(resolveNextChallengerPodium(session, nextIdx)), 450);
  };

  const handleCloseAction = () => {
    setSessionNonce((n) => n + 1);
    onClose();
  };

  const canCloseHeader = !session.isMandatory || finished;

  return (
    <ViewportModalPortal>
      <div className="fixed inset-0 z-[90] bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div className="hoi-panel rounded-lg border-2 border-[#EB3F7D]/55 w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl my-auto">
        <div className="hoi-header-steel p-4 border-b border-white/15 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Scale className="w-4 h-4 text-[#f472b6]" />
            <div>
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#EB3F7D]">{session.subtitle}</div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#F5EFE6] uppercase tracking-wide">{session.title}</h3>
            </div>
          </div>
          {canCloseHeader ? (
            <button type="button" onClick={handleCloseAction} className="p-1.5 rounded-sm bg-[#0b0508] border border-white/15 text-slate-300 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        <div className="p-4 space-y-3.5 bg-[#0a0f17]">
          {showIntro ? (
            <DebateNacionalIntroPlate
              title={session.title}
              subtitle={session.subtitle}
              isMandatory={session.isMandatory}
              onSkip={() => setShowIntro(false)}
            />
          ) : (
            <DebateStudioStageWrapper
              session={session}
              activeSpeakerIdx={activeSpeakerIdx}
              headline={headline}
              shotClock={shotClock}
              usedRebuttalThisRound={usedRebuttalThisRound}
              totals={totals}
              verdictBanner={verdictBanner}
              finished={finished}
              roundIdx={roundIdx}
              rebuttalsLeft={rebuttalsLeft}
              onUseRebuttal={handleUseRebuttal}
              onSelectOption={handleSelectOption}
              onSkipDebate={() => {
                onSkipDebate();
                handleCloseAction();
              }}
              onClose={handleCloseAction}
            />
          )}
        </div>
        </div>
      </div>
    </ViewportModalPortal>
  );
}
