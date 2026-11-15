import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Mic, Radio, Sparkles, Tv, X } from 'lucide-react';
import { playUiSound } from '@/lib/gameFeedback';
import { getMahoganyWoodTexture } from '../map-3d/proceduralPbrTextures.js';
import { loadGlbIntoAnchor } from '../map-3d/modelAssetLoader.js';
import type { MediaOutletLogoId } from '../party-setup/officialLogosCatalog.js';
import { OfficialInstitutionLogo, OfficialMediaLogo } from '../party-setup/OfficialLogoBadge.js';

// Simulador 3D de Conferencia de Prensa en Casa Rosada / Cadena Nacional
// y Debate Presidencial con Derechos a Replica y Chicanas en Vivo.

const STUDIO_NETWORK_POOL: MediaOutletLogoId[] = ['TV_PUBLICA', 'TN', 'LN_MAS', 'C5N', 'CRONICA_TV', 'A24'];

interface PressQuestionRound {
  id: string;
  journalist: string;
  outlet: string;
  outletLogos: MediaOutletLogoId[];
  question: string;
  options: Array<{
    tone: 'ORTODOXO' | 'CHICANA' | 'INSTITUCIONAL';
    toneLabel: string;
    replyText: string;
    imageDelta: number;
    viralDelta: number;
    marketDelta: number;
    headline: string;
  }>;
}

