// Metadatos politicos reales por jurisdiccion para las capas Gobernadores y Partidos del mapa 3D.

export type PoliticalBloc = 'DERECHA' | 'CENTRO' | 'IZQUIERDA';

export interface ProvincePoliticalMeta {
  governorName: string;
  partySigla: string;
  partyName: string;
  partyColorHex: number;
  bloc: PoliticalBloc;
}

const PARTY_COLOR_HEX: Record<string, number> = {
  LLA: 0x8b5cf6,       // Violeta
  UXP: 0x0284c7,       // Celeste UxP / PJ
  PRO: 0xeab308,       // Amarillo PRO
  UCR: 0xdc2626,       // Rojo UCR / JxC
  CORDOBA: 0x2563eb,   // Azul Cordobesismo
  PROVINCIAL: 0x10b981 // Esmeralda fuerzas locales
};

export const PROVINCE_POLITICAL_META: Record<string, ProvincePoliticalMeta> = {
  PBA: { governorName: 'Axel Kicillof', partySigla: 'UxP', partyName: 'Unión por la Patria', partyColorHex: PARTY_COLOR_HEX.UXP!, bloc: 'IZQUIERDA' },
  CABA: { governorName: 'Jorge Macri', partySigla: 'PRO', partyName: 'PRO', partyColorHex: PARTY_COLOR_HEX.PRO!, bloc: 'DERECHA' },
  CORDOBA: { governorName: 'Martín Llaryora', partySigla: 'HxC', partyName: 'Hacemos Unidos', partyColorHex: PARTY_COLOR_HEX.CORDOBA!, bloc: 'CENTRO' },
  SANTA_FE: { governorName: 'Maximiliano Pullaro', partySigla: 'UCR', partyName: 'Unidos (UCR)', partyColorHex: PARTY_COLOR_HEX.UCR!, bloc: 'CENTRO' },
  MENDOZA: { governorName: 'Alfredo Cornejo', partySigla: 'UCR', partyName: 'Cambia Mendoza', partyColorHex: PARTY_COLOR_HEX.UCR!, bloc: 'DERECHA' },
  ENTRE_RIOS: { governorName: 'Rogelio Frigerio', partySigla: 'PRO', partyName: 'Juntos (PRO)', partyColorHex: PARTY_COLOR_HEX.PRO!, bloc: 'DERECHA' },
  TUCUMAN: { governorName: 'Osvaldo Jaldo', partySigla: 'PJ', partyName: 'PJ Independencia', partyColorHex: PARTY_COLOR_HEX.UXP!, bloc: 'CENTRO' },
  SALTA: { governorName: 'Gustavo Sáenz', partySigla: 'PROV', partyName: 'Identidad Salteña', partyColorHex: PARTY_COLOR_HEX.PROVINCIAL!, bloc: 'CENTRO' },
  CHUBUT: { governorName: 'Ignacio Torres', partySigla: 'PRO', partyName: 'Despierta Chubut', partyColorHex: PARTY_COLOR_HEX.PRO!, bloc: 'DERECHA' },
  CHACO: { governorName: 'Leandro Zdero', partySigla: 'UCR', partyName: 'Juntos Chaco', partyColorHex: PARTY_COLOR_HEX.UCR!, bloc: 'DERECHA' },
  CORRIENTES: { governorName: 'Gustavo Valdés', partySigla: 'UCR', partyName: 'Vamos Corrientes', partyColorHex: PARTY_COLOR_HEX.UCR!, bloc: 'CENTRO' },
  FORMOSA: { governorName: 'Gildo Insfrán', partySigla: 'PJ', partyName: 'Partido Justicialista', partyColorHex: PARTY_COLOR_HEX.UXP!, bloc: 'IZQUIERDA' },
  LA_RIOJA: { governorName: 'Ricardo Quintela', partySigla: 'UxP', partyName: 'Frente de Todos', partyColorHex: PARTY_COLOR_HEX.UXP!, bloc: 'IZQUIERDA' },
  TIERRA_DEL_FUEGO: { governorName: 'Gustavo Melella', partySigla: 'UxP', partyName: 'FORJA / UxP', partyColorHex: PARTY_COLOR_HEX.UXP!, bloc: 'IZQUIERDA' },
  SANTA_CRUZ: { governorName: 'Claudio Vidal', partySigla: 'PROV', partyName: 'Por Santa Cruz', partyColorHex: PARTY_COLOR_HEX.PROVINCIAL!, bloc: 'CENTRO' },
  NEUQUEN: { governorName: 'Rolando Figueroa', partySigla: 'PROV', partyName: 'Comunidad', partyColorHex: PARTY_COLOR_HEX.PROVINCIAL!, bloc: 'CENTRO' },
  RIO_NEGRO: { governorName: 'Alberto Weretilneck', partySigla: 'PROV', partyName: 'JSRN', partyColorHex: PARTY_COLOR_HEX.PROVINCIAL!, bloc: 'CENTRO' },
  MISIONES: { governorName: 'Hugo Passalacqua', partySigla: 'PROV', partyName: 'Frente Renovador', partyColorHex: PARTY_COLOR_HEX.PROVINCIAL!, bloc: 'CENTRO' },
  SAN_JUAN: { governorName: 'Marcelo Orrego', partySigla: 'PRO', partyName: 'Cambia San Juan', partyColorHex: PARTY_COLOR_HEX.PRO!, bloc: 'DERECHA' },
  SAN_LUIS: { governorName: 'Claudio Poggi', partySigla: 'PRO', partyName: 'Cambia San Luis', partyColorHex: PARTY_COLOR_HEX.PRO!, bloc: 'DERECHA' },
  JUJUY: { governorName: 'Carlos Sadir', partySigla: 'UCR', partyName: 'Cambia Jujuy', partyColorHex: PARTY_COLOR_HEX.UCR!, bloc: 'CENTRO' },
  CATAMARCA: { governorName: 'Raúl Jalil', partySigla: 'UxP', partyName: 'Frente de Todos', partyColorHex: PARTY_COLOR_HEX.UXP!, bloc: 'CENTRO' },
  SANTIAGO_ESTERO: { governorName: 'Gerardo Zamora', partySigla: 'PROV', partyName: 'Frente Cívico', partyColorHex: PARTY_COLOR_HEX.PROVINCIAL!, bloc: 'IZQUIERDA' },
  LA_PAMPA: { governorName: 'Sergio Ziliotto', partySigla: 'PJ', partyName: 'Frejupa / PJ', partyColorHex: PARTY_COLOR_HEX.UXP!, bloc: 'IZQUIERDA' }
};

export function getProvincePoliticalMeta(provinceId: string): ProvincePoliticalMeta | undefined {
  return PROVINCE_POLITICAL_META[provinceId];
}

