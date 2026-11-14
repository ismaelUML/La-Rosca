import React, { useRef, useState } from 'react';
import { ChevronDown, ChevronUp, Dices, RotateCcw, Shield, Upload } from 'lucide-react';
import type {
  EmblemDisc,
  EmblemPattern,
  EmblemShape,
  EmblemSymbol,
  PartyEmblemConfig
} from '@argentina-sim/domain';
import { PartyEmblemSvg } from './PartyEmblemSvg.js';

interface PartyDesignerStudioProps {
  emblem: PartyEmblemConfig;
  sigla: string;
  onChange: (next: PartyEmblemConfig) => void;
}

const SHAPE_OPTIONS: Array<{ id: EmblemShape; label: string }> = [
  { id: 'ESCUDO', label: 'Escudo' },
  { id: 'CIRCULO', label: 'Círculo' },
  { id: 'CUADRADO', label: 'Cuadrado' },
  { id: 'HEXAGONO', label: 'Hexágono' },
  { id: 'ROMBO', label: 'Rombo' },
  { id: 'BANDERA', label: 'Bandera' }
];

const PATTERN_OPTIONS: Array<{ id: EmblemPattern; label: string }> = [
  { id: 'LISO', label: 'Liso' },
  { id: 'MITADES_VERTICALES', label: 'Mitades V.' },
  { id: 'MITADES_HORIZONTALES', label: 'Mitades H.' },
  { id: 'DIAGONAL', label: 'Diagonal' },
  { id: 'FRANJAS_HORIZONTALES', label: 'Franjas H.' },
  { id: 'FRANJAS_VERTICALES', label: 'Franjas V.' },
  { id: 'RAYOS', label: 'Rayos' },
  { id: 'CRUZ', label: 'Cruz' },
  { id: 'PUNTOS', label: 'Puntos' },
  { id: 'OLAS', label: 'Olas' },
  { id: 'CHEVRON', label: 'Chevrón' },
  { id: 'DEGRADE', label: 'Degradé' },
  { id: 'ANILLOS', label: 'Anillos' },
  { id: 'CUADRANTES', label: 'Cuadrantes' },
  { id: 'TABLERO', label: 'Tablero' },
  { id: 'BANDA_DIAGONAL', label: 'Banda' },
  { id: 'TRIANGULOS', label: 'Triángulos' }
];

const SYMBOL_OPTIONS: Array<{ id: EmblemSymbol; label: string }> = [
  { id: 'ESTRELLA', label: 'Estrella' },
  { id: 'SOL', label: 'Sol' },
  { id: 'ENGRANAJE', label: 'Engranaje' },
  { id: 'ESPIGA', label: 'Espiga' },
  { id: 'LLAMA', label: 'Llama' },
  { id: 'LIBRO', label: 'Libro' },
  { id: 'PALOMA', label: 'Paloma' },
  { id: 'ARBOL', label: 'Árbol' },
  { id: 'MONTANA', label: 'Montaña' },
  { id: 'OLA', label: 'Ola' },
  { id: 'ANTORCHA', label: 'Antorcha' },
  { id: 'CORAZON', label: 'Corazón' },
  { id: 'RAYO', label: 'Rayo' },
  { id: 'LAURELES', label: 'Laureles' },
  { id: 'EDIFICIO', label: 'Congreso' },
  { id: 'FLECHA', label: 'Flecha' }
];

const DISC_OPTIONS: Array<{ id: EmblemDisc; label: string }> = [
  { id: 'SIN_FONDO', label: 'Sin fondo' },
  { id: 'DISCO_DE_COLOR', label: 'Disco de color' },
  { id: 'DISCO_CLARO', label: 'Disco claro' },
  { id: 'DISCO_OSCURO', label: 'Disco oscuro' },
  { id: 'DISCO_TERCER_COLOR', label: 'Disco tercer color' }
];

const COLOR_SWATCHES = [
  '#2563eb',
  '#38bdf8',
  '#ef4444',
  '#dc2626',
  '#facc15',
  '#eab308',
  '#10b981',
  '#059669',
  '#9333ea',
  '#ec4899',
  '#f97316',
  '#0f766e',
  '#ffffff',
  '#0f172a',
  '#f8fafc'
];