const PRESS_ROUNDS: PressQuestionRound[] = [
  {
    id: 'ROUND_1',
    journalist: 'Acreditado Sala de Prensa · Economía',
    outlet: 'LN+ / Ámbito / Bloomberg',
    outletLogos: ['LN_MAS', 'AMBITO', 'BLOOMBERG'],
    question:
      '«Presidente, los formadores de precios remarcaron preventivamente esta semana y los gremios amenazan con no homologar paritarias debajo del IPC. ¿Va a convalidar una devaluación o mantiene el ancla fiscal a rajatabla?»',
    options: [
      {
        tone: 'ORTODOXO',
        toneLabel: 'Técnico-Ortodoxo (Rigor Fiscal)',
        replyText:
          '«El equilibrio fiscal no se negocia ni un milímetro. No vamos a convalidar la irresponsabilidad monetaria con devaluaciones bruscas: el que remarque por encima de la pauta se va a quedar sin vender.»',
        imageDelta: 1.5,
        viralDelta: 2.0,
        marketDelta: 4.5,
        headline: 'EL EJECUTIVO RATIFICA EL ANCLA FISCAL Y DESCARTA SALTO CAMBIARIO'
      },
      {
        tone: 'CHICANA',
        toneLabel: 'Chicana al Hueso (Cruzar a la Casta)',
        replyText:
          '«Los mismos economistas y sindicalistas que dejaron 200% de inflación ahora nos quieren explicar cómo manejar la mesa de dinero. Que vayan a competir sin subsidios del Estado.»',
        imageDelta: 1.0,
        viralDelta: 5.5,
        marketDelta: 1.5,
        headline: 'FUERTE CRUCE EN CASA ROSADA: "QUE COMPITAN SIN SUBSIDIOS DEL ESTADO"'
      },
      {
        tone: 'INSTITUCIONAL',
        toneLabel: 'Institucional-Moderado (Mesa Tripartita)',
        replyText:
          '«Vamos a convocar al Consejo del Salario y a las cámaras industriales para coordinar una transición ordenada de precios y haberes cuidando el empleo formal.»',
        imageDelta: 2.5,
        viralDelta: -1.0,
        marketDelta: 1.0,
        headline: 'EL GOBIERNO CONVOCA A EMPRESARIOS Y GREMIOS PARA ORDENAR PRECIOS'
      }
    ]
  },
  {
    id: 'ROUND_2',
    journalist: 'Corresponsal Parlamentario · Política',
    outlet: 'TN / Clarín / LA NACION',
    outletLogos: ['TN', 'CLARIN', 'LA_NACION'],
    question:
      '«Los gobernadores dialoguistas advierten que sin fondos para obras viales e infraestructura energética no habrá quórum para el próximo paquete de reformas en el Senado. ¿Habrá billetera abierta o decretazo?»',
    options: [
      {
        tone: 'ORTODOXO',
        toneLabel: 'Técnico-Ortodoxo (Auditoría Obra por Obra)',
        replyText:
          '«Cada peso de ATN o infraestructura va a estar atado a metas de superávit provincial y adhesión al RIGI. Se terminaron los cheques en blanco por votos.»',
        imageDelta: 1.5,
        viralDelta: 1.5,
        marketDelta: 3.5,
        headline: 'CONDICIONAN GIROS A PROVINCIAS AL CUMPLIMIENTO DE METAS FISCALES'
      },
      {
        tone: 'CHICANA',
        toneLabel: 'Chicana al Hueso (Exponer en Cadena)',
        replyText:
          '«Si los senadores quieren votar en contra del alivio impositivo para defender sus cajas políticas, vamos a exponer nombre por nombre en televisión quién vota contra la gente.»',
        imageDelta: 0.5,
        viralDelta: 6.0,
        marketDelta: 0.5,
        headline: 'TENSIÓN CON EL SENADO: ADVIERTEN QUE EXPONDRÁN A QUIENES BLOQUEEN LEYES'
      },
      {
        tone: 'INSTITUCIONAL',
        toneLabel: 'Institucional-Moderado (Pacto Federal)',
        replyText:
          '«El Ministro del Interior ya está reunido con las ligas provinciales para destrabar las obras estratégicas y garantizar una sanción con amplio consenso federal.»',
        imageDelta: 3.0,
        viralDelta: 0.5,
        marketDelta: 2.5,
        headline: 'ACERCAMIENTO CON GOBERNADORES PARA SELLAR EL PACTO FEDERAL EN EL SENADO'
      }
    ]
  },
  {
    id: 'ROUND_3',
    journalist: 'Periodista Acreditado · Sociedad y Calle',
    outlet: 'C5N / Crónica TV / Página/12',
    outletLogos: ['C5N', 'CRONICA_TV', 'PAGINA_12'],
    question:
      '«Las columnas sindicales y universitarias anunciaron una movilización frente al Congreso por la caída del poder adquisitivo. ¿Aplicará el protocolo antipiquetes al 100% o abrirá un canal de negociación?»',
    options: [
      {
        tone: 'ORTODOXO',
        toneLabel: 'Técnico-Ortodoxo (Orden Público Estricto)',
        replyText:
          '«El derecho a manifestarse existe sobre la vereda, pero la libre circulación está garantizada por ley. Las fuerzas federales van a hacer cumplir el protocolo sin excepciones.»',
        imageDelta: 2.0,
        viralDelta: 3.5,
        marketDelta: 3.0,
        headline: 'RATIFICAN APLICACIÓN ESTRICTA DEL PROTOCOLO DE ORDEN PÚBLICO EN ACCESOS'
      },
      {
        tone: 'CHICANA',
        toneLabel: 'Chicana al Hueso (Auditar Intermediarios)',
        replyText:
          '«El que corta no cobra y vamos a auditar hasta la última factura de los gerentes de la pobreza que usan a la gente de rehén para cuidar sus sellos.»',
        imageDelta: 1.0,
        viralDelta: 6.5,
        marketDelta: 2.0,
        headline: '"EL QUE CORTA NO COBRA": LANZAN AUDITORÍA MASIVA SOBRE INTERMEDIARIOS'
      },
      {
        tone: 'INSTITUCIONAL',
        toneLabel: 'Institucional-Moderado (Refuerzo Directo)',
        replyText:
          '«Reforzaremos de manera directa la Tarjeta Alimentar y las becas estudiantiles sin intermediarios, garantizando una jornada en paz y con diálogo institucional.»',
        imageDelta: 3.0,
        viralDelta: 0.5,
        marketDelta: 1.5,
        headline: 'ANUNCIAN REFUERZO SOCIAL DIRECTO SIN INTERMEDIARIOS PARA DESCOMPRIMIR LA CALLE'
      }
    ]
  },
  {
    id: 'ROUND_4',
    journalist: 'Mesa Redacción & Negocios · Inversiones y Medios',
    outlet: 'A24 / Infobae / Forbes',
    outletLogos: ['A24', 'INFOBAE', 'FORBES'],
    question:
      '«Grupos empresarios y fondos tech evalúan desembarcar en energía e IA bajo el RIGI, pero exigen estabilidad jurídica y reclaman señales sobre el rol de la pauta y las redes oficiales. ¿Qué garantía les da hoy?»',
    options: [
      {
        tone: 'ORTODOXO',
        toneLabel: 'Técnico-Ortodoxo (Blindaje RIGI 30 Años)',
        replyText:
          '«Estabilidad fiscal, giro libre de dividendos y cero discrecionalidad estatal. Argentina compite por capital global con reglas claras, no con favores de despacho.»',
        imageDelta: 2.0,
        viralDelta: 1.5,
        marketDelta: 4.0,
        headline: 'BLINDAN REGLAS DEL RIGI Y RATIFICAN PAUTA CERO ANTE CUMBRE EMPRESARIA'
      },
      {
        tone: 'CHICANA',
        toneLabel: 'Chicana al Hueso (Pauta Cero y Ensobrados)',
        replyText:
          '«Se terminó la época en que el Estado financiaba relatos con la tuya. El que quiera invertir en Argentina bienvenido sea; el que extrañe el sobre oficial, que consiga sponsors privados.»',
        imageDelta: 0.5,
        viralDelta: 6.5,
        marketDelta: 1.0,
        headline: 'CRUCE CON MEDIOS EN CASA ROSADA: REAFIRMAN RECORTES DE PAUTA OFICIAL'
      },
      {
        tone: 'INSTITUCIONAL',
        toneLabel: 'Institucional-Moderado (Mesa Sectorial)',
        replyText:
          '«Convocamos a una mesa de competitividad federal con pymes tecnológicas, gobernadores y prensa acreditada para asegurar seguridad jurídica de largo plazo.»',
        imageDelta: 3.0,
        viralDelta: 1.0,
        marketDelta: 2.5,
        headline: 'CONVOCAN MESA DE COMPETITIVIDAD FEDERAL PARA ATRAER CAPITALES PRODUCTIVOS'
      }
    ]
  }
];

