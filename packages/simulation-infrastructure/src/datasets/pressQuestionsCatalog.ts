// Catalogo de +50 preguntas de Sala de Prensa / Cadena Nacional (54 rondas reales)
// acreditando a todos los canales, diarios y revistas de noticias de la Argentina.

export type PressMediaId =
  | 'CLARIN'
  | 'LA_NACION'
  | 'LN_MAS'
  | 'TN'
  | 'C5N'
  | 'CRONICA_TV'
  | 'A24'
  | 'CANAL_26'
  | 'TV_PUBLICA'
  | 'INFOBAE'
  | 'AMBITO'
  | 'CRONISTA'
  | 'PAGINA_12'
  | 'VOZ_INTERIOR'
  | 'EL_DESTAPE'
  | 'REVISTA_BARCELONA'
  | 'FORBES'
  | 'BLOOMBERG'
  | 'CNN_ESPANOL';

export interface PressRoundOption {
  tone: 'ORTODOXO' | 'CHICANA' | 'INSTITUCIONAL';
  toneLabel: string;
  replyText: string;
  imageDelta: number;
  viralDelta: number;
  marketDelta: number;
  headline: string;
}

export interface PressQuestionRoundSpec {
  id: string;
  journalist: string;
  outlet: string;
  outletLogos: PressMediaId[];
  question: string;
  options: [PressRoundOption, PressRoundOption, PressRoundOption];
}

function mkPressRound(
  id: string,
  journalist: string,
  outlet: string,
  outletLogos: PressMediaId[],
  question: string,
  ortodoxo: [string, string],
  chicana: [string, string],
  institucional: [string, string]
): PressQuestionRoundSpec {
  return {
    id,
    journalist,
    outlet,
    outletLogos,
    question,
    options: [
      {
        tone: 'ORTODOXO',
        toneLabel: 'Técnico-Ortodoxo (Rigor Macro)',
        replyText: ortodoxo[0],
        imageDelta: 1.5,
        viralDelta: 1.8,
        marketDelta: 4.0,
        headline: ortodoxo[1]
      },
      {
        tone: 'CHICANA',
        toneLabel: 'Chicana al Hueso (Tapa y Redes)',
        replyText: chicana[0],
        imageDelta: 0.7,
        viralDelta: 6.4,
        marketDelta: 1.0,
        headline: chicana[1]
      },
      {
        tone: 'INSTITUCIONAL',
        toneLabel: 'Institucional-Moderado (Consenso)',
        replyText: institucional[0],
        imageDelta: 2.9,
        viralDelta: 0.7,
        marketDelta: 2.4,
        headline: institucional[1]
      }
    ]
  };
}

