// Catálogo exhaustivo de Leyes y Reformas de QQG (1:1 con el motor original):
// Cada proyecto contiene descripción, impactos cuantitativos, porcentaje de polémica,
// vía admitida (ley o decreto) y coherencia ideológica con el espacio gobernante.

export type BillApprovalRoute = 'SOLO_LEY' | 'ADMITE_DECRETO';

export type BillMajorityRequired = 'ORDINARIA' | 'CONSTITUCIONAL';

export type BillIdeologyAlignment = 'LIBERAL' | 'ESTATISTA' | 'TRANSVERSAL';

export interface MacroDeltaQQG {
  inversion?: number;
  gastoPrimario?: number;
  jubilacionReal?: number;
  aprobacion?: number;
  resultadoFiscalPbi?: number;
  inflacionMensual?: number;
  pobreza?: number;
  indigencia?: number;
  riesgoPais?: number;
  reservasInternacionales?: number;
  informalidadLaboral?: number;
  desempleo?: number;
  salarioReal?: number;
  confianzaEconomica?: number;
  recaudacion?: number;
  actividadIndustrial?: number;
  produccionAgropecuaria?: number;
  exportaciones?: number;
  importaciones?: number;
  giniPuntos?: number;
  brechaCambiaria?: number;
  negociacion?: number;
}

export interface OfficialLawQQG {
  id: string;
  title: string;
  sector: string;
  description: string;
  deltas: MacroDeltaQQG;
  fiscalImpactLabel: string;
  polemicaPct: number;
  route: BillApprovalRoute;
  majorityRequired: BillMajorityRequired;
  ideology: BillIdeologyAlignment;
}