function buildSculptedPressPodiumGroup(): THREE.Group {
  const anchor = new THREE.Group();
  anchor.position.set(0, 0, 0.4);

  const fallback = new THREE.Group();
  const woodTex = getMahoganyWoodTexture();
  const woodMat = new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.34, metalness: 0.22 });
  const brassMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.85, roughness: 0.2 });
  const chromeMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.18 });
  const foamMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });

  const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.16, 0.96), woodMat);
  plinth.position.y = 0.08;
  const column = new THREE.Mesh(new THREE.BoxGeometry(1.36, 1.18, 0.76), woodMat);
  column.position.y = 0.72;
  const slantedTop = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.12, 0.92), woodMat);
  slantedTop.position.set(0, 1.34, 0.02);
  slantedTop.rotation.x = 0.22;

  const seal = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.06, 20), brassMat);
  seal.rotation.x = Math.PI / 2;
  seal.position.set(0, 0.92, 0.4);
  const sealRing = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.03, 10, 24), brassMat);
  sealRing.position.set(0, 0.92, 0.41);

  fallback.add(plinth, column, slantedTop, seal, sealRing);

  for (const ox of [-0.34, 0, 0.34]) {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.36, 10), chromeMat);
    stem.position.set(ox, 1.54, 0.22);
    stem.rotation.x = -0.35;
    const foam = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), foamMat);
    foam.position.set(ox, 1.7, 0.14);
    fallback.add(stem, foam);
  }

  anchor.add(fallback);
  loadGlbIntoAnchor(anchor, '/models/atril_prensa.glb', 1);
  return anchor;
}