export const PRESS_QUESTIONS_CATALOG: PressQuestionRoundSpec[] = [
  mkPressRound(
    'PR_01', 'Acreditado Economía · Finanzas', 'LN+ / Ámbito / Bloomberg', ['LN_MAS', 'AMBITO', 'BLOOMBERG'],
    '«Los formadores de precios remarcaron preventivamente y los gremios rechazan paritarias debajo del IPC. ¿Convalida devaluación o sostiene el ancla fiscal a rajatabla?»',
    ['«El equilibrio fiscal no se negocia ni un milímetro: no habrá salto devaluatorio discrecional.»', 'RATIFICAN ANCLA FISCAL Y DESCARTAN SALTO CAMBIARIO'],
    ['«El que remarque apostando a una devaluación se va a quedar mirando la góndola llena y las ventas en cero.»', 'CRUCE CON FORMADORES DE PRECIOS POR REMARCACIONES'],
    ['«Convocaremos a cámaras empresarias y paritarias sectoriales para anclar expectativas con equilibrio fiscal.»', 'CONVOCAN MESA DE CONSISTENCIA DE PRECIOS Y SALARIOS']
  ),
  mkPressRound(
    'PR_02', 'Corresponsal Parlamentario · Política', 'TN / Clarín / LA NACION', ['TN', 'CLARIN', 'LA_NACION'],
    '«Los gobernadores dialoguistas advierten que sin fondos para rutas ni compensaciones no habrá quórum en el Senado. ¿Billetera abierta o decretazo?»',
    ['«Cada giro discrecional se elimina: toda obra será bajo metas de superávit provincial y adhesión al RIGI.»', 'CONDICIONAN GIROS A METAS FISCALES PROVINCIALES'],
    ['«Si quieren voltear una ley para proteger cajas viejas, vamos a publicar en televisión quién votó contra el contribuyente.»', 'TENSIÓN CON EL SENADO: EXPONDRÁN VOTOS CONTRA EL PAQUETE'],
    ['«El Ministerio del Interior negocia el Pacto Federal con las provincias para lograr dictamen de mayoría.»', 'ACERCAMIENTO CON GOBERNADORES POR EL PACTO FEDERAL']
  ),
  mkPressRound(
    'PR_03', 'Acreditado Calle y Gremios', 'C5N / Crónica TV / Página/12', ['C5N', 'CRONICA_TV', 'PAGINA_12'],
    '«Columnas sindicales y universitarias anunciaron paro con movilización al Congreso. ¿Protocolo antipiquetes estricto o canal de negociación abierto?»',
    ['«La vereda es libre para manifestarse, pero las fuerzas federales garantizarán la libre circulación de los trabajadores.»', 'RATIFICAN APLICACIÓN DEL PROTOCOLO DE ORDEN PÚBLICO'],
    ['«El que corta no cobra y vamos a auditar hasta el último recibo de los gerentes de la pobreza que arrean gente.»', '"EL QUE CORTA NO COBRA": AUDITORÍA SOBRE INTERMEDIARIOS'],
    ['«Reforzaremos becas y asignaciones de transferencia directa sin intermediarios para descomprimir la calle.»', 'REFUERZO SOCIAL DIRECTO PARA DESCOMPRIMIR CONFLICTO']
  ),
  mkPressRound(
    'PR_04', 'Mesa Redacción & Negocios', 'A24 / Infobae / Forbes', ['A24', 'INFOBAE', 'FORBES'],
    '«Fondos tech y energéticos evalúan desembarcos bajo el RIGI, pero preguntan por la estabilidad jurídica y las críticas oficiales al periodismo. ¿Qué señal da hoy?»',
    ['«Reglas fiscales estables por treinta años y cero discrecionalidad estatal: el capital se define por previsibilidad macro.»', 'BLINDAN REGLAS DEL RIGI ANTE CUMBRE DE INVERSIONES'],
    ['«Se terminó el Estado financista de relatos amigos: el que extrañe el sobre oficial que busque sponsors privados.»', 'CRUCE EN ROSADA POR PAUTA CERO Y FINANCIAMIENTO MEDIÁTICO'],
    ['«Lanzamos mesa de competitividad federal y respeto irrestricto a la prensa acreditada en todos los palacios.»', 'CONVOCAN MESA DE INVERSIÓN CON SEGURIDAD JURÍDICA']
  ),
  mkPressRound(
    'PR_05', 'Corresponsal Bancario · BCRA', 'Bloomberg / El Cronista / Ámbito', ['BLOOMBERG', 'CRONISTA', 'AMBITO'],
    '«Wall Street pide cronograma exacto de levantamiento total de restricciones cambiarias tras la baja de tasas del Tesoro. ¿Pone fecha este año?»',
    ['«No fijamos fechas políticas sino condiciones de balance: saneado el Central y superando reservas meta, se levantan todas las trabas.»', 'ECONOMÍA ATA SALIDA CAMBIARIA A BALANCES DEL BCRA'],
    ['«Muchos gurúes de planilla Excel pronosticaban hiperinflación y dólar a cinco mil: les volvimos a ganar el pronóstico.»', 'DURAS CRÍTICAS A PRONÓSTICOS DE CONSULTORAS DE LA CITY'],
    ['«El equipo económico publicará metas trimestrales de reservas y liquidez para dar hoja de ruta clara al mercado.»', 'ANUNCIAN HOJA DE RUTA TRIMESTRAL PARA NORMALIZAR EL MULC']
  ),
  mkPressRound(
    'PR_06', 'Periodista Federal · Provincias', 'La Voz del Interior / TV Pública', ['VOZ_INTERIOR', 'TV_PUBLICA'],
    '«Córdoba, Santa Fe y Patagonia reclaman desigualdad extrema por subsidios al transporte concentrados en el AMBA. ¿Equilibra el reparto federal?»',
    ['«Vamos hacia subsidio directo en la tarjeta del usuario sin subsidios opacos a empresas de colectivos por jurisdicción.»', 'REFORMA DE SUBSIDIOS AL TRANSPORTE HACIA EL USUARIO'],
    ['«Durante décadas esquilmaron al interior productivo para pagar campaña en el Conurbano. Basta de cajas porteñas.»', 'CRUCE CON EL AMBA POR DISCRIMINACIÓN DE SUBSIDIOS'],
    ['«Abrimos ronda de gobernadores y secretarios de transporte para rediseñar el fondo compensador federal.»', 'MESA FEDERAL PARA REEQUILIBRAR BOLETOS DEL INTERIOR']
  ),
  mkPressRound(
    'PR_07', 'Tribunales y Justicia · Rosada', 'El Destape / Infobae / Clarín', ['EL_DESTAPE', 'INFOBAE', 'CLARIN'],
    '«Trascendieron borradores de fallos adversos en Comodoro Py y la Corte sobre un paquete de decretos delegados. ¿Acatará el fallo o pedirá per saltum?»',
    ['«Defendemos la constitucionalidad de las reformas ante las instancias judiciales con solvencia jurídica técnica.»', 'RESPALDAN LEGALIDAD DE REFORMAS ANTE EVENTUALES FALLOS'],
    ['«Si un puñado de jueces quiere gobernar desde un escritorio contra la voluntad de la gente, los vamos a discutir en la plaza pública.»', 'TENSIÓN CON TRIBUNALES POR CAUTELARES CONTRA DNU'],
    ['«Respetamos la independencia del Poder Judicial y trabajaremos con el Congreso para dar rango de ley a cada reforma.»', 'APUESTAN AL CONGRESO PARA BLINDAR DECRETOS OBSERVADOS']
  ),
  mkPressRound(
    'PR_08', 'Sátira y Redes · Viralidad', 'Revista Barcelona / Canal 26 / A24', ['REVISTA_BARCELONA', 'CANAL_26', 'A24'],
    '«Un meme viral y audios editados con inteligencia artificial sobre supuestos dichos suyos explotaron en X y TikTok. ¿Cómo responde a la polémica?»',
    ['«No comentamos operaciones apócrifas ni distracciones digitales: nuestra agenda pública está documentada en el Boletín Oficial.»', 'IGNORA POLÉMICA EN REDES Y RATIFICA AGENDA OFICIAL'],
    ['«Les duele que les ganemos la calle digital sin pagar trolls de call center; ríanse tranquilos que los resultados hablan solos.»', 'RESPUESTA IRÓNICA DESDE EL ATRIL DISPARA TENDENCIA VIRAL'],
    ['«Presentaremos informe técnico sobre desinformación digital pero mantenemos foco total en resolver la inflación real.»', 'MINIMIZAN CONTROVERSIA EN REDES Y PIDEN FOCO ECONÓMICO']
  ),
  mkPressRound(
    'PR_09', 'Acreditado Energía & Campo', 'El Cronista / Forbes / LA NACION', ['CRONISTA', 'FORBES', 'LA_NACION'],
    '«El sector agroexportador retiene silobolsas esperando baja de retenciones mientras Vaca Muerta demanda oleoductos al Atlántico. ¿Cuál es la prioridad?»',
    ['«Aceleramos evacuación energética de Neuquén que aporta USD 15.000 millones anuales; las retenciones bajan contra metas fiscales cumplidas.»', 'PRIORIZAN OLEODUCTOS DE VACA MUERTA ANTE RECLAMO AGRO'],
    ['«El campo sabe que somos los únicos que bajamos impuestos reales y no mandamos patotas a romper silobolsas.»', 'GUIÑO AL CAMPO Y DEFENSA DE LA PROPIEDAD PRIVADA'],
    ['«Mesa agroindustrial junto al sector energético para armar un calendario previsible de baja tributaria por cosecha.»', 'ACUERDAN MESA DE TRABAJO CON BOLSAS DE CEREALES Y ENERGÍA']
  ),
  mkPressRound(
    'PR_10', 'Corresponsal Internacional', 'CNN en Español / Bloomberg / Infobae', ['CNN_ESPANOL', 'BLOOMBERG', 'INFOBAE'],
    '«Diplomáticos europeos y Washington observan con atención las tensiones comerciales con Brasil y China. ¿Reevalúa el bloque del Mercosur?»',
    ['«Exigimos flexibilización comercial del Mercosur para cerrar acuerdos bilaterales propios sin quedar atados a aranceles proteccionistas.»', 'IMPULSAN APERTURA BILATERAL DE COMERCIO FUERA DEL MERCOSUR'],
    ['«Nuestras relaciones comerciales las decidimos pensando en los dólares que entran al país, no en cenáculos ideológicos vencidos.»', 'DEFINICIÓN PRAGMÁTICA SOBRE COMERCIO EXTERIOR EN VIVO'],
    ['«Mantenemos diálogo estratégico con todos los socios comerciales defendiendo las exportaciones argentinas.»', 'RATIFICAN PRAGMATISMO CON SOCIOS COMERCIALES GLOBALES']
  )
];

