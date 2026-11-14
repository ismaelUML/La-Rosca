import type { SimulationState } from '../models/SimulationTypes.js';
import {
  govAvgGovernorLoyalty,
  govAvgStrikeConflict,
  type GovernmentEventCategory,
  type GovernmentEventDefinition,
  type GovernmentEventEffects,
  type GovernmentEventOption
} from './governmentEventsCatalog.js';

function opt(
  id: string,
  title: string,
  description: string,
  effects: Partial<GovernmentEventEffects>
): GovernmentEventOption {
  return { id, title, description, effects };
}

function mkEvt(
  id: string,
  title: string,
  description: string,
  category: GovernmentEventCategory,
  weight: (state: SimulationState) => number,
  options: GovernmentEventOption[],
  repeatable = true
): GovernmentEventDefinition {
  return { id, title, description, category, repeatable, weight, options };
}

const wAlways = () => 1;
const wMarketStress = (s: SimulationState) => (s.countryRiskEmbiPb > 750 ? 3 : 1);
const wLowReserves = (s: SimulationState) => (s.centralBank.grossReservesBillionUsd < 28 ? 3 : 0);
const wHighBrecha = (s: SimulationState) => (s.centralBank.exchangeBrechaPct > 15 ? 3 : 1);
const wStrikeHeat = (s: SimulationState) => (govAvgStrikeConflict(s) > 45 ? 3 : 1);
const wLowApproval = (s: SimulationState) => (s.publicOpinion.managementApprovalPct < 45 ? 3 : 1);
const wLowLoyalty = (s: SimulationState) => (govAvgGovernorLoyalty(s) < 55 ? 3 : 1);
const wJudicial = (s: SimulationState) => (s.judicial.cautelaresBlockingDnuCount >= 1 ? 3 : 1);
const wSummer = (s: SimulationState) => ([12, 1, 2].includes(s.currentMonthOfYear) ? 3 : 0);
const wWinter = (s: SimulationState) => ([6, 7, 8].includes(s.currentMonthOfYear) ? 3 : 0);
const wCampaign = (s: SimulationState) => (s.currentYear === 2029 || s.currentYear === 2031 ? 3 : 0);