function SwatchRow({
  label,
  selected,
  onSelect
}: {
  label: string;
  selected: string;
  onSelect: (hex: string) => void;
}) {
  return (
    <div>
      <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {COLOR_SWATCHES.map((hex) => {
          const isSelected = selected.toLowerCase() === hex.toLowerCase();
          return (
            <button
              key={`${label}_${hex}`}
              type="button"
              onClick={() => onSelect(hex)}
              title={hex}
              style={{ backgroundColor: hex }}
              className={`w-5 h-5 rounded-sm border transition ${
                isSelected ? 'border-amber-300 ring-2 ring-[#b89342] scale-110' : 'border-[#334155]'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

function EmblemChoiceGrid<T extends string>({
  title,
  options,
  selected,
  colsClass,
  onSelect
}: {
  title: string;
  options: Array<{ id: T; label: string }>;
  selected: T;
  colsClass: string;
  onSelect: (value: T) => void;
}) {
  return (
    <div className="p-2.5 rounded-sm bg-[#0b1018] border border-[#223044]">
      <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">{title}</div>
      <div className={`grid ${colsClass} gap-1.5`}>
        {options.map((item) => {
          const active = selected === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`px-2 py-1.5 rounded-sm text-[11px] font-medium transition border ${
                active
                  ? 'bg-[#1d3250] text-amber-200 border-[#b89342] font-semibold'
                  : 'bg-[#101724] text-slate-300 border-[#263142] hover:border-slate-500'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EmblemQuickActions({
  hasCustomImage,
  onRandomize,
  onOpenUpload,
  onClearImage
}: {
  hasCustomImage: boolean;
  onRandomize: () => void;
  onOpenUpload: () => void;
  onClearImage: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      <button
        type="button"
        onClick={onRandomize}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#162133] hover:bg-[#1e2c42] text-amber-200 text-xs font-semibold border border-[#32445d] transition"
      >
        <Dices className="w-3.5 h-3.5" />
        Aleatorio
      </button>
      <button
        type="button"
        onClick={onOpenUpload}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#162133] hover:bg-[#1e2c42] text-slate-200 text-xs font-semibold border border-[#32445d] transition"
      >
        <Upload className="w-3.5 h-3.5" />
        Subir imagen como logo
      </button>
      {hasCustomImage ? (
        <button
          type="button"
          onClick={onClearImage}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-rose-950/60 hover:bg-rose-900/60 text-rose-200 text-xs font-semibold border border-rose-700/60 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Quitar imagen
        </button>
      ) : null}
    </div>
  );
}

function pickRandomItem<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)]!;
}

export function PartyDesignerStudio({ emblem, sigla, onChange }: PartyDesignerStudioProps) {
  const [expanded, setExpanded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleRandomize = () => {
    const primary = pickRandomItem(COLOR_SWATCHES.slice(0, 12));
    const secondary = pickRandomItem(COLOR_SWATCHES.slice(0, 12));
    const third = pickRandomItem(COLOR_SWATCHES);
    onChange({
      ...emblem,
      shape: pickRandomItem(SHAPE_OPTIONS).id,
      pattern: pickRandomItem(PATTERN_OPTIONS).id,
      symbol: pickRandomItem(SYMBOL_OPTIONS).id,
      disc: pickRandomItem(DISC_OPTIONS).id,
      primaryColor: primary,
      secondaryColor: secondary,
      thirdColor: third,
      symbolColor: '#ffffff',
      customImageDataUrl: null
    });
  };

  const handleImageUpload = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange({ ...emblem, customImageDataUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-sm bg-[#0a0f17] border border-[#263142] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#1f2938]">
        <div className="inline-flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wider text-amber-300">
          <Shield className="w-3.5 h-3.5" />
          Escudo e Identidad Partidaria
        </div>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-amber-200 px-2.5 py-1 rounded-sm bg-[#121926] border border-[#2a374b]"
        >
          {expanded ? 'Contraer editor' : 'Personalizar escudo'}
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-3">
        <div className="p-2 rounded-sm bg-[#070a10] border border-[#263142] shrink-0 self-start">
          <PartyEmblemSvg config={emblem} size={76} />
        </div>
        <div className="flex-1 space-y-2">
          <div className="text-xs text-slate-300 leading-relaxed">
            Insignia vectorial para boleta electoral, Congreso y cartel de campaña. Podés combinar formas,
            patrones o subir una imagen PNG/JPG.
          </div>
          <EmblemQuickActions
            hasCustomImage={Boolean(emblem.customImageDataUrl)}
            onRandomize={handleRandomize}
            onOpenUpload={() => fileRef.current?.click()}
            onClearImage={() => onChange({ ...emblem, customImageDataUrl: null })}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>

      {expanded ? (
        <div className="mt-4 pt-4 border-t border-[#1f2938] space-y-3">
          <EmblemChoiceGrid
            title="Forma exterior"
            options={SHAPE_OPTIONS}
            selected={emblem.shape}
            colsClass="grid-cols-3 sm:grid-cols-6"
            onSelect={(shape) => onChange({ ...emblem, shape })}
          />
          <EmblemChoiceGrid
            title="Patrón de fondo"
            options={PATTERN_OPTIONS}
            selected={emblem.pattern}
            colsClass="grid-cols-3 sm:grid-cols-6"
            onSelect={(pattern) => onChange({ ...emblem, pattern })}
          />
          <div className="p-2.5 rounded-sm bg-[#0b1018] border border-[#223044] grid grid-cols-1 md:grid-cols-3 gap-4">
            <SwatchRow label="Color primario" selected={emblem.primaryColor} onSelect={(primaryColor) => onChange({ ...emblem, primaryColor })} />
            <SwatchRow label="Color secundario" selected={emblem.secondaryColor} onSelect={(secondaryColor) => onChange({ ...emblem, secondaryColor })} />
            <SwatchRow label="Tercer color" selected={emblem.thirdColor} onSelect={(thirdColor) => onChange({ ...emblem, thirdColor })} />
          </div>
          <EmblemChoiceGrid
            title="Símbolo central"
            options={SYMBOL_OPTIONS}
            selected={emblem.symbol}
            colsClass="grid-cols-4 sm:grid-cols-8"
            onSelect={(symbol) => onChange({ ...emblem, symbol })}
          />
          <div className="p-2.5 rounded-sm bg-[#0b1018] border border-[#223044] grid grid-cols-1 md:grid-cols-2 gap-4">
            <SwatchRow label="Color del símbolo" selected={emblem.symbolColor} onSelect={(symbolColor) => onChange({ ...emblem, symbolColor })} />
            <EmblemChoiceGrid
              title="Fondo / disco del símbolo"
              options={DISC_OPTIONS}
              selected={emblem.disc}
              colsClass="grid-cols-2 sm:grid-cols-3"
              onSelect={(disc) => onChange({ ...emblem, disc })}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