// Expandimos hasta 54 rondas unicas sumando 44 escenarios especificos con el constructor compacto.
const EXTRA_PRESS_SEEDS: Array<[string, string, string, PressMediaId[], string, string, string, string]> = [
  ['PR_11', 'Cobertura Previsional', 'Crónica TV / C5N', ['CRONICA_TV', 'C5N'], '«Los jubilados denuncian subas de remedios por encima del haber mínimo. ¿Habrá bono extraordinario o cambio de fórmula?»', 'La caja previsional solo se sostiene sin emisión recomponiendo empleo formal.', 'El que quebró el ANSES regalando cajas sin aportes fue el populismo anterior.', 'Estudiamos canasta protegida de medicamentos crónicos financiada sin déficit.'],
  ['PR_12', 'Mesa Financiera', 'Ámbito / Bloomberg', ['AMBITO', 'BLOOMBERG'], '«La brecha cambiaria superó el 25% esta mañana por cobertura preelectoral. ¿Sube tasas el Banco Central?»', 'Mantenemos absorción monetaria estricta y licitación de deuda corta para secar pesos.', 'Los especuladores de brecha corta van a perder hasta los zapatos apostando contra el peso.', 'El BCRA y Economía trabajan coordinados para darle liquidez y calma al mercado.'],
  ['PR_13', 'Acreditado Salud', 'TN / Página/12', ['TN', 'PAGINA_12'], '«Hospitales nacionales advierten faltantes de reactivos e insumos importados por demoras de pago. ¿Cuándo regularizan?»', 'Auditamos stock real y liberamos compras directas transparentes sin intermediarios.', 'Descubrimos depósitos llenos de facturas truchas antes de habilitar un solo cheque.', 'Habilitamos giro inmediato de emergencia para guardias y tratamientos críticos.'],
  ['PR_14', 'Acreditado Educativo', 'LA NACION / C5N', ['LA_NACION', 'C5N'], '«Rectores nacionales reclaman actualización salarial docente ante peligro de cierre de cuatrimestre. ¿Hay margen?»', 'Reasignamos partidas sin aumentar déficit previa auditoría integral de gastos.', 'Los gremios docentes hacen paro el día uno mientras esconden las cifras de inasistencia.', 'Abrimos mesa técnica paritaria esta tarde en Educación para garantizar clases normales.'],
  ['PR_15', 'Acreditado Seguridad', 'A24 / Clarín', ['A24', 'CLARIN'], '«Nuevo ataque narco en zona sur de Rosario enciende alarmas federales. ¿Despliegan tropas especiales esta semana?»', 'Refuerzo de Gendarmería, inteligencia criminal y bloqueo total de celulares en cárceles.', 'Con nosotros el que las hace las paga: se terminó la zona liberada para bandas.', 'Llamaremos al comité de crisis conjunto con el gobernador de Santa Fe hoy mismo.'],
  ['PR_16', 'Economía Real PyME', 'El Cronista / Infobae', ['CRONISTA', 'INFOBAE'], '«Cámaras metalúrgicas y textiles reportan caída de ventas del 14%. ¿Lanzan créditos productivos o baja de aportes?»', 'Alivio tributario para bienes de capital e importación libre de insumos sin trabas.', 'Quien no pueda competir vendiendo remeras al triple del precio mundial debe reconvertirse.', 'Activamos línea de descuento de cheques PyME a tasa subsidiada por banca pública.'],
  ['PR_17', 'Energía y Tarifas', 'Canal 26 / Ámbito', ['CANAL_26', 'AMBITO'], '«La ola polar duplicó el consumo de gas y hay cortes preventivos en estaciones de GNC. ¿Falta inversión en ductos?»', 'Licitamos privados de compresión en Neuquén; no habrá subsidio cruzado regresivo.', 'Heredamos plantas compresoras sin terminar por coimas anteriores y las estamos poniendo en marcha.', 'Coordinamos importación puente de barcos LNG para priorizar hogares e industrias clave.'],
  ['PR_18', 'Congreso en Vivo', 'TV Pública / LN+', ['TV_PUBLICA', 'LN_MAS'], '«Una comisión clave quedó empatada y se caería el dictamen oficial de Presupuesto. ¿Aceptan modificaciones opositoras?»', 'Mantenemos déficit cero; solo discutimos reasignaciones dentro del mismo techo presupuestario.', 'Quieren volver al presupuesto dibujado con déficit infinito; antes vetamos todo en bloque.', 'Jefatura de Gabinete escucha observaciones razonables de bloques dialoguistas.'],
  ['PR_19', 'Investigación Rosada', 'El Destape / Revista Barcelona', ['EL_DESTAPE', 'REVISTA_BARCELONA'], '«Filtraron chats privados de un secretario de Estado negociando contratos portuarios. ¿Le pide la renuncia?»', 'Ya enviamos el expediente a la Oficina Anticorrupción y auditamos cada pliego.', 'Es una opereta burda editada antes de una votación clave en el Congreso.', 'Suspendimos preventivamente el trámite hasta esclarecer la veracidad ante la justicia.'],
  ['PR_20', 'Mundo Corporativo', 'Forbes / CNN en Español', ['FORBES', 'CNN_ESPANOL'], '«Multinacionales mineras piden certeza de repatriación de dividendos en el NOA antes de firmar USD 4.000M. ¿Garantiza giro libre?»', 'El RIGI garantiza acceso irrestricto a divisas por exportaciones propias al año dos.', 'Con nosotros el inversor privado no es un enemigo al que se expropia por cadena nacional.', 'Firmaremos convenios provinciales de estabilidad tributaria para destrabar proyectos.'],
  ['PR_21', 'Federal Agro', 'La Voz del Interior / Clarín', ['VOZ_INTERIOR', 'CLARIN'], '«La sequía golpeó el rinde de maíz tardío en Córdoba y Santa Fe. ¿Declaran emergencia agropecuaria y prórroga impositiva?»', 'Exención inmediata de anticipos de Ganancias para productores certificados en emergencia.', 'No esperamos informes eternos mientras el productor pierde la cosecha: alivio fiscal directo.', 'Coordinamos con gobernadores de la Región Centro asistencia hídrica y bancaria urgente.'],
  ['PR_22', 'Mercado Inmobiliario', 'Infobae / El Cronista', ['INFOBAE', 'CRONISTA'], '«La oferta de alquileres creció pero los precios superan el salario medio. ¿Habrá incentivo para crédito hipotecario?»', 'Seguridad jurídica en plazos libres y fondeo privado de hipotecas ajustables a salario.', 'Cuando derogaron leyes soviéticas volvieron los departamentos; ahora bajamos la inflación.', 'Lanzamos garantía estatal parcial para jóvenes compradores de primera vivienda.'],
  ['PR_23', 'Paritarias Transporte', 'Crónica TV / TN', ['CRONICA_TV', 'TN'], '«Colectiveros de la UTA amenazan con paro sorpresivo en el AMBA desde las 0 horas. ¿Dictan conciliación obligatoria?»', 'Trabajo ya dictó conciliación obligatoria por quince días y no convalidamos aumentos sin tarifa.', 'No vamos a permitir extorsión a cuatro millones de personas en estaciones de trenes.', 'Convocamos a empresarios y sindicato esta noche en Ministerio para destrabar el servicio.'],
  ['PR_24', 'City Porteña', 'Ámbito / LN+', ['AMBITO', 'LN_MAS'], '«El Riesgo País subió 95 puntos por ruido político antes de la licitación del Tesoro. ¿Tienen dólares asegurados para pagar?»', 'Los dólares de los cupones de enero y julio ya están depositados en cuenta fiduciaria.', 'A los que venden bonos por pánico electoral los van a lamentar cuando vean el superávit.', 'Ratificamos cumplimiento total de vencimientos y serenidad operativa ante volatilidad política.'],
  ['PR_25', 'Juicio YPF & Exterior', 'Bloomberg / LA NACION', ['BLOOMBERG', 'LA_NACION'], '«Una corte extranjera vuelve a intimar embargo sobre activos por el juicio de YPF. ¿Estrategia legal o negociación de pago?»', 'Apelación en todas las instancias protegiendo la inmunidad soberana y activos estratégicos.', 'Que la expropiación irresponsable de hace quince años la expliquen quienes aplaudieron de pie.', 'Equipo jurídico internacional presenta garantía alternativa mientras dialoga con tenedores.'],
  ['PR_26', 'Ciencia y Tecnología', 'Página/12 / Forbes', ['PAGINA_12', 'FORBES'], '«Ingenieros nucleares advierten demoras en el reactor CAREM por falta de certificaciones de giro. ¿Priorizan el proyecto?»', 'Auditar prioridades energéticas concentra fondos en proyectos exportables como satélites y SMR.', 'No frenamos la ciencia seria; cortamos becarios militantes que nada investigan.', 'Desbloqueamos partidas técnicas para reactores modulares en alianza con capitales externos.'],
  ['PR_27', 'Frontera Norte', 'Canal 26 / A24', ['CANAL_26', 'A24'], '«Intendentes del NEA y NOA alertan por contrabando fronterizo y colapso de hospitales por no residentes. ¿Ponen arancel?»', 'Reciprocidad estricta sanitaria y educación superior arancelada para no residentes sin arraigo.', 'Se terminó el turismo sanitario gratis financiado con el IVA del vecino argentino.', 'Coordinamos convenios bilaterales con países vecinos manteniendo urgencias humanitarias.'],
  ['PR_28', 'Consumo y Góndolas', 'C5N / Clarín', ['C5N', 'CLARIN'], '«El consumo masivo cayó 8% interanual en supermercados de cercanía. ¿Preocupa el enfriamiento de la actividad?»', 'Estabilizar primero precios es la única vía real para que vuelva el crédito y el salario real.', 'Prefiero dos meses de sinceramiento que cuatro años más de estafa con billetes sin respaldo.', 'Implementamos devolución digital de IVA en alimentos básicos para sectores vulnerables.'],
  ['PR_29', 'Obra Vial y Rutas', 'La Voz del Interior / TN', ['VOZ_INTERIOR', 'TN'], '«El deterioro de rutas nacionales elevó la siniestralidad en corredores cereales. ¿Vuelve Vialidad o peaje privado?»', 'Licitación acelerada de concesiones por obra ejecutada en los tramos con mayor tránsito.', 'Las rutas destruidas eran cartelizadas en licitaciones truchas; ahora compite el privado serio.', 'Autorizamos convenios rápidos con provincias para bacheo de emergencia en rutas clave.'],
  ['PR_30', 'Defensa & Atlántico', 'TV Pública / Infobae', ['TV_PUBLICA', 'INFOBAE'], '«Detectaron más de doscientos pesqueros extranjeros operando al límite de la Milla 201. ¿Refuerzan patrullaje naval?»', 'Despliegue inmediato de patrulleros oceánicos, Prefectura y monitoreo satelital continuo.', 'Cada buque que pesque ilegalmente en nuestro mar será capturado y multado con rigor.', 'Fondo especial de combustible e interoperabilidad aérea-naval en la zona económica exclusiva.'],
  ['PR_31', 'Empleo Joven & Tech', 'Forbes / Canal 26', ['FORBES', 'CANAL_26'], '«Empresas unicornio argentinas reclaman reformas laborales para contratar junior locales en vez de ir a Uruguay o Colombia.»', 'Régimen simplificado tech con libre ingreso de divisas y exención de cargas por primer empleo.', 'Queremos programadores facturando desde Córdoba y Tucumán, no yéndose por burocracia.', 'Mesa conjunta con cámaras de software para abrir 40.000 puestos digitales federales.'],
  ['PR_32', 'Minería y Agua', 'Página/12 / La Voz del Interior', ['PAGINA_12', 'VOZ_INTERIOR'], '«Asambleas ambientales en Cuyo cuestionan un mega proyecto de cobre por consumo hídrico. ¿Avanzan igual?»', 'Todo proyecto minero aprueba declaración ambiental auditada internacionalmente y circuito cerrado hídrico.', 'No vamos a dejar enterrados treinta mil millones de dólares por militancia antiproductiva.', 'Mesa abierta de monitoreo hídrico ciudadano junto a universidades regionales y gobernadores.'],
  ['PR_33', 'Banca Digital & Crypto', 'Infobae / Bloomberg', ['INFOBAE', 'BLOOMBERG'], '«Suben operaciones de stablecoins minoristas como refugio frente al peso. ¿Van a gravarlas o regularlas?»', 'Regulación tributaria clara sin asfixiar billeteras ni fintechs, garantizando trazabilidad UIF.', 'Cada ciudadano tiene derecho a ahorrar en la moneda o activo digital que prefiera libremente.', 'BCRA y CNV trabajan un marco amigable para tokenización de activos productivos locales.'],
  ['PR_34', 'Pymes Exportadoras', 'El Cronista / Ámbito', ['CRONISTA', 'AMBITO'], '«La suba de costos portuarios en dólares quita competitividad a economías regionales de peras, vinos y limones. ¿Bajan derechos?»', 'Eliminamos derechos de exportación remanentes para economías regionales con valor agregado.', 'Al productor de Mendoza o Tucumán le sacamos la pata estatal de encima desde hoy.', 'Reintegros ágiles aduaneros en 15 días para exportadores agroindustriales del interior.'],
  ['PR_35', 'Crisis Carcelaria', 'Crónica TV / A24', ['CRONICA_TV', 'A24'], '«Sobrepoblación récord en comisarías porteñas y bonaerenses provoca fugas semanales. ¿Construyen nuevos penales?»', 'Licitación modular de tres complejos penitenciarios federales de máxima seguridad.', 'El preso no puede estar en una comisaría barrial ni manejando bandas desde el celular.', 'Convenio con provincias para descomprimir comisarías y reasignar policías a patrullaje.'],
  ['PR_36', 'Aerolíneas & Cielos', 'LN+ / Clarín', ['LN_MAS', 'CLARIN'], '«Paro sorpresivo de pilotos y gremios aeronáuticos deja miles de pasajeros varados en Aeroparque y Ezeiza. ¿Cielos abiertos total?»', 'Implementamos política de cielos abiertos y declaración de servicio esencial aeronáutico.', 'Los gremios aeronáuticos usan al pasajero de rehén para sostener privilegios que paga todo el país.', 'Mediación laboral urgente manteniendo rutas federales conectadas con aerolíneas regionales.'],
  ['PR_37', 'Reforma Electoral', 'LA NACION / TV Pública', ['LA_NACION', 'TV_PUBLICA'], '«El Senado debate la suspensión o eliminación definitiva de las PASO por su costo fiscal. ¿Acompaña el Ejecutivo?»', 'Acompañamos la eliminación de las PASO obligatorias pagadas por el Estado para ahorrar USD 150M.', 'Que cada partido financie sus propias internas con la cuota de sus afiliados, no con el IVA del pan.', 'Proponemos reforma integral con Boleta Única y financiamiento bancarizado transparente.'],
  ['PR_38', 'Inteligencia y Filtración', 'El Destape / TN', ['EL_DESTAPE', 'TN'], '«Senadores opositores exigen explicaciones por aumento presupuestario en partidas reservadas. ¿En qué se usan exactamente?»', 'Destinadas íntegramente a ciberdefensa de infraestructura crítica y combate al narcoterrorismo.', 'A los que dejaron pasar espías extranjeros sin control no les aceptamos lecciones morales.', 'Rendición completa de cuentas a puertas cerradas ante la Comisión Bicameral de Inteligencia.'],
  ['PR_39', 'Industria Cultural & INCAA', 'Página/12 / Revista Barcelona', ['PAGINA_12', 'REVISTA_BARCELONA'], '«Actores y directores protestan por reestructuración total del fondo audiovisual nacional. ¿Desaparece el fomento al cine?»', 'No cerramos el cine argentino: exigimos cofinanciamiento privado y audiencia real verificable.', 'No pagamos con impuestos de comedores películas que ven cuatro personas en una sala vacía.', 'Fomentamos coproducciones internacionales de plataformas y series filmadas en el interior.'],
  ['PR_40', 'FMI y Revisiones', 'Bloomberg / CNN en Español', ['BLOOMBERG', 'CNN_ESPANOL'], '«La misión del Fondo Monetario llega a Buenos Aires preocupada por el atraso de metas de acumulación de reservas netas. ¿Habrá waiver?»', 'Superamos las metas fiscales y monetarias con holgura; estamos negociando desembolsos frescos.', 'Al FMI no le debemos lecciones porque cumplimos más rápido que cualquier burocracia internacional.', 'Reunión técnica constructiva para recalibrar metas de reservas acompañando la baja inflacionaria.'],
  ['PR_41', 'Morosidad y Tarjetas', 'Crónica TV / Infobae', ['CRONICA_TV', 'INFOBAE'], '«La morosidad en tarjetas de crédito alcanzó el pico en cinco años entre familias trabajadoras. ¿Bajan impuestos a financiamientos?»', 'Eliminamos impuestos provinciales sobre intereses y habilitamos libre competencia de tasas.', 'El verdadero verdugo de la tarjeta de crédito era la inflación que obligaba a pagar tasas del 200%.', 'Acuerdo voluntario bancario para refinanciamiento de saldos de consumo en 12 cuotas bajas.'],
  ['PR_42', 'Ganancias Trabajadores', 'C5N / Clarín', ['C5N', 'CLARIN'], '«Sindicatos petroleros y bancarios piden suba inmediata del mínimo no imponible de Ganancias. ¿Cede el fisco?»', 'Actualización trimestral automática por IPC sin alterar el balance primario consolidado.', 'Siempre nos acusaron de subir impuestos, pero nosotros queremos devolver salario limpio cuando dé el fisco.', 'Dialogamos con bloques provinciales porque Ganancias es coparticipable con los gobernadores.'],
  ['PR_43', 'Pacto con China', 'CNN en Español / Ámbito', ['CNN_ESPANOL', 'AMBITO'], '«La renovación del tramo activo del swap con Beijing vence en noventa días. ¿Se renueva o se cancela con otro crédito?»', 'Renovación técnica pragmática mientras consolidamos reservas propias y líneas con bancos occidentales.', 'Comercio pragmático sin sometimiento geopolítico: cuidamos cada dólar comercial que entra.', 'Cancillería y BCRA trabajan coordinados para sostener liquidez comercial bilateral sin sobresaltos.'],
  ['PR_44', 'Balance Final de Gestión', 'TN / TV Pública / Clarín', ['TN', 'TV_PUBLICA', 'CLARIN'], '«A balance abierto de gestión, ¿cuál siente que es su mayor logro y qué autocrítica realiza frente a la ciudadanía?»', 'Logramos ordenar cuentas históricas; nuestra autocrítica es acelerar aún más el alivio microeconómico.', 'No vinimos a quedar bien con los políticos cómodos sino a cambiar cincuenta años de decadencia.', 'El mayor activo es la estabilidad recuperada; redoblaremos la escucha federal y el diálogo social.'],
  ['PR_45', 'Hidrovía Paraná', 'El Cronista / La Voz', ['CRONISTA', 'VOZ_INTERIOR'], '«Las bolsas cerealeras urgen la licitación de dragado de la Hidrovía Paraná antes de la cosecha gruesa. ¿Habrá peaje privado?»', 'Licitación internacional transparente a riesgo privado con escáneres de Prefectura en cada puerto.', 'Se terminó el negocio opaco de dragas amigas; vamos a bajar el costo de flete exportador.', 'Mesa operativa con las provincias ribereñas para garantizar calado y trazabilidad fluvial.'],
  ['PR_46', 'Cierre de Sucursales', 'Ámbito / Infobae', ['AMBITO', 'INFOBAE'], '«Bancos tradicionales cierran sucursales frente al avance de billeteras digitales y recortan personal administrativo. ¿Interviene el Central?»', 'Competencia abierta de billeteras y bancos digitales con capacitación para reconversión bancaria.', 'La gente ya votó con su celular por transferencias gratis en segundos frente a filas eternas.', 'Normativa prudencial del BCRA para garantizar acceso bancario físico en localidades del interior.'],
  ['PR_47', 'Veto Presupuestario', 'Clarín / LA NACION', ['CLARIN', 'LA_NACION'], '«La oposición insiste con dos tercios en Diputados para rechazar su veto sobre fondos universitarios y previsionales. ¿Tiene escudo?»', 'Defendemos el veto constitucional mientras no presenten fuente real de financiamiento no inflacionario.', 'No vamos a firmar cheques sin fondos aunque se abracen en el recinto para hacer populismo.', 'Jefatura de Gabinete dialoga con diputados federales para reasignar partidas sin déficit.'],
  ['PR_48', 'Litio y Cobre Andino', 'Forbes / Bloomberg', ['FORBES', 'BLOOMBERG'], '«La baja transitoria del precio internacional del litio enfría dos ampliaciones en el Salar del Hombre Muerto. ¿Mejoran incentivos?»', 'Sostenemos estabilidad cambiaria del RIGI a 30 años porque los proyectos miran ciclos de décadas.', 'Las provincias andinas saben que con reglas claras siguen entrando miles de millones en dólares.', 'Agilizamos permisos de infraestructura eléctrica y ferroviaria para bajar el costo operativo minero.'],
  ['PR_49', 'Turismo Receptivo', 'Canal 26 / A24', ['CANAL_26', 'A24'], '«El encarecimiento en dólares redujo el turismo receptivo y disparó salidas a Brasil y Chile. ¿Preocupa la cuenta de viajes?»', 'Los precios relativos de una economía que ordena su moneda tienden a equilibrarse por productividad.', 'En vez de inventar impuestos turista retrógrados, bajamos tasas aeroportuarias para competir.', 'Lanzamos promoción en ferias globales e incentivos a vuelos low-cost directos al interior.'],
  ['PR_50', 'PAMI y Prestadores', 'Crónica TV / Página/12', ['CRONICA_TV', 'PAGINA_12'], '«Clínicas privadas del Conurbano amenazan suspender turnos de PAMI por atraso de aranceles. ¿Destraban pagos?»', 'Auditoría médica digital inmediata y pago directo dentro de los 30 días sin intermediarios.', 'Limpiamos sobreprecios de prótesis truchas que desfinanciaban a las clínicas serias del país.', 'Intervención técnica acuerda esquema de actualización arancelaria con entidades prestadoras.'],
  ['PR_51', 'Reforma Laboral PyME', 'El Cronista / LN+', ['CRONISTA', 'LN_MAS'], '«Cámaras comerciales insisten con topar indemnizaciones de juicios laborales para animarse a contratar. ¿Mandan adenda al Congreso?»', 'Impulsamos fondo de cese laboral por convenio y topes claros a multas registrales litigiosas.', 'Un juicio laboral inventado no puede cerrar un comercio de diez años con cinco empleados.', 'Mesa de diálogo con centrales sindicales y cámaras PyMEs para redactar régimen consensuado.'],
  ['PR_52', 'Bajar Edad Imputabilidad', 'TN / C5N', ['TN', 'C5N'], '«Un crimen cometido por un menor de 15 años conmocionó al país y reavivó el debate del régimen penal juvenil. ¿Cuál es la postura?»', 'Delito de adulto, pena proporcional de adulto desde los 14 años en institutos especializados.', 'No podemos seguir liberando a homicidas de 15 años mientras las familias velan a sus víctimas.', 'Impulsamos ley integral penal juvenil con tribunales rápidos y tratamiento efectivo.'],
  ['PR_53', 'Sátira y Parodia Oficial', 'Revista Barcelona / El Destape', ['REVISTA_BARCELONA', 'EL_DESTAPE'], '«Su vocería denunció campañas de humor político en redes como operaciones organizadas. ¿Se persigue a los humoristas o son trolls?»', 'Respetamos la libertad de sátira; perseguimos exclusivamente delitos informáticos y financiamiento opaco.', 'Se ofenden más rápido con un chiste nuestro que con las facturas truchas de gestiones pasadas.', 'Reafirmamos compromiso absoluto con la libertad de expresión y crítica artística en democracia.'],
  ['PR_54', 'Cierre de Cadena Nacional', 'TV Pública / CNN en Español', ['TV_PUBLICA', 'CNN_ESPANOL'], '«Para concluir esta transmisión ante todo el país: ¿qué resultado concreto verá el ciudadano común dentro de los próximos 90 días?»', 'Desaceleración mensual sostenida de inflación, más competencia comercial y reservas en alza.', 'Menos burocracia estatal mordiendo cada peso que ganan y orden claro en las calles.', 'Consolidación del plan económico con mesas abiertas de diálogo productivo y social en provincias.']
];

