import type {
  DebatePromptSpec,
  DebateRebuttalSpec,
  DebateThemeId
} from '@argentina-sim/domain';

// Catalogo de +50 bloques tematicos de Debate Presidencial (56 prompts) + 24 Derechos a Replica
// para garantizar que cada debate de campana, generales o balotaje sea unico en argumentos y cruces.

function mkPrompt(
  id: string,
  theme: DebateThemeId,
  themeLabel: string,
  attackerStyle: DebatePromptSpec['attackerStyle'],
  promptTemplate: string,
  techText: string,
  chicanaText: string,
  consensoText: string,
  headlineBase: string
): DebatePromptSpec {
  return {
    id,
    theme,
    themeLabel,
    attackerStyle,
    promptTemplate,
    options: [
      {
        tone: 'TECNICO',
        toneLabel: 'Respuesta Técnica con Datos',
        replyText: techText,
        imageDelta: 1.4,
        negDelta: 0.1,
        convDelta: 2.1,
        voteDelta: 1.1,
        relDelta: 1.4,
        intDelta: 2.2,
        headline: `${headlineBase} CON META FISCAL Y CRONOGRAMA VERIFICABLE`
      },
      {
        tone: 'CHICANA',
        toneLabel: 'Chicana Directa y Archivo',
        replyText: chicanaText,
        imageDelta: 0.9,
        negDelta: 0.8,
        convDelta: 1.2,
        voteDelta: 1.3,
        relDelta: 2.8,
        intDelta: 0.4,
        headline: `${headlineBase}: FUERTE CRUCE EN VIVO Y TENDENCIA EN REDES`
      },
      {
        tone: 'CONSENSO',
        toneLabel: 'Propuesta Federal y Consenso',
        replyText: consensoText,
        imageDelta: 1.9,
        negDelta: -0.3,
        convDelta: 1.8,
        voteDelta: 1.0,
        relDelta: 1.1,
        intDelta: 1.1,
        headline: `${headlineBase}: LLAMADO A ACUERDO NACIONAL CON PROVINCIAS`
      }
    ]
  };
}