function createPressStudio3DScene(container: HTMLDivElement) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x060a12);

  const w = container.clientWidth || 380;
  const h = container.clientHeight || 190;
  const camera = new THREE.PerspectiveCamera(36, w / h, 0.1, 100);
  camera.position.set(0, 2.4, 6.2);
  camera.lookAt(0, 1.1, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xfef3c7, 0x0f172a, 1.15));
  const keyLight = new THREE.PointLight(0xfbbf24, 2.4, 18);
  keyLight.position.set(2.5, 4.2, 3.5);
  scene.add(keyLight);

  const flashLight = new THREE.PointLight(0xe0f2fe, 0, 15);
  flashLight.position.set(-2, 2.8, 4.2);
  scene.add(flashLight);

  const backdrop = new THREE.Mesh(
    new THREE.PlaneGeometry(11, 4.6),
    new THREE.MeshStandardMaterial({ color: 0x0f243c, roughness: 0.6, metalness: 0.25 })
  );
  backdrop.position.set(0, 1.8, -1.6);
  scene.add(backdrop);

  const flagStripe = new THREE.Mesh(
    new THREE.BoxGeometry(8.5, 0.28, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.45 })
  );
  flagStripe.position.set(0, 2.9, -1.52);
  scene.add(flagStripe);

  const podium = buildSculptedPressPodiumGroup();
  scene.add(podium);

  return { scene, camera, renderer, podium, flashLight };
}

function PressPodium3DCanvas({ activeHeadline }: { activeHeadline: string }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const { scene, camera, renderer, podium, flashLight } = createPressStudio3DScene(container);

    let animId = 0;
    const tick = () => {
      animId = requestAnimationFrame(tick);
      const t = performance.now() * 0.001;
      camera.position.x = Math.sin(t * 0.55) * 0.85;
      camera.lookAt(0, 1.05, 0);
      podium.rotation.y = Math.sin(t * 0.4) * 0.06;
      flashLight.intensity = Math.sin(t * 11) > 0.92 ? 3.5 : 0;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div className="relative rounded-sm overflow-hidden border border-[#8a6d33] bg-[#05080d]">
      <div ref={containerRef} className="w-full h-[185px]" />
      <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-sm bg-rose-700 text-[10px] font-mono font-extrabold uppercase text-white flex items-center gap-1.5 shadow">
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        EN VIVO · SALA DE PRENSA / CADENA NACIONAL
      </div>
      <div className="hidden sm:flex absolute top-2 right-2.5 items-center gap-1 bg-[#05080d]/85 border border-slate-700/80 px-1.5 py-1 rounded-sm">
        {STUDIO_NETWORK_POOL.map((mediaId) => (
          <OfficialMediaLogo key={mediaId} media={mediaId} heightPx={17} />
        ))}
      </div>
      <div className="bg-gradient-to-r from-[#8b0000] via-[#b91c1c] to-[#7f1d1d] px-3 py-1.5 border-t border-amber-400/70 flex items-center justify-between text-xs font-mono">
        <span className="font-extrabold text-white uppercase tracking-wider truncate">
          {activeHeadline}
        </span>
        <span className="text-[10px] text-amber-200 shrink-0 ml-2">TRANSMISIÓN OFICIAL</span>
      </div>
    </div>
  );
}

function formatSignedPts(val: number): string {
  const prefix = val >= 0 ? '+' : '';
  return `${prefix}${val} pts`;
}

