import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Flag, Landmark } from 'lucide-react';
import type { CampaignSimulationState } from '@argentina-sim/domain';
import { SectionPageHeader } from '@/components/ui/SectionPageHeader';
import { playUiSound } from '@/lib/gameFeedback';
import { OfficialPartyLogo } from '../party-setup/OfficialLogoBadge.js';

// Comando de campaña provincial profunda (QQG Capturas 2, 3, 4, 5):
// En Argentina ningún presidente gobierna sin territorio. Las 24 jurisdicciones eligen gobernador
// en cuatro turnos escalonados de 6 provincias (2028, 2029, 2030 y 2031). En cada provincia
// manejás el binomio Gobernador/Vice, el presupuesto local, las alianzas distritales y las 9
// acciones de campaña directa (entrevistas, actos, publicidad, debate, militancia y cenas).

export interface ProvincialPartyShare {
  partyName: string;
  sharePct: number;
  color: string;
  isPlayer?: boolean;
}

export interface ProvincialCandidateOption {
  id: string;
  name: string;
  relevance: number;
  roleDescription: string;
}

export interface DeepProvincialData {
  id: string;
  name: string;
  turnYear: '2028' | '2029' | '2030' | '2031';
  electionDate: string;
  formulaOpensDate: string;
  currentGovernor: string;
  governingParty: string;
  statusBadge: string;
  electorateBreakdown: { izq: number; centro: number; der: number };
  shares: ProvincialPartyShare[];
  gobernadorCandidates: ProvincialCandidateOption[];
  viceCandidates: ProvincialCandidateOption[];
  selectedGobernadorId: string;
  selectedViceId: string;
  localBudgetArgentums: number;
  localActionsRemaining: number;
  loyaltyIndex: number;
  localAlliances?: string[];
}