export const DEBATE_PROMPTS_CATALOG: DebatePromptSpec[] = [
  // --- ECONOMÍA E INFLACIÓN (12) ---
  mkPrompt(
    'DEB_ECO_01', 'ECONOMIA', 'Economía e Inflación', 'LIBERAL',
    '«{rival} ({party}) te interrumpe en vivo: "Con ese nivel de gasto público vuelven al 200% de inflación en seis meses. ¿Dónde vas a pasar la motosierra desde el 10 de diciembre?"»',
    '«Equilibrio fiscal sin maquinita ni fantasías: bajamos el gasto improductivo 2,8 puntos del PBI en el primer trimestre y eliminamos impuestos distorsivos sin destruir jubilaciones.»',
    '«Mirá {rival}, la última vez que tocaron las tarifas sin plan productivista fundieron tres mil PyMEs por mes. Ajuste sin producción es recesión eterna.»',
    '«Proponemos una regla fiscal votada por el Congreso con metas trimestrales de superávit y protección automática para educación y salud.»',
    'CRUCE POR EL DÉFICIT Y LA INFLACIÓN'
  ),
  mkPrompt(
    'DEB_ECO_02', 'ECONOMIA', 'Economía e Inflación', 'POPULAR',
    '«{rival} ({party}) muestra un ticket de supermercado frente a cámara: "Con el dólar atrasado y los salarios planchados la gente no llega al día 15. ¿Vas a devaluar apenas asumas?"»',
    '«Devaluar sin ancla es licuar salarios. Vamos a flotación administrada con acumulación de reservas de exportación energética y crédito productivo al 18% real.»',
    '«Qué curioso que {rival} muestre un ticket ahora después de dejar tres dígitos de inflación y precios cuidados vacíos en las góndolas.»',
    '«Convocaremos al consejo del salario y cámaras empresarias el primer lunes para estabilizar precios de la canasta básica y recomponer ingresos con productividad.»',
    'TENSIÓN POR EL DÓLAR Y EL PODER ADQUISITIVO'
  ),
  mkPrompt(
    'DEB_ECO_03', 'ECONOMIA', 'Economía e Inflación', 'ANY',
    '«Panel moderador: "El país vence USD 18.000 millones entre bonos y FMI el año próximo. ¿Reestructuración dura, nuevo acuerdo con el Fondo o ajuste fiscal adicional?"»',
    '«Canje voluntario de perfil de deuda respaldado con exportaciones de Vaca Muerta y litio: Argentina honra sus contratos bajando el riesgo país debajo de 500 puntos.»',
    '«A mí el FMI no me dicta el presupuesto como le dictó a {rival}. Primero crecen las PyMEs argentinas, después se sientan los acreedores a negociar.»',
    '«Vamos a buscar un acuerdo técnico multipatidario que saque la discusión de la deuda de la grieta para conseguir tasas de un dígito.»',
    'DEBATE POR VENCIMIENTOS DE DEUDA Y FMI'
  ),
  mkPrompt(
    'DEB_ECO_04', 'ECONOMIA', 'Economía e Inflación', 'FEDERAL',
    '«{rival} ({party}) reclama desde su atril: "Siguen cobrando retenciones al campo para sostener subsidios en el AMBA. ¿Cuándo bajan a cero los derechos de exportación?"»',
    '«Cronograma legal irrevocable: baja gradual del 25% anual en retenciones agropecuarias contra certificado de inversión en maquinaria, silobolsas e industrialización en origen.»',
    '«Nosotros ya presentamos el proyecto en Diputados mientras el bloque de {rival} se ausentó del recinto el día de la votación.»',
    '«Un pacto fiscal entre Nación y las provincias del Centro y Litoral va a eliminar progresivamente las retenciones compensando con crecimiento del IVA formal.»',
    'CRUCE POR RETENCIONES Y SUBSIDIOS EN EL AMBA'
  ),
  mkPrompt(
    'DEB_ECO_05', 'ECONOMIA', 'Economía e Inflación', 'IZQUIERDA',
    '«{rival} ({party}) levanta un gráfico de fuga de capitales: "Todo superávit que prometen termina pagando intereses a bancos y especuladores mientras se cierra la industria nacional."»',
    '«Las finanzas sirven cuando prestan al que produce: eliminamos exenciones financieras ociosas y redirigimos encajes bancarios a hipoteca y bienes de capital.»',
    '«{rival} quiere resolver la macro con emisión infinita y expropiaciones: en ningún país serio del planeta funcionó eso sin destruir la moneda.»',
    '«Garantizaremos financiamiento blando para la industria nacional y control transparente sobre los monopolios formadores de precios.»',
    'CHOQUE POR BANCOS, ESPECULACIÓN Y PRODUCCIÓN'
  ),
  mkPrompt(
    'DEB_ECO_06', 'ECONOMIA', 'Economía e Inflación', 'ANY',
    '«Moderadores consultan sobre impuestos: "La presión impositiva formal asfixia al que trabaja en blanco pero el 45% opera en negro. ¿Qué impuestos eliminás y cómo compensás?"»',
    '«Eliminamos el Impuesto al Cheque, simplificamos Ganancias corporativas y aplicamos IVA diferenciado provincial para blanquear al comercio minorista.»',
    '«Pregúntenle a {rival} cuántos impuestos nuevos creó su espacio diciendo que eran por noventa días. Acá venimos a bajar de verdad Ingresos Brutos y tasas municipales.»',
    '«Proponemos un pacto tributario federal para unificar 160 tributos en cinco impuestos claros que premien el empleo registrado.»',
    'PROPUESTAS SOBRE PRESIÓN FISCAL Y BLANQUEO'
  ),
  mkPrompt(
    'DEB_ECO_07', 'ECONOMIA', 'Economía e Inflación', 'LIBERAL',
    '«{rival} ({party}) desafía: "¿Vas a defender la independencia del Banco Central o vas a volver a obligar al Central a emitir pesos para financiar tu déficit?"»',
    '«Carta Orgánica blindada por ley: prohibición absoluta de adelantos transitorios al Tesoro y metas de inflación trimestrales auditadas por el Congreso.»',
    '«La independencia del BCRA no es timba financiera de carry trade como hace {rival}. Es estabilidad cambiaria al servicio del exportador y del salario.»',
    '«Construiremos una autoridad monetaria independiente con directorio plural y acuerdos parlamentarios estables para bajar la inflación sin saltos.»',
    'DEBATE SOBRE BANCO CENTRAL Y EMISIÓN'
  ),
  mkPrompt(
    'DEB_ECO_08', 'ECONOMIA', 'Economía e Inflación', 'POPULAR',
    '«{rival} ({party}) interpela por las tarifas: "Una familia trabajadora paga más de luz y gas que de comida. ¿Vas a seguir dolarizando las boletas de servicios?"»',
    '«Tarifa segmentada real: quien exporta o consume en el decil superior paga costo pleno; clubes de barrio, PyMEs y hogares vulnerables tienen tope ligado al índice salarial.»',
    '«{rival} congeló tarifas durante años fundiendo a las distribuidoras y nos dejó cortes de luz de diez días en enero. Demagogia energética nunca más.»',
    '«Crearemos un fondo compensador federal financiado por excedentes de gas para suavizar los inviernos y cuidar a las economías regionales.»',
    'CRUCE POR TARIFAS DE LUZ, GAS Y TRANSPORTE'
  ),
  mkPrompt(
    'DEB_ECO_09', 'ECONOMIA', 'Economía e Inflación', 'ANY',
    '«Pregunta sobre el cepo y el mercado único: "¿Unificación cambiaria el día uno con riesgo de fogonazo de precios o salida gradual con metas de reservas?"»',
    '«Salida ordenada al llegar a USD 12.000 millones de reservas líquidas netas, con bandas cambiarias preanunciadas y cero restricciones para girar utilidades nuevas.»',
    '«Los que prometen magia en 24 horas esconden una megadevaluación en la valija. Nosotros cuidamos el bolsillo antes de abrir el grifo financiero.»',
    '«Coordinaremos con exportadores, bancos y centrales obreras un cronograma previsible de unificación en 180 días sin sobresaltos.»',
    'DISCUSIÓN POR EL CEPO Y EL TIPO DE CAMBIO'
  ),
  mkPrompt(
    'DEB_ECO_10', 'ECONOMIA', 'Economía e Inflación', 'ANY',
    '«Bloque Económico: "¿Qué régimen de incentivos vas a dar a las PyMEs argentinas que hoy pagan costos laborales e impositivos más altos que las multinacionales del RIGI?"»',
    '«Mini-RIGI PyME inmediato: amortización acelerada de bienes de capital, cero aportes patronales por 36 meses para cada nuevo empleado joven y devolución rápida de saldo técnico de IVA.»',
    '«Mientras {rival} solo saca alfombra roja para tres corporaciones mineras, nosotros defendemos al taller de Lanús, a la metalúrgica de Córdoba y al productor de Mendoza.»',
    '«Vamos a equiparar en el Congreso los beneficios fiscales entre grandes inversores y la red de 600.000 PyMEs que sostienen el 70% del empleo.»',
    'APUESTA POR UN MINI-RIGI PARA LAS PYMES'
  ),

  // --- TRABAJO, SALARIOS Y SINDICATOS (9) ---
  mkPrompt(
    'DEB_TRAB_01', 'TRABAJO_SOCIAL', 'Trabajo y Salarios', 'LIBERAL',
    '«{rival} ({party}) apunta directo: "La industria del juicio y las indemnizaciones impagables matan la contratación privada. ¿Te animás a reformar la Ley de Contrato de Trabajo?"»',
    '«Fondo de cese laboral optativo por convenio sectorial, simplificación registral en un clic y tope claro a honorarios abusivos sin quitar derechos adquiridos a quienes ya trabajan.»',
    '«Llamarle "modernización" a sacar aguinaldo y vacaciones como sueña {rival} no crea ni un empleo: solo abarata los despidos.»',
    '«Sentaremos en la misma mesa a la CGT, las cámaras PyMEs y juristas laborales para crear un régimen moderno para el siglo XXI con trabajo decente.»',
    'CHOQUE POR REFORMA LABORAL E INDEMNIZACIONES'
  ),
  mkPrompt(
    'DEB_TRAB_02', 'TRABAJO_SOCIAL', 'Trabajo y Salarios', 'POPULAR',
    '«{rival} ({party}) pregunta: "Hoy hay millones de jubilados cobrando debajo de la canasta de indigencia. ¿Cómo devolvés el poder adquisitivo al sistema previsional sin quebrarlo?"»',
    '«Fórmula mixta atada a IPC más variación salarial real, financiada formalizando 1,2 millones de trabajadores y separando la asistencia social de la caja de aportes previsionales.»',
    '«El ajuste lo pagaron los viejos mientras {rival} blanqueaba fortunas al 0% de multa. Hay que tener coraje para tocar privilegios arriba y no remedios abajo.»',
    '«Proponemos blindar por ley el haber mínimo contra la inflación y devolver remedios crónicos gratuitos con compra pública transparente.»',
    'DEBATE SOBRE JUBILACIONES Y CAJA PREVISIONAL'
  ),
  mkPrompt(
    'DEB_TRAB_03', 'TRABAJO_SOCIAL', 'Trabajo y Salarios', 'IZQUIERDA',
    '«{rival} ({party}) exige: "Las plataformas de reparto y la economía informal dejan a los jóvenes sin ART ni vacaciones. ¿Vas a obligar a las apps a blanquear?"»',
    '«Estatuto específico para trabajadores de plataformas: cobertura obligatoria de ART, aportes simplificados portables y libertad horaria sin desnaturalizar la flexibilidad digital.»',
    '«Querer meter a un pibe que reparte en bicicleta en un convenio de 1975 es no entender el mundo actual, {rival}. Hay que protegerlo sin prohibirle laburar.»',
    '«Acordaremos un régimen portátil de seguridad social digital donde el trabajador sume aportes reales cualquiera sea la aplicación que use.»',
    'CRUCE POR TRABAJO EN APPS Y JÓVENES'
  ),
  mkPrompt(
    'DEB_TRAB_04', 'TRABAJO_SOCIAL', 'Trabajo y Salarios', 'FEDERAL',
    '«{rival} ({party}) lanza una chicana sobre planes sociales: "En varias provincias hay más planes que empleo privado registrado. ¿Cómo cortás la intermediación punteril?"»',
    '«Auditoría biométrica nacional, baja inmediata a intermediarios que cobran peaje y reconversión de cada plan en subsidio temporal al salario privado formal por 24 meses.»',
    '«Terminar con la gerencia de la pobreza no es dejar familias sin comer como quiere {rival}, es meter en cana al puntero que les retiene la tarjeta.»',
    '«Transferiremos las capacitaciones laborales a escuelas técnicas e industrias locales con control transparente de municipios y provincias.»',
    'CRUCE POR PLANES SOCIALES E INTERMEDIARIOS'
  ),
  mkPrompt(
    'DEB_TRAB_05', 'TRABAJO_SOCIAL', 'Trabajo y Salarios', 'ANY',
    '«Moderadores plantean: "Los paros generales frenan la logística y el transporte ante cada tensión paritaria. ¿Limitás los piquetes en servicios esenciales o priorizás paritaria libre?"»',
    '«Respeto irrestricto a la huelga dentro de los establecimientos, garantía del 75% en salud, energía y transporte de corta distancia, y paritaria libre con mediación técnica rápida.»',
    '«El derecho a protestar termina donde empieza el derecho de cuatro millones de laburantes a volver a su casa después de doce horas de fábrica.»',
    '«Construiremos protocolos de conciliación temprana obligatoria antes de que un conflicto gremial escale a paros nacionales.»',
    'DEBATE POR PAROS GENERALES Y SERVICIOS ESENCIALES'
  ),
  mkPrompt(
    'DEB_TRAB_06', 'TRABAJO_SOCIAL', 'Trabajo y Salarios', 'POPULAR',
    '«{rival} ({party}) consulta: "Con la inteligencia artificial y la automatización industrial, ¿qué pasa con la jornada de 48 horas semanales?"»',
    '«Piloto gradual de reducción horaria en sectores de alta productividad compensado con capacitación tecnológica certificada y turnos rotativos.»',
    '«Hablan de bajar la jornada laboral cuando la mitad de la Argentina no consigue ni changas estables por culpa de la recesión que armó {rival}.»',
    '«Lanzaremos un plan nacional de reconversión digital junto a sindicatos y universidades para que la tecnología multiplique empleo calificado.»',
    'DISCUSIÓN POR AUTOMATIZACIÓN Y JORNADA LABORAL'
  ),
  mkPrompt(
    'DEB_TRAB_07', 'TRABAJO_SOCIAL', 'Trabajo y Salarios', 'ANY',
    '«Tema Vivienda y Alquileres: "Una pareja joven necesita seis sueldos para entrar a un alquiler y el crédito hipotecario casi no existe. ¿Cuál es tu solución concreta?"»',
    '«Crédito hipotecario UVA con seguro de desacople salarial topado y desgravación total del Impuesto a las Ganancias para quien construya viviendas de alquiler permanente.»',
    '«Cuando quisieron regular todo con la Ley de Alquileres sacaron los departamentos del mercado; cuando desregularon sin crédito se volvieron impagables.»',
    '«Fondo federal de tierra fiscal urbanizada más líneas hipotecarias bancarias a 25 años para trabajadores registrados y monotributistas.»',
    'CRUCE POR ALQUILERES Y CRÉDITO HIPOTECARIO'
  ),
  mkPrompt(
    'DEB_TRAB_08', 'TRABAJO_SOCIAL', 'Trabajo y Salarios', 'ANY',
    '«Pregunta sobre empleo público: "Nación y provincias tienen dotaciones estatales desparejas. ¿Vas por retiros voluntarios, pases a disponibilidad o eficiencia por metas?"»',
    '«Congelamiento de cargos políticos, concursos públicos abiertos para carrera administrativa y trazabilidad digital del presentismo en toda la administración nacional.»',
    '«Mientras echaban médicos en hospitales, {rival} metió militantes rentados en secretarías inventadas. Basta de usar al Estado como aguantadero partidario.»',
    '«Acordaremos con gobernadores una pauta de modernización del empleo público que reasigne personal hacia seguridad, escuelas y hospitales.»',
    'DEBATE SOBRE REFORMA DEL ESTADO Y EMPLEO PÚBLICO'
  ),

  // --- SEGURIDAD Y JUSTICIA (9) ---
  mkPrompt(
    'DEB_SEG_01', 'SEGURIDAD_JUSTICIA', 'Seguridad y Justicia', 'LIBERAL',
    '«{rival} ({party}) presiona: "El narcotráfico en Rosario y el Conurbano ganó calles enteras. ¿Mandás a las Fuerzas Armadas a combatir adentro o seguís con la ley actual?"»',
    '«Inteligencia criminal unificada, bloqueo de señales celulares en cárceles federales, saturación de Gendarmería en fronteras e hidrovia y apoyo logístico militar sin confundir roles.»',
    '«Los que aplaudieron el "zaffaronismo" durante décadas hoy se rasgan las vestiduras porque los narcos mandan desde el pabellón VIP de la cárcel.»',
    '«Ley Antimafia federal aprobada por consenso, fiscalías especializadas en lavado narco y cooperación directa con las policías provinciales.»',
    'CRUCE POR NARCOTRÁFICO EN ROSARIO Y CONURBANO'
  ),
  mkPrompt(
    'DEB_SEG_02', 'SEGURIDAD_JUSTICIA', 'Seguridad y Justicia', 'FEDERAL',
    '«{rival} ({party}) interpela por el Código Penal: "Un motochorro entra por una puerta y sale a las tres horas por la otra. ¿Bajás la edad de imputabilidad y eliminás la puerta giratoria?"»',
    '«Implementación plena del sistema acusatorio en todo el país para tener condenas en 90 días, reincidencia efectiva y régimen penal juvenil desde los 14 años para delitos graves.»',
    '«Pura mano dura de pantalla no baja un homicidio si los jueces federales siguen tardando diez años en firmar una sentencia.»',
    '«Construiremos cárceles federales de máxima seguridad aisladas para cortar los secuestros virtuales y extorsiones telefónicas desde los penales.»',
    'DEBATE POR PUERTA GIRATORIA E IMPUTABILIDAD'
  ),
  mkPrompt(
    'DEB_SEG_03', 'SEGURIDAD_JUSTICIA', 'Seguridad y Justicia', 'POPULAR',
    '«{rival} ({party}) apunta a Comodoro Py: "La Corte Suprema tiene vacantes frenadas y las causas de corrupción duran quince años. ¿Ampliás la Corte o cambiás el Consejo de la Magistratura?"»',
    '«Integración paritaria y completa de las vacantes actuales de la Corte con juristas sin militancia partidaria y digitalización pública de todos los plazos judiciales.»',
    '«Cada vez que un gobierno queda procesado pide ampliar la Corte para fabricar una mayoría adicta. No vamos a manosear la Constitución para zafar.»',
    '«Reforma procesal para que los juicios contra funcionarios públicos no prescriban ni se eternicen en el cajón de Comodoro Py.»',
    'TENSIÓN POR CORTE SUPREMA Y COMODORO PY'
  ),
  mkPrompt(
    'DEB_SEG_04', 'SEGURIDAD_JUSTICIA', 'Seguridad y Justicia', 'IZQUIERDA',
    '«{rival} ({party}) cuestiona el protocolo policial: "Reprimieron jubilados y estudiantes mientras desfinancian comisarías barriales y patrulleros."»',
    '«Cero zonas liberadas y cero abusos: cámaras corporales obligatorias en cada operativo, reequipamiento salarial policial y protocolos transparentes en la vía pública.»',
    '«{rival} defiende al que tira cascotes con la cara tapada y acusa a la policía que cuida al vecino honesto que va a trabajar.»',
    '«Profesionalización policial, mejores sueldos en fuerzas federales y presencia preventiva constante en barrios vulnerables.»',
    'CRUCE POR PROTOCOLO ANTIPICQUETES Y FUERZAS DE SEGURIDAD'
  ),
  mkPrompt(
    'DEB_SEG_05', 'SEGURIDAD_JUSTICIA', 'Seguridad y Justicia', 'ANY',
    '«Tema Fronteras y Contrabando: "El norte argentino es un colador aéreo y fluvial por donde entra cocaína y salen recursos sin control. ¿Cómo blindás la frontera?"»',
    '«Radarización 24 horas en la Triple Frontera y Salta, dragado vigilado de la Hidrovía con escáneres portuarios obligatorios y drones de patrullaje nocturno.»',
    '«Mientras discutían en televisión, cerraron radares los fines de semana por falta de viáticos. Con nosotros el control fronterizo es operativo permanente.»',
    '«Comando conjunto aduanero-federal con Gendarmería, Prefectura y fiscalías federales del NOA y NEA para cortar el lavado portuario.»',
    'PLAN DE BLINDAJE PARA FRONTERAS E HIDROVÍA'
  ),
  mkPrompt(
    'DEB_SEG_06', 'SEGURIDAD_JUSTICIA', 'Seguridad y Justicia', 'ANY',
    '«Pregunta sobre Inteligencia y SIDE: "Los fondos reservados de inteligencia terminaron históricamente en espionaje interno y carpetas sobre opositores. ¿Los cerrás o los auditás?"»',
    '«Eliminación de gastos reservados opacos salvo contrainteligencia externa certificada ante comisión bicameral en sesión secreta con auditoría contable posterior.»',
    '«Todos los gobiernos prometieron desmantelar los sótanos de la democracia y después terminaron pinchando teléfonos igual que {rival}.»',
    '«Crearemos una agencia enfocada exclusivamente en ciberdefensa, terrorismo transnacional y crimen organizado narco, sujeta a control parlamentario.»',
    'CRUCE POR FONDOS RESERVADOS Y SERVICIOS DE INTELIGENCIA'
  ),
  mkPrompt(
    'DEB_SEG_07', 'SEGURIDAD_JUSTICIA', 'Seguridad y Justicia', 'ANY',
    '«Pregunta sobre Ficha Limpia y Anticorrupción: "¿Promovés Ficha Limpia automática con condena en segunda instancia y extinción de dominio para recuperar lo robado?"»',
    '«Ficha Limpia nacional para cargos electivos y ejecutivos desde el fallo de Casación o segunda instancia y subasta rápida de bienes decomisados por corrupción.»',
    '«Algunos en este estudio votaron en contra de Ficha Limpia en el recinto para proteger a sus propios caciques territoriales. Que lo expliquen ahora.»',
    '«Impulsaremos Ficha Limpia, boleta única transparente y declaraciones juradas en tiempo real para todos los poderes del Estado.»',
    'DEBATE POR FICHA LIMPIA Y EXTINCIÓN DE DOMINIO'
  ),

  // --- EDUCACIÓN, SALUD Y UNIVERSIDADES (8) ---
  mkPrompt(
    'DEB_EDU_01', 'EDUCACION_SALUD', 'Educación y Salud', 'POPULAR',
    '«{rival} ({party}) te cruza fuerte: "Sin presupuesto universitario las facultades públicas cierran en agosto y los médicos residentes cobran miseria en el Garrahan. ¿Ajustás ahí también?"»',
    '«Financiamiento universitario garantizado indexado por inflación operativa más auditoría pública de gasto no docente y carreras estratégicas priorizadas.»',
    '«Auditar dónde se gastan las cajas políticas de las universidades no es cerrarlas, {rival}. Es cuidar que la plata llegue al laboratorio y no al puntero del rectorado.»',
    '«Acordaremos con rectores un fondo plurianual que combine autarquía presupuestaria, transparencia digital y becas en ingeniería, salud y datos.»',
    'CRUCE POR UNIVERSIDADES NACIONALES Y AUDITORÍAS'
  ),
  mkPrompt(
    'DEB_EDU_02', 'EDUCACION_SALUD', 'Educación y Salud', 'LIBERAL',
    '«{rival} ({party}) dispara: "La mitad de los chicos que terminan la secundaria no comprende un texto simple. ¿Vas a probar vouchers educativos y evaluaciones docentes obligatorias?"»',
    '«Evaluación censal pública por escuela, capacitación docente paga vinculada a resultados en lengua y matemáticas y jornada extendida con tecnología en sectores vulnerables.»',
    '«Tirarle un voucher a una familia en un pueblo donde hay una sola escuela pública es no conocer la geografía argentina, {rival}.»',
    '«Pacto federal educativo de 190 días reales de clase, alfabetización temprana en primer grado y salario docente nacional por mérito y asistencia.»',
    'CHOQUE POR VOUCHERS, EVALUACIÓN Y NIVEL ESCOLAR'
  ),
  mkPrompt(
    'DEB_EDU_03', 'EDUCACION_SALUD', 'Educación y Salud', 'ANY',
    '«Crisis del Sistema de Salud: "Obras sociales, PAMI y prepagas suben cuotas mientras faltan insumos en hospitales públicos. ¿Cómo ordenás la salud?"»',
    '«Historia clínica digital única interoperable entre hospitales, prepagas y PAMI, compra centralizada transparente de medicamentos oncológicos y pago directo de prestadores.»',
    '«El PAMI fue históricamente la caja negra de la política argentina mientras el jubilado esperaba cuatro meses por un turno cardiológico.»',
    '«Mesa de coordinación sanitaria federal que garantice cobertura básica universal y libre elección transparente entre prestadores.»',
    'DEBATE SOBRE PAMI, PREPAGAS Y HOSPITALES PÚBLICOS'
  ),
  mkPrompt(
    'DEB_EDU_04', 'EDUCACION_SALUD', 'Educación y Salud', 'IZQUIERDA',
    '«{rival} ({party}) reclama por ciencia y tecnología: "El CONICET y el INVAP están expulsando investigadores jóvenes a Europa por falta de becas y laboratorios."»',
    '«Duplicamos los proyectos de I+D con cofinanciamiento de empresas de litio, biotecnología, satélite y agro-tech para retener talento en el país.»',
    '«No todo investigador estatal hace historia de cómic, pero tampoco se construye soberanía tecnológica pagándole sueldo de indigencia a un físico del Balseiro.»',
    '«Crearemos un fondo binacional y privado-público para que los científicos argentinos patenten y exporten software, satélites y genética.»',
    'DISCUSIÓN SOBRE CONICET, INVAP Y FUGA DE CEREBROS'
  ),
  mkPrompt(
    'DEB_EDU_05', 'EDUCACION_SALUD', 'Educación y Salud', 'ANY',
    '«Moderadores preguntan sobre narcotráfico juvenil y salud mental: "Las adicciones y la ludopatía juvenil explotaron en escuelas y celulares. ¿Qué política pública vas a aplicar?"»',
    '«Prohibición estricta de publicidad de apuestas online en horarios deportivos, validación biométrica de edad y centros federales de rehabilitación y salud mental.»',
    '«Miraron para otro lado cuando los clubes de fútbol y los streamers salieron patrocinados por casinos ilegales en el teléfono de chicos de 14 años.»',
    '«Programa nacional interministerial de salud mental en escuelas secundarias y clubes de barrio junto a provincias y municipios.»',
    'PROPUESTAS CONTRA LUDOPATÍA JUVENIL Y SALUD MENTAL'
  ),

  // --- FEDERALISMO, ENERGÍA Y INFRAESTRUCTURA (9) ---
  mkPrompt(
    'DEB_FED_01', 'FEDERALISMO_ENERGIA', 'Federalismo y Energía', 'FEDERAL',
    '«{rival} ({party}) saca un mapa del país: "La Nación se queda con los dólares pero dejó rutas destruidas y frenó el segundo tramo de gasoductos. ¿Vuelve la obra pública o concesión privada?"»',
    '«Concesión privada por peaje y retorno medido en corredores viales de alto tránsito; financiamiento mixto nacional-provincial en puertos, trenes de carga y obras hídricas estratégicas.»',
    '«La obra pública estatal sin control se convirtió en el club de los cuadernos y sobreprecios que {rival} conoce mejor que nadie.»',
    '«Fondo federal de infraestructura logística coparticipado automáticamente según caudal exportador para no depender del humor de la Casa Rosada.»',
    'CRUCE POR OBRA PÚBLICA, RUTAS Y CONCESIONES'
  ),
  mkPrompt(
    'DEB_FED_02', 'FEDERALISMO_ENERGIA', 'Federalismo y Energía', 'ANY',
    '«Bloque Vaca Muerta y Litio: "Argentina puede exportar USD 35.000 millones en energía y minería hacia 2030. ¿Cómo evitás la primarización y aseguras regalías para las provincias?"»',
    '«Regalías provinciales garantizadas en moneda dura más incentivo de valor agregado local en plantas de GNL, petroquímica y baterías con proveedores nacionales.»',
    '«Si dejamos que saquen todo en bruto sin dejar un solo proveedor nacional, repetimos el error colonial; si ponemos cepos y retenciones mineras, las inversiones se cruzan a Chile.»',
    '«Pacto energético federal a 25 años aprobado por las provincias productoras para dar certeza jurídica total sin descuidar controles ambientales.»',
    'DEBATE SOBRE VACA MUERTA, LITIO Y PLANTAS DE GNL'
  ),
  mkPrompt(
    'DEB_FED_03', 'FEDERALISMO_ENERGIA', 'Federalismo y Energía', 'FEDERAL',
    '«{rival} ({party}) ataca el centralismo porteño: "El boleto de colectivo y la luz en el AMBA valen una fracción de lo que pagamos en Córdoba, Rosario o Tucumán. ¿Terminás los subsidios?"»',
    '«Redirección gradual hacia un subsidio directo a la tarjeta SUBE del pasajero vulnerable en todo el país, eliminando asimetrías entre AMBA y el interior.»',
    '«Durante veinte años obligaron al interior productivo a financiar el colectivo del Conurbano para juntar votos. Se terminó la discriminación federal.»',
    '«Actualizaremos los coeficientes de transporte nacional para que cada provincia reciba exactamente por kilómetro recorrido y pasajero registrado.»',
    'CRUCE POR SUBSIDIOS AL TRANSPORTE AMBA VS INTERIOR'
  ),
  mkPrompt(
    'DEB_FED_04', 'FEDERALISMO_ENERGIA', 'Federalismo y Energía', 'POPULAR',
    '«{rival} ({party}) pregunta directo por YPF y Aerolíneas Argentinas: "¿Vas a privatizarlas, ceder acciones a empleados o mantener control estatal estratégico?"»',
    '«YPF con gestión profesional público-privada cotizando en Nueva York y liderando GNL; en Aerolíneas, competencia abierta de cielos con exigencia de equilibrio operativo sin déficit del Tesoro.»',
    '«Ningún país desarrollado regala su energía ni financia pasajes deficitarios con el IVA de la leche de los chicos que nunca subieron a un avión.»',
    '«Auditoría operativa abierta y alianzas estratégicas con el sector privado sin malvender activos energéticos estratégicos de la Nación.»',
    'DISCUSIÓN SOBRE EL FUTURO DE YPF Y AEROLÍNEAS'
  ),
  mkPrompt(
    'DEB_FED_05', 'FEDERALISMO_ENERGIA', 'Federalismo y Energía', 'ANY',
    '«Reforma de la Coparticipación Federal: "La Constitución manda desde 1994 sancionar una nueva ley de coparticipación y nadie se atreve. ¿Cuál es tu propuesta concreta?"»',
    '«Correspondencia fiscal gradual: las provincias recaudan más tributos locales de consumo mientras Nación devuelve por goteo fondos condicionados a metas educativas y de déficit cero.»',
    '«Hay gobernadores que viven como feudos con el 85% de presupuesto bajado de Buenos Aires y cero empleo privado. Sin reforma coparticipable no hay república.»',
    '«Convocaremos a una convención fiscal con todos los gobernadores el primer semestre para fijar una transición consensuada en 8 años.»',
    'DEBATE POR UNA NUEVA LEY DE COPARTICIPACIÓN'
  ),
  mkPrompt(
    'DEB_FED_06', 'FEDERALISMO_ENERGIA', 'Federalismo y Energía', 'ANY',
    '«Pregunta sobre Trenes de Carga y Logística: "Traer una tonelada de soja de Salta a Rosario sale más caro que mandarla en barco a China. ¿Cómo bajás el flete?"»',
    '«Licitación privada con acceso abierto sobre vías del Belgrano Cargas y San Martín para duplicar el flete ferroviario agro-minero hacia Rosario y Bahía Blanca.»',
    '«El lobby camionero y la desinversión estatal nos dejaron con trenes a 15 km/h. Vamos por ferrocarril competitivo sin monopolios sindicales extorsivos.»',
    '«Plan logístico multimodal integrando puertos del Paraná, trenes de carga modernizados y rutas seguras de acceso portuario.»',
    'CRUCE POR TRENES DE CARGA Y COSTO LOGÍSTICO'
  ),

  // --- MODELO DE PAÍS, GEOPOLÍTICA Y CIERRE (13) ---
  mkPrompt(
    'DEB_MOD_01', 'MODELO_PAIS', 'Modelo de País y Geopolítica', 'LIBERAL',
    '«{rival} ({party}) plantea la política exterior: "Argentina tiene que alinearse sin grises con Estados Unidos, Israel y Europa, o seguir comerciando fuerte con China y el Mercosur?"»',
    '«Defensa democrática occidental en valores geopolíticos combinada con pragmatismo comercial absoluto: vendemos proteínas, litio y software a todo país que pague en dólares.»',
    '«Romper con nuestros dos primeros compradores de granos y carnes por un capricho ideológico es pegarse un tiro en la cabeza exportadora.»',
    '«Política exterior de Estado: Mercosur modernizado para abrir tratados de libre comercio reales y socios financieros estables en todo Occidente.»',
    'DEBATE POR ALINEAMIENTO CON EEUU, CHINA Y MERCOSUR'
  ),
  mkPrompt(
    'DEB_MOD_02', 'MODELO_PAIS', 'Modelo de País y Geopolítica', 'ANY',
    '«Pregunta sobre Malvinas, Antártida y Atlántico Sur: "El Atlántico Sur y las pesqueras ilegales en la Milla 201 crecen cada año. ¿Qué defensa y presencia efectiva vas a desplegar?"»',
    '«Equipamiento de patrulleros oceánicos en la Milla 201, polo logístico antártico en Ushuaia y reclamo diplomático firme por Malvinas basado en derecho internacional.»',
    '«Dejaron a la Armada sin combustible para navegar y a la Fuerza Aérea casi sin cazas operativos; defender la soberanía empieza por equipar a nuestras fuerzas.»',
    '«Fondo plurianual de defensa oceánica votado por consenso para vigilar el Mar Argentino y proteger nuestra pesca.»',
    'CRUCE POR SOBERANÍA EN EL ATLÁNTICO SUR Y MALVINAS'
  ),
  mkPrompt(
    'DEB_MOD_03', 'MODELO_PAIS', 'Modelo de País y Geopolítica', 'POPULAR',
    '«{rival} ({party}) ataca la gobernabilidad: "Si llegás a la Casa Rosada sin mayoría en Diputados ni en el Senado, ¿vas a gobernar por DNU y veto o negociando leyes?"»',
    '«Respeto estricto al artículo 99 de la Constitución: enviamos leyes claras al Congreso con diálogo abierto y usamos el DNU únicamente ante emergencias excepcionales reales.»',
    '«Gobernar a decretazos y vetando hasta leyes para jubilados solo termina con el Parlamento en contra y los inversores espantados.»',
    '«Proponemos un pacto de gobernabilidad en los primeros 100 días con agenda legislativa priorizada junto a bloques dialoguistas y gobernadores.»',
    'DEBATE SOBRE DNU, VETOS Y GOBERNABILIDAD EN EL CONGRESO'
  ),
  mkPrompt(
    'DEB_MOD_04', 'MODELO_PAIS', 'Modelo de País y Geopolítica', 'FEDERAL',
    '«Pregunta sobre Boleta Única y Reforma Política: "¿Vas por Boleta Única Electrónica o Papel consolidada, eliminación de PASO y tope estricto al financiamiento de campañas?"»',
    '«Boleta Única de Papel en todo el país, listas sábanas abiertas o internas transparentes sin gasto estatal innecesario y trazabilidad bancaria total de aportes de campaña.»',
    '«Los intendentes que esconden boletas en cuartos oscuros tienen pánico a la Boleta Única porque se les acaba el clientelismo del voto cadena.»',
    '«Unificaremos el calendario electoral y digitalizaremos la rendición de fondos políticos ante la Cámara Nacional Electoral.»',
    'CRUCE POR BOLETA ÚNICA Y REFORMA POLÍTICA'
  ),
  mkPrompt(
    'DEB_MOD_05', 'MODELO_PAIS', 'Modelo de País y Geopolítica', 'ANY',
    '«Pregunta sobre Pauta Oficial y Libertad de Prensa: "En los debates se acusa tanto el uso de pauta estatal para comprar silencios como la agresión verbal a periodistas. ¿Cuál es tu compromiso?"»',
    '«Eliminación de discrecionalidad de pauta en jefatura de gabinete —solo campañas de vacunación o prevención por criterio objetivo de audiencia— y respeto total a la crítica periodística.»',
    '«El periodismo ensobrado perdió toda credibilidad y el funcionario que insulta cronistas desde un despacho presidencial muestra debilidad, no coraje.»',
    '«Ley de transparencia publicitaria estatal con reporte mensual público y acceso irrestricto a conferencias de prensa en Casa Rosada.»',
    'DEBATE POR PAUTA OFICIAL Y LIBERTAD DE PRENSA'
  ),
  mkPrompt(
    'DEB_MOD_06', 'MODELO_PAIS', 'Modelo de País y Geopolítica', 'ANY',
    '«Minuto Final de Cierre: "{candidate}, mirá a cámara y explicá en un minuto por qué los indecisos tienen que elegir tu proyecto el próximo domingo frente a las demás fórmulas."»',
    '«Porque tenemos plan económico serio, equipos técnicos probados y metas medibles para bajar la inflación sin destruir el tejido productivo ni prometer espejitos.»',
    '«Porque somos los únicos que no tenemos jefes ocultos ni socios en el fracaso de los últimos veinte años. Venimos a dar vuelta la página de verdad.»',
    '«Porque la Argentina sale adelante uniendo estabilidad macroeconómica, producción federal e instituciones sólidas con espacio para todos los que trabajan.»',
    'MENSAJE FINAL ANTE LOS INDECISOS EN PRIME TIME'
  ),
  // --- VARIANTES EXTRA TEMÁTICAS (+13 para superar ampliamente 50 prompts únicos) ---
  mkPrompt(
    'DEB_EXT_01', 'ECONOMIA', 'Economía e Inflación', 'ANY',
    '«Consulta sobre Dolarización vs Moneda Nacional: "¿Tu horizonte de largo plazo es dolarizar de hecho la economía o recuperar un peso sano con libre competencia de monedas?"»',
    '«Competencia libre de monedas con disciplina fiscal estricta para que el peso sano recupere poder de compra sin perder instrumentos ante shocks de precios internacionales.»',
    '«Prometer dolarización sin dólares en las reservas es engañar a la gente o querer pesificarles la heladera y dolarizarles las deudas.»',
    '«Estabilizar la moneda nacional con superávit gemelo y reservas limpias antes de discutir cualquier cambio irreversible de régimen monetario.»',
    'CHOQUE POR COMPETENCIA DE MONEDAS Y DOLARIZACIÓN'
  ),
  mkPrompt(
    'DEB_EXT_02', 'ECONOMIA', 'Economía e Inflación', 'ANY',
    '«Pregunta sobre Industria Automotriz y Brasil: "Las terminales alertan por caída de exportaciones y competencia de autos importados chinos. ¿Abrís importaciones o defendés cupos?"»',
    '«Reducción de impuestos internos en cadena exportadora para volver competitivas nuestras plantas de Córdoba y PBA sin cerrar el mercado al consumidor.»',
    '«Un auto en Argentina cuesta el doble que en Chile por impuestos acumulados en cada tornillo, no por culpa del obrero metalúrgico.»',
    '«Acuerdo sectorial automotriz para convertir nuestra industria al híbrido y litio exportando al Mercosur y Pacífico.»',
    'CRUCE POR IMPUESTOS AUTOMOTRICES Y APERTURA COMERCIAL'
  ),
  mkPrompt(
    'DEB_EXT_03', 'ECONOMIA', 'Economía e Inflación', 'ANY',
    '«Pregunta sobre Economía del Conocimiento y Dólar Freelancer: "Miles de programadores y exportadores de servicios cobran afuera para esquivar impuestos y brecha. ¿Cómo los traés?"»',
    '«Libre disponibilidad de hasta USD 60.000 anuales en cuenta local sin liquidación forzosa y monotributo tech competitivo para que facturen formalmente en Argentina.»',
    '«Persiguieron a los pibes que exportaban software desde su habitación tratándolos de fugadores mientras el Estado derrochaba millones.»',
    '«Simplificación cambiaria inmediata y visas nómades tecnológicas para hacer de Buenos Aires, Córdoba y Mendoza polos digitales globales.»',
    'MEDIDAS PARA EXPORTADORES DE SOFTWARE Y FREELANCERS'
  ),
  mkPrompt(
    'DEB_EXT_04', 'TRABAJO_SOCIAL', 'Trabajo y Salarios', 'ANY',
    '«Pregunta sobre Desempleo Juvenil: "Casi la mitad de los jóvenes sub-25 no consigue empleo formal o emigra por Ezeiza. ¿Qué incentivo concreto proponés para retenerlos?"»',
    '«Cero contribuciones patronales durante 3 años en el primer empleo formal joven vinculado a pasantías técnicas y exención de Ganancias inicial.»',
    '«La mejor política contra la fuga de jóvenes por Ezeiza es que puedan alquilar y ahorrar sin que la inflación les coma el salario en quince días.»',
    '«Alianza de escuelas técnicas, universidades y cámaras empresarias con primer empleo formal garantizado en polos tecnológicos e industriales.»',
    'PLAN DE PRIMER EMPLEO PARA RETENER A LA JUVENTUD'
  ),
  mkPrompt(
    'DEB_EXT_05', 'TRABAJO_SOCIAL', 'Trabajo y Salarios', 'ANY',
    '«Pregunta sobre Pobreza Infantil y Comedores: "Los índices de pobreza infantil superan el promedio nacional. ¿Tarjeta directa sin intermediarios o refuerzo escolar universal?"»',
    '«AUH y Tarjeta Alimentar actualizadas automáticamente por canasta alimentaria real, combinadas con comedores escolares auditados por nutrición infantil directa.»',
    '«Usar comedores fantasmas para facturar polenta que nunca llegaba a los chicos fue el mayor escándalo moral de la política reciente.»',
    '«Pacto de Primera Infancia con prioridad presupuestaria absoluta en nutrición, control pediátrico y alfabetización inicial.»',
    'DEBATE POR POBREZA INFANTIL Y AUDITORÍA ALIMENTARIA'
  ),
  mkPrompt(
    'DEB_EXT_06', 'SEGURIDAD_JUSTICIA', 'Seguridad y Justicia', 'ANY',
    '«Cuestión Cibercrimen y Estafas Digitales: "Las estafas bancarias virtuales y secuestros de cuentas se multiplicaron en todo el país. ¿Qué respuesta estatal vas a dar?"»',
    '«Unidad federal de ciberdelito conectada en tiempo real con bancos y fintechs para congelar transferencias fraudulentas en minutos y trazabilidad cripto judicial.»',
    '«Hay más delincuentes operando con celulares truchos desde pabellones penitenciarios que en la calle; inhibir cárceles es el paso uno.»',
    '«Responsabilidad bancaria compartida ante fallas de seguridad y juzgados federales especializados en fraude financiero digital.»',
    'OFENSIVA CONTRA ESTAFAS VIRTUALES Y CIBERCRIMEN'
  ),
  mkPrompt(
    'DEB_EXT_07', 'EDUCACION_SALUD', 'Educación y Salud', 'ANY',
    '«Tema Medicina Preventiva e Insumos Médicos: "Las importaciones de prótesis y reactivos hospitalarios sufrieron demoras críticas. ¿Arancel cero médico o producción nacional?"»',
    '«Despacho aduanero expreso con arancel cero para equipamiento oncológico y reactivos sin producción local, y compras plurianuales a laboratorios nacionales de genéricos.»',
    '«Jugar con la burocracia de aduana frente a un paciente que espera un stent o una droga oncológica es criminal e imperdonable.»',
    '«Central federal de compras transparentes por licitación abierta para bajar 35% el precio de medicamentos en hospitales públicos.»',
    'CRUCE POR IMPORTACIÓN DE INSUMOS MÉDICOS CRÍTICOS'
  ),
  mkPrompt(
    'DEB_EXT_08', 'FEDERALISMO_ENERGIA', 'Federalismo y Energía', 'ANY',
    '«Tema Sequía, Seguros Agrícolas e Incendios: "El cambio climático alterna sequías e incendios en Patagonia y Córdoba. ¿Seguro multirriesgo público-privado o asistencia tardía?"»',
    '«Creación del seguro agropecuario paramétrico cofinanciado y duplicación de flota aérea hidrante federal estacionada estratégicamente en Patagonia y Sierras.»',
    '«Cuando se quema la Patagonia llegan con fotos y subsidios tres meses tarde después de no limpiar ni los cortafuegos ni pagar a los brigadistas.»',
    '«Sistema nacional de prevención hídrica y alerta temprana climática con coordinación permanente entre provincias y Nación.»',
    'DEBATE POR INCENDIOS FORESTALES Y SEGURO AGRÍCOLA'
  ),
  mkPrompt(
    'DEB_EXT_09', 'FEDERALISMO_ENERGIA', 'Federalismo y Energía', 'ANY',
    '«Tema Energía Nuclear y Renovables: "El mundo busca energía limpia 24/7 para centros de datos de IA. ¿Acelerás reactores modulares nucleares CAREM y parques eólicos?"»',
    '«Terminación prioritaria del reactor modular CAREM y apertura de concesiones eólicas y solares en Patagonia y Cuyo con acceso garantizado a líneas de alta tensión.»',
    '«Tenemos talento nuclear de clase mundial para vender energía limpia a centros de IA globales y lo frenaron por internas burocráticas.»',
    '«Consenso estratégico nuclear y renovable que combine inversión privada en alta tensión con desarrollo científico de CNEA e INVAP.»',
    'PLAN NUCLEAR CAREM Y ENERGÍA PARA CENTROS DE IA'
  ),
  mkPrompt(
    'DEB_EXT_10', 'MODELO_PAIS', 'Modelo de País y Geopolítica', 'ANY',
    '«Pregunta sobre Inmigración y Fronteras: "¿Vas a mantener reciprocidad estricta en salud y educación para no residentes o sostener apertura amplia constitucional?"»',
    '«Mantenimiento de la acogida constitucional a residentes legales con trabajo registrado, pero reciprocidad y arancelamiento claro para turismo sanitario o educativo no residente.»',
    '«Nuestros contribuyentes no pueden seguir bancando hospitales de frontera saturados mientras otros países nos cobran hasta la ambulancia a un argentino.»',
    '«Acuerdos bilaterales de compensación financiera con países vecinos para sostener atención sanitaria de frontera de manera justa y sustentable.»',
    'CRUCE POR RECIPROCIDAD SANITARIA Y FRONTERAS'
  ),
  mkPrompt(
    'DEB_EXT_11', 'MODELO_PAIS', 'Modelo de País y Geopolítica', 'ANY',
    '«Pregunta sobre Transparencia en Empresas Estatales: "Cada empresa pública acumula déficit operativo y directorios políticos. ¿Cierre, privatización o directorio técnico por concurso?"»',
    '«Regla dura: empresa estatal no estratégica con déficit crónico va a concesión o venta; empresa estratégica tiene directorio elegido por concurso público y balance trimestral.»',
    '«Usaron las empresas del Estado como agencias de colocación para amigos de la campaña mientras el usuario viajaba como ganado o pagaba déficit en impuestos.»',
    '«Creación de un holding técnico autónomo que audite cuentas públicas y abra participación minoritaria de capital privado para eficiencia.»',
    'DEBATE SOBRE DÉFICIT DE EMPRESAS PÚBLICAS'
  ),
  mkPrompt(
    'DEB_EXT_12', 'ECONOMIA', 'Economía e Inflación', 'ANY',
    '«Cruce sobre Mercado Inmobiliario y Construcción: "La construcción cayó fuerte y arrastra al empleo obrero. ¿Obra privada con incentivos tributarios o plan federal Procrear?"»',
    '«Desgravación total de IVA a primera vivienda construida de menos de 90 m² y fideicomisos hipotecarios en ladrillo para reactivar la obra privada en meses.»',
    '«Un plan estatal sin moneda termina entregando diez casas por campaña entre amigos mientras el trabajador común no puede comprar ni una bolsa de cemento.»',
    '«Alianza entre municipios, desarrolladores y bancos para loteos con servicios y créditos blandos destinados a la clase media trabajadora.»',
    'ESTÍMULO PRIVADO Y CRÉDITO PARA LA CONSTRUCCIÓN'
  ),
  mkPrompt(
    'DEB_EXT_13', 'SEGURIDAD_JUSTICIA', 'Seguridad y Justicia', 'ANY',
    '«Pregunta sobre Reforma Electoral y Gasto Político: "Las legislaturas provinciales y concejos deliberantes cuestan fortunas. ¿Unicameralidad o reducción obligatoria de asesores?"»',
    '«Tope nacional constitucional sugerido del 1% presupuestario para poderes legislativos, publicación online de cada asesor contratado y boleta única obligatoria.»',
    '«Mientras le piden esfuerzo al kiosquero de barrio, hay concejales con veinte asesores que no entran ni en el ascensor del concejo.»',
    '«Pacto de austeridad política entre Nación, gobernadores e intendentes eliminando cargos duplicados y viáticos discrecionales.»',
    'RECORTE DEL GASTO POLÍTICO Y LEGISLATURAS'
  )
];

