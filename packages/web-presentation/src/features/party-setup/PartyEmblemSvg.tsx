import React from 'react';
import type {
  EmblemDisc,
  EmblemPattern,
  EmblemShape,
  EmblemSymbol,
  PartyEmblemConfig
} from '@argentina-sim/domain';

// Usamos mapas declarativos en vez de switches gigantes de 17 casos para que
// el verificador de complejidad ciclomatica se mantenga en CC <= 3 por funcion.

const SHAPE_CLIP_PATHS: Record<EmblemShape, string> = {
  ESCUDO: 'M12,8 L88,8 L88,52 C88,74 50,94 50,94 C50,94 12,74 12,52 Z',
  CIRCULO: 'M50,6 A44,44 0 1,1 49.9,6 Z',
  CUADRADO: 'M12,12 L88,12 L88,88 L12,88 Z',
  HEXAGONO: 'M50,6 L90,28 L90,72 L50,94 L10,72 L10,28 Z',
  ROMBO: 'M50,6 L94,50 L50,94 L6,50 Z',
  BANDERA: 'M8,16 C28,8 45,24 65,16 C78,11 86,14 92,16 L92,82 C75,76 58,88 38,80 C22,74 14,82 8,82 Z'
};

const SYMBOL_SVG_PATHS: Record<EmblemSymbol, string> = {
  ESTRELLA: 'M50,24 L56.5,39.5 L73,41 L60.5,52 L64.5,68 L50,59.5 L35.5,68 L39.5,52 L27,41 L43.5,39.5 Z',
  SOL: 'M50,32 A18,18 0 1,1 49.9,32 M50,20 L50,28 M50,72 L50,80 M20,50 L28,50 M72,50 L80,50 M28,28 L34,34 M66,66 L72,72 M72,28 L66,34 M34,66 L28,72',
  ENGRANAJE: 'M44,24 L56,24 L58,32 L66,36 L74,32 L78,40 L72,46 L72,54 L78,60 L74,68 L66,64 L58,68 L56,76 L44,76 L42,68 L34,64 L26,68 L22,60 L28,54 L28,46 L22,40 L26,32 L34,36 L42,32 Z',
  ESPIGA: 'M50,76 L50,26 M50,62 C40,58 36,50 42,46 M50,50 C40,46 36,38 42,34 M50,62 C60,58 64,50 58,46 M50,50 C60,46 64,38 58,34',
  LLAMA: 'M50,22 C62,36 70,46 66,62 C63,72 52,78 44,75 C35,71 31,60 36,48 C40,54 45,52 44,42 C43,34 46,27 50,22 Z',
  LIBRO: 'M24,32 L48,36 L48,70 L24,66 Z M76,32 L52,36 L52,70 L76,66 Z',
  PALOMA: 'M26,56 C36,42 46,36 62,34 L76,26 L68,42 L78,48 L60,54 L54,70 L42,60 Z',
  ARBOL: 'M50,24 C64,24 70,38 62,48 C68,56 60,64 53,64 L53,76 L47,76 L47,64 C40,64 32,56 38,48 C30,38 36,24 50,24 Z',
  MONTANA: 'M18,72 L42,30 L56,54 L66,38 L82,72 Z',
  OLA: 'M20,56 C30,42 42,42 50,54 C58,66 70,66 80,50 L80,68 L20,68 Z',
  ANTORCHA: 'M45,48 L55,48 L52,76 L48,76 Z M50,22 C60,30 62,40 50,46 C38,40 40,30 50,22 Z',
  CORAZON: 'M50,72 L28,50 C20,40 28,26 40,28 C45,29 48,33 50,37 C52,33 55,29 60,28 C72,26 80,40 72,50 Z',
  RAYO: 'M56,22 L32,52 L48,52 L42,78 L68,46 L52,46 Z',
  LAURELES: 'M36,68 C24,54 26,34 40,26 C32,38 34,54 44,64 Z M64,68 C76,54 74,34 60,26 C68,38 66,54 56,64 Z',
  EDIFICIO: 'M32,74 L32,30 L68,30 L68,74 Z M24,74 L76,74 M42,40 L48,40 M52,40 L58,40 M42,52 L48,52 M52,52 L58,52',
  FLECHA: 'M50,24 L72,48 L58,48 L58,74 L42,74 L42,48 L28,48 Z'
};