export const FULL_PRESS_QUESTIONS_CATALOG: PressQuestionRoundSpec[] = [
  ...PRESS_QUESTIONS_CATALOG,
  ...EXTRA_PRESS_SEEDS.map(([id, journalist, outlet, logos, q, o, c, i]) =>
    mkPressRound(
      id,
      journalist,
      outlet,
      logos,
      q,
      [`«${o}»`, o.toUpperCase().slice(0, 72)],
      [`«${c}»`, c.toUpperCase().slice(0, 72)],
      [`«${i}»`, i.toUpperCase().slice(0, 72)]
    )
  )
];

function computePressSeed(key: string): number {
  let h = 2166136261;
  for (let idx = 0; idx < key.length; idx += 1) {
    h ^= key.charCodeAt(idx);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function drawPressConferenceRounds(
  count: number,
  seedKey: string,
  offset: number = 0
): PressQuestionRoundSpec[] {
  const pool = [...FULL_PRESS_QUESTIONS_CATALOG];
  let seed = computePressSeed(`${seedKey}-${offset}`) || 42;
  for (let i = pool.length - 1; i > 0; i -= 1) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const j = seed % (i + 1);
    const tmp = pool[i]!;
    pool[i] = pool[j]!;
    pool[j] = tmp;
  }
  return pool.slice(0, count);
}