const INITIAL_PROVINCES_CATALOG: Record<string, DeepProvincialData> = {
  // TURNO 2028 (6 distritos)
  TIERRA_DEL_FUEGO: {
    id: 'TIERRA_DEL_FUEGO',
    name: 'Tierra del Fuego',
    turnYear: '2028',
    electionDate: '12 de marzo de 2028',
    formulaOpensDate: 'marzo de 2027',
    currentGovernor: 'Agustín Coto',
    governingParty: 'LLA',
    statusBadge: 'FALTAN 3 MESES',
    electorateBreakdown: { izq: 38, centro: 40, der: 22 },
    shares: [
      { partyName: 'Provincias Unidas', sharePct: 30.8, color: '#f97316' },
      { partyName: 'LLA', sharePct: 29.6, color: '#8b5cf6', isPlayer: true },
      { partyName: 'UxP', sharePct: 20.3, color: '#0284c7' },
      { partyName: 'Defendamos Tierra del Fuego', sharePct: 15.6, color: '#2563eb' },
      { partyName: 'FIT', sharePct: 2.0, color: '#ef4444' },
      { partyName: 'UCR', sharePct: 0.7, color: '#f87171' },
      { partyName: 'Movimiento al Socialismo (MAS)', sharePct: 0.6, color: '#ec4899' },
      { partyName: 'Frente Patriota Federal', sharePct: 0.3, color: '#14b8a6' }
    ],
    gobernadorCandidates: [
      { id: 'COTO_TDF', name: 'Agustín Coto', relevance: 27, roleDescription: 'Político de la provincia · relevancia 27' },
      { id: 'SCIURANO_TDF', name: 'Federico Sciurano', relevance: 25, roleDescription: 'Ex intendente de Ushuaia · relevancia 25' }
    ],
    viceCandidates: [
      { id: 'RODRIGUEZ_TDF', name: 'Miguel Rodríguez', relevance: 24, roleDescription: 'Político de la provincia · relevancia 24' },
      { id: 'PAULLER_TDF', name: 'Natalia Gracía', relevance: 21, roleDescription: 'Referente riograndense · relevancia 21' }
    ],
    selectedGobernadorId: 'COTO_TDF',
    selectedViceId: 'RODRIGUEZ_TDF',
    localBudgetArgentums: 168.4,
    localActionsRemaining: 4,
    loyaltyIndex: 78
  },
  MISIONES: {
    id: 'MISIONES',
    name: 'Misiones',
    turnYear: '2028',
    electionDate: '9 de abril de 2028',
    formulaOpensDate: 'abril de 2027',
    currentGovernor: 'Hugo Passalacqua',
    governingParty: 'FRC / Frente Renovador',
    statusBadge: 'FÓRMULA ABIERTA',
    electorateBreakdown: { izq: 20, centro: 55, der: 25 },
    shares: [
      { partyName: 'Frente Renovador de la Concordia', sharePct: 41.2, color: '#0ea5e9' },
      { partyName: 'Tu fórmula', sharePct: 28.5, color: '#8b5cf6', isPlayer: true },
      { partyName: 'JxC / Radicales', sharePct: 18.3, color: '#ef4444' },
      { partyName: 'UxP', sharePct: 12.0, color: '#38bdf8' }
    ],
    gobernadorCandidates: [
      { id: 'KLIPAU_MIS', name: 'Pedro Puerta', relevance: 32, roleDescription: 'Dirigente yerbatero · relevancia 32' },
      { id: 'ARRUA_MIS', name: 'Martín Arjol', relevance: 29, roleDescription: 'Diputado posadeño · relevancia 29' }
    ],
    viceCandidates: [
      { id: 'SCHIAV_MIS', name: 'Florencia Klipauka', relevance: 26, roleDescription: 'Referente Oberá · relevancia 26' }
    ],
    selectedGobernadorId: 'KLIPAU_MIS',
    selectedViceId: 'SCHIAV_MIS',
    localBudgetArgentums: 140.0,
    localActionsRemaining: 4,
    loyaltyIndex: 65
  },
  LA_PAMPA: {
    id: 'LA_PAMPA',
    name: 'La Pampa',
    turnYear: '2028',
    electionDate: '14 de mayo de 2028',
    formulaOpensDate: 'mayo de 2027',
    currentGovernor: 'Sergio Ziliotto',
    governingParty: 'PJ / Frejupa',
    statusBadge: 'FÓRMULA ABIERTA',
    electorateBreakdown: { izq: 32, centro: 48, der: 20 },
    shares: [
      { partyName: 'Frejupa / PJ', sharePct: 44.5, color: '#0284c7' },
      { partyName: 'Tu fórmula', sharePct: 31.0, color: '#8b5cf6', isPlayer: true },
      { partyName: 'UCR Pampeana', sharePct: 24.5, color: '#dc2626' }
    ],
    gobernadorCandidates: [
      { id: 'KRONE_LP', name: 'Martín Maquieyra', relevance: 34, roleDescription: 'Referente General Pico · relevancia 34' }
    ],
    viceCandidates: [
      { id: 'BERHON_LP', name: 'Josefina Díaz', relevance: 28, roleDescription: 'Productora agropecuaria · relevancia 28' }
    ],
    selectedGobernadorId: 'KRONE_LP',
    selectedViceId: 'BERHON_LP',
    localBudgetArgentums: 120.0,
    localActionsRemaining: 4,
    loyaltyIndex: 45
  },
  MENDOZA: {
    id: 'MENDOZA',
    name: 'Mendoza',
    turnYear: '2028',
    electionDate: '11 de junio de 2028',
    formulaOpensDate: 'junio de 2027',
    currentGovernor: 'Alfredo Cornejo',
    governingParty: 'Cambia Mendoza',
    statusBadge: 'TU FÓRMULA LIDERA',
    electorateBreakdown: { izq: 18, centro: 42, der: 40 },
    shares: [
      { partyName: 'Tu fórmula', sharePct: 42.5, color: '#8b5cf6', isPlayer: true },
      { partyName: 'Cambia Mendoza (UCR)', sharePct: 34.0, color: '#dc2626' },
      { partyName: 'Unión Mendocina', sharePct: 15.5, color: '#f59e0b' },
      { partyName: 'PJ Mendoza', sharePct: 8.0, color: '#0284c7' }
    ],
    gobernadorCandidates: [
      { id: 'DEMARCHI_MDZ', name: 'Omar De Marchi', relevance: 45, roleDescription: 'Luján de Cuyo · relevancia 45' },
      { id: 'CASADO_MDZ', name: 'Hebe Casado', relevance: 36, roleDescription: 'San Rafael · relevancia 36' }
    ],
    viceCandidates: [
      { id: 'GARCIA_MDZ', name: 'Mercedes Llano', relevance: 33, roleDescription: 'Diputada provincial · relevancia 33' }
    ],
    selectedGobernadorId: 'DEMARCHI_MDZ',
    selectedViceId: 'GARCIA_MDZ',
    localBudgetArgentums: 210.0,
    localActionsRemaining: 4,
    loyaltyIndex: 82
  },
  CHACO: {
    id: 'CHACO',
    name: 'Chaco',
    turnYear: '2028',
    electionDate: '9 de julio de 2028',
    formulaOpensDate: 'julio de 2027',
    currentGovernor: 'Leandro Zdero',
    governingParty: 'UCR / JxC',
    statusBadge: 'FÓRMULA ABIERTA',
    electorateBreakdown: { izq: 35, centro: 45, der: 20 },
    shares: [
      { partyName: 'Juntos por Chaco', sharePct: 41.0, color: '#dc2626' },
      { partyName: 'Frente Chaqueño (PJ)', sharePct: 36.5, color: '#0284c7' },
      { partyName: 'Tu fórmula', sharePct: 22.5, color: '#8b5cf6', isPlayer: true }
    ],
    gobernadorCandidates: [
      { id: 'ZDERO_CHA', name: 'Leandro Zdero', relevance: 42, roleDescription: 'Resistencia · relevancia 42' }
    ],
    viceCandidates: [
      { id: 'SCHNEIDER_CHA', name: 'Silvana Schneider', relevance: 31, roleDescription: 'Charata · relevancia 31' }
    ],
    selectedGobernadorId: 'ZDERO_CHA',
    selectedViceId: 'SCHNEIDER_CHA',
    localBudgetArgentums: 130.0,
    localActionsRemaining: 4,
    loyaltyIndex: 74
  },
  BUENOS_AIRES: {
    id: 'BUENOS_AIRES',
    name: 'Buenos Aires',
    turnYear: '2028',
    electionDate: '10 de septiembre de 2028',
    formulaOpensDate: 'septiembre de 2027',
    currentGovernor: 'Axel Kicillof',
    governingParty: 'UxP',
    statusBadge: 'BATALLA CLAVE (37% PADRÓN)',
    electorateBreakdown: { izq: 44, centro: 36, der: 20 },
    shares: [
      { partyName: 'Unión por la Patria', sharePct: 39.8, color: '#0284c7' },
      { partyName: 'Tu fórmula', sharePct: 32.4, color: '#8b5cf6', isPlayer: true },
      { partyName: 'Juntos por el Cambio', sharePct: 21.6, color: '#eab308' },
      { partyName: 'Frente de Izquierda', sharePct: 6.2, color: '#ef4444' }
    ],
    gobernadorCandidates: [
      { id: 'SANTILLI_PBA', name: 'Diego Santilli', relevance: 54, roleDescription: 'Diputado nacional · relevancia 54' },
      { id: 'RITONDO_PBA', name: 'Cristian Ritondo', relevance: 51, roleDescription: 'Jefe de bloque · relevancia 51' }
    ],
    viceCandidates: [
      { id: 'PIPARO_PBA', name: 'Carolina Píparo', relevance: 41, roleDescription: 'La Plata · relevancia 41' }
    ],
    selectedGobernadorId: 'SANTILLI_PBA',
    selectedViceId: 'PIPARO_PBA',
    localBudgetArgentums: 380.0,
    localActionsRemaining: 4,
    loyaltyIndex: 35
  },

  // TURNO 2029 (6 distritos)
  JUJUY: {
    id: 'JUJUY',
    name: 'Jujuy',
    turnYear: '2029',
    electionDate: '8 de abril de 2029',
    formulaOpensDate: 'abril de 2028',
    currentGovernor: 'Carlos Sadir',
    governingParty: 'UCR / Cambia Jujuy',
    statusBadge: 'FÓRMULA DESDE ABRIL DE 2028',
    electorateBreakdown: { izq: 30, centro: 50, der: 20 },
    shares: [
      { partyName: 'Cambia Jujuy', sharePct: 44.0, color: '#dc2626' },
      { partyName: 'Tu fórmula', sharePct: 29.5, color: '#8b5cf6', isPlayer: true },
      { partyName: 'PJ Jujuy', sharePct: 18.5, color: '#0284c7' },
      { partyName: 'FIT', sharePct: 8.0, color: '#ef4444' }
    ],
    gobernadorCandidates: [
      { id: 'SADIR_JUJ', name: 'Carlos Sadir', relevance: 40, roleDescription: 'San Salvador · relevancia 40' }
    ],
    viceCandidates: [
      { id: 'BERNIS_JUJ', name: 'Alberto Bernis', relevance: 32, roleDescription: 'Dirigente legislativo · relevancia 32' }
    ],
    selectedGobernadorId: 'SADIR_JUJ',
    selectedViceId: 'BERNIS_JUJ',
    localBudgetArgentums: 110.0,
    localActionsRemaining: 4,
    loyaltyIndex: 70
  },
  TUCUMAN: {
    id: 'TUCUMAN',
    name: 'Tucumán',
    turnYear: '2029',
    electionDate: '13 de mayo de 2029',
    formulaOpensDate: 'mayo de 2028',
    currentGovernor: 'Osvaldo Jaldo',
    governingParty: 'PJ Independiente',
    statusBadge: 'FÓRMULA DESDE MAYO DE 2028',
    electorateBreakdown: { izq: 38, centro: 44, der: 18 },
    shares: [
      { partyName: 'Frente Tucumano (PJ)', sharePct: 46.2, color: '#0284c7' },
      { partyName: 'Tu fórmula', sharePct: 31.0, color: '#8b5cf6', isPlayer: true },
      { partyName: 'Juntos por Tucumán', sharePct: 22.8, color: '#eab308' }
    ],
    gobernadorCandidates: [
      { id: 'ALFARO_TUC', name: 'Germán Alfaro', relevance: 38, roleDescription: 'San Miguel · relevancia 38' }
    ],
    viceCandidates: [
      { id: 'AVILA_TUC', name: 'Beatriz Ávila', relevance: 30, roleDescription: 'Senadora · relevancia 30' }
    ],
    selectedGobernadorId: 'ALFARO_TUC',
    selectedViceId: 'AVILA_TUC',
    localBudgetArgentums: 135.0,
    localActionsRemaining: 4,
    loyaltyIndex: 68
  },
  CORDOBA: {
    id: 'CORDOBA',
    name: 'Córdoba',
    turnYear: '2029',
    electionDate: '10 de junio de 2029',
    formulaOpensDate: 'junio de 2028',
    currentGovernor: 'Martín Llaryora',
    governingParty: 'Hacemos Unidos por Córdoba',
    statusBadge: 'FÓRMULA DESDE JUNIO DE 2028',
    electorateBreakdown: { izq: 16, centro: 46, der: 38 },
    shares: [
      { partyName: 'Hacemos Unidos por Córdoba', sharePct: 41.5, color: '#2563eb' },
      { partyName: 'Tu fórmula', sharePct: 38.2, color: '#8b5cf6', isPlayer: true },
      { partyName: 'JxC Córdoba', sharePct: 15.3, color: '#eab308' },
      { partyName: 'Kirchnerismo', sharePct: 5.0, color: '#0284c7' }
    ],
    gobernadorCandidates: [
      { id: 'DELOREDO_CBA', name: 'Rodrigo de Loredo', relevance: 49, roleDescription: 'Córdoba Capital · relevancia 49' },
      { id: 'JUEZ_CBA', name: 'Luis Juez', relevance: 52, roleDescription: 'Senador nacional · relevancia 52' }
    ],
    viceCandidates: [
      { id: 'RODRIGUEZ_CBA', name: 'Laura Rodríguez Machado', relevance: 35, roleDescription: 'Dirigente PRO · relevancia 35' }
    ],
    selectedGobernadorId: 'DELOREDO_CBA',
    selectedViceId: 'RODRIGUEZ_CBA',
    localBudgetArgentums: 240.0,
    localActionsRemaining: 4,
    loyaltyIndex: 85
  },
  SAN_LUIS: {
    id: 'SAN_LUIS',
    name: 'San Luis',
    turnYear: '2029',
    electionDate: '8 de julio de 2029',
    formulaOpensDate: 'julio de 2028',
    currentGovernor: 'Claudio Poggi',
    governingParty: 'Avanzar San Luis',
    statusBadge: 'FÓRMULA DESDE JULIO DE 2028',
    electorateBreakdown: { izq: 22, centro: 50, der: 28 },
    shares: [
      { partyName: 'Avanzar / Cambia San Luis', sharePct: 48.0, color: '#eab308' },
      { partyName: 'Tu fórmula', sharePct: 32.5, color: '#8b5cf6', isPlayer: true },
      { partyName: 'Unión por San Luis (PJ)', sharePct: 19.5, color: '#0284c7' }
    ],
    gobernadorCandidates: [
      { id: 'POGGI_SL', name: 'Claudio Poggi', relevance: 46, roleDescription: 'San Luis · relevancia 46' }
    ],
    viceCandidates: [
      { id: 'MONFORTE_SL', name: 'Ricardo Endeiza', relevance: 31, roleDescription: 'Villa Mercedes · relevancia 31' }
    ],
    selectedGobernadorId: 'POGGI_SL',
    selectedViceId: 'MONFORTE_SL',
    localBudgetArgentums: 115.0,
    localActionsRemaining: 4,
    loyaltyIndex: 80
  },
  CORRIENTES: {
    id: 'CORRIENTES',
    name: 'Corrientes',
    turnYear: '2029',
    electionDate: '9 de septiembre de 2029',
    formulaOpensDate: 'septiembre de 2028',
    currentGovernor: 'Gustavo Valdés',
    governingParty: 'UCR / ECO',
    statusBadge: 'FÓRMULA DESDE SEPTIEMBRE DE 2028',
    electorateBreakdown: { izq: 24, centro: 54, der: 22 },
    shares: [
      { partyName: 'ECO / Encuentro por Corrientes', sharePct: 49.2, color: '#dc2626' },
      { partyName: 'Tu fórmula', sharePct: 29.8, color: '#8b5cf6', isPlayer: true },
      { partyName: 'Frente de Todos Corrientes', sharePct: 21.0, color: '#0284c7' }
    ],
    gobernadorCandidates: [
      { id: 'VALDES_CRR', name: 'Gustavo Valdés', relevance: 48, roleDescription: 'Corrientes Capital · relevancia 48' }
    ],
    viceCandidates: [
      { id: 'BRAILLARD_CRR', name: 'Pedro Braillard Poccard', relevance: 36, roleDescription: 'Vicegobernador · relevancia 36' }
    ],
    selectedGobernadorId: 'VALDES_CRR',
    selectedViceId: 'BRAILLARD_CRR',
    localBudgetArgentums: 125.0,
    localActionsRemaining: 4,
    loyaltyIndex: 77
  },
  SANTIAGO_DEL_ESTERO: {
    id: 'SANTIAGO_DEL_ESTERO',
    name: 'Santiago del Estero',
    turnYear: '2029',
    electionDate: '11 de noviembre de 2029',
    formulaOpensDate: 'noviembre de 2028',
    currentGovernor: 'Gerardo Zamora',
    governingParty: 'Frente Cívico por Santiago',
    statusBadge: 'FÓRMULA DESDE NOVIEMBRE DE 2028',
    electorateBreakdown: { izq: 45, centro: 40, der: 15 },
    shares: [
      { partyName: 'Frente Cívico por Santiago', sharePct: 62.5, color: '#0284c7' },
      { partyName: 'Tu fórmula', sharePct: 24.0, color: '#8b5cf6', isPlayer: true },
      { partyName: 'Juntos por Santiago', sharePct: 13.5, color: '#eab308' }
    ],
    gobernadorCandidates: [
      { id: 'ZAMORA_SGO', name: 'Gerardo Zamora', relevance: 55, roleDescription: 'Santiago Capital · relevancia 55' }
    ],
    viceCandidates: [
      { id: 'SILVA_SGO', name: 'Carlos Silva Neder', relevance: 34, roleDescription: 'La Banda · relevancia 34' }
    ],
    selectedGobernadorId: 'ZAMORA_SGO',
    selectedViceId: 'SILVA_SGO',
    localBudgetArgentums: 105.0,
    localActionsRemaining: 4,
    loyaltyIndex: 50
  },

  // TURNO 2030 (6 distritos)
  NEUQUEN: {
    id: 'NEUQUEN',
    name: 'Neuquén',
    turnYear: '2030',
    electionDate: '14 de abril de 2030',
    formulaOpensDate: 'abril de 2029',
    currentGovernor: 'Rolando Figueroa',
    governingParty: 'Comunidad / Neuquinizate',
    statusBadge: 'FÓRMULA DESDE ABRIL DE 2029',
    electorateBreakdown: { izq: 28, centro: 46, der: 26 },
    shares: [
      { partyName: 'Comunidad', sharePct: 36.8, color: '#2563eb' },
      { partyName: 'Tu fórmula', sharePct: 32.5, color: '#8b5cf6', isPlayer: true },
      { partyName: 'MPN Histórico', sharePct: 18.2, color: '#0ea5e9' },
      { partyName: 'UxP', sharePct: 12.5, color: '#0284c7' }
    ],
    gobernadorCandidates: [
      { id: 'FIGUEROA_NQN', name: 'Rolando Figueroa', relevance: 47, roleDescription: 'Zapala / Capital · relevancia 47' }
    ],
    viceCandidates: [
      { id: 'RUIZ_NQN', name: 'Gloria Ruiz', relevance: 33, roleDescription: 'Plottier · relevancia 33' }
    ],
    selectedGobernadorId: 'FIGUEROA_NQN',
    selectedViceId: 'RUIZ_NQN',
    localBudgetArgentums: 160.0,
    localActionsRemaining: 4,
    loyaltyIndex: 72
  },
  RIO_NEGRO: {
    id: 'RIO_NEGRO',
    name: 'Río Negro',
    turnYear: '2030',
    electionDate: '14 de abril de 2030',
    formulaOpensDate: 'abril de 2029',
    currentGovernor: 'Alberto Weretilneck',
    governingParty: 'Juntos Somos Río Negro',
    statusBadge: 'FÓRMULA DESDE ABRIL DE 2029',
    electorateBreakdown: { izq: 32, centro: 48, der: 20 },
    shares: [
      { partyName: 'JSRN', sharePct: 40.5, color: '#10b981' },
      { partyName: 'Tu fórmula', sharePct: 30.0, color: '#8b5cf6', isPlayer: true },
      { partyName: 'UxP', sharePct: 19.5, color: '#0284c7' },
      { partyName: 'UCR / Cambia Río Negro', sharePct: 10.0, color: '#dc2626' }
    ],
    gobernadorCandidates: [
      { id: 'WERET_RN', name: 'Alberto Weretilneck', relevance: 48, roleDescription: 'Cipolletti · relevancia 48' }
    ],
    viceCandidates: [
      { id: 'PESATTI_RN', name: 'Pedro Pesatti', relevance: 35, roleDescription: 'Viedma · relevancia 35' }
    ],
    selectedGobernadorId: 'WERET_RN',
    selectedViceId: 'PESATTI_RN',
    localBudgetArgentums: 130.0,
    localActionsRemaining: 4,
    loyaltyIndex: 68
  },
  SAN_JUAN: {
    id: 'SAN_JUAN',
    name: 'San Juan',
    turnYear: '2030',
    electionDate: '12 de mayo de 2030',
    formulaOpensDate: 'mayo de 2029',
    currentGovernor: 'Marcelo Orrego',
    governingParty: 'Producción y Trabajo',
    statusBadge: 'FÓRMULA DESDE MAYO DE 2029',
    electorateBreakdown: { izq: 33, centro: 47, der: 20 },
    shares: [
      { partyName: 'Cambia San Juan', sharePct: 45.2, color: '#f59e0b' },
      { partyName: 'Tu fórmula', sharePct: 33.0, color: '#8b5cf6', isPlayer: true },
      { partyName: 'San Juan por Todos (PJ)', sharePct: 21.8, color: '#0284c7' }
    ],
    gobernadorCandidates: [
      { id: 'ORREGO_SJ', name: 'Marcelo Orrego', relevance: 45, roleDescription: 'Santa Lucía · relevancia 45' }
    ],
    viceCandidates: [
      { id: 'MARTIN_SJ', name: 'Fabián Martín', relevance: 33, roleDescription: 'Rivadavia · relevancia 33' }
    ],
    selectedGobernadorId: 'ORREGO_SJ',
    selectedViceId: 'MARTIN_SJ',
    localBudgetArgentums: 125.0,
    localActionsRemaining: 4,
    loyaltyIndex: 75
  },
  SANTA_FE: {
    id: 'SANTA_FE',
    name: 'Santa Fe',
    turnYear: '2030',
    electionDate: '8 de septiembre de 2030',
    formulaOpensDate: 'septiembre de 2029',
    currentGovernor: 'Maximiliano Pullaro',
    governingParty: 'UCR / Unidos',
    statusBadge: 'SEGUNDA PROVINCIA DEL PAÍS',
    electorateBreakdown: { izq: 24, centro: 48, der: 28 },
    shares: [
      { partyName: 'Unidos para Cambiar Santa Fe', sharePct: 43.5, color: '#dc2626' },
      { partyName: 'Tu fórmula', sharePct: 34.2, color: '#8b5cf6', isPlayer: true },
      { partyName: 'Juntos Avancemos (PJ)', sharePct: 15.3, color: '#0284c7' },
      { partyName: 'Somos Vida', sharePct: 7.0, color: '#f43f5e' }
    ],
    gobernadorCandidates: [
      { id: 'PULLARO_SF', name: 'Maximiliano Pullaro', relevance: 54, roleDescription: 'Hughes / Rosario · relevancia 54' }
    ],
    viceCandidates: [
      { id: 'SCAGLIA_SF', name: 'Gisela Scaglia', relevance: 38, roleDescription: 'Gálvez · relevancia 38' }
    ],
    selectedGobernadorId: 'PULLARO_SF',
    selectedViceId: 'SCAGLIA_SF',
    localBudgetArgentums: 270.0,
    localActionsRemaining: 4,
    loyaltyIndex: 86
  },
  ENTRE_RIOS: {
    id: 'ENTRE_RIOS',
    name: 'Entre Ríos',
    turnYear: '2030',
    electionDate: '13 de octubre de 2030',
    formulaOpensDate: 'octubre de 2029',
    currentGovernor: 'Rogelio Frigerio',
    governingParty: 'PRO / JxC',
    statusBadge: 'FÓRMULA DESDE OCTUBRE DE 2029',
    electorateBreakdown: { izq: 26, centro: 46, der: 28 },
    shares: [
      { partyName: 'Juntos por Entre Ríos', sharePct: 44.2, color: '#eab308' },
      { partyName: 'Tu fórmula', sharePct: 33.5, color: '#8b5cf6', isPlayer: true },
      { partyName: 'Más para Entre Ríos (PJ)', sharePct: 22.3, color: '#0284c7' }
    ],
    gobernadorCandidates: [
      { id: 'FRIGERIO_ER', name: 'Rogelio Frigerio', relevance: 52, roleDescription: 'Villa Paranacito · relevancia 52' }
    ],
    viceCandidates: [
      { id: 'ALUANI_ER', name: 'Alicia Aluani', relevance: 32, roleDescription: 'Nogoyá · relevancia 32' }
    ],
    selectedGobernadorId: 'FRIGERIO_ER',
    selectedViceId: 'ALUANI_ER',
    localBudgetArgentums: 155.0,
    localActionsRemaining: 4,
    loyaltyIndex: 84
  },
  CHUBUT: {
    id: 'CHUBUT',
    name: 'Chubut',
    turnYear: '2030',
    electionDate: '10 de noviembre de 2030',
    formulaOpensDate: 'noviembre de 2029',
    currentGovernor: 'Ignacio Torres',
    governingParty: 'PRO / Despierta Chubut',
    statusBadge: 'FÓRMULA DESDE NOVIEMBRE DE 2029',
    electorateBreakdown: { izq: 34, centro: 42, der: 24 },
    shares: [
      { partyName: 'Despierta Chubut', sharePct: 42.1, color: '#eab308' },
      { partyName: 'Tu fórmula', sharePct: 31.8, color: '#8b5cf6', isPlayer: true },
      { partyName: 'Arriba Chubut (PJ)', sharePct: 26.1, color: '#0284c7' }
    ],
    gobernadorCandidates: [
      { id: 'TORRES_CHU', name: 'Ignacio Torres', relevance: 50, roleDescription: 'Trelew / Rawson · relevancia 50' }
    ],
    viceCandidates: [
      { id: 'MENNA_CHU', name: 'Gustavo Menna', relevance: 35, roleDescription: 'Comodoro Rivadavia · relevancia 35' }
    ],
    selectedGobernadorId: 'TORRES_CHU',
    selectedViceId: 'MENNA_CHU',
    localBudgetArgentums: 145.0,
    localActionsRemaining: 4,
    loyaltyIndex: 78
  },

  // TURNO 2031 (6 distritos)
  FORMOSA: {
    id: 'FORMOSA',
    name: 'Formosa',
    turnYear: '2031',
    electionDate: '11 de mayo de 2031',
    formulaOpensDate: 'mayo de 2030',
    currentGovernor: 'Gildo Insfrán',
    governingParty: 'PJ / UxP',
    statusBadge: 'HEGEMONÍA DE 30 AÑOS',
    electorateBreakdown: { izq: 48, centro: 38, der: 14 },
    shares: [
      { partyName: 'Partido Justicialista', sharePct: 65.4, color: '#0284c7' },
      { partyName: 'Tu fórmula', sharePct: 22.8, color: '#8b5cf6', isPlayer: true },
      { partyName: 'Frente Amplio Formoseño', sharePct: 11.8, color: '#dc2626' }
    ],
    gobernadorCandidates: [
      { id: 'CARBAJAL_FOR', name: 'Fernando Carbajal', relevance: 39, roleDescription: 'Formosa Capital · relevancia 39' }
    ],
    viceCandidates: [
      { id: 'NEME_FOR', name: 'Gabriela Neme', relevance: 34, roleDescription: 'Diputada provincial · relevancia 34' }
    ],
    selectedGobernadorId: 'CARBAJAL_FOR',
    selectedViceId: 'NEME_FOR',
    localBudgetArgentums: 100.0,
    localActionsRemaining: 4,
    loyaltyIndex: 20
  },
  SALTA: {
    id: 'SALTA',
    name: 'Salta',
    turnYear: '2031',
    electionDate: '11 de mayo de 2031',
    formulaOpensDate: 'mayo de 2030',
    currentGovernor: 'Gustavo Sáenz',
    governingParty: 'Identidad Salteña',
    statusBadge: 'FÓRMULA DESDE MAYO DE 2030',
    electorateBreakdown: { izq: 32, centro: 48, der: 20 },
    shares: [
      { partyName: 'Unidos por Salta', sharePct: 45.0, color: '#2563eb' },
      { partyName: 'Tu fórmula', sharePct: 32.0, color: '#8b5cf6', isPlayer: true },
      { partyName: 'Juntos por el Cambio', sharePct: 14.5, color: '#eab308' },
      { partyName: 'Frente de Todos', sharePct: 8.5, color: '#0284c7' }
    ],
    gobernadorCandidates: [
      { id: 'SAENZ_SAL', name: 'Gustavo Sáenz', relevance: 51, roleDescription: 'Salta Capital · relevancia 51' }
    ],
    viceCandidates: [
      { id: 'MAROCCO_SAL', name: 'Antonio Marocco', relevance: 33, roleDescription: 'Vicegobernador · relevancia 33' }
    ],
    selectedGobernadorId: 'SAENZ_SAL',
    selectedViceId: 'MAROCCO_SAL',
    localBudgetArgentums: 140.0,
    localActionsRemaining: 4,
    loyaltyIndex: 72
  },
  CATAMARCA: {
    id: 'CATAMARCA',
    name: 'Catamarca',
    turnYear: '2031',
    electionDate: '8 de junio de 2031',
    formulaOpensDate: 'junio de 2030',
    currentGovernor: 'Raúl Jalil',
    governingParty: 'PJ / UxP',
    statusBadge: 'FÓRMULA DESDE JUNIO DE 2030',
    electorateBreakdown: { izq: 40, centro: 45, der: 15 },
    shares: [
      { partyName: 'Unión por la Patria', sharePct: 50.5, color: '#0284c7' },
      { partyName: 'Tu fórmula', sharePct: 29.5, color: '#8b5cf6', isPlayer: true },
      { partyName: 'Juntos por el Cambio', sharePct: 20.0, color: '#dc2626' }
    ],
    gobernadorCandidates: [
      { id: 'JALIL_CAT', name: 'Raúl Jalil', relevance: 46, roleDescription: 'San Fernando del Valle · relevancia 46' }
    ],
    viceCandidates: [
      { id: 'DUSSO_CAT', name: 'Rubén Dusso', relevance: 32, roleDescription: 'Vicegobernador · relevancia 32' }
    ],
    selectedGobernadorId: 'JALIL_CAT',
    selectedViceId: 'DUSSO_CAT',
    localBudgetArgentums: 110.0,
    localActionsRemaining: 4,
    loyaltyIndex: 65
  },
  LA_RIOJA: {
    id: 'LA_RIOJA',
    name: 'La Rioja',
    turnYear: '2031',
    electionDate: '13 de julio de 2031',
    formulaOpensDate: 'julio de 2030',
    currentGovernor: 'Ricardo Quintela',
    governingParty: 'PJ / Federalismo',
    statusBadge: 'FÓRMULA DESDE JULIO DE 2030',
    electorateBreakdown: { izq: 46, centro: 38, der: 16 },
    shares: [
      { partyName: 'Frente de Todos La Rioja', sharePct: 53.0, color: '#0284c7' },
      { partyName: 'Tu fórmula', sharePct: 30.5, color: '#8b5cf6', isPlayer: true },
      { partyName: 'Juntos por La Rioja', sharePct: 16.5, color: '#dc2626' }
    ],
    gobernadorCandidates: [
      { id: 'MENEM_LR', name: 'Martín Menem', relevance: 49, roleDescription: 'Presidente HCDN · relevancia 49' }
    ],
    viceCandidates: [
      { id: 'PAGOTTO_LR', name: 'Juan Carlos Pagotto', relevance: 35, roleDescription: 'Senador nacional · relevancia 35' }
    ],
    selectedGobernadorId: 'MENEM_LR',
    selectedViceId: 'PAGOTTO_LR',
    localBudgetArgentums: 120.0,
    localActionsRemaining: 4,
    loyaltyIndex: 30
  },
  SANTA_CRUZ: {
    id: 'SANTA_CRUZ',
    name: 'Santa Cruz',
    turnYear: '2031',
    electionDate: '10 de agosto de 2031',
    formulaOpensDate: 'agosto de 2030',
    currentGovernor: 'Claudio Vidal',
    governingParty: 'Por Santa Cruz',
    statusBadge: 'FÓRMULA DESDE AGOSTO DE 2030',
    electorateBreakdown: { izq: 38, centro: 42, der: 20 },
    shares: [
      { partyName: 'Por Santa Cruz', sharePct: 41.0, color: '#0ea5e9' },
      { partyName: 'Tu fórmula', sharePct: 32.5, color: '#8b5cf6', isPlayer: true },
      { partyName: 'Unión por la Patria', sharePct: 26.5, color: '#0284c7' }
    ],
    gobernadorCandidates: [
      { id: 'VIDAL_SC', name: 'Claudio Vidal', relevance: 47, roleDescription: 'Río Gallegos · relevancia 47' }
    ],
    viceCandidates: [
      { id: 'LEGUIZ_SC', name: 'Fabián Leguizamón', relevance: 31, roleDescription: 'Vicegobernador · relevancia 31' }
    ],
    selectedGobernadorId: 'VIDAL_SC',
    selectedViceId: 'LEGUIZ_SC',
    localBudgetArgentums: 130.0,
    localActionsRemaining: 4,
    loyaltyIndex: 60
  },
  CABA: {
    id: 'CABA',
    name: 'Ciudad de Buenos Aires',
    turnYear: '2031',
    electionDate: '12 de octubre de 2031',
    formulaOpensDate: 'octubre de 2030',
    currentGovernor: 'Jorge Macri',
    governingParty: 'PRO / JxC',
    statusBadge: 'BASTIÓN HISTÓRICO',
    electorateBreakdown: { izq: 22, centro: 42, der: 36 },
    shares: [
      { partyName: 'Juntos por el Cambio', sharePct: 44.5, color: '#eab308' },
      { partyName: 'Tu fórmula', sharePct: 34.0, color: '#8b5cf6', isPlayer: true },
      { partyName: 'Unión por la Patria', sharePct: 17.5, color: '#0284c7' },
      { partyName: 'Frente de Izquierda', sharePct: 4.0, color: '#ef4444' }
    ],
    gobernadorCandidates: [
      { id: 'MACRI_JORGE', name: 'Jorge Macri', relevance: 58, roleDescription: 'Jefe de Gobierno · relevancia 58' },
      { id: 'LOUSTEAU_CABA', name: 'Martín Lousteau', relevance: 54, roleDescription: 'Senador nacional · relevancia 54' }
    ],
    viceCandidates: [
      { id: 'MURA_CABA', name: 'Clara Muzzio', relevance: 37, roleDescription: 'Vicejefa de Gobierno · relevancia 37' }
    ],
    selectedGobernadorId: 'MACRI_JORGE',
    selectedViceId: 'MURA_CABA',
    localBudgetArgentums: 320.0,
    localActionsRemaining: 4,
    loyaltyIndex: 90
  }
};