export const OFFICIAL_LAWS_QQG: OfficialLawQQG[] = [
  {
    id: 'SISTEMA_PREVISIONAL_CAPITALIZACION',
    title: 'Sistema previsional de capitalización',
    sector: 'Jubilaciones y previsión social',
    description: 'Las nuevas generaciones aportan a cuentas individuales de ahorro y capitalización.',
    deltas: {
      inversion: 1.0,
      gastoPrimario: -0.4,
      jubilacionReal: -3.0,
      aprobacion: -3.0,
      resultadoFiscalPbi: 0.4
    },
    fiscalImpactLabel: '+0,4 % del PBI por año',
    polemicaPct: 90,
    route: 'SOLO_LEY',
    majorityRequired: 'ORDINARIA',
    ideology: 'LIBERAL'
  },
  {
    id: 'FIN_SUBSIDIOS_ECONOMICOS',
    title: 'Fin de todos los subsidios económicos',
    sector: 'Energía y recursos naturales',
    description: 'Tarifas plenas de energía y transporte, con tarifa social estrictamente focalizada.',
    deltas: {
      gastoPrimario: -1.0,
      inflacionMensual: 0.6,
      pobreza: 0.8,
      aprobacion: -2.5,
      riesgoPais: -40,
      resultadoFiscalPbi: 1.0
    },
    fiscalImpactLabel: '+1,0 % del PBI por año',
    polemicaPct: 75,
    route: 'ADMITE_DECRETO',
    majorityRequired: 'ORDINARIA',
    ideology: 'LIBERAL'
  },
  {
    id: 'SEGURO_SALUD_PRIVADO',
    title: 'Seguro de salud obligatorio privado',
    sector: 'Salud',
    description: 'Cada persona contrata un seguro; el Estado subsidia a los de menores ingresos.',
    deltas: {
      gastoPrimario: -0.4,
      pobreza: 0.4,
      aprobacion: -2.0,
      resultadoFiscalPbi: 0.4
    },
    fiscalImpactLabel: '+0,4 % del PBI por año',
    polemicaPct: 80,
    route: 'SOLO_LEY',
    majorityRequired: 'ORDINARIA',
    ideology: 'LIBERAL'
  },
  {
    id: 'REFORMA_PREVISIONAL_SUSTENTABILIDAD',
    title: 'Reforma previsional de sustentabilidad',
    sector: 'Jubilaciones y previsión social',
    description: 'Movilidad atada a recaudación genuina y suba gradual de la edad jubilatoria.',
    deltas: {
      gastoPrimario: -0.6,
      jubilacionReal: -4.0,
      aprobacion: -4.0,
      resultadoFiscalPbi: 0.6
    },
    fiscalImpactLabel: '+0,6 % del PBI por año',
    polemicaPct: 85,
    route: 'SOLO_LEY',
    majorityRequired: 'ORDINARIA',
    ideology: 'LIBERAL'
  },
  {
    id: 'DESREGULACION_ENERGETICA',
    title: 'Desregulación energética',
    sector: 'Energía y recursos naturales',
    description: 'Precios de mercado libre y apertura total del mercado eléctrico y gasífero.',
    deltas: {
      inversion: 0.5,
      reservasInternacionales: 2.0,
      inflacionMensual: 0.3,
      gastoPrimario: -0.3,
      aprobacion: -1.5,
      resultadoFiscalPbi: 0.3
    },
    fiscalImpactLabel: '+0,3 % del PBI por año',
    polemicaPct: 50,
    route: 'ADMITE_DECRETO',
    majorityRequired: 'ORDINARIA',
    ideology: 'LIBERAL'
  },
  {
    id: 'NUEVO_CODIGO_PENAL',
    title: 'Nuevo Código Penal',
    sector: 'Justicia penal',
    description: 'Endurecimiento general de penas y modernización integral de tipos penales.',
    deltas: {
      gastoPrimario: 0.1,
      aprobacion: 2.0,
      resultadoFiscalPbi: 0.0
    },
    fiscalImpactLabel: 'Sin impacto fiscal neto',
    polemicaPct: 60,
    route: 'SOLO_LEY',
    majorityRequired: 'ORDINARIA',
    ideology: 'TRANSVERSAL'
  },
  {
    id: 'DEMOCRACIA_SINDICAL',
    title: 'Democracia sindical y cuotas voluntarias',
    sector: 'Trabajo y empleo',
    description: 'Elecciones con boleta única en los gremios y fin de los aportes compulsivos.',
    deltas: {
      informalidadLaboral: -0.4,
      aprobacion: -0.5,
      negociacion: -4.0,
      resultadoFiscalPbi: 0.0
    },
    fiscalImpactLabel: 'Sin costo presupuestario',
    polemicaPct: 70,
    route: 'ADMITE_DECRETO',
    majorityRequired: 'ORDINARIA',
    ideology: 'LIBERAL'
  },
  {
    id: 'SERVICIOS_ESENCIALES_HUELGAS',
    title: 'Servicios esenciales en las huelgas',
    sector: 'Trabajo y empleo',
    description: 'Guardias y funcionamiento mínimo del 75 % en educación, salud y transporte.',
    deltas: {
      confianzaEconomica: 2.0,
      aprobacion: -0.6,
      resultadoFiscalPbi: 0.0
    },
    fiscalImpactLabel: 'Sin costo presupuestario',
    polemicaPct: 65,
    route: 'ADMITE_DECRETO',
    majorityRequired: 'ORDINARIA',
    ideology: 'LIBERAL'
  },
  {
    id: 'SIMPLIFICACION_TRIBUTARIA',
    title: 'Simplificación tributaria',
    sector: 'Impuestos',
    description: 'Unifica y simplifica impuestos nacionales con una baja gradual de la carga.',
    deltas: {
      informalidadLaboral: -1.0,
      inversion: 0.3,
      recaudacion: -0.2,
      aprobacion: 1.0,
      resultadoFiscalPbi: -0.2
    },
    fiscalImpactLabel: '-0,2 % del PBI por año',
    polemicaPct: 55,
    route: 'SOLO_LEY',
    majorityRequired: 'ORDINARIA',
    ideology: 'LIBERAL'
  },
  {
    id: 'LEY_SEGURIDAD_JUSTICIA',
    title: 'Ley de seguridad y justicia',
    sector: 'Seguridad',
    description: 'Mayor equipamiento tecnológico y coordinación operacional de las fuerzas federales.',
    deltas: {
      aprobacion: 2.5,
      gastoPrimario: 0.1,
      resultadoFiscalPbi: -0.1
    },
    fiscalImpactLabel: '-0,1 % del PBI por año',
    polemicaPct: 50,
    route: 'SOLO_LEY',
    majorityRequired: 'ORDINARIA',
    ideology: 'TRANSVERSAL'
  },
  {
    id: 'ALIVIO_FINANCIAMIENTO_PYMES',
    title: 'Alivio y financiamiento para pymes',
    sector: 'Producción e industria',
    description: 'Incentivos fiscales de desgravación y líneas de crédito para pequeñas empresas.',
    deltas: {
      inversion: 0.4,
      desempleo: -0.3,
      recaudacion: -0.1,
      aprobacion: 1.5,
      resultadoFiscalPbi: -0.1
    },
    fiscalImpactLabel: '-0,1 % del PBI por año',
    polemicaPct: 35,
    route: 'ADMITE_DECRETO',
    majorityRequired: 'ORDINARIA',
    ideology: 'TRANSVERSAL'
  },
  {
    id: 'REGIMEN_PRIMER_EMPLEO',
    title: 'Régimen de primer empleo',
    sector: 'Trabajo y empleo',
    description: 'Exención de aportes patronales por 24 meses al contratar jóvenes de 18 a 25 años.',
    deltas: {
      desempleo: -0.4,
      informalidadLaboral: -0.6,
      recaudacion: -0.1,
      aprobacion: 1.0,
      resultadoFiscalPbi: -0.1
    },
    fiscalImpactLabel: '-0,1 % del PBI por año',
    polemicaPct: 40,
    route: 'ADMITE_DECRETO',
    majorityRequired: 'ORDINARIA',
    ideology: 'TRANSVERSAL'
  },
  {
    id: 'FICHA_LIMPIA_ANTICORRUPCION',
    title: 'Ley anticorrupción y ficha limpia',
    sector: 'Instituciones y transparencia',
    description: 'Inhabilitación automática de candidaturas con condena confirmada en segunda instancia.',
    deltas: {
      aprobacion: 3.0,
      confianzaEconomica: 2.0,
      resultadoFiscalPbi: 0.0
    },
    fiscalImpactLabel: 'Sin costo presupuestario',
    polemicaPct: 35,
    route: 'SOLO_LEY',
    majorityRequired: 'ORDINARIA',
    ideology: 'TRANSVERSAL'
  },
  {
    id: 'REFORMA_ELECTORAL_BOLETA_UNICA',
    title: 'Reforma electoral y boleta única',
    sector: 'Instituciones y transparencia',
    description: 'Boleta única de papel obligatoria en todo el país y reglas de financiamiento transparente.',
    deltas: {
      aprobacion: 0.5,
      confianzaEconomica: 1.0,
      resultadoFiscalPbi: 0.0
    },
    fiscalImpactLabel: 'Sin costo presupuestario',
    polemicaPct: 50,
    route: 'SOLO_LEY',
    majorityRequired: 'ORDINARIA',
    ideology: 'TRANSVERSAL'
  },
  {
    id: 'ESTATUTO_PYME',
    title: 'Estatuto pyme',
    sector: 'Producción e industria',
    description: 'Régimen simplificado de impuestos, crédito y contratación especial para pymes.',
    deltas: {
      informalidadLaboral: -1.0,
      desempleo: -0.4,
      inversion: 0.2,
      recaudacion: -0.1,
      aprobacion: 0.5,
      resultadoFiscalPbi: -0.1
    },
    fiscalImpactLabel: '-0,1 % del PBI por año',
    polemicaPct: 30,
    route: 'SOLO_LEY',
    majorityRequired: 'ORDINARIA',
    ideology: 'TRANSVERSAL'
  },
  {
    id: 'REFORMA_POLICIAL_INTEGRAL',
    title: 'Reforma policial integral',
    sector: 'Seguridad',
    description: 'Modernización en formación, salarios, control externo y estadísticas abiertas.',
    deltas: {
      aprobacion: 1.2,
      gastoPrimario: 0.2,
      resultadoFiscalPbi: -0.2
    },
    fiscalImpactLabel: '-0,2 % del PBI por año',
    polemicaPct: 40,
    route: 'SOLO_LEY',
    majorityRequired: 'ORDINARIA',
    ideology: 'TRANSVERSAL'
  },
  {
    id: 'EDUCACION_DIGITAL_PROGRAMACION',
    title: 'Educación digital y programación obligatoria',
    sector: 'Educación',
    description: 'Enseñanza obligatoria de programación, pensamiento computacional e inglés desde primaria.',
    deltas: {
      gastoPrimario: 0.1,
      inversion: 0.1,
      aprobacion: 0.6,
      resultadoFiscalPbi: -0.1
    },
    fiscalImpactLabel: '-0,1 % del PBI por año',
    polemicaPct: 20,
    route: 'ADMITE_DECRETO',
    majorityRequired: 'ORDINARIA',
    ideology: 'TRANSVERSAL'
  },
  {
    id: 'LEY_CALIDAD_EDUCATIVA',
    title: 'Ley de calidad educativa',
    sector: 'Educación',
    description: 'Evaluación docente periódica vinculante, cumplimiento estricto del calendario escolar y fondos.',
    deltas: {
      aprobacion: 1.5,
      desempleo: -0.2,
      gastoPrimario: 0.2,
      resultadoFiscalPbi: -0.1
    },
    fiscalImpactLabel: '-0,1 % del PBI por año',
    polemicaPct: 40,
    route: 'SOLO_LEY',
    majorityRequired: 'ORDINARIA',
    ideology: 'TRANSVERSAL'
  },
  {
    id: 'NUEVO_REGIMEN_COPARTICIPACION',
    title: 'Nuevo régimen de coparticipación',
    sector: 'Federalismo y coparticipación',
    description: 'Redefine los coeficientes de reparto automático de fondos entre Nación y las 24 provincias.',
    deltas: {
      negociacion: 6.0,
      resultadoFiscalPbi: -0.1,
      aprobacion: 1.0
    },
    fiscalImpactLabel: '-0,1 % del PBI por año',
    polemicaPct: 70,
    route: 'SOLO_LEY',
    majorityRequired: 'CONSTITUCIONAL',
    ideology: 'TRANSVERSAL'
  },
  {
    id: 'PRESUPUESTOS_MINIMOS_AMBIENTALES',
    title: 'Ley de presupuestos mínimos ambientales',
    sector: 'Instituciones y transparencia',
    description: 'Mayores exigencias de impacto ambiental, protección de humedales y fiscalización.',
    deltas: {
      aprobacion: 0.8,
      inversion: -0.1,
      resultadoFiscalPbi: 0.0
    },
    fiscalImpactLabel: 'Sin costo presupuestario',
    polemicaPct: 40,
    route: 'SOLO_LEY',
    majorityRequired: 'ORDINARIA',
    ideology: 'ESTATISTA'
  },
  {
    id: 'REGIMEN_ECONOMIA_POPULAR',
    title: 'Régimen de la economía popular',
    sector: 'Trabajo y empleo',
    description: 'Registro de trabajadores de la economía popular, cobertura social y acceso a microcrédito.',
    deltas: {
      informalidadLaboral: -1.2,
      pobreza: -0.5,
      gastoPrimario: 0.3,
      aprobacion: 0.8,
      resultadoFiscalPbi: -0.3
    },
    fiscalImpactLabel: '-0,3 % del PBI por año',
    polemicaPct: 40,
    route: 'ADMITE_DECRETO',
    majorityRequired: 'ORDINARIA',
    ideology: 'ESTATISTA'
  },
  {
    id: 'FINANCIAMIENTO_UNIVERSITARIO_AUTOMATICO',
    title: 'Ley de financiamiento universitario',
    sector: 'Educación',
    description: 'Actualización automática mensual de partidas universitarias y salarios docentes por IPC.',
    deltas: {
      gastoPrimario: 0.3,
      aprobacion: 1.2,
      giniPuntos: -0.3,
      resultadoFiscalPbi: -0.3
    },
    fiscalImpactLabel: '-0,3 % del PBI por año',
    polemicaPct: 40,
    route: 'SOLO_LEY',
    majorityRequired: 'ORDINARIA',
    ideology: 'ESTATISTA'
  },
  {
    id: 'LEY_INTEGRAL_CUIDADOS',
    title: 'Ley integral de cuidados',
    sector: 'Asistencia social',
    description: 'Licencias parentales igualitarias y red pública nacional de centros de primera infancia.',
    deltas: {
      desempleo: -0.3,
      pobreza: -0.6,
      gastoPrimario: 0.4,
      aprobacion: 1.0,
      resultadoFiscalPbi: -0.4
    },
    fiscalImpactLabel: '-0,4 % del PBI por año',
    polemicaPct: 35,
    route: 'SOLO_LEY',
    majorityRequired: 'ORDINARIA',
    ideology: 'ESTATISTA'
  },
  {
    id: 'SISTEMA_UNICO_SALUD',
    title: 'Sistema único de salud',
    sector: 'Salud',
    description: 'Integración centralizada de hospitales públicos, obras sociales sindicales y medicina prepaga.',
    deltas: {
      pobreza: -0.6,
      gastoPrimario: 0.6,
      confianzaEconomica: -2.0,
      aprobacion: 1.0,
      resultadoFiscalPbi: -0.6
    },
    fiscalImpactLabel: '-0,6 % del PBI por año',
    polemicaPct: 65,
    route: 'SOLO_LEY',
    majorityRequired: 'ORDINARIA',
    ideology: 'ESTATISTA'
  },
  {
    id: 'RENTA_INESPERADA',
    title: 'Impuesto a la renta inesperada',
    sector: 'Impuestos',
    description: 'Gravamen extraordinario del 15% sobre utilidades extraordinarias provocadas por shocks de precios.',
    deltas: {
      recaudacion: 0.5,
      confianzaEconomica: -2.5,
      inversion: -0.4,
      resultadoFiscalPbi: 0.5
    },
    fiscalImpactLabel: '+0,5 % del PBI por año',
    polemicaPct: 55,
    route: 'SOLO_LEY',
    majorityRequired: 'ORDINARIA',
    ideology: 'ESTATISTA'
  },
  {
    id: 'CONSEJO_SALARIO_VINCULANTE',
    title: 'Consejo del salario con poder vinculante',
    sector: 'Trabajo y empleo',
    description: 'Pisos salariales fijados obligatoriamente por rama de actividad entre gremios, empresas y Estado.',
    deltas: {
      salarioReal: 1.0,
      informalidadLaboral: 0.5,
      aprobacion: 0.8,
      resultadoFiscalPbi: 0.0
    },
    fiscalImpactLabel: 'Sin costo presupuestario',
    polemicaPct: 45,
    route: 'ADMITE_DECRETO',
    majorityRequired: 'ORDINARIA',
    ideology: 'ESTATISTA'
  },
  {
    id: 'PLAN_VIVIENDA_PUBLICA',
    title: 'Plan nacional de vivienda pública',
    sector: 'Infraestructura y vivienda',
    description: 'Construcción federal de 100.000 viviendas sociales mediante licitación y cooperativas barriales.',
    deltas: {
      inversion: 0.3,
      desempleo: -0.3,
      gastoPrimario: 0.3,
      aprobacion: 1.5,
      resultadoFiscalPbi: -0.3
    },
    fiscalImpactLabel: '-0,3 % del PBI por año',
    polemicaPct: 35,
    route: 'ADMITE_DECRETO',
    majorityRequired: 'ORDINARIA',
    ideology: 'ESTATISTA'
  },
  {
    id: 'REFORMA_TRIBUTARIA_PROGRESIVA',
    title: 'Reforma tributaria progresiva',
    sector: 'Impuestos',
    description: 'Alivio en el IVA al consumo de alimentos compensado con mayor carga a bienes personales y rentas.',
    deltas: {
      recaudacion: 0.3,
      giniPuntos: -0.3,
      informalidadLaboral: 0.2,
      aprobacion: 0.5,
      resultadoFiscalPbi: 0.3
    },
    fiscalImpactLabel: '+0,3 % del PBI por año',
    polemicaPct: 60,
    route: 'SOLO_LEY',
    majorityRequired: 'ORDINARIA',
    ideology: 'ESTATISTA'
  },
  {
    id: 'SOBERANIA_ALIMENTARIA',
    title: 'Ley de soberanía alimentaria',
    sector: 'Producción e industria',
    description: 'Compras prioritarias a cooperativas de agricultura familiar y protección soberana de semillas.',
    deltas: {
      indigencia: -0.6,
      produccionAgropecuaria: -1.0,
      aprobacion: 0.8,
      resultadoFiscalPbi: 0.0
    },
    fiscalImpactLabel: 'Sin costo presupuestario',
    polemicaPct: 50,
    route: 'ADMITE_DECRETO',
    majorityRequired: 'ORDINARIA',
    ideology: 'ESTATISTA'
  },
  {
    id: 'SEMANA_LABORAL_CUATRO_DIAS',
    title: 'Semana laboral de cuatro días',
    sector: 'Trabajo y empleo',
    description: 'Reducción de la jornada legal a 32 horas semanales sin reducción del salario básico.',
    deltas: {
      salarioReal: 1.5,
      desempleo: -0.3,
      informalidadLaboral: 0.3,
      inversion: -0.8,
      aprobacion: 1.5,
      resultadoFiscalPbi: 0.0
    },
    fiscalImpactLabel: 'Sin costo presupuestario',
    polemicaPct: 60,
    route: 'SOLO_LEY',
    majorityRequired: 'ORDINARIA',
    ideology: 'ESTATISTA'
  },
  {
    id: 'EMERGENCIA_SOCIAL_ALIMENTARIA',
    title: 'Emergencia social y alimentaria',
    sector: 'Asistencia social',
    description: 'Refuerzo presupuestario extraordinario para la red federal de comedores comunitarios y merenderos.',
    deltas: {
      pobreza: -0.8,
      indigencia: -0.5,
      gastoPrimario: 0.3,
      aprobacion: 1.2,
      resultadoFiscalPbi: -0.3
    },
    fiscalImpactLabel: '-0,3 % del PBI por año',
    polemicaPct: 40,
    route: 'ADMITE_DECRETO',
    majorityRequired: 'ORDINARIA',
    ideology: 'ESTATISTA'
  },
  {
    id: 'PROTECCION_INDUSTRIAL_ARANCELES',
    title: 'Ley de protección industrial',
    sector: 'Comercio exterior',
    description: 'Licencias no automáticas de importación, compre nacional y aranceles a bienes manufacturados.',
    deltas: {
      actividadIndustrial: 3.0,
      importaciones: -3.0,
      inflacionMensual: 0.2,
      inversion: 0.2,
      aprobacion: 1.0,
      resultadoFiscalPbi: 0.0
    },
    fiscalImpactLabel: 'Sin costo presupuestario',
    polemicaPct: 50,
    route: 'ADMITE_DECRETO',
    majorityRequired: 'ORDINARIA',
    ideology: 'ESTATISTA'
  },
  {
    id: 'IMPUESTO_A_LA_HERENCIA',
    title: 'Impuesto a la herencia',
    sector: 'Impuestos',
    description: 'Gravamen progresivo a las transmisiones gratuitas de grandes patrimonios e inmuebles de lujo.',
    deltas: {
      recaudacion: 0.4,
      giniPuntos: -0.8,
      inversion: -0.2,
      confianzaEconomica: -2.0,
      aprobacion: 0.3,
      resultadoFiscalPbi: 0.4
    },
    fiscalImpactLabel: '+0,4 % del PBI por año',
    polemicaPct: 65,
    route: 'SOLO_LEY',
    majorityRequired: 'ORDINARIA',
    ideology: 'ESTATISTA'
  },
  {
    id: 'MORATORIA_JUBILACION_UNIVERSAL',
    title: 'Moratoria y jubilación universal',
    sector: 'Jubilaciones y previsión social',
    description: 'Permite jubilarse y percibir haberes a quienes no alcanzaron los 30 años de aportes formales.',
    deltas: {
      gastoPrimario: 0.6,
      jubilacionReal: 4.0,
      pobreza: -0.5,
      aprobacion: 3.0,
      resultadoFiscalPbi: -0.6
    },
    fiscalImpactLabel: '-0,6 % del PBI por año',
    polemicaPct: 60,
    route: 'SOLO_LEY',
    majorityRequired: 'ORDINARIA',
    ideology: 'ESTATISTA'
  },
  {
    id: 'PARITARIAS_INDEXADAS_IPC',
    title: 'Salario mínimo y paritarias indexadas',
    sector: 'Trabajo y empleo',
    description: 'Cláusula gatillo mensual automática obligatoria sobre el salario mínimo y convenios de trabajo.',
    deltas: {
      salarioReal: 3.0,
      inflacionMensual: 0.2,
      informalidadLaboral: 0.4,
      aprobacion: 2.0,
      resultadoFiscalPbi: 0.0
    },
    fiscalImpactLabel: 'Sin costo presupuestario',
    polemicaPct: 55,
    route: 'ADMITE_DECRETO',
    majorityRequired: 'ORDINARIA',
    ideology: 'ESTATISTA'
  },
  {
    id: 'CONTROL_PRECIOS_GONDOLAS',
    title: 'Ley de góndolas y control de precios',
    sector: 'Producción e industria',
    description: 'Fijación de precios máximos en la canasta básica y sanciones a monopolios de distribución.',
    deltas: {
      inflacionMensual: -0.2,
      inversion: -0.2,
      aprobacion: 1.2,
      resultadoFiscalPbi: 0.0
    },
    fiscalImpactLabel: 'Sin costo presupuestario',
    polemicaPct: 55,
    route: 'ADMITE_DECRETO',
    majorityRequired: 'ORDINARIA',
    ideology: 'ESTATISTA'
  },
  {
    id: 'EMPRESAS_PUBLICAS_ESTRATEGICAS',
    title: 'Fortalecimiento de empresas públicas',
    sector: 'Organización del Estado',
    description: 'Capitalización estatal y ampliación de facultades para YPF, Aerolíneas Argentinas y Trenes.',
    deltas: {
      gastoPrimario: 0.4,
      inversion: 0.2,
      confianzaEconomica: -2.0,
      aprobacion: 1.0,
      resultadoFiscalPbi: -0.4
    },
    fiscalImpactLabel: '-0,4 % del PBI por año',
    polemicaPct: 55,
    route: 'SOLO_LEY',
    majorityRequired: 'ORDINARIA',
    ideology: 'ESTATISTA'
  },
  {
    id: 'PARTICIPACION_GANANCIAS_TRABAJADORES',
    title: 'Participación de los trabajadores en las ganancias',
    sector: 'Trabajo y empleo',
    description: 'Aplicación del artículo 14 bis de la CN: reparto obligatorio del 10% de utilidades netas empresarias.',
    deltas: {
      salarioReal: 2.0,
      inversion: -0.3,
      confianzaEconomica: -2.0,
      aprobacion: 1.5,
      resultadoFiscalPbi: 0.0
    },
    fiscalImpactLabel: 'Sin costo presupuestario',
    polemicaPct: 70,
    route: 'SOLO_LEY',
    majorityRequired: 'ORDINARIA',
    ideology: 'ESTATISTA'
  },
  {
    id: 'SALARIO_BASICO_UNIVERSAL',
    title: 'Salario básico universal',
    sector: 'Asistencia social',
    description: 'Transferencia monetaria mensual permanente a toda persona adulta sin empleo formal registrado.',
    deltas: {
      pobreza: -2.5,
      indigencia: -2.0,
      gastoPrimario: 1.2,
      informalidadLaboral: 1.0,
      aprobacion: 2.0,
      resultadoFiscalPbi: -1.2
    },
    fiscalImpactLabel: '-1,2 % del PBI por año',
    polemicaPct: 75,
    route: 'SOLO_LEY',
    majorityRequired: 'ORDINARIA',
    ideology: 'ESTATISTA'
  },
  {
    id: 'NACIONALIZACION_RECURSOS_ESTRATEGICOS',
    title: 'Nacionalización de recursos estratégicos',
    sector: 'Energía y recursos naturales',
    description: 'Estatización del 100% de yacimientos de litio, cobre y control mayoritario absoluto en hidrocarburos.',
    deltas: {
      inversion: -0.7,
      riesgoPais: 90,
      confianzaEconomica: -4.0,
      reservasInternacionales: -1.0,
      aprobacion: 1.5,
      resultadoFiscalPbi: 0.0
    },
    fiscalImpactLabel: 'Sin costo presupuestario',
    polemicaPct: 80,
    route: 'SOLO_LEY',
    majorityRequired: 'CONSTITUCIONAL',
    ideology: 'ESTATISTA'
  },
  {
    id: 'BANCA_PUBLICA_DESARROLLO',
    title: 'Banca pública de desarrollo',
    sector: 'Producción e industria',
    description: 'Líneas masivas de crédito productivo a tasa subsidiada mediante el Banco de la Nación Argentina.',
    deltas: {
      actividadIndustrial: 2.0,
      inversion: 0.3,
      gastoPrimario: 0.2,
      aprobacion: 1.0,
      resultadoFiscalPbi: -0.2
    },
    fiscalImpactLabel: '-0,2 % del PBI por año',
    polemicaPct: 55,
    route: 'SOLO_LEY',
    majorityRequired: 'ORDINARIA',
    ideology: 'ESTATISTA'
  },
  {
    id: 'APORTE_GRANDES_FORTUNAS',
    title: 'Aporte extraordinario de grandes fortunas',
    sector: 'Impuestos',
    description: 'Contribución solidaria por única vez a patrimonios personales superiores a 5 millones de USD.',
    deltas: {
      recaudacion: 0.4,
      confianzaEconomica: -4.0,
      reservasInternacionales: -1.0,
      aprobacion: 1.5,
      resultadoFiscalPbi: 0.4
    },
    fiscalImpactLabel: '+0,4 % del PBI por año',
    polemicaPct: 85,
    route: 'SOLO_LEY',
    majorityRequired: 'ORDINARIA',
    ideology: 'ESTATISTA'
  },
  {
    id: 'MONOPOLIO_COMERCIO_EXTERIOR',
    title: 'Monopolio estatal del comercio exterior',
    sector: 'Comercio exterior',
    description: 'Un ente público centraliza y fiscaliza todas las operaciones de importación y exportación nacional.',
    deltas: {
      reservasInternacionales: 4.0,
      exportaciones: -6.0,
      confianzaEconomica: -8.0,
      brechaCambiaria: 10.0,
      resultadoFiscalPbi: 0.0
    },
    fiscalImpactLabel: 'Sin costo presupuestario',
    polemicaPct: 90,
    route: 'SOLO_LEY',
    majorityRequired: 'CONSTITUCIONAL',
    ideology: 'ESTATISTA'
  },
  {
    id: 'ESTATIZACION_COMERCIO_GRANOS',
    title: 'Estatización del comercio exterior de granos',
    sector: 'Comercio exterior',
    description: 'Creación de una junta nacional de granos con monopolio en la compra y liquidación de cosechas.',
    deltas: {
      produccionAgropecuaria: -3.0,
      exportaciones: -3.0,
      confianzaEconomica: -5.0,
      aprobacion: -1.0,
      resultadoFiscalPbi: 0.0
    },
    fiscalImpactLabel: 'Sin costo presupuestario',
    polemicaPct: 90,
    route: 'SOLO_LEY',
    majorityRequired: 'CONSTITUCIONAL',
    ideology: 'ESTATISTA'
  },
  {
    id: 'REFORMA_AGRARIA',
    title: 'Reforma agraria y tierra para quien la trabaja',
    sector: 'Producción e industria',
    description: 'Expropiación de latifundios improductivos y cesión de tierras a cooperativas de pequeños agricultores.',
    deltas: {
      produccionAgropecuaria: -6.0,
      giniPuntos: -1.5,
      confianzaEconomica: -6.0,
      aprobacion: 1.0,
      resultadoFiscalPbi: 0.0
    },
    fiscalImpactLabel: 'Sin costo presupuestario',
    polemicaPct: 90,
    route: 'SOLO_LEY',
    majorityRequired: 'CONSTITUCIONAL',
    ideology: 'ESTATISTA'
  },
  {
    id: 'NACIONALIZACION_DEPOSITOS',
    title: 'Nacionalización del sistema de depósitos',
    sector: 'Moneda y Banco Central',
    description: 'Los bancos privados actúan como mandatarios y el Estado garantiza y asigna todos los depósitos.',
    deltas: {
      inversion: -2.0,
      confianzaEconomica: -10.0,
      riesgoPais: 250,
      inflacionMensual: 0.4,
      actividadIndustrial: 1.0,
      aprobacion: -1.0,
      resultadoFiscalPbi: 0.0
    },
    fiscalImpactLabel: 'Sin costo presupuestario',
    polemicaPct: 95,
    route: 'SOLO_LEY',
    majorityRequired: 'CONSTITUCIONAL',
    ideology: 'ESTATISTA'
  }
];

const RIGHT_PARTIES = new Set(['LLA', 'PRO']);

export function checkIsBillIdeologicallyAligned(
  billIdeology: BillIdeologyAlignment,
  playerPartySigla: string
): boolean {
  if (billIdeology === 'TRANSVERSAL') return true;
  if (RIGHT_PARTIES.has(playerPartySigla)) {
    return billIdeology === 'LIBERAL';
  }
  return billIdeology === 'ESTATISTA';
}