function renderPatternOverlay(pattern: EmblemPattern, c2: string, c3: string): React.ReactNode {
  const map: Record<EmblemPattern, React.ReactNode> = {
    LISO: null,
    MITADES_VERTICALES: <rect x="50" y="0" width="50" height="100" fill={c2} />,
    MITADES_HORIZONTALES: <rect x="0" y="50" width="100" height="50" fill={c2} />,
    DIAGONAL: <polygon points="100,0 100,100 0,100" fill={c2} />,
    FRANJAS_HORIZONTALES: (
      <>
        <rect x="0" y="33" width="100" height="34" fill={c3} />
        <rect x="0" y="67" width="100" height="33" fill={c2} />
      </>
    ),
    FRANJAS_VERTICALES: (
      <>
        <rect x="33" y="0" width="34" height="100" fill={c3} />
        <rect x="67" y="0" width="33" height="100" fill={c2} />
      </>
    ),
    RAYOS: <polygon points="50,50 0,0 25,0 50,50 75,0 100,0 50,50 100,50 100,100 50,50 0,100 0,50" fill={c2} opacity={0.65} />,
    CRUZ: (
      <>
        <rect x="40" y="0" width="20" height="100" fill={c2} />
        <rect x="0" y="40" width="100" height="20" fill={c2} />
      </>
    ),
    PUNTOS: (
      <>
        <circle cx="28" cy="28" r="8" fill={c2} />
        <circle cx="72" cy="28" r="8" fill={c2} />
        <circle cx="28" cy="72" r="8" fill={c2} />
        <circle cx="72" cy="72" r="8" fill={c2} />
      </>
    ),
    OLAS: <path d="M0,62 Q25,48 50,62 T100,62 L100,100 L0,100 Z" fill={c2} />,
    CHEVRON: <polygon points="0,25 50,65 100,25 100,55 50,95 0,55" fill={c2} />,
    DEGRADE: <rect x="0" y="45" width="100" height="55" fill={c2} opacity={0.6} />,
    ANILLOS: <circle cx="50" cy="50" r="34" fill="none" stroke={c2} strokeWidth="10" />,
    CUADRANTES: (
      <>
        <rect x="50" y="0" width="50" height="50" fill={c2} />
        <rect x="0" y="50" width="50" height="50" fill={c2} />
      </>
    ),
    TABLERO: (
      <>
        <rect x="0" y="0" width="33" height="33" fill={c2} />
        <rect x="66" y="0" width="34" height="33" fill={c2} />
        <rect x="33" y="33" width="33" height="33" fill={c2} />
        <rect x="0" y="66" width="33" height="34" fill={c2} />
        <rect x="66" y="66" width="34" height="34" fill={c2} />
      </>
    ),
    BANDA_DIAGONAL: <polygon points="0,75 75,0 100,0 100,25 25,100 0,100" fill={c2} />,
    TRIANGULOS: <polygon points="50,8 92,90 8,90" fill={c2} opacity={0.75} />
  };
  return map[pattern];
}

function resolveDiscColor(disc: EmblemDisc, config: PartyEmblemConfig): string | null {
  const map: Record<EmblemDisc, string | null> = {
    SIN_FONDO: null,
    DISCO_DE_COLOR: config.secondaryColor,
    DISCO_CLARO: '#f8fafc',
    DISCO_OSCURO: '#0f172a',
    DISCO_TERCER_COLOR: config.thirdColor
  };
  return map[disc];
}

interface PartyEmblemSvgProps {
  config: PartyEmblemConfig;
  size?: number;
  className?: string;
}

export function PartyEmblemSvg({ config, size = 96, className }: PartyEmblemSvgProps) {
  const clipId = React.useId();
  const shapePath = SHAPE_CLIP_PATHS[config.shape];
  const symbolPath = SYMBOL_SVG_PATHS[config.symbol];
  const discColor = resolveDiscColor(config.disc, config);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-label="Insignia partidaria"
    >
      <defs>
        <clipPath id={clipId}>
          <path d={shapePath} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        <rect x="0" y="0" width="100" height="100" fill={config.primaryColor} />
        {renderPatternOverlay(config.pattern, config.secondaryColor, config.thirdColor)}
        {config.customImageDataUrl ? (
          <image href={config.customImageDataUrl} x="8" y="8" width="84" height="84" preserveAspectRatio="xMidYMid slice" />
        ) : (
          <>
            {discColor ? <circle cx="50" cy="50" r="27" fill={discColor} /> : null}
            <path
              d={symbolPath}
              fill={config.symbolColor}
              stroke={config.symbolColor}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
          </>
        )}
      </g>

      <path d={shapePath} fill="none" stroke="#ffffff" strokeOpacity="0.22" strokeWidth="2.5" />
    </svg>
  );
}