interface ProvincialVoteBarProps {
  shares: ProvincialPartyShare[];
}

function ProvincialLeadingBadge({ isLeading, diff, rivalName }: { isLeading: boolean; diff: string; rivalName: string }) {
  if (isLeading) {
    return (
      <span className="px-2 py-0.5 rounded-sm bg-emerald-950/60 border border-emerald-700/70 font-mono font-bold text-emerald-300 text-[11px] uppercase tracking-wider">
        ★ Lidera tu fórmula (+{diff} pp vs. {rivalName})
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded-sm bg-amber-950/40 border border-[#8a6d33]/70 font-mono text-amber-200 text-[11px]">
      Escoltas a {rivalName} (-{diff} pp)
    </span>
  );
}

function resolvePlayerShare(shares: ProvincialPartyShare[]): number {
  for (const s of shares) {
    if (s.isPlayer) return s.sharePct;
  }
  return 0;
}

function resolveRivalShare(sorted: ProvincialPartyShare[]): { name: string; share: number } {
  const isTop = sorted[0]?.isPlayer ?? false;
  const rival = isTop ? sorted[1] : sorted[0];
  const name = rival ? rival.partyName : 'primero';
  const share = rival ? rival.sharePct : 0;
  return { name, share };
}

function formatVoteRowLabel(share: ProvincialPartyShare): string {
  if (!share.isPlayer) return share.partyName;
  if (share.partyName.toLowerCase().includes('tu fórmula')) {
    return 'Tu fórmula oficial';
  }
  return `${share.partyName} (tu fórmula)`;
}

const PARTY_LOGO_KEYWORDS: Array<[string, string]> = [
  ['lla', 'LLA'],
  ['libertad', 'LLA'],
  ['pro', 'PRO'],
  ['provincias unidas', 'PF'],
  ['hacemos', 'PF'],
  ['ucr', 'UCR'],
  ['radical', 'UCR'],
  ['cambia', 'UCR'],
  ['uxp', 'UXP'],
  ['unión por la patria', 'UXP'],
  ['justicialista', 'PJ'],
  ['pj', 'PJ'],
  ['fit', 'FIT'],
  ['izquierda', 'FIT']
];

function resolveProvincialLogoKey(partyName: string): string {
  const lower = partyName.toLowerCase();
  for (const [kw, key] of PARTY_LOGO_KEYWORDS) {
    if (lower.includes(kw)) return key;
  }
  return 'PROVINCIALES';
}

function VoteRowItem({ share }: { share: ProvincialPartyShare }) {
  const label = formatVoteRowLabel(share);
  const textClass = share.isPlayer ? 'font-bold text-amber-100' : 'text-slate-300';
  const rowBg = share.isPlayer ? 'bg-[#121a28] border-[#8a6d33]/60' : 'bg-[#090d14] border-[#1e293b]';
  return (
    <div className={`flex items-center justify-between px-3 py-1.5 rounded-sm border text-xs ${rowBg}`}>
      <div className="flex items-center gap-2 min-w-0">
        <OfficialPartyLogo partyIdOrSigla={resolveProvincialLogoKey(share.partyName)} sizePx={20} fallbackColor={share.color} />
        <span className={`${textClass} truncate`}>{label}</span>
      </div>
      <span className="font-mono font-extrabold text-amber-200 shrink-0 ml-2">
        {share.sharePct.toFixed(1).replace('.', ',')} %
      </span>
    </div>
  );
}

function ProvincialVoteBar({ shares }: ProvincialVoteBarProps) {
  const sortedShares = useMemo(
    () => [...shares].sort((a, b) => b.sharePct - a.sharePct),
    [shares]
  );
  const playerShare = resolvePlayerShare(sortedShares);
  const rival = resolveRivalShare(sortedShares);
  const isLeading = playerShare >= rival.share && playerShare > 0;
  const diff = isLeading
    ? (playerShare - rival.share).toFixed(1).replace('.', ',')
    : (rival.share - playerShare).toFixed(1).replace('.', ',');

  return (
    <div className="hoi-panel rounded-sm p-5 space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#263142] pb-2.5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 block">
            SONDEO ELECTORAL DISTRITAL
          </span>
          <span className="font-serif font-bold uppercase tracking-wide text-amber-100 text-sm">
            Intención de voto provincial a Gobernador
          </span>
        </div>
        <ProvincialLeadingBadge isLeading={isLeading} diff={diff} rivalName={rival.name} />
      </div>

      <div className="w-full h-3.5 rounded-sm overflow-hidden flex bg-[#090d14] border border-[#263142]">
        {sortedShares.map((s) => (
          <div
            key={s.partyName}
            style={{ width: `${s.sharePct}%`, backgroundColor: s.color }}
            className="h-full transition-all duration-300 border-r border-[#090d14]/60"
            title={`${s.partyName}: ${s.sharePct}%`}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
        {sortedShares.map((s) => (
          <VoteRowItem key={s.partyName} share={s} />
        ))}
      </div>
    </div>
  );
}

interface ProvincialFormulaProps {
  prov: DeepProvincialData;
  onChangeGobernador: (id: string) => void;
  onChangeVice: (id: string) => void;
}

function FormulaCandidateSlotCard({
  roleTitle,
  badgeCode,
  selected,
  candidates,
  selectedId,
  onChange
}: {
  roleTitle: string;
  badgeCode: string;
  selected: ProvincialCandidateOption | undefined;
  candidates: ProvincialCandidateOption[];
  selectedId: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="hoi-panel rounded-sm p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300">
          {roleTitle}
        </span>
        <span className="text-[10px] font-mono text-sky-300">
          Relevancia: {selected?.relevance ?? 25} pts
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-sm bg-[#162233] border border-[#8a6d33] flex items-center justify-center font-mono font-bold text-xs text-amber-200 shrink-0">
          {badgeCode}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-serif font-bold text-amber-100 truncate">{selected?.name}</div>
          <div className="text-[11px] font-mono text-slate-400 truncate">{selected?.roleDescription}</div>
        </div>
      </div>
      <select
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        aria-label={roleTitle}
        className="w-full bg-[#090d14] border border-[#263142] focus:border-[#b89342] rounded-sm px-3 py-2 text-xs font-mono text-amber-100"
      >
        {candidates.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} · relev. {c.relevance}
          </option>
        ))}
      </select>
    </div>
  );
}

function ProvincialFormulaSelector({ prov, onChangeGobernador, onChangeVice }: ProvincialFormulaProps) {
  const selectedGov =
    prov.gobernadorCandidates.find((c) => c.id === prov.selectedGobernadorId) ??
    prov.gobernadorCandidates[0];
  const selectedVice =
    prov.viceCandidates.find((c) => c.id === prov.selectedViceId) ??
    prov.viceCandidates[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormulaCandidateSlotCard
        roleTitle="CANDIDATO A GOBERNADOR"
        badgeCode="GOB"
        selected={selectedGov}
        candidates={prov.gobernadorCandidates}
        selectedId={prov.selectedGobernadorId}
        onChange={onChangeGobernador}
      />
      <FormulaCandidateSlotCard
        roleTitle="CANDIDATO A VICEGOBERNADOR"
        badgeCode="VICE"
        selected={selectedVice}
        candidates={prov.viceCandidates}
        selectedId={prov.selectedViceId}
        onChange={onChangeVice}
      />
    </div>
  );
}

interface LocalActionItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  badges: string[];
}

const LOCAL_ACTIONS: LocalActionItem[] = [
  {
    id: 'ENTREVISTA',
    title: 'Entrevista',
    description: 'Entrevista en radio, TV o streaming provincial.',
    cost: 3.4,
    badges: ['IMAGEN POSITIVA 0/+3,2', 'DESCONOCIMIENTO -3/-0,5', 'RELEVANCIA +0,3/+1,6']
  },
  {
    id: 'PUBLICIDAD',
    title: 'Publicidad',
    description: 'Campaña en medios y redes pagas provinciales.',
    cost: 10.3,
    badges: ['DESCONOCIMIENTO -8/-3', 'IMAGEN POSITIVA +0,5/+3', 'RELEVANCIA +0,5/+1,5']
  },
  {
    id: 'ACTO_PARTIDARIO',
    title: 'Acto partidario',
    description: 'Un acto con militancia y dirigentes locales.',
    cost: 6.8,
    badges: ['APOYO PARTIDARIO +0,6/+2,2', 'CONVENCIMIENTO +0,8/+2,4', 'RELEVANCIA +0,3/+1,4']
  },
  {
    id: 'FORMACION_EQUIPOS',
    title: 'Formación de equipos',
    description: 'Sumar técnicos y referentes al equipo de campaña provincial.',
    cost: 5.1,
    badges: ['INTELIGENCIA PERCIBIDA +1/+3,4', 'APOYO PARTIDARIO +0,4/+1,8']
  },
  {
    id: 'DEBATE',
    title: 'Debate',
    description: 'Participar en un debate público o partidario en la capital provincial.',
    cost: 4.3,
    badges: ['RELEVANCIA +0,8/+2,8', 'IMAGEN POSITIVA -4/+4,5', 'INTELIGENCIA PERCIBIDA -2/+3,5']
  },
  {
    id: 'PLAN_GOBIERNO',
    title: 'Plan de gobierno',
    description: 'Presentar propuestas y equipo para gobernar la provincia.',
    cost: 6.0,
    badges: ['INTELIGENCIA PERCIBIDA +1/+3,2', 'CONVENCIMIENTO +0,6/+2,2']
  }
];

interface ProvincialActionsGridProps {
  budget: number;
  actionsLeft: number;
  onExecute: (cost: number, boost: number) => void;
}

function formatScaledProvNumber(n: number): string {
  const sign = n > 0 ? '+' : '';
  const formatted = n.toFixed(1).replace('.', ',');
  return n === 0 ? '0' : `${sign}${formatted}`;
}

function scaleRangeString(rangeText: string, mult: number): string {
  if (Math.abs(mult - 1) < 0.02) return rangeText;
  const parts = rangeText.split('/');
  if (parts.length !== 2) return rangeText;
  const n1 = parseFloat(parts[0]!.replace(',', '.'));
  const n2 = parseFloat(parts[1]!.replace(',', '.'));
  if (isNaN(n1) || isNaN(n2)) return rangeText;
  return `${formatScaledProvNumber(n1 * mult)}/${formatScaledProvNumber(n2 * mult)}`;
}

function scaleProvincialBadge(badge: string, mult: number): string {
  if (Math.abs(mult - 1) < 0.02) return badge;
  const lastSpace = badge.lastIndexOf(' ');
  if (lastSpace === -1) return badge;
  const prefix = badge.slice(0, lastSpace);
  const range = badge.slice(lastSpace + 1);
  return `${prefix} ${scaleRangeString(range, mult)}`;
}

function computeProvincialFatigueMult(actionsLeft: number): number {
  const actionsDone = Math.max(0, 4 - actionsLeft);
  return 1 / (1 + 0.35 * actionsDone);
}

function isPartyIncompatible(partyName: string): boolean {
  return partyName.includes('FIT') || partyName.includes('Socialismo');
}

function transferAllianceVotes(
  shares: ProvincialPartyShare[],
  alliedParty: string,
  transfer: number
): ProvincialPartyShare[] {
  const updated = shares.map((s) => {
    if (s.isPlayer) {
      return { ...s, sharePct: Math.round((s.sharePct + transfer) * 10) / 10 };
    }
    if (s.partyName === alliedParty) {
      return { ...s, sharePct: Math.max(0.2, Math.round((s.sharePct - transfer) * 10) / 10) };
    }
    return s;
  });
  return [...updated].sort((a, b) => b.sharePct - a.sharePct);
}

function returnAllianceVotes(
  shares: ProvincialPartyShare[],
  alliedParty: string
): ProvincialPartyShare[] {
  const updated = shares.map((s) => {
    if (s.partyName === alliedParty) {
      return { ...s, sharePct: Math.round((s.sharePct + 2.5) * 10) / 10 };
    }
    if (s.isPlayer) {
      return { ...s, sharePct: Math.max(1.0, Math.round((s.sharePct - 3.0) * 10) / 10) };
    }
    return s;
  });
  return [...updated].sort((a, b) => b.sharePct - a.sharePct);
}

const DISTRICT_REFERENTES_TABLE = [
  { match: 'unidas', text: 'Caudillos distritales y legisladores provinciales' },
  { match: 'federal', text: 'Caudillos distritales y legisladores provinciales' },
  { match: 'patria', text: 'Referentes del peronismo distrital e intendentes' },
  { match: 'pj', text: 'Referentes del peronismo distrital e intendentes' },
  { match: 'frejupa', text: 'Referentes del peronismo distrital e intendentes' },
  { match: 'pro', text: 'Dirigentes de gestión urbana y concejales' },
  { match: 'radical', text: 'Comité provincial y dirigentes territoriales' },
  { match: 'defendamos', text: 'Federico Sciurano y ediles de Ushuaia / Río Grande' },
  { match: 'fit', text: 'Delegados de base y comisiones obreras' }
];

function resolveDistrictReferente(partyName: string): string {
  const lower = partyName.toLowerCase();
  const found = DISTRICT_REFERENTES_TABLE.find((item) => lower.includes(item.match));
  return found ? found.text : 'Concejales y dirigentes locales del espacio';
}

interface ProvincialCoalitionCardProps {
  party: ProvincialPartyShare;
  isInAlliance: boolean;
  canAddMore: boolean;
  onFormAlliance: () => void;
  onBreakAlliance: () => void;
}

function CoalitionActionFooter({
  isInAlliance,
  canAddMore,
  onFormAlliance,
  onBreakAlliance
}: {
  isInAlliance: boolean;
  canAddMore: boolean;
  onFormAlliance: () => void;
  onBreakAlliance: () => void;
}) {
  if (isInAlliance) {
    return (
      <button
        type="button"
        onClick={onBreakAlliance}
        className="w-full py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider text-rose-300 bg-rose-950/40 border border-rose-800/70 hover:bg-rose-900/60 transition"
      >
        Romper pacto distrital
      </button>
    );
  }
  return (
    <button
      type="button"
      disabled={!canAddMore}
      onClick={onFormAlliance}
      className="hoi-btn-gold w-full py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed transition"
    >
      {canAddMore ? 'Proponer alianza distrital' : 'Máximo 2 aliados alcanzado'}
    </button>
  );
}

function ProvincialCoalitionCard({
  party,
  isInAlliance,
  canAddMore,
  onFormAlliance,
  onBreakAlliance
}: ProvincialCoalitionCardProps) {
  const potentialBoost = Math.max(0.3, Math.round(party.sharePct * 0.6 * 10) / 10);
  const referente = resolveDistrictReferente(party.partyName);
  const borderCls = isInAlliance ? 'border-emerald-700/80' : 'border-[#263142] hover:border-[#8a6d33]';

  return (
    <div className={`hoi-panel rounded-sm p-4 flex flex-col justify-between space-y-3 transition ${borderCls}`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
          <div className="flex items-center gap-2 min-w-0">
            <OfficialPartyLogo partyIdOrSigla={resolveProvincialLogoKey(party.partyName)} sizePx={22} fallbackColor={party.color} />
            <span className="text-sm font-serif font-bold text-amber-100 truncate">{party.partyName}</span>
          </div>
          {isInAlliance ? (
            <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-700/70 px-2 py-0.5 rounded-sm shrink-0">
              ✓ EN COALICIÓN
            </span>
          ) : (
            <span className="text-[10px] font-mono text-slate-400 shrink-0">Fuerza distrital</span>
          )}
        </div>

        <div className="text-[11px] text-slate-300">
          Referente territorial: <span className="font-semibold text-amber-100">{referente}</span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-mono">
          <div className="p-2 rounded-sm bg-[#090d14] border border-[#1e293b]">
            <div className="text-[9px] text-slate-400 uppercase">Caudal propio</div>
            <div className="font-bold text-white mt-0.5">{party.sharePct.toFixed(1).replace('.', ',')} %</div>
          </div>
          <div className="p-2 rounded-sm bg-[#090d14] border border-[#1e293b]">
            <div className="text-[9px] text-slate-400 uppercase">Transferencia</div>
            <div className="font-bold text-emerald-400 mt-0.5">+{potentialBoost.toFixed(1).replace('.', ',')} %</div>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-[#1e293b]">
        <CoalitionActionFooter
          isInAlliance={isInAlliance}
          canAddMore={canAddMore}
          onFormAlliance={onFormAlliance}
          onBreakAlliance={onBreakAlliance}
        />
      </div>
    </div>
  );
}

function LocalActionCard({
  act,
  allowed,
  fatigueMult,
  onExecute
}: {
  act: LocalActionItem;
  allowed: boolean;
  fatigueMult: number;
  onExecute: (cost: number, boost: number) => void;
}) {
  const btnCls = allowed
    ? 'hoi-btn-gold'
    : 'bg-[#090d14] text-slate-500 border border-[#1e293b] cursor-not-allowed';

  return (
    <div className="hoi-panel rounded-sm p-4 flex flex-col justify-between space-y-3 hover:border-[#8a6d33] transition">
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-[#1e293b] pb-2">
          <span className="text-sm font-serif font-bold uppercase tracking-wide text-amber-100">
            {act.title}
          </span>
          <span className="px-2 py-0.5 rounded-sm bg-amber-950/30 border border-[#8a6d33]/80 font-mono font-bold text-[11px] text-amber-300">
            -${act.cost.toFixed(1).replace('.', ',')}M
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{act.description}</p>
        <div className="flex flex-wrap gap-1 pt-1">
          {act.badges.map((b) => (
            <span
              key={b}
              className="px-2 py-0.5 rounded-sm text-[9px] font-mono font-bold bg-[#090d14] border border-[#263142] text-emerald-400"
            >
              {scaleProvincialBadge(b, fatigueMult)}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-2 border-t border-[#1e293b]">
        <button
          type="button"
          disabled={!allowed}
          onClick={() => {
            playUiSound('atn');
            onExecute(act.cost, 1.8 * fatigueMult);
          }}
          className={`w-full py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition ${btnCls}`}
        >
          Ejecutar operación (-${act.cost.toFixed(1).replace('.', ',')}M)
        </button>
      </div>
    </div>
  );
}

function ProvincialActionsGrid({ budget, actionsLeft, onExecute }: ProvincialActionsGridProps) {
  const fatigueMult = computeProvincialFatigueMult(actionsLeft);

  return (
    <div className="space-y-4">
      <div className="hoi-panel rounded-sm px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div>
          CAJA DE CAMPAÑA LOCAL:{' '}
          <strong className="text-amber-300 text-sm">${budget.toFixed(1)}M argentums</strong>
        </div>
        <div className="text-slate-300">
          OPERACIONES DISPONIBLES ESTE MES:{' '}
          <strong className="text-emerald-400">{actionsLeft} / 4</strong>
          <span className="text-slate-500 ml-2">· Eficacia {Math.round(fatigueMult * 100)}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {LOCAL_ACTIONS.map((act) => (
          <LocalActionCard
            key={act.id}
            act={act}
            allowed={budget >= act.cost && actionsLeft > 0}
            fatigueMult={fatigueMult}
            onExecute={onExecute}
          />
        ))}
      </div>
    </div>
  );
}

function ProvincialElectorateBar({ prov }: { prov: DeepProvincialData }) {
  const { izq, centro, der } = prov.electorateBreakdown;
  return (
    <div className="hoi-panel rounded-sm p-4 space-y-2.5 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono font-bold uppercase tracking-wider text-amber-200">
          Composición Ideológica del Padrón de {prov.name}
        </span>
        <span className="font-mono text-[11px] text-slate-400">
          Izquierda <strong className="text-rose-400">{izq}%</strong> · Centro{' '}
          <strong className="text-sky-300">{centro}%</strong> · Derecha{' '}
          <strong className="text-amber-300">{der}%</strong>
        </span>
      </div>
      <div className="w-full h-2.5 rounded-sm overflow-hidden flex bg-[#090d14] border border-[#263142]">
        <div style={{ width: `${izq}%` }} className="bg-rose-500/80 h-full" />
        <div style={{ width: `${centro}%` }} className="bg-sky-500/80 h-full" />
        <div style={{ width: `${der}%` }} className="bg-amber-500/80 h-full" />
      </div>
      <p className="text-[11px] text-slate-400 leading-relaxed">
        Manejás la campaña distrital en cualquier fase de la partida: si algún mes no ejecutás operaciones,
        el comité local sostiene presencia mínima. Las operaciones provinciales impactan directo sobre la gobernación.
      </p>
    </div>
  );
}

function ProvincialCandidateProfilePanel({ prov }: { prov: DeepProvincialData }) {
  const gov =
    prov.gobernadorCandidates.find((c) => c.id === prov.selectedGobernadorId) ??
    prov.gobernadorCandidates[0];
  const vice =
    prov.viceCandidates.find((c) => c.id === prov.selectedViceId) ??
    prov.viceCandidates[0];
  const relevance = gov?.relevance ?? 32;
  const playerShare = resolvePlayerShare(prov.shares);

  return (
    <div className="hoi-panel rounded-sm p-5 space-y-4 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#263142] pb-2.5">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 block">
            DOSSIER DE INTELIGENCIA ELECTORAL
          </span>
          <h4 className="text-sm font-serif font-bold uppercase tracking-wide text-amber-100">
            Atributos del binomio: {gov?.name} — {vice?.name}
          </h4>
        </div>
        <span className="px-2.5 py-1 rounded-sm bg-[#090d14] border border-[#8a6d33] font-mono text-[11px] text-amber-200">
          Lealtad con Casa Rosada: {prov.loyaltyIndex}%
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center font-mono">
        <div className="p-3 rounded-sm bg-[#090d14] border border-[#263142]">
          <div className="text-slate-400 text-[10px] uppercase">Relevancia</div>
          <div className="text-lg font-extrabold text-amber-200 mt-1">{relevance} pts</div>
        </div>
        <div className="p-3 rounded-sm bg-[#090d14] border border-[#263142]">
          <div className="text-slate-400 text-[10px] uppercase">Estructura Local</div>
          <div className="text-lg font-extrabold text-sky-400 mt-1">
            {Math.min(95, Math.round(prov.loyaltyIndex * 0.85 + 12))} %
          </div>
        </div>
        <div className="p-3 rounded-sm bg-[#090d14] border border-[#263142]">
          <div className="text-slate-400 text-[10px] uppercase">Intención de Voto</div>
          <div className="text-lg font-extrabold text-emerald-400 mt-1">
            {playerShare.toFixed(1).replace('.', ',')} %
          </div>
        </div>
        <div className="p-3 rounded-sm bg-[#090d14] border border-[#263142]">
          <div className="text-slate-400 text-[10px] uppercase">Fiscalización Mesas</div>
          <div className="text-lg font-extrabold text-amber-300 mt-1">
            {Math.min(100, Math.round(relevance * 1.4 + 28))} %
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProvincialDrilldownProps {
  prov: DeepProvincialData;
  onBack: () => void;
  onUpdateProv: (updater: (p: DeepProvincialData) => DeepProvincialData) => void;
}

function ProvincialDrilldownHeader({
  prov,
  onBack
}: {
  prov: DeepProvincialData;
  onBack: () => void;
}) {
  return (
    <div className="hoi-panel hoi-header-steel rounded-sm p-4 space-y-3">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              playUiSound('tab');
              onBack();
            }}
            className="px-3 py-1.5 rounded-sm bg-[#090d14] border border-[#263142] hover:border-[#b89342] text-xs font-mono font-bold text-amber-100 transition inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-300" />
            Volver a turnos
          </button>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-300">
              COMANDO DE ELECCIÓN PROVINCIAL · TURNO {prov.turnYear}
            </div>
            <h1 className="text-xl md:text-2xl font-serif font-extrabold uppercase tracking-wide text-amber-100 mt-0.5">
              {prov.name}
            </h1>
          </div>
        </div>
        <div className="text-xs font-mono font-bold text-amber-200 bg-[#090d14] border border-[#8a6d33] px-3 py-1.5 rounded-sm">
          {prov.statusBadge}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-[#263142] text-xs font-mono text-slate-300">
        <span>
          Comicio a Gobernador: <strong className="text-amber-200">{prov.electionDate}</strong> · Mayoría / Balotaje Provincial
        </span>
        <span>
          Gobernador en ejercicio: <strong className="text-white">{prov.currentGovernor}</strong> ({prov.governingParty})
        </span>
      </div>
    </div>
  );
}

function applyLocalCampaignAction(
  prev: DeepProvincialData,
  cost: number,
  boostPct: number
): DeepProvincialData {
  const nextShares = prev.shares.map((s) => {
    if (s.isPlayer) {
      return { ...s, sharePct: Math.round((s.sharePct + boostPct) * 10) / 10 };
    }
    const deduction = boostPct / Math.max(1, prev.shares.length - 1);
    return { ...s, sharePct: Math.max(0.5, Math.round((s.sharePct - deduction) * 10) / 10) };
  });
  nextShares.sort((a, b) => b.sharePct - a.sharePct);

  return {
    ...prev,
    localBudgetArgentums: Math.max(0, Math.round((prev.localBudgetArgentums - cost) * 10) / 10),
    localActionsRemaining: Math.max(0, prev.localActionsRemaining - 1),
    shares: nextShares
  };
}

function ProvincialDrilldownSubTabs({
  subTab,
  actionsLeft,
  alliancesCount,
  onSelect
}: {
  subTab: 'CAMPAÑA' | 'COALICION' | 'PERFIL';
  actionsLeft: number;
  alliancesCount: number;
  onSelect: (t: 'CAMPAÑA' | 'COALICION' | 'PERFIL') => void;
}) {
  const tabs: Array<{ id: 'CAMPAÑA' | 'COALICION' | 'PERFIL'; label: string }> = [
    { id: 'CAMPAÑA', label: `Operaciones de Campaña (${actionsLeft}/4)` },
    { id: 'COALICION', label: `Coalición Distrital (${alliancesCount}/2)` },
    { id: 'PERFIL', label: 'Dossier del Binomio' }
  ];

  return (
    <div className="flex flex-wrap gap-1 border-b border-[#263142] pb-1">
      {tabs.map((tab) => {
        const isSelected = subTab === tab.id;
        const cls = isSelected
          ? 'bg-[#17253b] text-amber-100 border-b-2 border-[#b89342]'
          : 'text-slate-400 hover:text-slate-200 border-b-2 border-transparent';
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              playUiSound('tab');
              onSelect(tab.id);
            }}
            className={`px-4 py-2 rounded-t-sm text-xs font-mono font-bold uppercase tracking-wide transition ${cls}`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function ProvincialCoalitionPanel({
  prov,
  coalitionBanner,
  onClearBanner,
  onFormAlliance,
  onBreakAlliance
}: {
  prov: DeepProvincialData;
  coalitionBanner: string | null;
  onClearBanner: () => void;
  onFormAlliance: (target: ProvincialPartyShare) => void;
  onBreakAlliance: (partyName: string) => void;
}) {
  const alliances = prov.localAlliances ?? [];
  return (
    <div className="space-y-4">
      <div className="hoi-panel rounded-sm p-4 text-xs text-slate-300 space-y-1.5">
        <h4 className="text-sm font-serif font-bold uppercase tracking-wide text-amber-100">
          Pactos y Frentes Electorales en {prov.name}
        </h4>
        <p className="text-slate-400 leading-relaxed">
          Podés sellar alianza con hasta 2 fuerzas provinciales o vecinalistas para apuntalar tu
          fórmula a la gobernación. Cada espacio aliado transfiere el 60 % de su caudal directo a tu boleta.
        </p>
      </div>

      {coalitionBanner ? (
        <div className="rounded-sm p-3 bg-amber-950/50 border border-[#b89342] text-amber-100 text-xs font-mono flex items-center justify-between">
          <span>{coalitionBanner}</span>
          <button
            type="button"
            onClick={onClearBanner}
            className="text-amber-300 hover:text-white font-bold ml-2"
          >
            ✕
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {prov.shares
          .filter((s) => !s.isPlayer)
          .map((party) => {
            const isInAlliance = alliances.includes(party.partyName);
            const canAddMore = alliances.length < 2 || isInAlliance;
            return (
              <ProvincialCoalitionCard
                key={party.partyName}
                party={party}
                isInAlliance={isInAlliance}
                canAddMore={canAddMore}
                onFormAlliance={() => onFormAlliance(party)}
                onBreakAlliance={() => onBreakAlliance(party.partyName)}
              />
            );
          })}
      </div>
    </div>
  );
}

function validateAllianceProposal(prov: DeepProvincialData, target: ProvincialPartyShare): string | null {
  if ((prov.localAlliances ?? []).length >= 2) {
    return 'Ya alcanzaste el límite máximo de 2 coaliciones distritales.';
  }
  if (isPartyIncompatible(target.partyName)) {
    return `${target.partyName} rechazó la alianza distrital por diferencias ideológicas.`;
  }
  return null;
}

function ProvincialDrilldownView({ prov, onBack, onUpdateProv }: ProvincialDrilldownProps) {
  const [subTab, setSubTab] = useState<'CAMPAÑA' | 'COALICION' | 'PERFIL'>('CAMPAÑA');
  const [coalitionBanner, setCoalitionBanner] = useState<string | null>(null);

  const handleExecuteAction = (cost: number, boostPct: number) => {
    onUpdateProv((prev) => applyLocalCampaignAction(prev, cost, boostPct));
  };

  const handleFormAlliance = (target: ProvincialPartyShare) => {
    const errorMsg = validateAllianceProposal(prov, target);
    if (errorMsg) {
      setCoalitionBanner(errorMsg);
      return;
    }
    const transfer = Math.max(0.3, Math.round(target.sharePct * 0.6 * 10) / 10);
    onUpdateProv((prev) => ({
      ...prev,
      localAlliances: [...(prev.localAlliances ?? []), target.partyName],
      shares: transferAllianceVotes(prev.shares, target.partyName, transfer)
    }));
    setCoalitionBanner(
      `¡Alianza confirmada con ${target.partyName}! Aporta +${transfer.toFixed(1).replace('.', ',')} % a tu fórmula.`
    );
  };

  const handleBreakAlliance = (targetParty: string) => {
    onUpdateProv((prev) => ({
      ...prev,
      localAlliances: (prev.localAlliances ?? []).filter((name) => name !== targetParty),
      shares: returnAllianceVotes(prev.shares, targetParty)
    }));
    setCoalitionBanner(`Rompiste la alianza distrital con ${targetParty}. Tu fórmula pierde intención de voto.`);
  };

  return (
    <div className="space-y-5 rosca-panel-enter">
      <ProvincialDrilldownHeader prov={prov} onBack={onBack} />
      <ProvincialVoteBar shares={prov.shares} />

      <ProvincialFormulaSelector
        prov={prov}
        onChangeGobernador={(id) => onUpdateProv((prev) => ({ ...prev, selectedGobernadorId: id }))}
        onChangeVice={(id) => onUpdateProv((prev) => ({ ...prev, selectedViceId: id }))}
      />

      <ProvincialElectorateBar prov={prov} />

      <div className="space-y-4">
        <ProvincialDrilldownSubTabs
          subTab={subTab}
          actionsLeft={prov.localActionsRemaining}
          alliancesCount={prov.localAlliances?.length ?? 0}
          onSelect={setSubTab}
        />

        {subTab === 'CAMPAÑA' ? (
          <ProvincialActionsGrid
            budget={prov.localBudgetArgentums}
            actionsLeft={prov.localActionsRemaining}
            onExecute={handleExecuteAction}
          />
        ) : null}

        {subTab === 'COALICION' ? (
          <ProvincialCoalitionPanel
            prov={prov}
            coalitionBanner={coalitionBanner}
            onClearBanner={() => setCoalitionBanner(null)}
            onFormAlliance={handleFormAlliance}
            onBreakAlliance={handleBreakAlliance}
          />
        ) : null}

        {subTab === 'PERFIL' ? <ProvincialCandidateProfilePanel prov={prov} /> : null}
      </div>
    </div>
  );
}

interface TurnCardProps {
  prov: DeepProvincialData;
  onOpen: (id: string) => void;
}

function checkIsPlayerLeading(shares: ProvincialPartyShare[]): { playerShare: number; isLeading: boolean } {
  let playerShare = 0;
  let topRival = 0;
  for (const s of shares) {
    if (s.isPlayer) {
      playerShare = s.sharePct;
    } else if (s.sharePct > topRival) {
      topRival = s.sharePct;
    }
  }
  return {
    playerShare,
    isLeading: playerShare > topRival && playerShare > 0
  };
}

function TurnCardItem({ prov, onOpen }: TurnCardProps) {
  const { playerShare, isLeading } = checkIsPlayerLeading(prov.shares);
  const borderClass = isLeading ? 'border-[#b89342] shadow-md shadow-amber-950/30' : 'border-[#263142]';
  const shareText = playerShare > 0 ? `${playerShare.toFixed(1).replace('.', ',')} %` : 'sin datos';

  return (
    <div
      onClick={() => {
        playUiSound('select');
        onOpen(prov.id);
      }}
      className="hoi-panel rounded-sm p-4 flex flex-col justify-between text-center gap-3 hover:border-[#b89342] cursor-pointer transition group"
    >
      <div>
        <h4 className="font-extrabold text-white text-sm group-hover:text-amber-200 transition leading-tight">
          {prov.name}
        </h4>
        <div className="text-[10px] font-mono text-slate-400 mt-0.5">{prov.electionDate}</div>
      </div>

      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
        <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center flex-col ${borderClass}`}>
          <span className="text-xs font-mono font-extrabold text-white">{shareText}</span>
          <span className="text-[8px] text-slate-500">tu fórmula</span>
        </div>
      </div>

      {isLeading ? (
        <div className="text-[9px] font-mono font-extrabold text-emerald-300 bg-emerald-950/80 border border-emerald-700/70 rounded-sm px-1.5 py-0.5 inline-block mx-auto">
          Lidera tu fórmula
        </div>
      ) : null}

      <div className="border-t border-[#263142] pt-2 space-y-1">
        <div className="text-[9px] font-mono uppercase font-bold text-slate-400 tracking-wider">
          Fórmula desde {prov.formulaOpensDate.toUpperCase()}
        </div>
        <div className="text-[10px] font-mono font-bold text-amber-300 group-hover:underline inline-flex items-center justify-center gap-1">
          Ver campaña y fórmula
          <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}

export interface CampaignPartidoProvinciasViewProps {
  state?: CampaignSimulationState;
}

export function CampaignPartidoProvinciasView({ state }: CampaignPartidoProvinciasViewProps) {
  const [selectedTurn, setSelectedTurn] = useState<'2028' | '2029' | '2030' | '2031' | 'MAPA'>('2028');
  const [provincesMap, setProvincesMap] = useState<Record<string, DeepProvincialData>>(
    INITIAL_PROVINCES_CATALOG
  );
  const [selectedProvinceId, setSelectedProvinceId] = useState<string | null>(null);
  const prevMonthRef = useRef<number | undefined>(state?.stage?.currentMonthIndex);

  useEffect(() => {
    const monthIndex = state?.stage?.currentMonthIndex;
    if (monthIndex !== undefined && monthIndex !== prevMonthRef.current) {
      prevMonthRef.current = monthIndex;
      setProvincesMap((prev) => {
        const next: Record<string, DeepProvincialData> = {};
        for (const [key, val] of Object.entries(prev)) {
          next[key] = {
            ...val,
            localActionsRemaining: 4,
            localBudgetArgentums: Math.round((val.localBudgetArgentums + 12.0) * 10) / 10
          };
        }
        return next;
      });
    }
  }, [state?.stage?.currentMonthIndex]);

  const allProvinces = Object.values(provincesMap);
  const activeTurnProvinces =
    selectedTurn !== 'MAPA' ? allProvinces.filter((p) => p.turnYear === selectedTurn) : [];

  const handleUpdateProvince = (updater: (p: DeepProvincialData) => DeepProvincialData) => {
    if (!selectedProvinceId) return;
    setProvincesMap((prev) => {
      const current = prev[selectedProvinceId];
      if (!current) return prev;
      return {
        ...prev,
        [selectedProvinceId]: updater(current)
      };
    });
  };

  if (selectedProvinceId && provincesMap[selectedProvinceId]) {
    return (
      <ProvincialDrilldownView
        prov={provincesMap[selectedProvinceId]!}
        onBack={() => setSelectedProvinceId(null)}
        onUpdateProv={handleUpdateProvince}
      />
    );
  }

  return (
    <div className="space-y-5 rosca-panel-enter">
      <SectionPageHeader
        eyebrow="Político · Estructura Federal"
        title="Partido en las provincias"
        description="Cronograma constitucional de las 24 gobernaciones y comandos locales."
        icon={<Flag className="w-4 h-4 text-amber-300" />}
      />

      <div className="hoi-panel hoi-header-steel rounded-sm p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-[#162233] border border-[#344661] flex items-center justify-center shrink-0">
            <Landmark className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Comando de campaña provincial</h3>
            <p className="text-xs text-slate-300">
              Manejás las fórmulas, las coaliciones y las campañas de tus candidatos provinciales en cualquier fase.
            </p>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed border-t border-[#263142] pt-3">
          Las 24 jurisdicciones votan en cuatro turnos de 6 (2028, 2029, 2030 y 2031, y cada cuatro
          años después): en 2027 no se elige ningún gobernador. La fórmula se elige un año antes de
          cada elección. Hacé clic en cualquier provincia para gestionar su binomio y sus acciones.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['Turno 2028', 'Turno 2029', 'Turno 2030', 'Turno 2031', 'Mapa de gobernadores'] as const).map(
          (tabLabel) => {
            const tabKey =
              tabLabel === 'Mapa de gobernadores'
                ? 'MAPA'
                : (tabLabel.replace('Turno ', '') as '2028' | '2029' | '2030' | '2031');
            const isSelected = selectedTurn === tabKey;
            return (
              <button
                key={tabLabel}
                type="button"
                onClick={() => {
                  playUiSound('tab');
                  setSelectedTurn(tabKey);
                }}
                className={`px-4 py-2 rounded-sm text-xs font-mono font-bold transition border ${
                  isSelected
                    ? 'bg-[#1d3250] text-amber-100 border-[#b89342]'
                    : 'bg-[#090d14] text-slate-300 border-[#263142] hover:border-slate-500'
                }`}
              >
                {tabLabel}
              </button>
            );
          }
        )}
      </div>

      {selectedTurn === 'MAPA' ? (
        <div className="hoi-panel rounded-sm overflow-hidden">
          <div className="p-4 border-b border-[#263142]">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
              Mapa de los 24 Gobernadores e Intervención Federal (Art. 6 CN)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Las 24 provincias divididas en los cuatro turnos constitucionales.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090d14] border-b border-[#263142] text-[10px] font-mono font-bold uppercase text-slate-400">
                <tr>
                  <th className="py-3 px-4">Provincia</th>
                  <th className="py-3 px-4">Turno Electoral</th>
                  <th className="py-3 px-4">Gobernador Actual</th>
                  <th className="py-3 px-4">Espacio Político</th>
                  <th className="py-3 px-4 text-center">Lealtad Rosca</th>
                </tr>
              </thead>
              <tbody>
                {allProvinces.map((prov) => (
                  <tr
                    key={prov.id}
                    onClick={() => {
                      playUiSound('select');
                      setSelectedProvinceId(prov.id);
                    }}
                    className="border-b border-[#263142]/60 hover:bg-[#131d2d] cursor-pointer transition"
                  >
                    <td className="py-3 px-4 font-bold text-white">{prov.name}</td>
                    <td className="py-3 px-4 font-mono text-amber-300">{prov.turnYear}</td>
                    <td className="py-3 px-4 text-slate-300">{prov.currentGovernor}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold bg-[#090d14] border border-[#263142] text-slate-300">
                        {prov.governingParty}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-sky-400">
                      {prov.loyaltyIndex} %
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {activeTurnProvinces.map((prov) => (
            <TurnCardItem
              key={prov.id}
              prov={prov}
              onOpen={(id) => setSelectedProvinceId(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