// Catálogo ampliado de 105 eventos dinámicos de gobierno condicionados por el estado del juego.
export const GOVERNMENT_EVENTS_EXPANSION_105: GovernmentEventDefinition[] = [
  // A. Economía, Corridas, Deuda y Mercados (E01-E20)
  mkEvt('VENCIMIENTO_BONO_WALL_STREET_DURO', 'Pared de vencimientos en Wall Street', 'Se acumulan USD 4.500 M de bonos Globales sin rollover fluido en Nueva York.', 'ECONOMIA', wLowReserves, [
    opt('PAGAR_NETAS', 'Pagar con reservas netas', 'Cumplís al día pero dejás seco el balance del BCRA.', { grossReservesBillionUsd: -3.5, countryRiskPb: -40, anchorCredibility: 3 }),
    opt('CANJE_LOCAL', 'Canje caro con bancos locales', 'Estirás el perfil pagando tasa alta en el mercado doméstico.', { countryRiskPb: 55, anchorCredibility: -2, expectationPts: -1 }),
    opt('PUENTE_FMI', 'Negociar puente extraordinario con el FMI', 'Alivio inmediato bajo metas fiscales más estrictas.', { grossReservesBillionUsd: 2.0, approvalPts: -2, anchorCredibility: 2 })
  ]),
  mkEvt('CORRIDA_BANCARIA_RUMOR_CORRALITO', 'Rumor viral de corralito bancario', 'Cadenas masivas aseguran que se restringen retiros de argendólares en ventanilla.', 'ECONOMIA', wHighBrecha, [
    opt('BILLETES_TASA', 'Mostrar billetes y subir tasa bancaria', 'Cortás el pánico con liquidez visible y premio al peso.', { grossReservesBillionUsd: -1.4, anchorCredibility: 4, unemploymentPct: 0.2 }),
    opt('CADENA_MULTA', 'Cadena nacional y multa a bancos', 'Buscás culpables afuera pero el mercado sospecha.', { countryRiskPb: 90, approvalPts: -1, brechaPct: 5 }),
    opt('FERIADO_CAMBIARIO', 'Feriado cambiario de 48 horas', 'Congelás la salida hoy y disparás el dólar paralelo.', { brechaPct: 14, anchorCredibility: -7, approvalPts: -4 })
  ]),
  mkEvt('FONDOS_BUITRE_EMBARGO_EMBAJADA', 'Cautelar de fondos buitre en Nueva York', 'Un juzgado neoyorquino habilita embargos por un juicio soberano heredado.', 'EXTERNO', wMarketStress, [
    opt('ACUERDO_CONFIDENCIAL', 'Negociar quita confidencial con pago', 'Cerrás el frente judicial a cambio de caja.', { grossReservesBillionUsd: -1.1, countryRiskPb: -50, anchorCredibility: 2 }),
    opt('APELAR_CONGELAR', 'Apelar y congelar todo giro', 'Defensa dura que eleva la prima de riesgo externo.', { countryRiskPb: 110, approvalPts: 1, anchorCredibility: -3 }),
    opt('BONO_ARREGLO', 'Emitir bono largo de consolidación', 'Pateás la factura financiera con mayor stock de deuda.', { countryRiskPb: 25, anchorCredibility: 1 })
  ]),
  mkEvt('RECALIFICACION_EMERGING_MARKETS', 'Evaluación MSCI de Mercado Emergente', 'MSCI evalúa reclasificar a la Argentina tras los avances en apertura cambiaria.', 'EXTERNO', wAlways, [
    opt('SOSTENER_APERTURA', 'Sostener apertura aunque vibre el dólar', 'Señal pro-mercado que atrae fondos indexados.', { countryRiskPb: -70, brechaPct: 3, anchorCredibility: 4 }),
    opt('FRENAR_CEPO', 'Frenar la apertura por prudencia', 'Evitás sobresalto cambiario y perdés el ascenso.', { brechaPct: -3, countryRiskPb: 45, expectationPts: -2 })
  ], false),
  mkEvt('CAIDA_BRUTAL_PRECIO_SOJA', 'Derrumbe global de la soja', 'Una supercosecha en Estados Unidos y Brasil hunde la soja a USD 310 la tonelada.', 'ECONOMIA', wAlways, [
    opt('BAJAR_RETENCIONES_EMG', 'Bajar retenciones de emergencia', 'Cuidás márgenes del productor sacrificando caja fiscal.', { grossReservesBillionUsd: 0.7, approvalPts: 2, anchorCredibility: -2 }),
    opt('DEVALUAR_ESCALON', 'Acelerar un escalón cambiario', 'Devolvés competitividad exportadora pero recalienta precios.', { brechaPct: -4, approvalPts: -3, anchorCredibility: -3 }),
    opt('AJUSTAR_GASTO', 'Recortar partidas para compensar caja', 'El campo protesta y el mercado valora la solvencia.', { countryRiskPb: -30, unemploymentPct: 0.3, approvalPts: -2 })
  ]),
  mkEvt('BOOM_COMMODITIES_LITIO_COBRE', 'Rally mundial de litio y cobre', 'Escasez global dispara más de 40% la cotización de minerales críticos andinos.', 'ECONOMIA', wAlways, [
    opt('CAPTURAR_REGALIAS', 'Negociar mayor captura vía regalías', 'Más ingresos hoy y fricción con proyectos nuevos.', { grossReservesBillionUsd: 1.5, countryRiskPb: 20, governorLoyaltyPts: 3 }),
    opt('ACELERAR_RIGI', 'Acelerar permisos RIGI sin cambios', 'Lluvia de anuncios privados a mediano plazo.', { grossReservesBillionUsd: 2.2, countryRiskPb: -35, expectationPts: 3 }),
    opt('FONDO_ANTICICLICO', 'Ahorrar divisas en fondo anticíclico', 'Construís colchón soberano estable.', { anchorCredibility: 5, countryRiskPb: -45 })
  ]),
  mkEvt('DEVALUACION_BRASIL_REAL_650', 'Fuerte devaluación del real en Brasil', 'El real brasileño se deprecia abruptamente y abarata importaciones industriales.', 'EXTERNO', wAlways, [
    opt('ACELERAR_CRAWL', 'Acelerar el crawling peg local', 'Aliviás la industria exportadora con presión en góndolas.', { brechaPct: 4, anchorCredibility: -3, unemploymentPct: -0.2 }),
    opt('ARANCEL_COMPENSATORIO', 'Subir aranceles compensatorios', 'Protegés fábricas del GBA generando ruido en Mercosur.', { unemploymentPct: -0.3, countryRiskPb: 35, approvalPts: 1 }),
    opt('AGUANTAR_TCR', 'Sostener tipo de cambio real firme', 'Usás bienes baratos para anclar inflación pese al reclamo fabril.', { anchorCredibility: 3, unemploymentPct: 0.3, approvalPts: -1 })
  ]),
  mkEvt('QUIEBRA_BANCO_MEDIANO_PROVINCIAL', 'Estrés de liquidez en banco regional', 'Una entidad provincial queda ilíquida tras una caída abrupta de títulos públicos.', 'ECONOMIA', wMarketStress, [
    opt('RESCATE_BCRA', 'Redescuento de rescate del BCRA', 'Evitás contagio bancario con costo cuasifiscal.', { grossReservesBillionUsd: -0.6, anchorCredibility: -3, approvalPts: 1 }),
    opt('ABSORCION_BNA', 'Absorción ordenada por Banco Nación', 'Protegés depositantes cargando activos en banca pública.', { countryRiskPb: 30, approvalPts: 2, anchorCredibility: -1 }),
    opt('LIQUIDACION_ORDENADA', 'Liquidación aplicando garantía SEDESA', 'Señal estricta de mercado con ruido local.', { anchorCredibility: 4, approvalPts: -3, governorLoyaltyPts: -4 })
  ]),
  mkEvt('DISPARADA_BRECHA_CCL_45', 'Salto del CCL por ruido político', 'El dólar financiero perfora la banda superior y reabre expectativas de salto cambiario.', 'ECONOMIA', wHighBrecha, [
    opt('INTERVENIR_BONOS', 'Intervenir con venta de bonos AL30', 'Enfriás el MEP/CCL quemando poder de fuego.', { brechaPct: -8, grossReservesBillionUsd: -1.1, anchorCredibility: -1 }),
    opt('SUBIR_TASA_800PB', 'Subir tasa de referencia 800 pb', 'Apretás pesos y enfriás el nivel de actividad.', { brechaPct: -6, unemploymentPct: 0.4, anchorCredibility: 4 }),
    opt('IGNORAR_EMISION_CERO', 'Mantener emisión cero y no intervenir', 'Mostrás convicción ortodoxa mientras sube la brecha.', { brechaPct: 7, anchorCredibility: 2, approvalPts: -2 })
  ]),
  mkEvt('INFLACION_REBOTA_ALIMENTARIOS', 'Rebote inflacionario en alimentos', 'Carne y estacionales vuelven a empujar el IPC por encima de la meta mensual.', 'ECONOMIA', wAlways, [
    opt('IMPORTAR_CARNE', 'Abrir importación exprés de canasta', 'Bajás precios rápido enfrentando quejas rurales.', { anchorCredibility: 2, approvalPts: 2, governorLoyaltyPts: -3 }),
    opt('ANCLA_SIN_INTERVENIR', 'Sostener ancla fiscal sin controles', 'Evitás distorsiones mientras aguantás desgaste en calle.', { anchorCredibility: 3, approvalPts: -3 }),
    opt('PACTO_SUPERMERCADOS', 'Acuerdo voluntario con supermercados', 'Alivio corto que recuerda esquemas del pasado.', { approvalPts: 1, expectationPts: -1, anchorCredibility: -2 })
  ]),
  mkEvt('PARATE_CONSTRUCCION_CONURBANO', 'Freno brusco de obra en el Conurbano', 'El desempleo en la construcción marca pico tras la paralización de obra pública.', 'SOCIAL', wLowApproval, [
    opt('LINEA_HIPOTECARIA', 'Lanzar crédito hipotecario privado', 'Reactiva demanda genuina sin romper superávit.', { unemploymentPct: -0.4, approvalPts: 2, expectationPts: 2 }),
    opt('RELAUNCH_OBRAS', 'Reactivar obras puntuales con intendentes', 'Bajás conflicto territorial con impacto fiscal.', { governorLoyaltyPts: 6, unemploymentPct: -0.5, countryRiskPb: 35 }),
    opt('MANTENER_CERO_OBRA', 'Mantener recorte total en obra', 'Preservás caja fiscal bajo fuerte costo social.', { anchorCredibility: 3, approvalPts: -3, strikeConflictPts: 5 })
  ]),
  mkEvt('HUIDA_DEPOSITOS_FONDOS_MONEY_MARKET', 'Desarme masivo de fondos Money Market', 'Inversores institucionales desarman liquidez en pesos hacia el dólar MEP.', 'ECONOMIA', wHighBrecha, [
    opt('ENCAJES_DUAL', 'Subir encajes y licitar bono dólar-linked', 'Contenés la corrida asumiendo mayor carga futura.', { brechaPct: -6, countryRiskPb: 25, anchorCredibility: 1 }),
    opt('FLOTACION_PURA', 'Dejar ajustar al dólar libre', 'Sin costo patrimonial del BCRA pero golpea precios.', { brechaPct: 8, grossReservesBillionUsd: 0.4, approvalPts: -3 })
  ]),
  mkEvt('ANUNCIO_MEGAPLANTA_IA_PATAGONIA', 'Megaproyecto de Data Center IA en Patagonia', 'Consorcio global ofrece USD 3.000 M si garantizás estabilidad y energía limpia dedicada.', 'ECONOMIA', wAlways, [
    opt('EXENCION_TOTAL_ENERGIA', 'Otorgar exención plena y nodo dedicado', 'Asegurás la inversión récord y divisas frescas.', { grossReservesBillionUsd: 2.0, countryRiskPb: -30, expectationPts: 3 }),
    opt('EXIGIR_COMPRE_LOCAL', 'Exigir integración nacional y capacitación', 'Más empleo tecnológico local con menor desembolso inicial.', { unemploymentPct: -0.4, approvalPts: 2, grossReservesBillionUsd: 0.8 })
  ], false),
  mkEvt('CIERRE_CADENA_TEXTIL_HISTORICA', 'Quiebra de textil emblemática', 'Una planta con 1.200 operarios presenta concurso preventivo ante la competencia externa.', 'SOCIAL', wStrikeHeat, [
    opt('CREDITO_BNA_SALVATAJE', 'Crédito puente blando del Banco Nación', 'Salvas empleos en el distrito comprometiendo eficiencia.', { unemploymentPct: -0.2, approvalPts: 2, anchorCredibility: -3 }),
    opt('LIQUIDACION_SEGURO', 'Dejar quebrar con seguro de desempleo', 'Señal de competencia abierta con alto costo gremial.', { anchorCredibility: 3, strikeConflictPts: 6, approvalPts: -3 }),
    opt('RECONVERSION_SUBSIDIO', 'Subsidio condicionado a reconversión', 'Transición pactada con sindicato y empresa.', { approvalPts: 1, countryRiskPb: 15, unemploymentPct: -0.1 })
  ]),
  mkEvt('RECLAMO_MOROSIDAD_PROVEEDORES_ESTADO', 'Corte de entregas por deuda estatal', 'Farmacéuticas y constructoras suspenden provisión reclamando facturas impagas.', 'ECONOMIA', wAlways, [
    opt('BONO_3_ANIOS', 'Emitir bono de cancelación a 3 años', 'Normalizás entregas sin usar caja corriente.', { countryRiskPb: 40, anchorCredibility: 1, approvalPts: 1 }),
    opt('PAGO_REASIGNANDO', 'Pagar al contado recortando otra partida', 'Limpiás deuda rápido con tensión interna.', { anchorCredibility: 3, governorLoyaltyPts: -3 }),
    opt('AUDITAR_PRIMERO', 'Auditar sobreprecios antes de liberar', 'Aplauso de opinión pública y demora de suministros.', { approvalPts: 2, blackoutRiskPct: 3 })
  ]),
  mkEvt('GUERRA_COMERCIAL_ARANCELES_EEUU', 'Aranceles de Washington a metal y biodiésel', 'Estados Unidos impone sobretasas a exportaciones de aluminio y biodiésel argentino.', 'EXTERNO', wAlways, [
    opt('NEGOCIAR_CUOTA', 'Negociar cuota cediendo en patentes', 'Salvas exportaciones clave con concesión regulatoria.', { grossReservesBillionUsd: 0.6, approvalPts: -1, countryRiskPb: -15 }),
    opt('REDIRIGIR_ASIA_UE', 'Redirigir embarques hacia Asia y Europa', 'Diversificás mercados con demora comercial inicial.', { grossReservesBillionUsd: -0.5, expectationPts: 1 })
  ]),
  mkEvt('BOOM_TURISTICO_POR_ATRASO_INVERSO', 'Ola de turismo emisivo a Brasil y Chile', 'El peso apreciado dispara compras y viajes al exterior, drenando divisas por servicios.', 'ECONOMIA', wLowReserves, [
    opt('PERCEPCION_TARJETA', 'Reponer percepción a consumos en dólares', 'Frenás drenaje de divisas a costa de malhumor de clase media.', { grossReservesBillionUsd: 1.2, approvalPts: -4, brechaPct: 5 }),
    opt('DEJAR_COMPETIR', 'Sostener tipo de cambio y bajar aranceles', 'Abaratás bienes locales con pérdida neta en turismo.', { grossReservesBillionUsd: -1.3, anchorCredibility: 2, approvalPts: 2 })
  ]),
  mkEvt('CRISIS_FINANCIAMIENTO_PYME_CHEQUES', 'Pico de cheques rechazados en PyMEs', 'La cadena de pagos comercial se tensa con fuerte suba en mora de cheques diferidos.', 'ECONOMIA', wMarketStress, [
    opt('BAJAR_TASA_REF', 'Recortar tasa de política monetaria', 'Oxigenás el crédito local asumiendo riesgo cambiario.', { unemploymentPct: -0.3, brechaPct: 5, anchorCredibility: -2 }),
    opt('GARANTIA_FOGAR', 'Ampliar garantías FOGAR de emergencia', 'Sostenés pymes viables sin emitir base monetaria.', { unemploymentPct: -0.2, countryRiskPb: 15, approvalPts: 2 }),
    opt('DEPURACION_MERCADO', 'No intervenir y dejar limpiar cartera', 'Preservás hoja de balance monetaria con cierres fabriles.', { anchorCredibility: 3, unemploymentPct: 0.4, approvalPts: -3 })
  ]),
  mkEvt('INFORME_INDEC_POBREZA_SUBA', 'Dato semestral de pobreza e indigencia en alza', 'El INDEC publica un incremento sensible de la vulnerabilidad en el Gran Buenos Aires.', 'SOCIAL', wLowApproval, [
    opt('REFUERZO_AUH_TARJETA', 'Reforzar AUH y Tarjeta Alimentar ya', 'Contenés urgencia social subiendo el gasto corriente.', { approvalPts: 3, countryRiskPb: 35, strikeConflictPts: -6 }),
    opt('RELATO_SINCERAMIENTO', 'Enfatizar sinceramiento de precios heredado', 'Cuidás meta fiscal con desgaste emocional en la sociedad.', { anchorCredibility: 2, approvalPts: -4 }),
    opt('MESA_SOCIAL', 'Convocar mesa social con credos e intendentes', 'Ganás respaldo territorial sin comprometer caja grande.', { approvalPts: 1, governorLoyaltyPts: 3, strikeConflictPts: -3 })
  ]),
  mkEvt('COMPRA_MULTINACIONAL_BANCO_LOCAL', 'Oferta extranjera de USD 1.800 M por banco local', 'Grupo financiero europeo pide autorización para adquirir una gran red bancaria privada.', 'ECONOMIA', wAlways, [
    opt('APROBAR_SIN_TRABAS', 'Autorizar operación con celeridad', 'Ingresan divisas de inversión directa y baja el riesgo.', { grossReservesBillionUsd: 1.8, countryRiskPb: -30, anchorCredibility: 2 }),
    opt('EXIGIR_CREDITO_PYME', 'Condicionar a líneas blandas para PyMEs', 'Menor ingreso financiero inicial, mayor crédito productivo.', { grossReservesBillionUsd: 1.0, unemploymentPct: -0.2, approvalPts: 2 })
  ]),

  // B. Calle, Gremios, Piquetes y Conflictos Sectoriales (E21-E38)
  mkEvt('PARO_CAMIONEROS_DESABASTECIMIENTO', 'Bloqueo de Camioneros en centros logísticos', 'Frenan distribución de combustibles y alimentos exigiendo reapertura salarial inmediata.', 'SOCIAL', wStrikeHeat, [
    opt('GENDARMERIA_CONCILIACION', 'Conciliación y Gendarmería en playones', 'Destrabás el suministro con choque gremial directo.', { strikeConflictPts: 6, approvalPts: 2, expectationPts: 2 }),
    opt('HOMOLOGAR_SUBA', 'Homologar paritaria extraordinaria', 'Normalizás surtidores perforando la pauta antiinflacionaria.', { strikeConflictPts: -15, anchorCredibility: -5, countryRiskPb: 45 }),
    opt('PYMES_TRANSPORTISTAS', 'Contratar flota de pymes independientes', 'Rompés monopolio sindical pagando prima logística.', { strikeConflictPts: -5, unemploymentPct: -0.1, approvalPts: 1 })
  ]),
  mkEvt('TOMA_PLANTA_NEUMATICOS', 'Toma sindical en fábrica de neumáticos', 'Un gremio combativo bloquea portones y frena exportaciones automotrices.', 'SOCIAL', wStrikeHeat, [
    opt('DESALOJO_FIRME', 'Ordenar desalojo judicial inmediato', 'Defendés derecho de propiedad con alto voltaje mediático.', { approvalPts: 2, strikeConflictPts: 4, judicialInterference: -2 }),
    opt('LIBERAR_CUBIERTAS', 'Bajar a cero arancel de cubiertas importadas', 'Disciplinás precios locales debilitando la presión gremial.', { anchorCredibility: 3, unemploymentPct: 0.2, approvalPts: 1 }),
    opt('MEDIACION_TRABAJO', 'Instalar mesa permanente de mediación', 'Solución lenta con concesiones mutuas.', { strikeConflictPts: -8, expectationPts: 1 })
  ]),
  mkEvt('LOCKOUT_CAMPO_NO_LIQUIDACION', 'Cese de comercialización rural por 15 días', 'La Mesa de Enlace frena ventas en puerto reclamando por retenciones y brecha.', 'ECONOMIA', wHighBrecha, [
    opt('BAJAR_RETENCIONES_3PT', 'Recortar 3 puntos las retenciones', 'Acelerás liquidación inmediata resignando caja.', { grossReservesBillionUsd: 1.6, anchorCredibility: -2, governorLoyaltyPts: 4 }),
    opt('REPO_BANCOS', 'Aguantar con repo de bancos internacionales', 'Preservás regla fiscal sumando costo financiero.', { grossReservesBillionUsd: 1.0, countryRiskPb: 30, approvalPts: -1 }),
    opt('AMENAZAR_CUPOS', 'Advertir cierre de registros de exportación', 'Tensión máxima con el campo y fuerte ruido de mercado.', { countryRiskPb: 85, anchorCredibility: -6, approvalPts: -2 })
  ]),
  mkEvt('PARO_AEROPORTOS_VACACIONES_INVIERNO', 'Paro aeronáutico en plena temporada', 'Gremios de rampa y pilotos cancelan vuelos dejando miles de turistas varados.', 'SOCIAL', wWinter, [
    opt('DESREGULAR_RAMPAS', 'Desregular servicios de rampa y terceros', 'Golpe estructural al monopolio sindical en aeropuertos.', { approvalPts: 4, strikeConflictPts: 5, anchorCredibility: 2 }),
    opt('NEGOCIAR_BONOS', 'Conceder bono para levantar medidas ya', 'Descomprimís aeropuertos pero premiás el paro.', { strikeConflictPts: -10, approvalPts: -2, anchorCredibility: -3 }),
    opt('MULTAS_PERSONERIA', 'Aplicar multas millonarias a sindicatos', 'Firmeza institucional con demora en la normalización.', { approvalPts: 2, expectationPts: 1 })
  ]),
  mkEvt('ACAMPE_PIQUETERO_9_DE_JULIO', 'Acampe de 72 horas en Avenida 9 de Julio', 'Organizaciones sociales vuelven a cortar el centro porteño exigiendo comida y cupos.', 'SOCIAL', wStrikeHeat, [
    opt('PROTOCOLO_FIRME', 'Aplicar protocolo antipiquetes completo', 'Respaldo de orden público salvo exceso operativo.', { approvalPts: 3, strikeConflictPts: 4, expectationPts: 2 }),
    opt('QUITAR_PLANES', 'Dar de baja planes a quienes corten', 'Disuade cortes futuros y enciende a movimientos sociales.', { anchorCredibility: 2, strikeConflictPts: 7, approvalPts: 1 }),
    opt('MESA_ASISTENCIA', 'Abrir diálogo y refuerzo focalizado', 'Desactiva la calle bajando autoridad política.', { strikeConflictPts: -10, approvalPts: -2, expectationPts: -1 })
  ]),
  mkEvt('HUELGA_SUBTES_Y_TRENES_HORA_PICO', 'Parálisis ferroviaria y de subtes en AMBA', 'Cientos de miles de trabajadores quedan sin transporte en hora pico matutina.', 'SOCIAL', wStrikeHeat, [
    opt('DESCONTAR_COLECTIVOS', 'Descontar días y sumar micros de emergencia', 'Alivia usuarios y marca límite salarial.', { approvalPts: 2, strikeConflictPts: 3 }),
    opt('CEDER_PARITARIA', 'Cerrar acuerdo salarial por encima de pauta', 'Vuelve el servicio dañando el ancla nominal.', { strikeConflictPts: -12, anchorCredibility: -4 }),
    opt('SERVICIO_ESENCIAL', 'Imponer guardias mínimas por decreto', 'Escalada legal con apoyo de usuarios urbanos.', { judicialInterference: 4, approvalPts: 1, strikeConflictPts: 2 })
  ]),
  mkEvt('PROTESTA_MEDICOS_RESIDENTES_GARRAHAN', 'Conflicto en hospitales pediátricos nacionales', 'Médicos residentes marchan por recomposición con altísima simpatía ciudadana.', 'SOCIAL', wAlways, [
    opt('RECOMPOSICION_SALUD', 'Otorgar recomposición salarial inmediata', 'Fuerte mejora de imagen con impacto acotado en caja.', { approvalPts: 4, countryRiskPb: 15, strikeConflictPts: -5 }),
    opt('REORDENAR_GUARDIAS', 'Reasignar partidas internas del ministerio', 'Solución equilibrada sin perforar el techo fiscal.', { approvalPts: 2, expectationPts: 2 }),
    opt('NO_CEDER_IMAGEN', 'Sostener congelamiento salarial estricto', 'Cuidás caja a costo de enorme rechazo social.', { anchorCredibility: 2, approvalPts: -5 })
  ]),
  mkEvt('SAQUEOS_COORDINADOS_CONURBANO', 'Incidentes en supermercados del Conurbano', 'Grupos coordinados intentan saqueos nocturnos en distritos del GBA.', 'SOCIAL', wLowApproval, [
    opt('DESPLIEGUE_EMERGENCIA', 'Despliegue masivo federal + refuerzo alimentario', 'Contenés orden y urgencia social al mismo tiempo.', { approvalPts: 2, strikeConflictPts: -8, countryRiskPb: 25 }),
    opt('DENUNCIAR_DESESTAB', 'Denunciar intento golpista y cortar asistencia', 'Polarización dura con riesgo de escalada.', { strikeConflictPts: 9, approvalPts: -3, expectationPts: -3 })
  ]),
  mkEvt('MARCHA_JUBILADOS_CONGRESO_REPRESION', 'Tensión policial en marcha de jubilados', 'Imágenes de forcejeos con adultos mayores frente al Congreso recorren el mundo.', 'SOCIAL', wLowApproval, [
    opt('BONO_APARTAR_JEFE', 'Anunciar bono compensatorio y relevar jefe', 'Contenés la crisis emocional cediendo caja.', { approvalPts: 2, countryRiskPb: 30, anchorCredibility: -2 }),
    opt('RESPALDO_SEGURIDAD', 'Respaldar operativo mostrando infiltrados', 'Sostenés al ala dura pagando costo en centros urbanos.', { approvalPts: -4, expectationPts: -2, strikeConflictPts: 4 })
  ]),
  mkEvt('PARO_ESTIBA_PUERTOS_GRAN_ROSARIO', 'Freno total en puertos del Gran Rosario', 'Cuarenta buques graneleros quedan parados en pleno pico de liquidación de cosecha.', 'ECONOMIA', wStrikeHeat, [
    opt('INTERVENCION_LOGISTICA', 'Declarar emergencia logística y abrir muelles', 'Destrabás ingreso de dólares con choque gremial.', { grossReservesBillionUsd: 1.3, strikeConflictPts: 6, approvalPts: 1 }),
    opt('BONO_DOLAR_LINKED', 'Negociar bono sectorial atado a embarque', 'Se reanuda la carga pagando costo en costos portuarios.', { grossReservesBillionUsd: 0.9, strikeConflictPts: -8, anchorCredibility: -2 })
  ]),
  mkEvt('REBELION_TAXIS_CONTRA_APPS', 'Bloqueo de taxistas en accesos a aeropuertos', 'Protestan contra la desregulación total de aplicaciones de movilidad urbana.', 'SOCIAL', wAlways, [
    opt('DESPEJAR_APERTURA', 'Despejar accesos y sostener libre competencia', 'Popular en usuarios jóvenes con roces locales.', { approvalPts: 2, strikeConflictPts: 2 }),
    opt('EQUIPARAR_SEGUROS', 'Exigir seguro profesional equivalente a apps', 'Solución intermedia que calma la protesta.', { strikeConflictPts: -5, expectationPts: 1 })
  ]),
  mkEvt('HUELGA_DOCENTE_INICIO_CLASES', 'Huelga docente nacional sin inicio de clases', 'Seis semanas de conflicto escolar por recortes en incentivos salariales nacionales.', 'SOCIAL', wLowApproval, [
    opt('FONDO_PRESENTISMO', 'Crear incentivo nacional atado a presentismo', 'Destrabás aulas introduciendo mérito y algo de gasto.', { approvalPts: 3, strikeConflictPts: -7, countryRiskPb: 15 }),
    opt('DELEGAR_PROVINCIAS', 'Mantener corte y responsabilizar gobernadores', 'Ahorro nacional con enojo de provincias y familias.', { governorLoyaltyPts: -7, approvalPts: -3, anchorCredibility: 2 })
  ]),
  mkEvt('CONFLICTO_PETROLERO_VACA_MUERTA', 'Paro petrolero en yacimientos de Neuquén', 'El sindicato frena fracturas reclamando adicional salarial por zona patagónica.', 'ENERGIA', wStrikeHeat, [
    opt('ARBITRAJE_OPERADORAS', 'Arbitraje rápido entre gremio y operadoras', 'Evitás caída de gas y petróleo con leve suba de costos.', { blackoutRiskPct: -4, strikeConflictPts: -6, anchorCredibility: -1 }),
    opt('OPERACION_TECNICOS', 'Sostener producción mínima con personal técnico', 'Defendés suministro pagando fuerte tensión en cuenca.', { blackoutRiskPct: -2, strikeConflictPts: 6, governorLoyaltyPts: -4 })
  ]),
  mkEvt('MOVILIZACION_INQUILINOS_Y_DESALOJOS', 'Marchas urbanas por suba de alquileres', 'Inquilinos reclaman por contratos dolarizados y ola de vencimientos en grandes ciudades.', 'SOCIAL', wAlways, [
    opt('GARANTIA_PESOS', 'Fondo público-privado de garantía en pesos', 'Alivia acceso sin volver a congelar precios.', { approvalPts: 3, countryRiskPb: 10 }),
    opt('MERCADO_LIBRE', 'No intervenir en contratos privados', 'Coherencia de mercado a costa de rechazo inquilino.', { anchorCredibility: 2, approvalPts: -3 })
  ]),
  mkEvt('PARO_BANCARIO_NACIONAL_PRIVATIZACION', 'Paro bancario contra reforma del BNA', 'La Bancaria cierra sucursales 48 horas por el proyecto de sociedad anónima.', 'SOCIAL', wStrikeHeat, [
    opt('RETROCEDER_BNA', 'Retirar conversión del Banco Nación', 'Normalizás atención frustrando agenda reformista.', { strikeConflictPts: -9, anchorCredibility: -3, approvalPts: 1 }),
    opt('DIGITAL_Y_ACCIONES', 'Acelerar banca digital y ofrecer PPP a empleados', 'Dividís el frente sindical sosteniendo la reforma.', { expectationPts: 2, strikeConflictPts: -3, approvalPts: 1 }),
    opt('SOSTENER_PROYECTO', 'Mantener proyecto intacto sin concesiones', 'Firmeza institucional ante presión corporativa.', { anchorCredibility: 3, strikeConflictPts: 5, approvalPts: -2 })
  ]),
  mkEvt('ASAMBLEAS_AMBIENTALES_CORTAN_RUTA_MINERA', 'Corte de ruta hacia proyecto de cobre andino', 'Asambleas locales bloquean logística minera en Catamarca y San Juan.', 'ENERGIA', wAlways, [
    opt('VEEDORES_TECNICOS', 'Audiencia con monitoreo hídrico independiente', 'Legitima licencia social sin frenar el proyecto.', { governorLoyaltyPts: 4, approvalPts: 1, expectationPts: 1 }),
    opt('DESPEJE_RUTA_NAC', 'Despejar ruta nacional con fuerzas federales', 'Asegura tránsito de equipos con costo ambiental mediático.', { grossReservesBillionUsd: 0.4, approvalPts: -2, strikeConflictPts: 4 })
  ]),
  mkEvt('PROTESTA_CHOFERES_COLECTIVOS_SIN_NAFTA', 'Paro de colectivos en ciudades del Interior', 'Empresarios paralizan líneas reclamando atrasos en compensaciones de gasoil.', 'SOCIAL', wLowLoyalty, [
    opt('GIRAR_DEUDA_TRANS', 'Regularizar giros adeudados de inmediato', 'Restablecés servicio y sumás respaldo provincial.', { governorLoyaltyPts: 5, approvalPts: 2, countryRiskPb: 20 }),
    opt('TRASPASO_LEGAL', 'Confirmar competencia provincial exclusiva', 'Limpiás cuentas nacionales tensando relación federal.', { governorLoyaltyPts: -8, anchorCredibility: 2, approvalPts: -2 })
  ]),
  mkEvt('MARCHA_CGT_CON_SECTOR_EMPRESARIO_PYME', 'Marcha conjunta de CGT y cámaras PyME', 'Sindicatos y pymes industriales comparten palco en Plaza de Mayo contra recesión.', 'SOCIAL', wStrikeHeat, [
    opt('DIVIDIR_FRENTE_PYME', 'Recibir a cámaras PyME por separado con alivio', 'Quebrás el frente opositor con alivio tributario selectivo.', { strikeConflictPts: -6, unemploymentPct: -0.2, approvalPts: 2 }),
    opt('DISCURSO_CORPORATIVO', 'Ignorar acto criticando prebendas históricas', 'Consolidás base dura perdiendo apoyos industriales.', { anchorCredibility: 2, approvalPts: -2, strikeConflictPts: 5 })
  ]),

  // C. Rosca Política, Gobernadores, Congreso y Carpetazos (E39-E58)
  mkEvt('REBELION_INTERNA_EN_TU_BLOQUE', 'Sublevación de 12 diputados propios', 'Legisladores oficialistas amenazan con armar bloque aparte por falta de diálogo.', 'INSTITUCIONAL', wLowApproval, [
    opt('CEDER_COMISION', 'Entregar presidencia de comisión y lugares', 'Contenés la fuga interna cediendo poder parlamentario.', { governorLoyaltyPts: 3, expectationPts: 2, approvalPts: -1 }),
    opt('EXPULSAR_LIDER', 'Expulsar al cabecilla y disciplinar en redes', 'Mostrás autoridad vertical quedando más justo de quórum.', { expectationPts: -3, approvalPts: 1 })
  ]),
  mkEvt('PACTO_OCULTO_OPOSICION_MAYORIA', 'Mayoría opositora busca voltear un veto', 'Peronismo y bloques de centro alinean votos para insistir contra un veto clave.', 'INSTITUCIONAL', wLowLoyalty, [
    opt('NEGOCIAR_ATN_OBRA', 'Seducir 4 votos provinciales con ATN y obras', 'Blindás el veto en el recinto a puro pragmatismo fiscal.', { governorLoyaltyPts: 8, anchorCredibility: -3, countryRiskPb: 30 }),
    opt('BATALLA_PUBLICA', 'Ir a batalla pública denunciando golpe fiscal', 'Si perdés el veto te cuesta caro; tu núcleo duro festeja.', { countryRiskPb: 85, approvalPts: 1, anchorCredibility: -2 })
  ]),
  mkEvt('AMENAZA_CUASIMONEDA_PROVINCIAL', 'Dos provincias lanzan cuasimonedas locales', 'Gobernadores grandes imprimen bonos propios para pagar aguinaldos y proveedores.', 'INSTITUCIONAL', wLowLoyalty, [
    opt('CORTAR_REDESCUENTO', 'Cortar todo giro discrecional y redescuento', 'Disciplinás emisión paralela escalando conflicto federal.', { anchorCredibility: 5, governorLoyaltyPts: -10, approvalPts: 1 }),
    opt('RESCATE_CONDICIONADO', 'Rescate financiero a cambio de ajuste fiscal', 'Desactivás la cuasimoneda con apoyo ordenado.', { governorLoyaltyPts: 4, countryRiskPb: 25, anchorCredibility: 1 })
  ]),
  mkEvt('CARPETAZO_CONGRESO_VALIJAS_SENADO', 'Denuncia de coimas tras sesión ajustada', 'Un informe televisivo muestra presuntos pagos ocultos tras votar una ley clave.', 'INSTITUCIONAL', wAlways, [
    opt('SACRIFICAR_OPERADOR', 'Impulsar auditoría y apartar al operador', 'Frenás el daño reputacional perdiendo un negociador hábil.', { approvalPts: -1, anchorCredibility: 2, governorLoyaltyPts: -3 }),
    opt('CONTRAATACAR_SIDE', 'Acusar operación de inteligencia opositora', 'Desliz institucional riesgoso si aparecen pruebas.', { approvalPts: -4, judicialInterference: 6, expectationPts: -2 })
  ]),
  mkEvt('RENUNCIA_VICEPRESIDENTE_DISTANCIAMIENTO', 'Fractura pública con la Vicepresidencia', 'Tu vicepresidente marca disidencia en desempates del Senado y arma agenda propia.', 'INSTITUCIONAL', wLowApproval, [
    opt('VACIAR_EQUIPO', 'Aislar su equipo de la mesa chica de la Rosada', 'Consolidás conducción ejecutiva agravando riesgo en Senado.', { expectationPts: -3, approvalPts: 1, governorLoyaltyPts: -2 }),
    opt('PACTAR_TREGUA', 'Acordar tregua de gobernabilidad parlamentaria', 'Estabilizás la Cámara Alta compartiendo vidriera.', { expectationPts: 3, governorLoyaltyPts: 3 })
  ]),
  mkEvt('LIGA_GOBERNADORES_PATAGONICOS_CORTE_GAS', 'Amenaza patagónica sobre concesiones energéticas', 'Mandatarios del Sur amagan con trabar permisos hidrocarburíferos sin compensación.', 'ENERGIA', wLowLoyalty, [
    opt('MEJORA_RUTAS_REGALIAS', 'Negociar plan vial a cambio de paz energética', 'Asegurás gas y petróleo sumando gasto de capital.', { governorLoyaltyPts: 8, blackoutRiskPct: -5, countryRiskPb: 20 }),
    opt('DENUNCIA_CORTE', 'Presentar demanda penal ante la Corte Suprema', 'Defensa dura del interés federal que paraliza acuerdos.', { governorLoyaltyPts: -9, judicialInterference: 4, anchorCredibility: 2 })
  ]),
  mkEvt('ACUERDO_INTERBLOQUES_JUICIO_POLITICO', 'Comisión de Juicio Político junta número', 'La oposición logra mayoría en comisión para investigar al Presidente o a un ministro.', 'INSTITUCIONAL', wLowApproval, [
    opt('ENTREGAR_FUSIBLE', 'Relevar al ministro cuestionado como fusible', 'Descomprimís la cámara sacrificando gestión.', { expectationPts: -1, approvalPts: -2, anchorCredibility: -2 }),
    opt('POLARIZAR_CALLE', 'Denunciar destitución y convocar respaldo social', 'Tensión institucional máxima que asusta bonos.', { countryRiskPb: 95, approvalPts: 2, expectationPts: -3 })
  ]),
  mkEvt('MUERTE_LIDER_HISTORICO_OPOSITOR', 'Fallece líder histórico de la oposición', 'La muerte de una figura central reordena de golpe las jefaturas de todos los bloques.', 'INSTITUCIONAL', wAlways, [
    opt('TRIBUTO_DIALOGO', 'Tributo de Estado y diálogo con nueva camada', 'Ganás aire institucional y apertura moderada en Congreso.', { approvalPts: 3, expectationPts: 3, governorLoyaltyPts: 3 }),
    opt('SILENCIO_ACELERAR', 'Mensaje protocolar frío y acelerar proyectos', 'Mantenés épica dura sin capitalizar el reordenamiento.', { approvalPts: -2, anchorCredibility: 1 })
  ], false),
  mkEvt('RUPTURA_ALIADO_ELECTORAL_CLAVE', 'Tensión terminal con aliado parlamentario', 'Tu principal socio legislativo amenaza con romper el interbloque por cierre de listas.', 'INSTITUCIONAL', wCampaign, [
    opt('REPARTIR_DIRECTORIOS', 'Ceder lugares en empresas públicas y listas', 'Preservás mayoría legislativa con costo de purismo.', { governorLoyaltyPts: 5, expectationPts: 2, approvalPts: -1 }),
    opt('COMPETIR_SOLOS', 'Romper acuerdo y absorber sus dirigentes', 'Riesgo alto de parálisis parlamentaria a cambio de identidad.', { expectationPts: -4, approvalPts: 2 })
  ]),
  mkEvt('RECLAMO_INTENDENTES_CONURBANO_SEGURIDAD', 'Intendentes piden Gendarmería por inseguridad', 'Jefes comunales del GBA exigen despliegue federal inmediato ante suba de homicidios.', 'SOCIAL', wAlways, [
    opt('ENVIAR_FEDERALES', 'Desplegar Gendarmería pidiendo votos en Congreso', 'Ganás seguridad territorial y apoyos cruzados clave.', { approvalPts: 3, governorLoyaltyPts: 5 }),
    opt('EXIGIR_PBA', 'Rechazar y exigir que responda el gobernador', 'Preservás fuerza federal a costa de desgaste con intendentes.', { governorLoyaltyPts: -6, approvalPts: -2 })
  ]),
  mkEvt('PEDIDO_INTERVENCION_FEDERAL_CRISIS_PROV', 'Crisis institucional grave en provincia del Norte', 'Acefalía de facto y conflicto de poderes paralizan una provincia entera.', 'INSTITUCIONAL', wAlways, [
    opt('ENVIAR_INTERVENCION', 'Enviar proyecto de intervención al Congreso', 'Orden rápido pero te compra un frente federal entero.', { governorLoyaltyPts: -7, approvalPts: 1, judicialInterference: 3 }),
    opt('SOLUCION_LOCAL', 'Respaldar salida institucional de legislatura local', 'Menos costo político federal, mayor demora en normalizar.', { governorLoyaltyPts: 3, expectationPts: 1 })
  ]),
  mkEvt('OPERACION_CAMBIO_REGISTRO_PARTIDO', 'Cuestionan personería de tu sello partidario', 'Un juzgado electoral objeta avales en un distrito grande antes del cierre de listas.', 'INSTITUCIONAL', wCampaign, [
    opt('ALIANZA_SELLO_PROV', 'Acordar lista con sello provincial aliado', 'Garantizás boleta cediendo primeros lugares locales.', { expectationPts: 1, governorLoyaltyPts: 4 }),
    opt('APELAR_CNE', 'Apelar urgente ante Cámara Nacional Electoral', 'Ganás independencia bajo riesgo de calendario.', { judicialInterference: 2, expectationPts: -2 })
  ]),
  mkEvt('ENCUENTRO_SECRETO_EN_EXILIO_OPOSICION', 'Filtran foto de operador pactando con opositores', 'Medios publican reunión reservada de un asesor tuyo con referentes del kirchnerismo duro.', 'INSTITUCIONAL', wAlways, [
    opt('ECHAR_OPERADOR', 'Desplazar al operador en el acto', 'Calmás a tu base dura cortando puente discreto.', { approvalPts: 2, governorLoyaltyPts: -4 }),
    opt('BLANQUEAR_DIALOGO', 'Explicar que fue diálogo institucional normal', 'Malestar en redes propias pero mejor clima en Senado.', { approvalPts: -2, expectationPts: 2, governorLoyaltyPts: 3 })
  ]),
  mkEvt('VETO_COMPENSADO_UNIVERSIDADES_JUBILADOS', 'El Congreso sanciona ley de alto costo fiscal', 'Ambas cámaras aprueban gasto previsional/universitario extra; tenés diez días para decidir.', 'INSTITUCIONAL', wMarketStress, [
    opt('VETO_TOTAL', 'Veto total y operativo para blindar el tercio', 'El mercado celebra la defensa del déficit cero; calle enardecida.', { anchorCredibility: 5, countryRiskPb: -55, approvalPts: -4, strikeConflictPts: 5 }),
    opt('VETO_PARCIAL_REASIG', 'Veto parcial reasignando partidas internas', 'Salida negociada que atenúa costo político con ruido fiscal.', { approvalPts: 1, countryRiskPb: 35, governorLoyaltyPts: 3 })
  ]),
  mkEvt('DISPUTA_PRESIDENCIA_PROVISIONAL_SENADO', 'Pelea por la sucesión en el Senado', 'Se abre negociación feroz por la Presidencia Provisional al inaugurar sesiones.', 'INSTITUCIONAL', wAlways, [
    opt('CEDER_A_FEDERAL', 'Ceder silla a senador aliado federal', 'Asegurás gobernabilidad en comisiones todo el año.', { governorLoyaltyPts: 6, expectationPts: 2 }),
    opt('IMPONER_PROPIO', 'Imponer senador puro de La Rosca', 'Cohesión partidaria con riesgo de empate permanente.', { governorLoyaltyPts: -4, approvalPts: 1 })
  ]),
  mkEvt('RECLAMO_CORDOBA_SANTA_FE_HIDROVIA', 'Región Centro exige silla en la Hidrovía', 'Córdoba, Santa Fe y Entre Ríos piden participación directa en el control de la vía navegable.', 'INSTITUCIONAL', wLowLoyalty, [
    opt('SUMAR_TRES_GOB', 'Incorporar gobernadores al directorio de control', 'Pacifica la Región Centro ganando aliados de peso.', { governorLoyaltyPts: 7, approvalPts: 1 }),
    opt('CONTROL_FEDERAL_PURO', 'Sostener control nacional centralizado', 'Agilidad licitatoria con malhumor de la zona núcleo.', { governorLoyaltyPts: -5, anchorCredibility: 2 })
  ]),
  mkEvt('FILTRACION_CHATS_GABINETE', 'Filtran chats internos de ministros insultándose', 'Capturas reales muestran peleas feroces entre áreas económicas y políticas.', 'INSTITUCIONAL', wAlways, [
    opt('MOVER_PIEZAS_NOCHE', 'Cambiar dos ministros esa misma noche', 'Cortás la crisis mostrando mando presidencial.', { expectationPts: 2, approvalPts: -1, anchorCredibility: 2 }),
    opt('NEGAR_PERSEGUIR', 'Desmentir autenticidad e iniciar sumario', 'La agenda mediática se estira una semana entera.', { approvalPts: -3, expectationPts: -2 })
  ]),
  mkEvt('CUMBRE_EMPRESARIA_IDEA_COLOQUIO_FRIO', 'Coloquio empresario reclama previsibilidad', 'El Círculo Rojo pide cronograma cierto de baja de impuestos antes de hundir inversiones.', 'ECONOMIA', wAlways, [
    opt('PROMETER_CRONOGRAMA', 'Comprometer fecha de baja de retenciones e impuestos', 'Mejora clima inversor atando metas futuras de caja.', { countryRiskPb: -30, expectationPts: 3, anchorCredibility: 2 }),
    opt('RETAR_PREBENDARIOS', 'Cruzarlos por pedir privilegios del Estado', 'Aplauso libertario en redes con frío empresarial.', { approvalPts: 2, countryRiskPb: 35, expectationPts: -2 })
  ]),
  mkEvt('PROYECTO_OPOSITOR_PLEBISCITO', 'Juntan firmas para plebiscitar privatizaciones', 'Bloques rivales impulsan consulta popular vinculante contra venta de empresas públicas.', 'INSTITUCIONAL', wLowApproval, [
    opt('ADELANTAR_CONSULTA', 'Convocar consulta propia más favorable', 'Tomás la iniciativa política con costo operativo.', { approvalPts: 2, expectationPts: 2 }),
    opt('FRENAR_CORTE', 'Pedir bloqueo por inconstitucionalidad fiscal', 'Evitás la urna acumulando desgaste judicial.', { judicialInterference: 4, approvalPts: -2 })
  ]),
  mkEvt('NEGOCIACION_PLIEGOS_EMBAJADORES', 'Senadores traban 20 pliegos de embajadores', 'La comisión de Acuerdos frena designaciones diplomáticas pidiendo obras provinciales.', 'INSTITUCIONAL', wAlways, [
    opt('APROBAR_OBRAS_CHICAS', 'Destrabar cinco obras menores en provincias', 'Aprobás todos los pliegos sin choque.', { governorLoyaltyPts: 4, countryRiskPb: 10 }),
    opt('DESIGNAR_COMISION', 'Nombrar en comisión por decreto presidencial', 'Fricción institucional fuerte con el Senado.', { judicialInterference: 3, governorLoyaltyPts: -5, expectationPts: -1 })
  ]),

  // D. Justicia, Causas, Medios y Operetas (E59-E74)
  mkEvt('FALLO_CORTE_INCONSTITUCIONAL_DNU', 'La Corte voltea un capítulo clave de tu DNU', 'La CSJN declara inválido un tramo entero de desregulación vigente hace meses.', 'INSTITUCIONAL', wJudicial, [
    opt('REENVIAR_LEY_FRACC', 'Reenviarlo fraccionado en leyes cortas', 'Respeto republicano que recompone confianza jurídica.', { judicialInterference: -4, countryRiskPb: -25, anchorCredibility: 2 }),
    opt('CRITICAR_VACANTES', 'Criticar fallo y negociar pliegos de vacantes', 'Señal de choque que inquieta a inversores externos.', { judicialInterference: 6, countryRiskPb: 55, approvalPts: -1 })
  ]),
  mkEvt('CAUSA_SOBREPRECIOS_PAMI_O_COMPRAS', 'Denuncia de sobreprecios en compras públicas', 'Investigación periodística revela facturas infladas de proveedores cercanos.', 'INSTITUCIONAL', wAlways, [
    opt('ECHAR_QUERELLANTE', 'Despedir al funcionario y ser querellante', 'Muestra tolerancia cero y frena el desgaste.', { approvalPts: 1, anchorCredibility: 2, judicialInterference: -2 }),
    opt('DEFENDER_ACUSAR_PAUTA', 'Defender compra y acusar presión por pauta', 'Si la causa avanza te golpea de lleno en imagen.', { approvalPts: -5, expectationPts: -3, judicialInterference: 3 })
  ]),
  mkEvt('PROCESAMIENTO_EX_PRESIDENTE_CASACION', 'Fallo firme de Casación contra líder opositor', 'Una condena confirmada sacude el tablero electoral de cara a los próximos comicios.', 'INSTITUCIONAL', wAlways, [
    opt('PERFIL_BAJO_INST', 'Respetar fallos con silencio institucional', 'Evitás victimización opositora y ganás estatura.', { judicialInterference: -2, expectationPts: 2, countryRiskPb: -15 }),
    opt('POLARIZAR_CAMPANA', 'Usar la condena como eje central de campaña', 'Enciende tu núcleo y cohesiona a todo el rival.', { approvalPts: 1, strikeConflictPts: 4 })
  ]),
  mkEvt('AMPARO_PREPAGAS_O_TARIFAS_MENDOZA', 'Amparo federal congela tarifas en invierno', 'Un juzgado federal suspende subas de gas y luz en una región entera.', 'ENERGIA', wWinter, [
    opt('PER_SALTUM_CSJN', 'Recurrir por per saltum a la Corte Suprema', 'Señal firme de seguridad jurídica para concesionarias.', { countryRiskPb: -20, judicialInterference: 2, approvalPts: -1 }),
    opt('TOPE_MODIFICADO', 'Rehacer esquema con tope de aumento gradual', 'Bajás malhumor de usuarios cediendo superávit.', { approvalPts: 3, countryRiskPb: 25, anchorCredibility: -2 })
  ]),
  mkEvt('ESCANDALO_SERVICIOS_INTELIGENCIA', 'Denuncia de escuchas ilegales desde la SIDE', 'Filtran documentos sobre espionaje a periodistas y dirigentes políticos.', 'INSTITUCIONAL', wJudicial, [
    opt('DISOLVER_AUDITORIA', 'Disolver unidad implicada y auditar ante Congreso', 'Desarmás la bomba con costo operativo interno.', { approvalPts: 1, judicialInterference: -4, expectationPts: 2 }),
    opt('SECRETO_ESTADO', 'Respaldar cúpula invocando secreto de Estado', 'Fuerte deterioro de imagen republicana.', { approvalPts: -5, judicialInterference: 6, countryRiskPb: 40 })
  ]),
  mkEvt('CRIPTOESTAFAS_O_PUBLICIDAD_OFICIAL', 'Escándalo viral por activo financiero colapsado', 'Una promoción en redes oficiales termina en desplome millonario en horas.', 'INSTITUCIONAL', wAlways, [
    opt('BORRAR_INVESTIGAR', 'Reconocer error y abrir investigación interna', 'Daño acotado con crítica rápida pero pasajera.', { approvalPts: -3, anchorCredibility: -1 }),
    opt('DOBLAR_APUESTA', 'Culpar a especuladores y sostener postura', 'Pérdida seria de credibilidad técnica y mediática.', { approvalPts: -6, countryRiskPb: 60, anchorCredibility: -5 })
  ]),
  mkEvt('MEDIO_HEGEMONICO_CAMBIA_LINEA', 'Multimedios clave pasa a oposición abierta', 'Tras el recorte de pauta y licencias, el principal grupo pasa a fuego diario.', 'INSTITUCIONAL', wAlways, [
    opt('PACTAR_REGLAS', 'Negociar pauta institucional indirecta', 'Modera tapas adversas cediendo discurso anti-pauta.', { approvalPts: 2, expectationPts: 1 }),
    opt('GUERRA_STREAMING', 'Guerra frontal vía streaming y redes propias', 'Polariza al máximo blindando al voto intenso.', { approvalPts: -2, expectationPts: -1 })
  ]),
  mkEvt('FILTRACION_PANDORA_CUENTAS_MINISTRO', 'Sociedad offshore de ministro clave en prensa', 'Aparecen cuentas no declaradas vinculadas al responsable de Economía o Cancillería.', 'INSTITUCIONAL', wMarketStress, [
    opt('REEMPLAZAR_24HS', 'Aceptar renuncia en 24 horas con técnico sólido', 'Vibran los mercados dos días pero salvás transparencia.', { countryRiskPb: 45, approvalPts: 2, anchorCredibility: 1 }),
    opt('SOSTENER_PREVIA', 'Respaldarlo explicando que era previa al cargo', 'Desgaste ético continuo en el Congreso.', { approvalPts: -4, judicialInterference: 3, expectationPts: -2 })
  ]),
  mkEvt('HACKERS_ROBAN_BASE_RENAPER_O_ANses', 'Filtración masiva de bases biométricas estatales', 'Publican en la dark web datos sensibles de 45 millones de ciudadanos.', 'INSTITUCIONAL', wAlways, [
    opt('INVERTIR_REMOVER', 'Remover cúpula y financiar ciberdefensa urgente', 'Respuesta seria ante crisis digital.', { approvalPts: 1, countryRiskPb: 10, expectationPts: 2 }),
    opt('MINIMIZAR_IMPACTO', 'Minimizar filtración como datos viejos', 'Ola de indignación y demandas judiciales.', { approvalPts: -4, judicialInterference: 3 })
  ]),
  mkEvt('DENUNCIA_VIOLENCIA_INST_EN_MARCHA', 'Video viral de abuso policial en manifestación', 'Cámaras registran exceso claro de un efectivo contra manifestante pacífico.', 'SOCIAL', wAlways, [
    opt('SEPARAR_CAMARAS', 'Pasar a disponibilidad y sumar cámaras corporales', 'Preservás legitimidad del protocolo de orden.', { approvalPts: 2, strikeConflictPts: -3 }),
    opt('DEFENSA_CORPORATIVA', 'Defender todo el accionar sin sumario', 'Rechazo transversal fuera del núcleo duro.', { approvalPts: -4, strikeConflictPts: 5, judicialInterference: 2 })
  ]),
  mkEvt('JUICIO_YPF_EMBARGO_ACCIONES_EEUU', 'Fallo adverso definitivo en juicio por YPF', 'Corte extranjera intima a entregar acciones o depositar USD 16.000 M.', 'EXTERNO', wMarketStress, [
    opt('ACUERDO_BONOS_LARGOS', 'Negociar quita y pago en bonos a 25 años', 'Despeja horizonte de mercado aceptando deuda.', { countryRiskPb: -65, anchorCredibility: 3, approvalPts: -2 }),
    opt('LITIGAR_DILATORIO', 'Litigar cada instancia posible para ganar tiempo', 'Mantenés reservas intactas con alta incertidumbre en activos.', { countryRiskPb: 90, expectationPts: -2 })
  ]),
  mkEvt('INVESTIGACION_APORTES_TRUCHOS_CAMPANA', 'Objetan rendición de aportes de campaña', 'Auditoría judicial detecta miles de donantes apócrifos en tu último cierre.', 'INSTITUCIONAL', wCampaign, [
    opt('RECTIFICAR_MULTA', 'Rectificar rendición y remover al tesorero', 'Frena el escándalo antes de la veda electoral.', { approvalPts: -1, judicialInterference: -2 }),
    opt('CULPAR_PUNTEROS', 'Culpar a armadores distritales sin cambios', 'Pega fuerte en credibilidad ética urbana.', { approvalPts: -4, governorLoyaltyPts: -3 })
  ]),
  mkEvt('JUEZ_FEDERAL_LIBERA_CAPO_NARCO', 'Liberan por error procesal a capo narco', 'Un juez federal otorga excarcelación en Rosario generando conmoción nacional.', 'INSTITUCIONAL', wAlways, [
    opt('JUICIO_MAGISTRATURA', 'Impulsar juicio político en la Magistratura', 'Fuerte apoyo ciudadano en agenda de seguridad.', { approvalPts: 4, judicialInterference: 4 }),
    opt('CUSTODIA_CALLE', 'Reforzar operativo federal sin tocar al juez', 'Evitás choque judicial pero cuesta explicar la soltura.', { approvalPts: -2, judicialInterference: -1 })
  ]),
  mkEvt('OPERETA_DEEPFAKE_EN_ELECCION', 'Deepfake presidencial viral antes de votar', 'Video sintético hiperrealista anuncia corralito 48 horas antes de abrir las urnas.', 'INSTITUCIONAL', wCampaign, [
    opt('DESMENTIDA_BANCOS', 'Desmentida conjunta en cadena con bancos', 'Frenás la corrida de último minuto con rapidez.', { brechaPct: -3, approvalPts: 1, anchorCredibility: 2 }),
    opt('IGNORAR_DEEPFAKE', 'Minimizarlo esperando que pase solo', 'Se retiran depósitos y perdés votos indecisos.', { brechaPct: 7, approvalPts: -4, grossReservesBillionUsd: -0.7 })
  ]),
  mkEvt('CONFLICTO_LICITACION_PASAPORTES_DNI', 'Cautelar frena compra millonaria de insumos', 'Freno judicial por presunto direccionamiento en licitación de pasaportes y DNI.', 'INSTITUCIONAL', wAlways, [
    opt('ANULAR_SUBASTA', 'Anular pliego y lanzar subasta pública abierta', 'Aplauso de transparencia con demora administrativa.', { approvalPts: 2, judicialInterference: -2 }),
    opt('DEFENDER_URGENCIA', 'Apelar invocando emergencia documental', 'Mantiene sospecha pública durante semanas.', { approvalPts: -3, judicialInterference: 3 })
  ]),
  mkEvt('FALLO_LABORAL_MULTIMILLONARIO_PYME', 'Indemnización récord quiebra a PyME de 40 empleos', 'Una sentencia con intereses compuestos desmedidos cierra una fábrica y se vuelve viral.', 'SOCIAL', wAlways, [
    opt('LEY_TOPE_INTERESES', 'Enviar al Congreso ley urgente de tope laboral', 'Consenso enorme en cámaras pymes y empleo formal.', { expectationPts: 3, approvalPts: 2, unemploymentPct: -0.2 }),
    opt('SALVATAJE_PUNTUAL', 'Subsidiar el cierre evitando choque sindical', 'Solución cara que no corrige el incentivo judicial.', { countryRiskPb: 15, approvalPts: 1 })
  ]),

  // E. Clima, Energía, Campo y Catástrofes (E75-E90)
  mkEvt('INUNDACIONES_LITORAL_Y_NUCLEO', 'Inundaciones graves en Litoral y Zona Núcleo', 'Desborde del Paraná y lluvias extremas aíslan ciudades y tapan miles de hectáreas.', 'ECONOMIA', wSummer, [
    opt('ATN_Y_FFAA', 'Giro urgente de ATN y despliegue militar', 'Contención territorial inmediata con impacto fiscal.', { governorLoyaltyPts: 7, approvalPts: 3, countryRiskPb: 20 }),
    opt('CREDITO_BNA_PRO', 'Prórroga impositiva y líneas BNA blandas', 'Menor gasto directo pero demora asistencia en zonas rurales.', { governorLoyaltyPts: 2, grossReservesBillionUsd: -0.5, approvalPts: 1 })
  ]),
  mkEvt('OLA_POLAR_FALTA_GNC_E_INDUSTRIA', 'Ola polar obliga a cortar GNC e industrias', 'Picos récord de frío congelan la oferta de gas y paralizan parques industriales.', 'ENERGIA', wWinter, [
    opt('COMPRAR_GNL_CARO', 'Importar cargamentos urgentes de GNL spot', 'Resolves el invierno drenando reservas del Central.', { blackoutRiskPct: -12, grossReservesBillionUsd: -1.4, anchorCredibility: -2 }),
    opt('PRIORIZAR_HOGARES', 'Cortar GNC y grandes usuarios priorizando casas', 'Cuidás dólares y casas pagando parate fabril.', { blackoutRiskPct: -6, unemploymentPct: 0.3, approvalPts: -2 })
  ]),
  mkEvt('INCENDIOS_FORESTALES_CORDOBA_PATAGONIA', 'Incendios críticos en Córdoba y Patagonia', 'Frentes fuera de control amenazan áreas turísticas y redes eléctricas regionales.', 'SOCIAL', wSummer, [
    opt('AVIONES_EXTERIOR', 'Alquilar aviones hidrantes y declarar emergencia', 'Respuesta visible y rápida valorada en todo el país.', { approvalPts: 3, countryRiskPb: 15 }),
    opt('EJERCITO_VOLUNT', 'Desplegar brigadas del Ejército y provincias', 'Menor costo en dólares pero mayor duración del fuego.', { approvalPts: -2, governorLoyaltyPts: -3 })
  ]),
  mkEvt('BAJANTE_HISTORICA_RIO_PARANA', 'Bajante extrema del río Paraná', 'Buques graneleros zarpan con 35% menos carga desde terminales del Up-River.', 'ECONOMIA', wAlways, [
    opt('DRAGADO_EXTRA', 'Financiar dragado de emergencia inmediato', 'Recupera ritmo exportador con inversión rápida.', { grossReservesBillionUsd: 0.8, anchorCredibility: 1 }),
    opt('DESVIO_QUEQUEN', 'Desviar cargas hacia Quequén y Bahía Blanca', 'Satura rutas bonaerenses y encarece flete interno.', { grossReservesBillionUsd: -0.6, approvalPts: -1 })
  ]),
  mkEvt('APAGON_MASIVO_NACIONAL_TRANSENER', 'Apagón masivo por falla en red de alta tensión', 'Colapso en el corredor Comahue deja sin electricidad a medio país durante 14 horas.', 'ENERGIA', wSummer, [
    opt('AUDITORIA_MULTA', 'Multa récord e intervención técnica a concesionaria', 'Gana aprobación popular asustando a inversores eléctricos.', { approvalPts: 3, countryRiskPb: 30, blackoutRiskPct: -4 }),
    opt('PLAN_REDES_PRIV', 'Lanzar licitación exprés de líneas privadas', 'Solución estructural de mediano plazo bien vista por mercado.', { blackoutRiskPct: -8, countryRiskPb: -20, approvalPts: 1 })
  ]),
  mkEvt('PLAGA_CHICHARRITA_MAIZ_PERDIDA_30', 'Plaga agrícola arrasa 30% del maíz tardío', 'La chicharrita destroza rindes justo antes de la ventana fuerte de exportación.', 'ECONOMIA', wAlways, [
    opt('EMERGENCIA_SIN_ARCA', 'Suspender anticipos ARCA en distritos afectados', 'Alivio vital al productor con menor recaudación trimestral.', { approvalPts: 2, grossReservesBillionUsd: -0.7, governorLoyaltyPts: 4 }),
    opt('SEMILLAS_EXPRES', 'Aprobar ingreso rápido de genética resistente', 'Mejora campaña próxima con poco efecto inmediato.', { expectationPts: 2, grossReservesBillionUsd: -0.4 })
  ]),
  mkEvt('CORTE_PASO_CRISTO_REDENTOR_NIEVE', 'Temporal bloquea el paso a Chile 15 días', 'Tres mil camiones quedan varados en alta montaña frenando comercio del Pacífico.', 'ECONOMIA', wWinter, [
    opt('HABILITAR_PASOS_ALT', 'Coordinar desvío ágil por pasos Sur y Norte', 'Descomprimís logística en acuerdo con Cuyo y Neuquén.', { governorLoyaltyPts: 4, expectationPts: 1 }),
    opt('ASISTENCIA_ADUANA', 'Asistencia en ruta y exención de estadías', 'Evitás conflictos de choferes asumiendo costos aduaneros.', { approvalPts: 2, grossReservesBillionUsd: -0.2 })
  ]),
  mkEvt('CRISIS_HIDRICA_CUYO_MENDOZA_SAN_JUAN', 'Emergencia hídrica en Cuyo', 'Escasa nieve cordillerana enfrenta a productores vitivinícolas contra proyectos mineros.', 'ENERGIA', wSummer, [
    opt('IMPERMEABILIZAR_CANALES', 'Financiar obra conjunta de impermeabilización', 'Desactiva conflicto de raíz sumando apoyo cuyano.', { governorLoyaltyPts: 6, approvalPts: 2, countryRiskPb: 10 }),
    opt('CUPOS_MINEROS', 'Imponer cupos estrictos de agua industrial', 'Protege fincas frenando ritmo de inversión minera.', { approvalPts: 2, grossReservesBillionUsd: -0.4 })
  ]),
  mkEvt('COLAPSO_PUENTE_RUTA_NACIONAL_CLAVE', 'Colapso estructural de puente vial estratégico', 'Se cae un viaducto central dejando aislada a una provincia mesopotámica.', 'SOCIAL', wAlways, [
    opt('BAILEY_MILITAR', 'Instalar puente Bailey militar y obra directa', 'Solución veloz que muestra capacidad operativa del Estado.', { approvalPts: 4, governorLoyaltyPts: 5 }),
    opt('LICITACION_PEAJE', 'Licitación rápida bajo concesión privada', 'Sin impacto en Tesoro pero tarda meses en restablecer cruce.', { approvalPts: -3, anchorCredibility: 2 })
  ]),
  mkEvt('EPIDEMIA_DENGUE_VERANO_RECORRIDO', 'Brote récord de dengue satura guardias', 'Faltan repelentes en góndolas y crecen internaciones en NOA, NEA y AMBA.', 'SOCIAL', wSummer, [
    opt('LIBERAR_REPELENTES', 'Arancel y registro cero a importación de insumos', 'Abastece mercado en días sin romper equilibrio fiscal.', { approvalPts: 3, anchorCredibility: 1 }),
    opt('CAMPANA_VACUNAS', 'Compra estatal focalizada de vacunas gratuitas', 'Alto rédito sanitario con costo presupuestario adicional.', { approvalPts: 4, countryRiskPb: 20 })
  ]),
  mkEvt('BROTE_FIEBRE_AFTOSA_O_GRIPE_AVIAR', 'Alerta sanitaria suspende exportación cárnica', 'Un foco puntual activa restricciones externas sobre embarques argentinos por 60 días.', 'ECONOMIA', wAlways, [
    opt('RIFLE_SANITARIO_COMP', 'Protocolo estricto y compensación inmediata', 'Recuperás estatus rápido manteniendo confianza rural.', { grossReservesBillionUsd: -0.6, anchorCredibility: 2, approvalPts: 1 }),
    opt('REGIONALIZAR_OMSA', 'Negociar regionalización sin sacrificio masivo', 'Menor gasto inicial con demora mayor en mercados externos.', { grossReservesBillionUsd: -1.1, expectationPts: -1 })
  ]),
  mkEvt('DERRAME_HIDROCARBUROS_CUENCA_SUR', 'Incidente ambiental en oleoducto patagónico', 'Un derrame afecta riveras productivas y enciende protestas provinciales.', 'ENERGIA', wAlways, [
    opt('MULTA_INTERVENCION', 'Multa ejemplar y plan obligatorio de remediación', 'Señal ambiental seria valorada internacionalmente.', { approvalPts: 3, governorLoyaltyPts: 3 }),
    opt('REMEDIACION_RAPIDA', 'Priorizar continuidad productiva con multa menor', 'Cuida regalías y dólares pagando rechazo verde.', { grossReservesBillionUsd: 0.3, approvalPts: -3 })
  ]),
  mkEvt('TORMENTA_CONVECTIVA_DESTRUYE_BAHIA_O_AMBA', 'Temporal severo destruye redes y puertos', 'Ráfagas de 150 km/h voltean torres de alta tensión e instalaciones portuarias.', 'ENERGIA', wAlways, [
    opt('FONDO_RECONSTRUCCION', 'Fondo nacional extraordinario y créditos blandos', 'Solidaridad nacional visible ante la tragedia.', { approvalPts: 4, blackoutRiskPct: -5, countryRiskPb: 25 }),
    opt('REASIGNAR_VIALES', 'Reasignar partidas sin ampliar déficit total', 'Responsabilidad fiscal valorada con auxilio más acotado.', { anchorCredibility: 3, approvalPts: -1, blackoutRiskPct: -2 })
  ]),
  mkEvt('CAIDA_REPRESA_COMAHUE_MANTENIMIENTO', 'Falla de turbinas clave en represas del Comahue', 'Salen de servicio unidades hidroeléctricas por demoras de repuestos antes del verano.', 'ENERGIA', wAlways, [
    opt('COMPRA_DIRECTA_REP', 'Compra urgente de repuestos sin burocracia', 'Baja riesgo de apagones cuidando transparencia posterior.', { blackoutRiskPct: -8, grossReservesBillionUsd: -0.3 }),
    opt('TERMICA_CARA', 'Compensar con generación térmica a gasoil', 'Mayor costo en dólares por combustible importado.', { blackoutRiskPct: -3, grossReservesBillionUsd: -0.9 })
  ]),
  mkEvt('INVASION_ALGAS_O_MAREA_ROJA_PESCA', 'Marea roja paraliza zafra pesquera del Sur', 'Puertos de Chubut y Santa Cruz quedan inactivos cuatro meses dejando marineros sin ingresos.', 'SOCIAL', wAlways, [
    opt('ASISTENCIA_MARINEROS', 'Asistencia transitoria a tripulantes y estibadores', 'Paz social patagónica con leve impacto fiscal.', { approvalPts: 2, governorLoyaltyPts: 4, strikeConflictPts: -3 }),
    opt('ADELANTAR_CUPOS', 'Adelantar cupos en áreas marítimas sanas', 'Mantiene actividad pesquera evitando subsidios directos.', { grossReservesBillionUsd: 0.3, approvalPts: 1 })
  ]),
  mkEvt('SISMO_EN_CUYO_INFRAESTRUCTURA', 'Fuerte sismo daña escuelas y diques en Cuyo', 'Un movimiento telúrico importante afecta edificios públicos en San Juan y Mendoza.', 'SOCIAL', wAlways, [
    opt('GIRO_DIRECTO_CUYO', 'Despliegue federal inmediato y giro directo', 'Liderazgo nacional rápido muy bien recibido.', { approvalPts: 4, governorLoyaltyPts: 6, countryRiskPb: 15 }),
    opt('CREDITOS_VIVIENDA', 'Línea hipotecaria de reconstrucción vía BNA', 'Ayuda ordenada sin alterar las cuentas fiscales.', { anchorCredibility: 2, approvalPts: 1 })
  ]),

  // F. Geopolítica, FMI, Región y Campaña Electoral (E91-E105)
  mkEvt('CUMBRE_MERCOSUR_UE_FIRMA_O_ROTURA', 'Definición final del acuerdo Mercosur–UE', 'Se abre ventana histórica para firmar el tratado comercial tras décadas de trabas.', 'EXTERNO', wAlways, [
    opt('FIRMAR_ACUERDO_UE', 'Firmar aceptando apertura industrial gradual', 'Hito exportador y salto de credibilidad internacional.', { countryRiskPb: -70, anchorCredibility: 4, expectationPts: 3 }),
    opt('PATEAR_MESA_UE', 'Exigir apertura agrícola plena o levantarse', 'Aplauso nacionalista y pérdida de oportunidad histórica.', { approvalPts: 1, countryRiskPb: 40, expectationPts: -2 })
  ], false),
  mkEvt('TENSION_PESCA_ILEGAL_MILLAS_200', 'Flota de 300 poteros depreda milla 201', 'Buques extranjeros cruzan ilegalmente el límite económico depredando calamar.', 'EXTERNO', wAlways, [
    opt('CAPTURA_FIRME', 'Intercepción y captura firme con Prefectura y Armada', 'Fuerte golpe de soberanía muy popular en la opinión pública.', { approvalPts: 4, expectationPts: 2 }),
    opt('NOTA_DIPLOMATICA', 'Multas administrativas y protesta formal en cancillería', 'Evita roces internacionales pero transmite debilidad.', { approvalPts: -3, countryRiskPb: -10 })
  ]),
  mkEvt('CRISIS_MIGRATORIA_O_CRIME_FRONTERA_BRASIL_PAR', 'Bandas transnacionales operan en frontera Norte', 'Facciones criminales regionales buscan asentarse en pasos de Misiones y Salta.', 'EXTERNO', wAlways, [
    opt('COMANDO_CONJUNTO', 'Crear comando conjunto con países vecinos', 'Cooperación inteligente que golpea rutas narco.', { approvalPts: 3, governorLoyaltyPts: 3 }),
    opt('MILITARIZAR_VISAS', 'Militarizar pasos e imponer visados estrictos', 'Mensaje duro de orden con demora comercial fronteriza.', { approvalPts: 2, countryRiskPb: 15 })
  ]),
  mkEvt('APROXIMACION_CHINA_BASE_O_INFRAESTRUCTURA', 'Beijing ofrece USD 5.000 M en infraestructura', 'China propone financiar trenes y represas pidiendo concesiones logísticas clave.', 'EXTERNO', wAlways, [
    opt('ACEPTAR_CHINA', 'Aceptar financiamiento asiático con reservas', 'Alivio inmediato de divisas bajo fuerte tensión con Washington.', { grossReservesBillionUsd: 3.5, countryRiskPb: 60, anchorCredibility: -2 }),
    opt('RECHAZAR_OCCIDENTE', 'Rechazar y exigir crédito occidental equivalente', 'Sólido alineamiento geopolítico recompensado por Wall Street.', { countryRiskPb: -40, anchorCredibility: 3 })
  ]),
  mkEvt('EXIGENCIA_OCDE_ESTANDAR_INSTITUCIONAL', 'Comité OCDE audita calidad institucional', 'Evaluadores exigen más transparencia en compras públicas y estadísticas autónomas.', 'EXTERNO', wAlways, [
    opt('ACELERAR_TRANSP', 'Adoptar reglas OCDE en compras y justicia', 'Baja prima de riesgo a largo plazo.', { countryRiskPb: -45, anchorCredibility: 4, judicialInterference: -3 }),
    opt('PRIORIZAR_DECRETO', 'Priorizar velocidad ejecutiva por decreto', 'Mantenés agilidad de corto plazo frenando ingreso a OCDE.', { judicialInterference: 3, countryRiskPb: 30 })
  ]),
  mkEvt('DESAIRE_O_ROCE_CON_BRASILIA', 'Cruce diplomático traba exportaciones a Brasil', 'Una pelea verbal presidencial frena autorizaciones automotrices y de trigo en Brasilia.', 'EXTERNO', wAlways, [
    opt('BAJAR_TONO_CUMBRE', 'Desescalar en cumbre bilateral por comercio', 'Protegés exportaciones fabriles del Centro y Litoral.', { grossReservesBillionUsd: 0.7, expectationPts: 2, approvalPts: -1 }),
    opt('DOBLAR_APUESTA_ID', 'Redoblar disputa ideológica en redes', 'Festeja tu núcleo con freno industrial visible.', { approvalPts: 2, unemploymentPct: 0.3, countryRiskPb: 25 })
  ]),
  mkEvt('GUERRA_ORIENTE_MEDIO_SUBA_PETROLEO', 'Escalada global lleva el crudo a USD 120', 'La crisis energética dispara ingresos de Vaca Muerta pero presiona naftas en surtidor.', 'EXTERNO', wAlways, [
    opt('PARIDAD_EXPORTACION', 'Dejar precio local a paridad internacional', 'Boom de inversiones petroleras con golpe directo al IPC.', { grossReservesBillionUsd: 2.0, approvalPts: -4, anchorCredibility: 2 }),
    opt('AMORTIGUAR_ICL', 'Suavizar suba en surtidores bajando impuestos', 'Contenés inflación y calle pagando costo recaudatorio.', { approvalPts: 3, countryRiskPb: 20 })
  ]),
  mkEvt('INVITACION_BILATERAL_CASA_BLANCA', 'Cumbre bilateral en la Casa Blanca', 'Washington ofrece foto presidencial y respaldo financiero a cambio de alineamiento.', 'EXTERNO', wAlways, [
    opt('ALINEAMIENTO_PLENO', 'Aceptar alineamiento estratégico completo', 'Respaldo fuerte del Tesoro de EE.UU. y mercados.', { countryRiskPb: -60, anchorCredibility: 3, approvalPts: 1 }),
    opt('AGENDA_BALANCEADA', 'Sostener agenda comercial multipolar', 'Conservás mercados asiáticos con menor premio financiero.', { grossReservesBillionUsd: 0.8, expectationPts: 1 })
  ], false),
  mkEvt('DEBATE_PRESIDENCIAL_CRUCE_VIRAL', 'Cruce feroz en pleno debate nacional', 'En el tramo decisivo, un adversario te acorrala en vivo con el dato de pobreza y deuda.', 'INSTITUCIONAL', wCampaign, [
    opt('DATO_MACRO_DURO', 'Responder con datos duros y herencia recibida', 'Convencés a indecisos técnicos consolidando autoridad.', { anchorCredibility: 2, approvalPts: 2 }),
    opt('EMPATIA_ALIVIO', 'Conectar con empatía y prometer alivio cercano', 'Mejora imagen humana dejando flanco sobre el ajuste.', { approvalPts: 3, anchorCredibility: -1 })
  ]),
  mkEvt('BAJA_INTERNA_PROVINCIAL_CLAVE', 'Renuncia tu principal candidato en distrito clave', 'A semanas del cierre, la cabeza de lista en Córdoba o Santa Fe baja su candidatura.', 'INSTITUCIONAL', wCampaign, [
    opt('EXTRAPARTIDARIO', 'Lanzar figura extrapartidaria conocida', 'Mantiene competitividad de voto con poca lealtad orgánica.', { approvalPts: 2, governorLoyaltyPts: -3 }),
    opt('CUADRO_PURO', 'Promover referente leal de tu fuerza', 'Cohesión partidaria con menor techo de votos en balotaje.', { approvalPts: -2, expectationPts: 1 })
  ]),
  mkEvt('APAGON_FISCALIZACION_CONURBANO_BOLETAS', 'Faltan 8.000 fiscales en la Tercera Sección', 'A diez días de los comicios peligra el control de mesas en distritos populosos.', 'INSTITUCIONAL', wCampaign, [
    opt('PACTAR_FISCALES', 'Pactar fiscalización cruzada con aliados e intendentes', 'Cuidás cada voto cediendo poder territorial futuro.', { expectationPts: 3, governorLoyaltyPts: 4, approvalPts: -1 }),
    opt('CAMPANA_VOLUNTARIOS', 'Campaña relámpago de fiscales voluntarios', 'Mística genuina con riesgo en zonas periféricas.', { approvalPts: 2, expectationPts: -2 })
  ]),
  mkEvt('CANDIDATO_OUTSIDER_TE_ROBA_VOTO_JOVEN', 'Irrupción viral de candidato outsider sub-25', 'Un creador de contenido anti-establishment alcanza 9% amenazando tu electorado joven.', 'INSTITUCIONAL', wCampaign, [
    opt('SUMAR_OUTSIDER', 'Integrarlo con lista propia y cargo eventual', 'Neutralizás la fuga sumando ruido interno de gestión.', { approvalPts: 3, anchorCredibility: -2 }),
    opt('IGNORAR_OUTSIDER', 'Ignorarlo apostando a voto útil presidencial', 'Evitás ceder cartel pero arriesgás dividir tu base.', { approvalPts: -2, expectationPts: 1 })
  ]),
  mkEvt('ENCUESTA_EMPATE_TECNICO_ULTIMA_SEMANA', 'Empate técnico a siete días de las urnas', 'Las mediciones muestran diferencia menor a 1% rumbo a la elección decisiva.', 'INSTITUCIONAL', wCampaign, [
    opt('MEDIDA_POPULAR_YA', 'Anunciar alivio fiscal inmediato en TV', 'Sube intención de voto asustando a los bonos soberanos.', { approvalPts: 4, countryRiskPb: 75, anchorCredibility: -3 }),
    opt('ESTABILIDAD_SIN_CAMBIOS', 'Apostar al orden macro y no volver atrás', 'Blindás mercados confiando en el voto estable.', { countryRiskPb: -25, anchorCredibility: 3, approvalPts: -1 })
  ]),
  mkEvt('INCIDENTE_CARAVANA_CAMPANA_INT', 'Incidentes violentos en caravana de cierre', 'Piedrazos obligan a decidir si continuar el acto de cierre en el Conurbano.', 'SOCIAL', wCampaign, [
    opt('SEGUIR_CHALECO', 'Seguir acto con chaleco antibalas y épica', 'Foto épica inolvidable con riesgo físico y polarización.', { approvalPts: 4, strikeConflictPts: 4 }),
    opt('SUSPENDER_PRIME', 'Suspender y denunciar agresión en prime time', 'Capitalizás rechazo a la violencia manteniendo calma.', { approvalPts: 2, expectationPts: 2 })
  ]),
  mkEvt('TRIUNFO_O_DERROTA_AJUSTADA_MEDIO_TERMINO', 'Cierre electoral define el mapa del Congreso', 'El recuento legislativo deja equilibrio fino entre bloqueo propio y minoría parlamentaria.', 'INSTITUCIONAL', wCampaign, [
    opt('PACTO_CENTRO', 'Convocar Pacto de Gobernabilidad al centro', 'Calma financiera instantánea abriendo segunda etapa reformista.', { countryRiskPb: -65, governorLoyaltyPts: 7, expectationPts: 3 }),
    opt('REDOBLAR_MANDATO', 'Redoblar mandato duro sin negociar cargos', 'Cohesiona núcleo propio elevando fricción con cámaras.', { approvalPts: 2, governorLoyaltyPts: -5, countryRiskPb: 35 })
  ])
];