function ActivePressQuestionPanel({
  roundIdx,
  totalRounds,
  currentRound,
  onSelectOption
}: {
  roundIdx: number;
  totalRounds: number;
  currentRound: PressQuestionRound;
  onSelectOption: (opt: PressQuestionRound['options'][number]) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="p-3.5 rounded-sm bg-[#090d14] border border-[#8a6d33]/80 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-amber-300">
          <span className="inline-flex items-center gap-1">
            <Mic className="w-3 h-3" />
            PREGUNTA {roundIdx + 1} DE {totalRounds} · {currentRound.journalist}
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {currentRound.outletLogos.map((logoId) => (
              <OfficialMediaLogo key={logoId} media={logoId} heightPx={20} />
            ))}
            <span className="text-sky-300 ml-0.5">{currentRound.outlet}</span>
          </div>
        </div>
        <p className="text-xs sm:text-sm font-serif italic text-slate-100 leading-relaxed">
          {currentRound.question}
        </p>
      </div>

      <div className="space-y-2">
        {currentRound.options.map((opt) => (
          <button
            key={opt.tone}
            type="button"
            onClick={() => onSelectOption(opt)}
            className="w-full p-3 rounded-sm bg-[#0c1119] hover:bg-[#152030] border border-[#263142] hover:border-[#b89342] text-left space-y-1 transition"
          >
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="font-bold text-amber-200 uppercase flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-amber-400" />
                {opt.toneLabel}
              </span>
              <span className="text-emerald-300">
                Img +{opt.imageDelta} · Redes {formatSignedPts(opt.viralDelta)} · Mkt +{opt.marketDelta}
              </span>
            </div>
            <p className="text-xs text-slate-300">{opt.replyText}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function CadenaNacionalIntroPlate({
  speakerName,
  onSkip
}: {
  speakerName: string;
  onSkip: () => void;
}) {
  return (
    <div className="rounded-sm bg-[#060b14] border-2 border-[#75aadb]/70 overflow-hidden shadow-2xl">
      <div className="h-2.5 w-full flex">
        <span className="flex-1 bg-[#75aadb]" />
        <span className="flex-1 bg-white" />
        <span className="flex-1 bg-[#75aadb]" />
      </div>

      <div className="p-6 sm:p-8 text-center space-y-5 bg-[radial-gradient(circle_at_top,rgba(117,170,219,0.22),#060b14_70%)]">
        <div className="flex items-center justify-center gap-4">
          <OfficialInstitutionLogo institution="ESCUDO_NACIONAL" heightPx={68} />
          <OfficialInstitutionLogo institution="PRESIDENCIA" heightPx={48} />
        </div>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-sky-950/70 border border-sky-400/50 text-[10px] font-mono font-bold uppercase tracking-[0.22em] text-sky-200 animate-pulse">
            <Radio className="w-3.5 h-3.5 text-red-400" />
            CADENA NACIONAL DE RADIO Y TELEVISIÓN
          </div>
          <h4 className="text-xl sm:text-2xl font-serif font-black uppercase tracking-wide text-white">
            Presidencia de la Nación Argentina
          </h4>
          <p className="text-xs font-mono text-amber-200">
            Transmisión oficial obligatoria en todo el territorio · Vocero: {speakerName}
          </p>
        </div>

        <div className="pt-1 flex justify-center">
          <button
            type="button"
            onClick={onSkip}
            className="px-4 py-1.5 rounded-sm bg-[#142033] hover:bg-[#1d2e48] border border-[#3a5275] text-[11px] font-mono font-bold uppercase tracking-wider text-sky-200 transition"
          >
            Ir al atril ahora →
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

function PressPodiumLiveStage({
  headline,
  totals,
  roundIdx,
  currentRound,
  finished,
  onSelectOption,
  onClose
}: {
  headline: string;
  totals: { image: number; viral: number; market: number };
  roundIdx: number;
  currentRound: PressQuestionRound;
  finished: boolean;
  onSelectOption: (opt: PressQuestionRound['options'][number]) => void;
  onClose: () => void;
}) {
  return (
    <>
      <PressPodium3DCanvas activeHeadline={headline} />

      <div className="grid grid-cols-3 gap-2.5 font-mono text-xs text-center">
        <div className="p-2 rounded-sm bg-[#0c1119] border border-[#263142]">
          <span className="text-[10px] text-slate-400 block">IMAGEN PÚBLICA</span>
          <strong className="text-emerald-400 text-sm">{formatSignedPts(totals.image)}</strong>
        </div>
        <div className="p-2 rounded-sm bg-[#0c1119] border border-[#263142]">
          <span className="text-[10px] text-slate-400 block">VIRALIDAD EN REDES</span>
          <strong className="text-amber-300 text-sm">{formatSignedPts(totals.viral)}</strong>
        </div>
        <div className="p-2 rounded-sm bg-[#0c1119] border border-[#263142]">
          <span className="text-[10px] text-slate-400 block">CALMA DE MERCADOS</span>
          <strong className="text-sky-300 text-sm">{formatSignedPts(totals.market)}</strong>
        </div>
      </div>

      {!finished ? (
        <ActivePressQuestionPanel
          roundIdx={roundIdx}
          totalRounds={PRESS_ROUNDS.length}
          currentRound={currentRound}
          onSelectOption={onSelectOption}
        />
      ) : (
        <div className="p-4 rounded-sm bg-[#090d14] border border-emerald-700/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-xs font-mono font-bold text-emerald-300 uppercase flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Conferencia Finalizada · Repercusión en Tapa y Mercados
            </div>
            <p className="text-xs text-slate-300">
              Cerraste las {PRESS_ROUNDS.length} rondas con impacto de {formatSignedPts(totals.image)} en imagen y {formatSignedPts(totals.market)} en mercados.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="hoi-btn-gold px-4 py-2 rounded-sm text-xs font-mono font-bold uppercase shrink-0"
          >
            Cerrar Transmisión
          </button>
        </div>
      )}
    </>
  );
}

export function PressAndDebateSimulatorModal({
  open,
  speakerName,
  onCompleteImpact,
  onClose
}: {
  open: boolean;
  speakerName: string;
  onCompleteImpact?: (deltas: { image: number; viral: number; market: number }) => void;
  onClose: () => void;
}) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [totals, setTotals] = useState({ image: 0, viral: 0, market: 0 });
  const [headline, setHeadline] = useState(
    'CONFERENCIA DE PRENSA Y DERECHO A RÉPLICA DESDE EL ATRIL OFICIAL'
  );
  const [finished, setFinished] = useState(false);
  const [showIntroPlate, setShowIntroPlate] = useState(true);

  useEffect(() => {
    if (!open) return;
    setRoundIdx(0);
    setTotals({ image: 0, viral: 0, market: 0 });
    setHeadline('CONFERENCIA DE PRENSA Y DERECHO A RÉPLICA DESDE EL ATRIL OFICIAL');
    setFinished(false);
    setShowIntroPlate(true);
    playUiSound('quorum');
    const timerId = window.setTimeout(() => setShowIntroPlate(false), 2200);
    return () => window.clearTimeout(timerId);
  }, [open]);

  if (!open) return null;

  const currentRound = PRESS_ROUNDS[roundIdx] ?? PRESS_ROUNDS[0]!;

  const handleSelectOption = (opt: PressQuestionRound['options'][number]) => {
    playUiSound('stamp');
    const nextTotals = {
      image: Number((totals.image + opt.imageDelta).toFixed(1)),
      viral: Number((totals.viral + opt.viralDelta).toFixed(1)),
      market: Number((totals.market + opt.marketDelta).toFixed(1))
    };
    setTotals(nextTotals);
    setHeadline(opt.headline);

    if (roundIdx + 1 >= PRESS_ROUNDS.length) {
      setFinished(true);
      onCompleteImpact?.(nextTotals);
    } else {
      setRoundIdx((r) => r + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto hoi-panel rounded-sm p-4 sm:p-6 space-y-4 border border-[#8a6d33] shadow-2xl">
        <div className="hoi-header-steel p-3.5 rounded-sm flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <OfficialInstitutionLogo institution="PRESIDENCIA" heightPx={32} />
            <div className="min-w-0">
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-amber-400" />
                ATRIL OFICIAL · CADENA NACIONAL Y CONFERENCIA DE PRENSA EN VIVO
              </div>
              <h3 className="text-lg sm:text-xl font-serif font-extrabold uppercase tracking-wide text-amber-100 mt-0.5 truncate">
                Vocería y Definiciones de {speakerName}
              </h3>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {showIntroPlate ? (
          <CadenaNacionalIntroPlate
            speakerName={speakerName}
            onSkip={() => setShowIntroPlate(false)}
          />
        ) : (
          <PressPodiumLiveStage
            headline={headline}
            totals={totals}
            roundIdx={roundIdx}
            currentRound={currentRound}
            finished={finished}
            onSelectOption={handleSelectOption}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}
