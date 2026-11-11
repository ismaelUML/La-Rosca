import React, { useRef } from 'react';
import type {
  EmblemDisc,
  EmblemPattern,
  EmblemShape,
  EmblemSymbol,
  PartyEmblemConfig
} from '@argentina-sim/domain';
import { PartyEmblemSvg } from './PartyEmblemSvg.js';

// Estudio de diseno de insignia partidaria calcado de la captura 4:
// 6 formas, 17 fondos, 3 capas de color, 16 simbolos, 5 discos, boton Aleatorio y subida de logo propio.

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
  { id: 'MITADES_VERTICALES', label: 'Mitades verticales' },
  { id: 'MITADES_HORIZONTALES', label: 'Mitades horizontales' },
  { id: 'DIAGONAL', label: 'Diagonal' },
  { id: 'FRANJAS_HORIZONTALES', label: 'Franjas horizontales' },
  { id: 'FRANJAS_VERTICALES', label: 'Franjas verticales' },
  { id: 'RAYOS', label: 'Rayos' },
  { id: 'CRUZ', label: 'Cruz' },
  { id: 'PUNTOS', label: 'Puntos' },
  { id: 'OLAS', label: 'Olas' },
  { id: 'CHEVRON', label: 'Chevron' },
  { id: 'DEGRADE', label: 'Degradé' },
  { id: 'ANILLOS', label: 'Anillos' },
  { id: 'CUADRANTES', label: 'Cuadrantes' },
  { id: 'TABLERO', label: 'Tablero' },
  { id: 'BANDA_DIAGONAL', label: 'Banda diagonal' },
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
  { id: 'EDIFICIO', label: 'Edificio' },
  { id: 'FLECHA', label: 'Flecha' }
];

const DISC_OPTIONS: Array<{ id: EmblemDisc; label: string }> = [
  { id: 'SIN_FONDO', label: 'Sin fondo' },
  { id: 'DISCO_DE_COLOR', label: 'Disco de color' },
  { id: 'DISCO_CLARO', label: 'Disco claro' },
  { id: 'DISCO_OSCURO', label: 'Disco oscuro' },
  { id: 'DISCO_TERCER_COLOR', label: 'Disco del tercer color' }
];

const COLOR_SWATCHES = [
  '#ffffff',
  '#eab308',
  '#0f172a',
  '#e11d48',
  '#10b981',
  '#2563eb',
  '#7c3aed',
  '#f97316',
  '#0ea5e9'
];

function pickRandom<T>(items: T[]): T {
  const idx = Math.floor(Math.random() * items.length);
  return items[idx]!;
}

interface SwatchRowProps {
  title: string;
  selected: string;
  onSelect: (color: string) => void;
}

function SwatchRow({ title, selected, onSelect }: SwatchRowProps) {
  return (
    <div>
      <div className="text-xs text-slate-300 mb-2">
        <span className="font-semibold text-white">{title}</span> · <span className="text-slate-400">{selected}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {COLOR_SWATCHES.map((hex) => (
          <button
            key={hex}
            type="button"
            onClick={() => onSelect(hex)}
            style={{ backgroundColor: hex }}
            className={`w-7 h-7 rounded-full border-2 transition ${
              selected === hex ? 'border-white scale-110 ring-2 ring-sky-400/60' : 'border-slate-700'
            }`}
            aria-label={`Color ${hex}`}
          />
        ))}
      </div>
    </div>
  );
}

interface PartyDesignerStudioProps {
  emblem: PartyEmblemConfig;
  onChange: (next: PartyEmblemConfig) => void;
}

export function PartyDesignerStudio({ emblem, onChange }: PartyDesignerStudioProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleRandomize = () => {
    onChange({
      shape: pickRandom(SHAPE_OPTIONS).id,
      pattern: pickRandom(PATTERN_OPTIONS).id,
      primaryColor: pickRandom(COLOR_SWATCHES.slice(1)),
      secondaryColor: pickRandom(COLOR_SWATCHES.slice(1)),
      thirdColor: pickRandom(COLOR_SWATCHES),
      symbol: pickRandom(SYMBOL_OPTIONS).id,
      symbolColor: pickRandom(['#ffffff', '#eab308', '#0f172a']),
      disc: pickRandom(DISC_OPTIONS).id,
      customImageDataUrl: null
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      onChange({ ...emblem, customImageDataUrl: String(reader.result) });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-2xl bg-[#10131c] border border-slate-800/90 p-5 mt-5">
      <div className="text-xs font-semibold text-slate-300 mb-4">
        ▾ <span className="text-white">Diseño del partido</span> · <span className="text-slate-400">insignia, símbolo, bandera</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 rounded-xl bg-[#141824] border border-slate-800 p-5 flex flex-col items-center justify-center gap-4">
          <PartyEmblemSvg config={emblem} size={140} />
          <div className="flex items-end gap-3">
            <PartyEmblemSvg config={emblem} size={46} />
            <PartyEmblemSvg config={emblem} size={30} />
            <PartyEmblemSvg config={emblem} size={20} />
          </div>

          <button
            type="button"
            onClick={handleRandomize}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200"
          >
            🎲 Aleatorio
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300"
          >
            🖼 Subir imagen como logo
          </button>
        </div>

        <div className="lg:col-span-8 space-y-4">
          <div>
            <div className="text-xs text-slate-300 mb-1.5">
              <span className="font-semibold text-white">Forma de la insignia</span>
            </div>
            <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-[#0b0e15] border border-slate-800">
              {SHAPE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChange({ ...emblem, shape: opt.id })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    emblem.shape === opt.id ? 'bg-white text-slate-950 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-300 mb-1.5">
              <span className="font-semibold text-white">Diseño de fondo</span>
            </div>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-[#0b0e15] border border-slate-800">
              {PATTERN_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChange({ ...emblem, pattern: opt.id, customImageDataUrl: null })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    emblem.pattern === opt.id ? 'bg-white text-slate-950 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SwatchRow
              title="Color primario"
              selected={emblem.primaryColor}
              onSelect={(primaryColor) => onChange({ ...emblem, primaryColor })}
            />
            <SwatchRow
              title="Color secundario"
              selected={emblem.secondaryColor}
              onSelect={(secondaryColor) => onChange({ ...emblem, secondaryColor })}
            />
            <SwatchRow
              title="Tercer color del diseño"
              selected={emblem.thirdColor}
              onSelect={(thirdColor) => onChange({ ...emblem, thirdColor })}
            />
          </div>

          <div>
            <div className="text-xs text-slate-300 mb-1.5">
              <span className="font-semibold text-white">Símbolo central</span>
            </div>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-[#0b0e15] border border-slate-800">
              {SYMBOL_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChange({ ...emblem, symbol: opt.id, customImageDataUrl: null })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    emblem.symbol === opt.id ? 'bg-white text-slate-950 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <SwatchRow
            title="Color del símbolo"
            selected={emblem.symbolColor}
            onSelect={(symbolColor) => onChange({ ...emblem, symbolColor })}
          />

          <div>
            <div className="text-xs text-slate-300 mb-1.5">
              <span className="font-semibold text-white">Disco detrás del símbolo</span>
            </div>
            <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-[#0b0e15] border border-slate-800">
              {DISC_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onChange({ ...emblem, disc: opt.id })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    emblem.disc === opt.id ? 'bg-white text-slate-950 font-semibold' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