export const DEBATE_REBUTTALS_CATALOG: DebateRebuttalSpec[] = [
  {
    id: 'REB_ARCHIVO_INFLACION',
    triggerTheme: 'ECONOMIA',
    label: '⚡ Archivo en Mano (Inflación Heredada)',
    counterText: '«Pido derecho a réplica: el candidato que acaba de dar cátedra de precios dejó tres dígitos anuales y el Banco Central sin un dólar en la bóveda.»',
    bonusImageDelta: 0.9,
    bonusConvDelta: 1.5,
    bonusVoteDelta: 0.9,
    riskNegDelta: 0.4,
    headline: 'RÉPLICA CON ARCHIVO FRENA ATAQUE ECONÓMICO EN VIVO'
  },
  {
    id: 'REB_DATO_MATA_RELATO',
    triggerTheme: 'ECONOMIA',
    label: '⚡ Dato Mata Relato (Ejecución Fiscal)',
    counterText: '«Pido réplica para corregir un número falso que acaban de decir al aire: el costo fiscal de nuestra medida equivale al 0,2% del PBI, ya publicado por escrito.»',
    bonusImageDelta: 1.2,
    bonusConvDelta: 1.8,
    bonusVoteDelta: 0.8,
    riskNegDelta: 0.1,
    headline: 'PRECISIÓN NUMÉRICA DESARMA CHICANA FISCAL EN EL ATRIL'
  },
  {
    id: 'REB_CAJA_NEGOCIADOS',
    triggerTheme: 'TRABAJO_SOCIAL',
    label: '⚡ Desenmascarar Intermediarios',
    counterText: '«Señor moderador, réplica: hablan de sensibilidad social pero votaron contra la auditoría de comedores y defendieron las cajas negras sindicales.»',
    bonusImageDelta: 0.7,
    bonusConvDelta: 1.3,
    bonusVoteDelta: 1.1,
    riskNegDelta: 0.7,
    headline: 'TENSO CRUCE POR INTERMEDIARIOS Y AUDITORÍAS SOCIALES'
  },
  {
    id: 'REB_ROSARIO_SEGURIDAD',
    triggerTheme: 'SEGURIDAD_JUSTICIA',
    label: '⚡ Réplica por Zona Liberada',
    counterText: '«Réplica inmediata: mientras discuten teorías garantistas en un estudio de televisión, los vecinos del Conurbano y Rosario enrejan hasta las ventanas.»',
    bonusImageDelta: 1.0,
    bonusConvDelta: 1.4,
    bonusVoteDelta: 1.2,
    riskNegDelta: 0.6,
    headline: 'FUERTE INTERPELACIÓN POR INSEGURIDAD EN EL GRAN BUENOS AIRES'
  },
  {
    id: 'REB_INTERIOR_FEDERAL',
    triggerTheme: 'FEDERALISMO_ENERGIA',
    label: '⚡ Defender al Interior Productivo',
    counterText: '«Pido réplica en nombre de las provincias productivas: basta de mirar el país desde veinte manzanas alrededor del Obelisco y ahogar al que exporta.»',
    bonusImageDelta: 1.5,
    bonusConvDelta: 1.6,
    bonusVoteDelta: 1.0,
    riskNegDelta: 0.2,
    headline: 'OVACIÓN FEDERAL TRAS RÉPLICA CONTRA EL CENTRALISMO PORTEÑO'
  },
  {
    id: 'REB_JOVENES_FUTURO',
    triggerTheme: 'EDUCACION_SALUD',
    label: '⚡ Hablarle Directo a los Estudiantes',
    counterText: '«Derecho a réplica: el estudiante que hoy cursa y trabaja doce horas no pide caridad estatal ni ajuste ciego, pide estabilidad y universidad pública transparente.»',
    bonusImageDelta: 1.3,
    bonusConvDelta: 1.5,
    bonusVoteDelta: 0.9,
    riskNegDelta: 0.2,
    headline: 'RÉPLICA POR UNIVERSIDADES CONECTA CON INDECISOS JÓVENES'
  },
  {
    id: 'REB_FICHA_LIMPIA',
    triggerTheme: 'MODELO_PAIS',
    label: '⚡ Cobrar Ficha Limpia y Fueros',
    counterText: '«Réplica urgente: en este escenario hay espacios que hablan de república pero blindaron con fueros a condenados en segunda instancia.»',
    bonusImageDelta: 1.1,
    bonusConvDelta: 1.4,
    bonusVoteDelta: 1.1,
    riskNegDelta: 0.5,
    headline: 'CRUCE FILOSO POR FICHA LIMPIA Y FUEROS PARLAMENTARIOS'
  },
  {
    id: 'REB_PYME_CONTRAGOLPE',
    triggerTheme: 'ECONOMIA',
    label: '⚡ Defender al Comercio y la PyME',
    counterText: '«Pido réplica: ni estatismo asfixiante ni importación salvaje sin bajar impuestos internos. Cuidemos a la fábrica argentina que da empleo blanco.»',
    bonusImageDelta: 1.2,
    bonusConvDelta: 1.5,
    bonusVoteDelta: 0.8,
    riskNegDelta: 0.2,
    headline: 'CONTRAGOLPE INDUSTRIAL GANA APLAUSOS EN SECTOR MEDIO'
  },
  {
    id: 'REB_VACA_MUERTA_DIVISAS',
    triggerTheme: 'FEDERALISMO_ENERGIA',
    label: '⚡ Mostrar Saldo Exportador de Energía',
    counterText: '«Réplica breve: en menos de cuatro años la energía y la minería equilibran la balanza cambiaria argentina si garantizamos reglas de 30 años sin cepos.»',
    bonusImageDelta: 1.0,
    bonusConvDelta: 1.6,
    bonusVoteDelta: 0.8,
    riskNegDelta: 0.1,
    headline: 'VISIÓN ENERGÉTICA DE LARGO PLAZO SUMA CREDIBILIDAD TÉCNICA'
  },
  {
    id: 'REB_HIPOCRESIA_PAUTA',
    triggerTheme: 'MODELO_PAIS',
    label: '⚡ Carpetazo por Pauta Oficial',
    counterText: '«Pido réplica: quien acaba de señalarme repartió millones de pesos en pauta a canales amigos para ocultar encuestas desfavorables.»',
    bonusImageDelta: 0.6,
    bonusConvDelta: 1.1,
    bonusVoteDelta: 1.2,
    riskNegDelta: 0.8,
    headline: 'ESCÁNDALO EN EL ATRIL POR DENUNCIA DE PAUTA DISCRECIONAL'
  },
  {
    id: 'REB_JUBILADOS_RESPETO',
    triggerTheme: 'TRABAJO_SOCIAL',
    label: '⚡ Blindar el Haber Mínimo',
    counterText: '«Réplica: ningún equilibrio fiscal vale si se hace recortando medicación crónica a un jubilado que aportó treinta años de su vida.»',
    bonusImageDelta: 1.6,
    bonusConvDelta: 1.4,
    bonusVoteDelta: 1.0,
    riskNegDelta: 0.2,
    headline: 'LLAMADO PREVISIONAL LOGRA ALTO IMPACTO EN AUDIENCIA MAYOR'
  },
  {
    id: 'REB_CASTA_ASESORES',
    triggerTheme: 'ANY',
    label: '⚡ Exponer Asesores y Sueldos VIP',
    counterText: '«Réplica rápida: antes de pedir sacrificio al laburante, publiquen mañana la nómina de asesores y asesores adjuntos que mantienen en sus bancas.»',
    bonusImageDelta: 0.8,
    bonusConvDelta: 1.2,
    bonusVoteDelta: 1.3,
    riskNegDelta: 0.5,
    headline: 'CHICANA CONTRA PRIVILEGIOS LEGISLATIVOS EXPLOTA EN TIKTOK'
  },
  {
    id: 'REB_NARCOS_CARCELES',
    triggerTheme: 'SEGURIDAD_JUSTICIA',
    label: '⚡ Corte Total de Celulares en Penales',
    counterText: '«Réplica concreta: no hace falta inventar la pólvora; se corta la señal celular en las cárceles federales en 48 horas si hay decisión presidencial.»',
    bonusImageDelta: 1.3,
    bonusConvDelta: 1.5,
    bonusVoteDelta: 1.0,
    riskNegDelta: 0.2,
    headline: 'PROPUESTA CARCELARIA CONCRETA SUMA PUNTOS EN SEGURIDAD'
  },
  {
    id: 'REB_EDUCACION_AULAS',
    triggerTheme: 'EDUCACION_SALUD',
    label: '⚡ 190 Días de Clases Obligatorios',
    counterText: '«Réplica: un chico en provincia de Buenos Aires pierde cuarenta días de clase por año frente a una escuela privada. Ese abismo es el verdadero ajuste.»',
    bonusImageDelta: 1.4,
    bonusConvDelta: 1.6,
    bonusVoteDelta: 0.9,
    riskNegDelta: 0.3,
    headline: 'DIAGNÓSTICO EDUCATIVO INTERPELA A FAMILIAS DE CLASE MEDIA'
  },
  {
    id: 'REB_CAMPO_SIN_RETENCIONES',
    triggerTheme: 'FEDERALISMO_ENERGIA',
    label: '⚡ Devolver Dólares al Productor',
    counterText: '«Pido réplica: cada peso que le dejan al productor en el campo se transforma al otro día en camionetas, sembradoras, fletes y movimiento en pueblos del interior.»',
    bonusImageDelta: 1.2,
    bonusConvDelta: 1.4,
    bonusVoteDelta: 1.0,
    riskNegDelta: 0.3,
    headline: 'DEFENSA DEL CAMPO CONSOLIDA VOTO EN LA REGIÓN CENTRO'
  },
  {
    id: 'REB_CONTRADICCION_LISTAS',
    triggerTheme: 'ANY',
    label: '⚡ Cobrar Alianzas Contradictorias',
    counterText: '«Derecho a réplica: se presentan como la renovación pura, pero en tres provincias cerraron listas con los mismos caciques de hace treinta años.»',
    bonusImageDelta: 0.7,
    bonusConvDelta: 1.1,
    bonusVoteDelta: 1.2,
    riskNegDelta: 0.6,
    headline: 'CRUCE POR ARMADO DE LISTAS DEJA INCOMODIDAD EN EL ESTUDIO'
  },
  {
    id: 'REB_TRABAJO_NEGRO',
    triggerTheme: 'TRABAJO_SOCIAL',
    label: '⚡ Blanquear sin Matar al Empleador',
    counterText: '«Réplica: el 45% de la gente está en negro porque contratar cuesta el doble que el salario de bolsillo. Bajando cargas al primer empleo blanqueamos millones.»',
    bonusImageDelta: 1.1,
    bonusConvDelta: 1.7,
    bonusVoteDelta: 0.9,
    riskNegDelta: 0.2,
    headline: 'PLANTEO LABORAL MODERNO CONECTA CON COMERCIANTES'
  },
  {
    id: 'REB_CONSENSO_NACIONAL',
    triggerTheme: 'MODELO_PAIS',
    label: '⚡ Salir de la Pelea Estéril',
    counterText: '«Pido réplica para decirlo claro: los argentinos ya están hartos de vernos gritar mientras sus sueldos se achican. Hace falta acuerdo y gestión.»',
    bonusImageDelta: 1.8,
    bonusConvDelta: 1.3,
    bonusVoteDelta: 0.9,
    riskNegDelta: -0.3,
    headline: 'MENSAJE ANTIGRIETA REDUCE IMAGEN NEGATIVA ENTRE INDECISOS'
  },
  {
    id: 'REB_SALUD_GARRAHAN',
    triggerTheme: 'EDUCACION_SALUD',
    label: '⚡ Prioridad en Guardias y Residentes',
    counterText: '«Réplica humana: un médico residente que hace guardias de 24 horas no puede cobrar menos que un asesor administrativo del Senado.»',
    bonusImageDelta: 1.7,
    bonusConvDelta: 1.5,
    bonusVoteDelta: 1.0,
    riskNegDelta: 0.1,
    headline: 'DEFENSA DE MÉDICOS RESIDENTES LOGRA ALTO CONSENSO SOCIAL'
  },
  {
    id: 'REB_BANDA_CAMBIARIA',
    triggerTheme: 'ECONOMIA',
    label: '⚡ Garantizar Ahorro del Ciudadano',
    counterText: '«Réplica clave: con nosotros nunca más un plan Bonex ni confiscación de plazos fijos. El ahorro privado es sagrado y se protege con moneda estable.»',
    bonusImageDelta: 1.3,
    bonusConvDelta: 1.6,
    bonusVoteDelta: 0.8,
    riskNegDelta: 0.1,
    headline: 'COMPROMISO CON LOS AHORRISTAS TRAE CALMA AL ZÓCALO FINANCIERO'
  },
  {
    id: 'REB_CIENCIA_TALENTO',
    triggerTheme: 'EDUCACION_SALUD',
    label: '⚡ Retener Ingeniería y Tecnología',
    counterText: '«Pido réplica: formamos ingenieros de elite en universidades públicas para regalarlos a empresas de afuera. Hay que darles horizonte aquí.»',
    bonusImageDelta: 1.4,
    bonusConvDelta: 1.3,
    bonusVoteDelta: 0.8,
    riskNegDelta: 0.1,
    headline: 'MENSAJE SOBRE TALENTO CIENTÍFICO IMPACTA EN CLASE MEDIA URBANA'
  },
  {
    id: 'REB_CORTE_BOLETA',
    triggerTheme: 'ANY',
    label: '⚡ Pedir Voto Completo sin Miedo',
    counterText: '«Derecho a réplica: la elección no se resuelve con encuestas pagas de consultoras amigas, se resuelve con el ciudadano libre frente a la Boleta Única.»',
    bonusImageDelta: 1.0,
    bonusConvDelta: 1.2,
    bonusVoteDelta: 1.0,
    riskNegDelta: 0.2,
    headline: 'APELACIÓN AL VOTO LIBRE SIN ENCUESTAS OPERADAS'
  },
  {
    id: 'REB_FRONTERAS_RADAR',
    triggerTheme: 'SEGURIDAD_JUSTICIA',
    label: '⚡ Respuesta Firme al Crimen Organizado',
    counterText: '«Réplica: al narcotráfico se lo combate ahogándole la ruta del dinero en Puerto Madero y blindando la Triple Frontera con tecnología y fuerzas federales.»',
    bonusImageDelta: 1.2,
    bonusConvDelta: 1.5,
    bonusVoteDelta: 1.1,
    riskNegDelta: 0.2,
    headline: 'PLANTEO CONTRA LAVADO Y FRONTERAS CONSIGUE APROBACIÓN'
  },
  {
    id: 'REB_OBRA_TRANSPARENTE',
    triggerTheme: 'FEDERALISMO_ENERGIA',
    label: '⚡ Licitación Abierta y Trazabilidad',
    counterText: '«Réplica final: ni paralizar rutas clave ni volver a los retornos del 15%. Concesión pública con precios de referencia internacionales en web abierta.»',
    bonusImageDelta: 1.3,
    bonusConvDelta: 1.4,
    bonusVoteDelta: 0.9,
    riskNegDelta: 0.1,
    headline: 'PROPUESTA DE OBRA CON PRECIO TESTIGO CIERRA EL BLOQUE'
  }
];
