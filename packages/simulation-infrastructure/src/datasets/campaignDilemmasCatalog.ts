import type { CampaignSimulationState } from '@argentina-sim/domain';

// Catalogo expandido de +50 Dilemas y Eventos Emergentes de Campana (52 escenarios unicos)
// para que cada mes de la campaña 2027 tenga acontecimientos distintos e irrepetibles.

export interface DilemmaEffectBadge {
  label: string;
  isPositive: boolean;
}

export interface CampaignDilemmaOption {
  id: string;
  title: string;
  badges: DilemmaEffectBadge[];
  apply: (state: CampaignSimulationState) => CampaignSimulationState;
}

export interface CampaignMonthlyDilemma {
  id: string;
  monthIndex: number;
  formattedDate: string;
  title: string;
  description: string;
  options: [CampaignDilemmaOption, CampaignDilemmaOption];
}

interface SimpleDilemmaDeltas {
  budget?: number;
  pos?: number;
  neg?: number;
  rel?: number;
  int?: number;
  conv?: number;
  apoyo?: number;
  vuln?: number;
  voto?: number;
  interna?: number;
}

function nz(value?: number): number {
  return value ?? 0;
}

function clampRound(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(val * 10) / 10));
}

function applySimpleDilemmaDeltas(
  state: CampaignSimulationState,
  logNote: string,
  d: SimpleDilemmaDeltas
): CampaignSimulationState {
  const nextPos = clampRound(state.image.imagenPositiva + nz(d.pos), 5, 88);
  const nextNeg = clampRound(state.image.imagenNegativa + nz(d.neg), 5, 88);
  const curVuln = state.attributes.vulnerabilidad ?? 20;
  return {
    ...state,
    budgetArgentums: Math.max(0, clampRound(state.budgetArgentums + nz(d.budget), 0, 9999)),
    image: {
      imagenPositiva: nextPos,
      imagenNegativa: nextNeg,
      desconocimiento: Math.max(2, clampRound(100 - nextPos - nextNeg, 2, 90))
    },
    attributes: {
      ...state.attributes,
      relevancia: clampRound(state.attributes.relevancia + nz(d.rel), 0, 100),
      inteligenciaPercibida: clampRound(state.attributes.inteligenciaPercibida + nz(d.int), 0, 100),
      convencimiento: clampRound(state.attributes.convencimiento + nz(d.conv), 0, 100),
      apoyoPartidario: clampRound(state.attributes.apoyoPartidario + nz(d.apoyo), 0, 100),
      vulnerabilidad: clampRound(curVuln + nz(d.vuln), 0, 100)
    },
    votingIntention: {
      ...state.votingIntention,
      tuInterna: clampRound(state.votingIntention.tuInterna + nz(d.interna), 1, 95),
      intencionVotoGeneral: clampRound(state.votingIntention.intencionVotoGeneral + nz(d.voto), 1, 75)
    },
    historyLog: [`Situación del mes: ${logNote}`, ...state.historyLog]
  };
}

function mkDilemmaOption(
  id: string,
  title: string,
  badges: DilemmaEffectBadge[],
  logNote: string,
  deltas: SimpleDilemmaDeltas
): CampaignDilemmaOption {
  return {
    id,
    title,
    badges,
    apply: (state) => applySimpleDilemmaDeltas(state, logNote, deltas)
  };
}

function mkCampDilemma(
  id: string,
  monthIndex: number,
  title: string,
  description: string,
  optA: CampaignDilemmaOption,
  optB: CampaignDilemmaOption
): CampaignMonthlyDilemma {
  return {
    id,
    monthIndex,
    formattedDate: `1 de ${['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][(monthIndex - 1) % 12]} de 2027`,
    title,
    description,
    options: [optA, optB]
  };
}

const CORE_DILEMMAS: CampaignMonthlyDilemma[] = [
  {
    id: 'DILEMMA_MES_5_EMPRESARIO',
    monthIndex: 5,
    formattedDate: '1 de mayo de 2027',
    title: 'Un empresario ofrece un aporte',
    description:
      'Un empresario de la construcción te ofrece un aporte de campaña significativo a cambio de que no toques ciertas licitaciones en caso de asumir. Nadie más lo sabe por ahora, pero aumentaría tu vulnerabilidad ante filtraciones judiciales.',
    options: [
      mkDilemmaOption(
        'ACEPTAR_DINERO', 'Aceptar el dinero',
        [
          { label: 'PRESUPUESTO +22 ARGENTUMS', isPositive: true },
          { label: 'VULNERABILIDAD +3,5', isPositive: false },
          { label: 'IMAGEN NEGATIVA +0,8', isPositive: false }
        ],
        'aceptaste el aporte del empresario de la construcción (+22 argentums, +3.5 vulnerabilidad).',
        { budget: 22.0, vuln: 3.5, neg: 0.8, rel: 1.2 }
      ),
      mkDilemmaOption(
        'RECHAZAR_DINERO', 'Rechazarlo',
        [
          { label: 'INTELIGENCIA PERCIBIDA +1,2', isPositive: true },
          { label: 'CONVENCIMIENTO +0,8', isPositive: true }
        ],
        'rechazaste el dinero turbio (+1.2 inteligencia percibida, +0.8 convencimiento).',
        { int: 1.2, conv: 0.8, pos: 0.6 }
      )
    ]
  },
  {
    id: 'DILEMMA_MES_7_FILTRACION',
    monthIndex: 7,
    formattedDate: '1 de julio de 2027',
    title: 'Operación mediática en la previa a las PASO',
    description:
      'Un canal de noticias asegura tener un audio de un armador tuyo negociando concejalías en el Conurbano. Amenazan con difundirlo el próximo domingo en horario central si no pagás pauta publicitaria anticipada.',
    options: [
      mkDilemmaOption(
        'SILENCIAR_PAUTA', 'Pautar y operar el silenciamiento',
        [
          { label: 'PRESUPUESTO -15 ARGENTUMS', isPositive: false },
          { label: 'BLINDAJE MEDIÁTICO TEMPORAL', isPositive: true }
        ],
        'pautaste para frenar la filtración mediática (-15 argentums).',
        { budget: -15.0 }
      ),
      mkDilemmaOption(
        'DENUNCIAR_EXTORSION', 'Dar la cara y denunciar extorsión',
        [
          { label: 'RELEVANCIA +3,0', isPositive: true },
          { label: 'CONVENCIMIENTO +2,0', isPositive: true },
          { label: 'IMAGEN NEGATIVA +1,5', isPositive: false }
        ],
        'fuiste a los medios a denunciar la opereta (+3 relevancia, +2 convencimiento, +1.5 negativa).',
        { rel: 3.0, conv: 2.0, neg: 1.5 }
      )
    ]
  },
  {
    id: 'DILEMMA_MES_9_BARONES',
    monthIndex: 9,
    formattedDate: '1 de septiembre de 2027',
    title: 'Pacto de no agresión en el Conurbano',
    description:
      'Intendentes de peso te ofrecen cuidar tus boletas presidenciales en las mesas de votación si bajás la intensidad de tus recorridas territoriales para no amenazar su control del concejo deliberante.',
    options: [
      mkDilemmaOption(
        'CERRAR_PACTO', 'Cerrar el pacto y asegurar fiscales',
        [
          { label: 'VOTOS GENERALES +2,2 %', isPositive: true },
          { label: 'APOYO PARTIDARIO -2,0', isPositive: false }
        ],
        'pactaste fiscalización con los caciques distritales (+2.2% votos generales, -2 apoyo partidario).',
        { voto: 2.2, apoyo: -2.0 }
      ),
      mkDilemmaOption(
        'RECHAZAR_PACTO', 'Rechazar y redoblar caravanas',
        [
          { label: 'APOYO MILITANTE +4,0', isPositive: true },
          { label: 'IMAGEN POSITIVA +1,5', isPositive: true }
        ],
        'rechazaste el apriete distrital y metiste caravana propia (+4 apoyo partidario, +1.5 positiva).',
        { apoyo: 4.0, pos: 1.5 }
      )
    ]
  }
];

type ExtraDilemmaSeed = [
  string,
  number,
  string,
  string,
  [string, string, SimpleDilemmaDeltas, DilemmaEffectBadge[]],
  [string, string, SimpleDilemmaDeltas, DilemmaEffectBadge[]]
];

const EXTRA_DILEMMA_SEEDS: ExtraDilemmaSeed[] = [
  ['DIL_CRYPTO_SPONSOR', 2, 'Sponsor de Exchange Cripto Extranjero', 'Un fondo de criptoactivos ofrece financiarte la pauta digital de redes a cambio de impulsar desregulación financiera total si ganás.', ['Aceptar patrocinio cripto', 'aceptaste financiamiento cripto (+18 argentums, +4.0 vulnerabilidad).', { budget: 18, vuln: 4.0, rel: 1.8, neg: 0.9 }, [{ label: 'PRESUPUESTO +18 ¥', isPositive: true }, { label: 'VULNERABILIDAD +4,0', isPositive: false }]], ['Declinar y publicar aportes', 'declinaste el sponsor cripto priorizando transparencia.', { int: 1.5, pos: 1.2 }, [{ label: 'IMAGEN POSITIVA +1,2', isPositive: true }, { label: 'INTELIGENCIA +1,5', isPositive: true }]]],
  ['DIL_STREAM_TRAMPA', 2, 'Invitación a Streamer Polémico', 'El canal de streaming más visto por menores de 30 años te invita a una entrevista sin filtro donde suelen hacer encerronas virales.', ['Ir al piso y bancar el cruce', 'fuiste al streaming y te viralizaste en el segmento sub-30.', { rel: 3.4, pos: 1.1, neg: 0.7, voto: 1.1 }, [{ label: 'RELEVANCIA +3,4', isPositive: true }, { label: 'VOTOS +1,1 %', isPositive: true }, { label: 'NEGATIVA +0,7', isPositive: false }]], ['Enviar un video grabado corto', 'evitaste el piso en vivo enviando un clip editado.', { rel: 0.8, conv: 0.5 }, [{ label: 'BAJO RIESGO', isPositive: true }, { label: 'RELEVANCIA +0,8', isPositive: true }]]],
  ['DIL_CARAVANA_LLUVIA', 2, 'Temporal en Lanzamiento de Provincia', 'Un diluvio amenaza con vaciar la plaza central el día de tu primer acto grande en el interior.', ['Hacer el acto bajo la lluvia', 'diste discurso épico bajo la lluvia frente a militantes.', { apoyo: 3.5, conv: 2.1, budget: -4 }, [{ label: 'APOYO PARTIDARIO +3,5', isPositive: true }, { label: 'CONVENCIMIENTO +2,1', isPositive: true }]], ['Pasarlo a club cerrado techado', 'reubicaste el lanzamiento en un estadio cubierto.', { pos: 1.1, int: 0.8, budget: -2.5 }, [{ label: 'IMAGEN POSITIVA +1,1', isPositive: true }, { label: 'COSTO -2,5 ¥', isPositive: false }]]],
  ['DIL_ENCUESTA_OPERA', 3, 'Encuestadora Ofrece "Dibujar" Sondeo', 'Una consultora conocida promete ubicarte cinco puntos arriba en su informe dominical si contratás sus servicios de tracking.', ['Contratar el paquete VIP', 'contrataste el informe estadístico inflado (-12 ¥).', { budget: -12, rel: 2.0, vuln: 2.2 }, [{ label: 'RELEVANCIA +2,0', isPositive: true }, { label: 'PRESUPUESTO -12 ¥', isPositive: false }]], ['Publicar tracking propio austero', 'publicaste métricas propias transparentes.', { int: 1.6, conv: 1.0 }, [{ label: 'INTELIGENCIA +1,6', isPositive: true }, { label: 'CONVENCIMIENTO +1,0', isPositive: true }]]],
  ['DIL_RURAL_SILBIDOS', 3, 'Tensión en Exposición Agropecuaria', 'Productores del centro protestan por retenciones justo antes de que subas al escenario principal de la exposición rural.', ['Proponer baja gradual en el acto', 'anunciaste cronograma de retenciones frente al agro.', { voto: 1.6, pos: 1.3, apoyo: -0.5 }, [{ label: 'VOTOS +1,6 %', isPositive: true }, { label: 'IMAGEN +1,3', isPositive: true }]], ['Reunion privada con Mesa de Enlace', 'negociaste a puertas cerradas con entidades rurales.', { int: 1.4, rel: 0.7 }, [{ label: 'INTELIGENCIA +1,4', isPositive: true }, { label: 'RELEVANCIA +0,7', isPositive: true }]]],
  ['DIL_LISTA_CERRADA', 3, 'Pelea por el Primer Lugar de Diputados', 'Dos referentes territoriales exigen encabezar la lista de diputados nacionales en tu distrito madre bajo amenaza de romper.', ['Imponer un técnico de confianza', 'impusiste un cuadro técnico en la lista de diputados.', { int: 2.0, apoyo: -2.4, interna: 2.5 }, [{ label: 'INTERNA +2,5 %', isPositive: true }, { label: 'APOYO -2,4', isPositive: false }]], ['Ceder el primer lugar al territorio', 'cediste la cabeza de lista al armado territorial.', { apoyo: 3.2, voto: 0.9 }, [{ label: 'APOYO PARTIDARIO +3,2', isPositive: true }, { label: 'VOTOS +0,9 %', isPositive: true }]]],
  ['DIL_INTERNA_CHICANA', 4, 'Rival Interno te Desafía a Mano a Mano', 'Tu adversario en la interna pide un debate televisado de dos horas en señal de noticias antes de votar.', ['Aceptar el desafío en prime time', 'arrasaste en el mano a mano de la interna.', { interna: 4.2, rel: 2.6, neg: 0.8 }, [{ label: 'INTERNA +4,2 %', isPositive: true }, { label: 'RELEVANCIA +2,6', isPositive: true }]], ['Ignorarlo y hacer recorrida barrial', 'evitaste subirle el precio al rival interno.', { conv: 1.5, interna: 1.1 }, [{ label: 'CONVENCIMIENTO +1,5', isPositive: true }, { label: 'INTERNA +1,1 %', isPositive: true }]]],
  ['DIL_AFICHES_ROTOS', 4, 'Guerra Sucía de Afiches en CABA y GBA', 'Amanecen tus carteles tapados con consignas agresivas de un rival anónimo de tu mismo espacio.', ['Salir con contracampaña irónica', 'capitalizaste la agresión con humor viral en redes.', { rel: 2.4, pos: 1.4, budget: -3 }, [{ label: 'IMAGEN +1,4', isPositive: true }, { label: 'RELEVANCIA +2,4', isPositive: true }]], ['Judicializar ante junta electoral', 'presentaste denuncia formal y preservaste caja.', { int: 1.1, interna: 1.6 }, [{ label: 'INTERNA +1,6 %', isPositive: true }, { label: 'INTELIGENCIA +1,1', isPositive: true }]]],
  ['DIL_BOLETA_COLOR', 4, 'Impugnación de Diseño de Boleta', 'Una línea interna menor objeta los colores y tipografía de tu boleta partidaria a diez días de imprimir.', ['Rediseñar urgente con imprenta', 'reimprimiste boletas limpias sin frenar distribución.', { budget: -7, interna: 2.0 }, [{ label: 'INTERNA +2,0 %', isPositive: true }, { label: 'PRESUPUESTO -7 ¥', isPositive: false }]], ['Pelear el fallo en la Justicia', 'ganaste la cautelar manteniendo el diseño clásico.', { rel: 1.4, apoyo: 1.5 }, [{ label: 'APOYO +1,5', isPositive: true }, { label: 'RELEVANCIA +1,4', isPositive: true }]]],
  ['DIL_GARRAHAN_MARCHA', 5, 'Caravana de Médicos Residentes frente a Tu Búnker', 'Residentes hospitalarios se concentran pidiendo compromiso explícito con presupuestos sanitarios y residencias pagas.', ['Recibir a delegados y firmar acta', 'recibiste a los residentes médicos con foto institucional.', { pos: 2.3, conv: 1.6, budget: -1 }, [{ label: 'IMAGEN +2,3', isPositive: true }, { label: 'CONVENCIMIENTO +1,6', isPositive: true }]], ['Prometer auditoría antes de girar', 'respondiste con criterio fiscal estricto.', { int: 1.7, neg: 1.1 }, [{ label: 'INTELIGENCIA +1,7', isPositive: true }, { label: 'NEGATIVA +1,1', isPositive: false }]]],
  ['DIL_SPOT_PLAGIO', 5, 'Acusación de Plagio en Tu Jingle de Campaña', 'Un músico denuncia que tu jingle viral copia un tema clásico sin derechos pagos.', ['Pagar licencia y sumar al autor al spot', 'resolviste los derechos y convertiste el tema en hit.', { budget: -6, rel: 2.2, pos: 1.0 }, [{ label: 'RELEVANCIA +2,2', isPositive: true }, { label: 'PRESUPUESTO -6 ¥', isPositive: false }]], ['Bajar la pieza y lanzar acapella', 'bajaste el jingle viejo y evitaste juicio.', { int: 0.9, neg: 0.5 }, [{ label: 'INTELIGENCIA +0,9', isPositive: true }, { label: 'NEGATIVA +0,5', isPositive: false }]]],
  ['DIL_COLOQUIO_IDEA', 6, 'Invitación Central al Foro Empresario', 'Los principales CEOs de energía, bancos y consumo masivo esperan definiciones sobre cepo, dólar y retenciones.', ['Discurso duro pro-mercado e inversión', 'entusiasmaste al Círculo Rojo con reglas claras.', { int: 2.6, budget: 14, neg: 0.7 }, [{ label: 'APORTES +14 ¥', isPositive: true }, { label: 'INTELIGENCIA +2,6', isPositive: true }]], ['Pedir compromiso con salarios locales', 'marcaste agenda productivista ante empresarios.', { pos: 1.8, voto: 1.0 }, [{ label: 'IMAGEN +1,8', isPositive: true }, { label: 'VOTOS +1,0 %', isPositive: true }]]],
  ['DIL_TUIT_DOLAR', 6, 'Un Tuit Tuyo Mueve el Dólar Blue 6%', 'Una declaración picante en redes dispara la cotización paralela y abre todos los zócalos de televisión.', ['Aclarar metas en conferencia urgente', 'calmaste la plaza aclarando hoja de ruta económica.', { int: 2.1, rel: 2.0 }, [{ label: 'INTELIGENCIA +2,1', isPositive: true }, { label: 'RELEVANCIA +2,0', isPositive: true }]], ['Redoblar la apuesta discursiva', 'polarizaste al máximo convirtiéndote en eje del debate.', { rel: 3.8, voto: 1.2, neg: 1.9 }, [{ label: 'VOTOS +1,2 %', isPositive: true }, { label: 'NEGATIVA +1,9', isPositive: false }]]],
  ['DIL_FACULTAD_TOMADA', 6, 'Toma en Facultad Pública Antes de Tu Charla', 'Estudiantes opositores toman el hall central de la universidad donde tenías pactada una disertación abierta.', ['Debatir en las escalinatas sin custodia', 'debatiste cara a cara en las escalinatas frente a cámaras.', { pos: 2.0, rel: 3.0, conv: 1.8 }, [{ label: 'IMAGEN +2,0', isPositive: true }, { label: 'RELEVANCIA +3,0', isPositive: true }]], ['Trasladar al teatro municipal', 'mudaste el encuentro evitando forcejeos.', { int: 1.2, apoyo: 1.0 }, [{ label: 'INTELIGENCIA +1,2', isPositive: true }, { label: 'APOYO +1,0', isPositive: true }]]],
  ['DIL_CARPETAZO_CONCEJAL', 7, 'Escándalo con Concejal de Cuarta Línea', 'Aparecen fotos de un candidato suplente de tu lista en un municipio chico en una fiesta de lujo incompatible con su sueldo.', ['Expulsarlo de la lista en vivo', 'cortaste por lo sano expulsando al suplente.', { pos: 1.7, vuln: -1.5, apoyo: -0.6 }, [{ label: 'VULNERABILIDAD -1,5', isPositive: true }, { label: 'IMAGEN +1,7', isPositive: true }]], ['Minimizarlo como operación rival', 'intentaste encapsular la polémica sin echarlo.', { neg: 1.6, rel: 1.0 }, [{ label: 'IMAGEN NEGATIVA +1,6', isPositive: false }, { label: 'RELEVANCIA +1,0', isPositive: true }]]],
  ['DIL_PARO_BONAERENSE', 7, 'Paro de Colectivos en el Día de Tu Caravana', 'Un corte gremial deja sin transporte el oeste del Conurbano justo el sábado de tu cierre previo a las PASO.', ['Contratar combis y microbarrios propios', 'movilizaste militancia en combis garantizando la foto.', { budget: -11, voto: 1.5, apoyo: 2.0 }, [{ label: 'VOTOS +1,5 %', isPositive: true }, { label: 'PRESUPUESTO -11 ¥', isPositive: false }]], ['Convertirlo en transmisión multi-stream', 'armaste transmisión federal desde tres puntos simultáneos.', { rel: 2.2, conv: 1.3 }, [{ label: 'RELEVANCIA +2,2', isPositive: true }, { label: 'CONVENCIMIENTO +1,3', isPositive: true }]]],
  ['DIL_DEEPFAKE_AUDIO', 8, 'Video Deepfake con Tu Voz Circula por WhatsApp', 'A días de las PASO, grupos masivos reenvían un video alterado con IA donde supuestamente anunciás un ajuste extremo.', ['Campaña flash de desmentida certificada', 'activaste fact-checkers y denuncia penal en horas.', { budget: -6, pos: 1.3, int: 1.5 }, [{ label: 'IMAGEN +1,3', isPositive: true }, { label: 'PRESUPUESTO -6 ¥', isPositive: false }]], ['Responder con video parodia viral', 'desactivaste la opereta burlándote en TikTok.', { rel: 3.1, voto: 1.2, neg: 0.6 }, [{ label: 'RELEVANCIA +3,1', isPositive: true }, { label: 'VOTOS +1,2 %', isPositive: true }]]],
  ['DIL_BOLETAS_MATANZA', 8, 'Faltan Bolsones de Boletas en el Oeste', 'A las cinco de la mañana del domingo faltan 400 mil boletas en camiones demorados hacia escuelas del GBA.', ['Fletar reparto de emergencia con drones y motos', 'salvaste el reparto en 190 escuelas antes de las 9 AM.', { budget: -10, voto: 2.1 }, [{ label: 'VOTOS +2,1 %', isPositive: true }, { label: 'PRESUPUESTO -10 ¥', isPositive: false }]], ['Redoblar fiscales para reponer con reservas', 'movilizaste reserva de militantes en escuelas clave.', { apoyo: 2.6, voto: 1.2 }, [{ label: 'APOYO +2,6', isPositive: true }, { label: 'VOTOS +1,2 %', isPositive: true }]]],
  ['DIL_GOBERNADOR_NORTE', 9, 'Gobernador del Norte Ofrece Estructura por ATN', 'Un mandatario provincial poderoso ofrece abrir sus escuelas y fiscales si prometés restituir obras viales en el presupuesto.', ['Firmar acta pública de obra estratégica', 'sellaste acuerdo de infraestructura con la provincia.', { voto: 1.9, int: 1.1, apoyo: 1.4 }, [{ label: 'VOTOS +1,9 %', isPositive: true }, { label: 'APOYO +1,4', isPositive: true }]], ['Mantener autonomía sin ceder cajas', 'mantuviste independencia frente al gobernador.', { pos: 1.5, rel: 1.2 }, [{ label: 'IMAGEN +1,5', isPositive: true }, { label: 'RELEVANCIA +1,2', isPositive: true }]]],
  ['DIL_BLACKOUT_SPOT', 9, 'Apagón en AMBA Durante Tu Spot Central', 'Se corta la luz en medio millón de hogares justo a las 21:00 cuando salía al aire tu pieza principal.', ['Usar el apagón para criticar desinversión', 'saliste en redes con linterna cuestionando falta de redes.', { rel: 2.9, voto: 1.3 }, [{ label: 'RELEVANCIA +2,9', isPositive: true }, { label: 'VOTOS +1,3 %', isPositive: true }]], ['Reprogramar pauta para mañana domingo', 'aseguraste reposición gratuita en prime time.', { budget: -3, conv: 1.6 }, [{ label: 'CONVENCIMIENTO +1,6', isPositive: true }, { label: 'PRESUPUESTO -3 ¥', isPositive: false }]]],
  ['DIL_CGT_ASADO', 10, 'Sindicato Gremial Pide Reunión Secreta', 'Dirigentes de transporte y energía buscan tender puentes con tu equipo antes de las elecciones generales de octubre.', ['Escuchar reclamos laborales sin prometer cargos', 'escuchaste a los gremios evitando conflictos de octubre.', { voto: 1.7, apoyo: -0.8 }, [{ label: 'VOTOS +1,7 %', isPositive: true }, { label: 'APOYO -0,8', isPositive: false }]], ['Rechazar foto y marcar agenda anti-burocracia', 'rechazaste la cumbre consolidando voto duro.', { conv: 1.8, rel: 1.9, neg: 0.7 }, [{ label: 'CONVENCIMIENTO +1,8', isPositive: true }, { label: 'NEGATIVA +0,7', isPositive: false }]]],
  ['DIL_CIERRE_CORDOBA', 10, 'Elección de Sede de Cierre Nacional', 'Tu comando discute si cerrar campaña en el Obelisco porteño o dar señal federal llenando el centro de Córdoba.', ['Cerrar en Córdoba apostando al interior', 'metiste multitud en Córdoba con cobertura federal.', { voto: 2.3, pos: 1.7, budget: -9 }, [{ label: 'VOTOS +2,3 %', isPositive: true }, { label: 'IMAGEN +1,7', isPositive: true }]], ['Cierre en microestadio del AMBA', 'llenaste estadio cerrado bajo control televisivo total.', { rel: 2.1, conv: 1.9, budget: -7 }, [{ label: 'CONVENCIMIENTO +1,9', isPositive: true }, { label: 'RELEVANCIA +2,1', isPositive: true }]]],
  ['DIL_TERCER_PUESTO', 11, 'El Tercero Atrasado Negocia Su Apoyo al Balotaje', 'El candidato que quedó tercero en octubre pide dos ministerios y agenda educativa para llamar a votarte en noviembre.', ['Acuerdo programático sin repartir ministerios', 'sumaste respaldo programático limpio de cara al balotaje.', { voto: 2.6, pos: 1.4 }, [{ label: 'VOTOS BALOTAJE +2,6 %', isPositive: true }, { label: 'IMAGEN +1,4', isPositive: true }]], ['Ceder Ministerio técnico y ganar aparato', 'incorporaste cuadro técnico del tercero a tu fórmula.', { voto: 3.4, apoyo: -1.5, budget: 8 }, [{ label: 'VOTOS +3,4 %', isPositive: true }, { label: 'APOYO PROPIO -1,5', isPositive: false }]]],
  ['DIL_CAMBIO_ASESOR', 11, 'Tu Consultor Estrella Propone Moderar el Discurso', 'Antes del balotaje, tus encuestadores sugieren bajar el tono confrontativo para seducir al votante blando del centro.', ['Moderar formas manteniendo eje económico', 'ajustaste discurso captando votos indecisos de centro.', { pos: 2.4, neg: -1.4, voto: 1.8 }, [{ label: 'IMAGEN +2,4', isPositive: true }, { label: 'NEGATIVA -1,4', isPositive: true }]], ['Sostener épica original hasta el domingo', 'redoblaste identidad propia con máxima movilización.', { conv: 2.7, rel: 2.2, voto: 1.5 }, [{ label: 'CONVENCIMIENTO +2,7', isPositive: true }, { label: 'VOTOS +1,5 %', isPositive: true }]]]
];

// 25 eventos transversales adicionales para llegar a 52 eventos distintos de campana
const POOL_TRANSVERSAL_SEEDS: Array<[string, string, string, [string, string, SimpleDilemmaDeltas, DilemmaEffectBadge[]], [string, string, SimpleDilemmaDeltas, DilemmaEffectBadge[]]]> = [
  ['DIL_TR_PERIODISTA', 'Cruce Caliente con Movilero de TV', 'Un cronista te sigue veinte cuadras con preguntas insistentes sobre tu declaración jurada patrimonial.', ['Mostrar resumen impositivo al aire', 'exhibiste tu patrimonio abriendo datos ante cámaras.', { pos: 1.6, int: 1.4 }, [{ label: 'IMAGEN +1,6', isPositive: true }, { label: 'INTELIGENCIA +1,4', isPositive: true }]], ['Cortar entrevista y seguir caminando', 'seguiste saludando vecinos evitando entrar en provocaciones.', { apoyo: 1.2, neg: 0.7 }, [{ label: 'APOYO +1,2', isPositive: true }, { label: 'NEGATIVA +0,7', isPositive: false }]]],
  ['DIL_TR_TREN_ROCA', 'Viaje Sorpresa en Tren Roca / Sarmiento', 'Tus estrategas proponen subirte en hora pico al tren para charlar sin vallas con trabajadores del Conurbano.', ['Hacerlo en hora pico con cámaras de mano', 'charlaste cara a cara en el vagón logrando clips genuinos.', { voto: 1.5, pos: 1.8, rel: 1.4 }, [{ label: 'VOTOS +1,5 %', isPositive: true }, { label: 'IMAGEN +1,8', isPositive: true }]], ['Hacer caminata en la estación con mesas', 'evitaste empujones organizando mesa en la salida.', { apoyo: 1.4, conv: 1.1 }, [{ label: 'APOYO +1,4', isPositive: true }, { label: 'CONVENCIMIENTO +1,1', isPositive: true }]]],
  ['DIL_TR_EMPRENDEDOR', 'Reclamo de Startups y Exportadores de Software', 'Fundadores de startups piden dólar libre para servicios digitales y baja inmediata de burocracia societaria.', ['Comprometer ventanilla única en 48 horas', 'atrajiste al ecosistema tech con proyecto concreto.', { int: 2.0, voto: 1.0 }, [{ label: 'INTELIGENCIA +2,0', isPositive: true }, { label: 'VOTOS +1,0 %', isPositive: true }]], ['Poner énfasis en empleo industrial local', 'priorizaste el perfil manufacturero clásico.', { conv: 1.2, pos: 0.7 }, [{ label: 'CONVENCIMIENTO +1,2', isPositive: true }, { label: 'IMAGEN +0,7', isPositive: true }]]],
  ['DIL_TR_LITIO_SALTA', 'Cumbre Federal por Inversiones en Litio', 'Cámaras mineras del NOA reclaman definición sobre regalías provinciales y estabilidad jurídica por 30 años.', ['Respaldar esquema RIGI con proveedores locales', 'equilibraste inversión minera y empleo regional.', { int: 1.9, budget: 8 }, [{ label: 'CAJA +8 ¥', isPositive: true }, { label: 'INTELIGENCIA +1,9', isPositive: true }]], ['Exigir industrialización de baterías en origen', 'marcaste postura desarrollista en el norte.', { pos: 1.5, conv: 1.3 }, [{ label: 'IMAGEN +1,5', isPositive: true }, { label: 'CONVENCIMIENTO +1,3', isPositive: true }]]],
  ['DIL_TR_INUNDACION', 'Emergencia Hídrica en el Litoral', 'Crece el Paraná y anega barrios ribereños justo en semana de actos programados.', ['Suspender actos y enviar brigadas solidarias', 'convertiste la gira en asistencia directa sin banderas.', { pos: 2.5, budget: -6, neg: -0.9 }, [{ label: 'IMAGEN +2,5', isPositive: true }, { label: 'PRESUPUESTO -6 ¥', isPositive: false }]], ['Mantener agenda criticando falta de obras', 'responsabilizaste al gobierno de turno por falta de defensas.', { rel: 1.9, neg: 0.8 }, [{ label: 'RELEVANCIA +1,9', isPositive: true }, { label: 'NEGATIVA +0,8', isPositive: false }]]],
  ['DIL_TR_INFLACION_SORP', 'Dato de Inflación Mensual Sorprende al Alza', 'El INDEC publica un índice peor al esperado por analistas y el debate económico monopoliza la semana.', ['Salir con pizarra y medidas de choque', 'explicaste medidas antiinflacionarias punto por punto.', { int: 2.3, rel: 1.7, voto: 1.1 }, [{ label: 'INTELIGENCIA +2,3', isPositive: true }, { label: 'VOTOS +1,1 %', isPositive: true }]], ['Pegar duro por fracaso de gestión actual', 'golpeaste políticamente capitalizando el malestar.', { voto: 1.4, rel: 2.1, neg: 0.5 }, [{ label: 'RELEVANCIA +2,1', isPositive: true }, { label: 'VOTOS +1,4 %', isPositive: true }]]],
  ['DIL_TR_ESCRUTINIO', 'Falla en Simulacro Informático del Correo', 'Apoderados técnicos reportan demoras sospechosas durante el simulacro de carga de telegramas.', ['Armar centro de cómputos paralelo propio', 'financiaste auditoría técnica y centro propio de actas.', { budget: -9, apoyo: 2.5, int: 1.5 }, [{ label: 'APOYO +2,5', isPositive: true }, { label: 'PRESUPUESTO -9 ¥', isPositive: false }]], ['Denunciar públicamente ante la CNE', 'elevaste alerta formal ante la cámara electoral.', { rel: 2.0, conv: 1.2 }, [{ label: 'RELEVANCIA +2,0', isPositive: true }, { label: 'CONVENCIMIENTO +1,2', isPositive: true }]]],
  ['DIL_TR_JUBILADOS_CENTRO', 'Asamblea en Centro de Jubilados', 'Adultos mayores te reclaman por el precio de medicamentos crónicos y demoras en turnos de PAMI.', ['Presentar canasta garantizada sin intermediarios', 'sumaste credibilidad entre votantes mayores de 60.', { pos: 2.0, voto: 1.3 }, [{ label: 'IMAGEN +2,0', isPositive: true }, { label: 'VOTOS +1,3 %', isPositive: true }]], ['Sincerar crisis financiera de la caja previsional', 'hablaste con franqueza fiscal ganando respeto técnico.', { int: 1.8, neg: 0.4 }, [{ label: 'INTELIGENCIA +1,8', isPositive: true }, { label: 'NEGATIVA +0,4', isPositive: false }]]],
  ['DIL_TR_ROSARIO_VIVO', 'Cacerolazo por Inseguridad en Rosario', 'Miles de vecinos salen a reclamar orden en el Monumento a la Bandera tras una balacera en zona céntrica.', ['Presentar plan antimafia en vivo desde Rosario', 'viajaste esa misma noche con paquete penal concreto.', { voto: 1.8, rel: 2.4, budget: -4 }, [{ label: 'VOTOS +1,8 %', isPositive: true }, { label: 'RELEVANCIA +2,4', isPositive: true }]], ['Llamar a cumbre interpartidaria de seguridad', 'propusiste pacto nacional contra el narcotráfico.', { pos: 1.7, int: 1.1 }, [{ label: 'IMAGEN +1,7', isPositive: true }, { label: 'INTELIGENCIA +1,1', isPositive: true }]]],
  ['DIL_TR_PAUTA_TIKTOK', 'Influencers Ofrecen Campaña "Orgánica" Pagada', 'Una agencia propone cien videos de creadores comentando "espontáneamente" tus propuestas por un fee reservado.', ['Rechazar y pagar pauta oficial declarada', 'elegiste pauta transparente evitando carpetazos futuros.', { budget: -5, int: 1.3 }, [{ label: 'INTELIGENCIA +1,3', isPositive: true }, { label: 'TRANSPARENCIA', isPositive: true }]], ['Aceptar la ola encubierta en reels', 'explotaste en alcance juvenil asumiendo riesgo de filtración.', { rel: 3.2, vuln: 2.5, budget: -7 }, [{ label: 'RELEVANCIA +3,2', isPositive: true }, { label: 'VULNERABILIDAD +2,5', isPositive: false }]]],
  ['DIL_TR_FERROCARRIL', 'Descarrilamiento de Tren de Cargas Agrícola', 'Un convoy cerealero descarrila cerca de Santa Fe reabriendo el debate sobre concesiones y flete.', ['Proponer licitación privada abierta de vías', 'despertaste apoyo agroindustrial con plan ferroviario.', { int: 1.6, voto: 1.0 }, [{ label: 'INTELIGENCIA +1,6', isPositive: true }, { label: 'VOTOS +1,0 %', isPositive: true }]], ['Plantear consorcio mixto Nación-Provincias', 'propusiste gestión federal junto a gobernadores.', { pos: 1.4, apoyo: 1.1 }, [{ label: 'IMAGEN +1,4', isPositive: true }, { label: 'APOYO +1,1', isPositive: true }]]],
  ['DIL_TR_HACK_CAMPAÑA', 'Ciberataque a Tu Base de Voluntarios', 'Desconocidos tiran tu web de afiliación y amenazan filtrar correos internos de fiscales voluntarios.', ['Contratar equipo urgente de ciberseguridad', 'blindaste servidores y mitigaste daños en 6 horas.', { budget: -6.5, vuln: -1.0 }, [{ label: 'VULNERABILIDAD -1,0', isPositive: true }, { label: 'PRESUPUESTO -6,5 ¥', isPositive: false }]], ['Denunciar espionaje político en conferencia', 'denunciaste sabotaje ganando centralidad mediática.', { rel: 2.6, neg: 0.4 }, [{ label: 'RELEVANCIA +2,6', isPositive: true }, { label: 'NEGATIVA +0,4', isPositive: false }]]],
  ['DIL_TR_VACA_MUERTA_GREMIO', 'Conflicto en Yacimiento de Añelo', 'Subcontratistas petroleros paran accesos en Neuquén pidiendo actualización por inflación patagónica.', ['Viajar a mediar entre petroleras y gremio', 'proyectaste liderazgo nacional destrabando el diálogo.', { pos: 1.7, voto: 1.3, rel: 1.6 }, [{ label: 'VOTOS +1,3 %', isPositive: true }, { label: 'IMAGEN +1,7', isPositive: true }]], ['Exigir ley de esencialidad energética ya', 'tomaste postura dura en favor de exportaciones continuas.', { int: 1.6, neg: 0.8 }, [{ label: 'INTELIGENCIA +1,6', isPositive: true }, { label: 'NEGATIVA +0,8', isPositive: false }]]],
  ['DIL_TR_PYME_CREDITO', 'Cierre de Fábrica Textil Centenaria en GBA', 'Ciento cuarenta operarios cortan la avenida frente a la planta cerrada por caída de consumo e insumos caros.', ['Presentar proyecto de Mini-RIGI PyME allí', 'propusiste alivio fiscal directo para sostener empleo.', { pos: 1.9, conv: 1.5 }, [{ label: 'IMAGEN +1,9', isPositive: true }, { label: 'CONVENCIMIENTO +1,5', isPositive: true }]], ['Explicar reconversión competitiva sin subsidios', 'defendiste apertura productiva pese a críticas.', { int: 1.5, neg: 1.2 }, [{ label: 'INTELIGENCIA +1,5', isPositive: true }, { label: 'NEGATIVA +1,2', isPositive: false }]]],
  ['DIL_TR_MISA_SOCIAL', 'Invitación a Celebración Interreligiosa en Villas', 'Sacerdotes y pastores de barrios populares invitan a firmar acta de lucha contra la ludopatía y el narco juvenil.', ['Ir sin cámaras políticas y firmar acta', 'generaste fuerte respeto en redes barriales del GBA.', { pos: 2.2, voto: 1.4 }, [{ label: 'IMAGEN +2,2', isPositive: true }, { label: 'VOTOS +1,4 %', isPositive: true }]], ['Mandar referente social de tu equipo', 'cumpliste protocolo dejando paso a agenda macro.', { apoyo: 0.9, int: 0.6 }, [{ label: 'APOYO +0,9', isPositive: true }, { label: 'INTELIGENCIA +0,6', isPositive: true }]]],
  ['DIL_TR_AEROLINEAS_PARO', 'Varados en Aeroparque por Asamblea Gremial', 'Tenías vuelo al interior para un acto clave y una asamblea imprevista cancela los vuelos matutinos.', ['Salir en camioneta por ruta y hacer vivos', 'grabaste el viaje por ruta convirtiendo la demora en épica.', { rel: 2.5, pos: 1.4, conv: 1.3 }, [{ label: 'RELEVANCIA +2,5', isPositive: true }, { label: 'IMAGEN +1,4', isPositive: true }]], ['Reprogramar agenda y criticar monopolio aéreo', 'planteaste reforma de cielos abiertos desde el hall.', { int: 1.5, voto: 1.1 }, [{ label: 'INTELIGENCIA +1,5', isPositive: true }, { label: 'VOTOS +1,1 %', isPositive: true }]]],
  ['DIL_TR_FORO_EXTERIOR', 'Carta Crítica de Think Tank de Washington', 'Un informe estadounidense advierte riesgos de gobernabilidad si ganás sin mayoría parlamentaria propia.', ['Responder con nota en prensa financiera global', 'mostraste solvencia técnica bajando ruido en mercados.', { int: 2.4, rel: 1.5 }, [{ label: 'INTELIGENCIA +2,4', isPositive: true }, { label: 'RELEVANCIA +1,5', isPositive: true }]], ['Rechazar injerencia externa en acto local', 'marcaste soberanía política frente a militantes.', { apoyo: 2.4, conv: 1.4 }, [{ label: 'APOYO +2,4', isPositive: true }, { label: 'CONVENCIMIENTO +1,4', isPositive: true }]]],
  ['DIL_TR_CORRUPCION_OBRA', 'Causa Judicial Reabre Sospechas en Contratista', 'Un proveedor de escenarios de tu acto aparece vinculado a una causa vieja de sobreprecios municipales.', ['Cambiar proveedor y publicar factura online', 'mostraste reflejos rápidos limpiando la imagen.', { budget: -4.5, vuln: -1.4, pos: 1.1 }, [{ label: 'VULNERABILIDAD -1,4', isPositive: true }, { label: 'IMAGEN +1,1', isPositive: true }]], ['Alegar que solo alquiló sonido sin vínculos', 'seguiste con el proveedor asumiendo desgaste.', { neg: 1.3, vuln: 1.2 }, [{ label: 'NEGATIVA +1,3', isPositive: false }, { label: 'VULNERABILIDAD +1,2', isPositive: false }]]],
  ['DIL_TR_LUDOPATIA', 'Padres Denuncian Casas de Apuestas en Escuelas', 'Madres organizadas piden leyes duras contra el juego online en menores antes de tu charla educativa.', ['Proponer prohibición total de publicidad deportiva', 'lideraste la agenda familiar ganando apoyo transversal.', { pos: 2.3, voto: 1.2 }, [{ label: 'IMAGEN +2,3', isPositive: true }, { label: 'VOTOS +1,2 %', isPositive: true }]], ['Pedir control parental sin prohibir sponsors', 'defendiste autorregulación y libertad comercial.', { budget: 6, neg: 1.1 }, [{ label: 'APORTE +6 ¥', isPositive: true }, { label: 'NEGATIVA +1,1', isPositive: false }]]],
  ['DIL_TR_PODCAST_2H', 'Podcast Independiente Batió Récord de Vistas', 'Te ofrecen charla de dos horas sin cortes ni zócalos para hablar de historia, economía y vida personal.', ['Ir sin libreto y contar errores propios', 'humanizaste tu perfil logrando empatía inesperada.', { pos: 2.6, neg: -1.1, conv: 1.7 }, [{ label: 'IMAGEN +2,6', isPositive: true }, { label: 'NEGATIVA -1,1', isPositive: true }]], ['Ir con punteo técnico estricto', 'dejaste clara tu plataforma sin sorpresas.', { int: 1.8, rel: 1.0 }, [{ label: 'INTELIGENCIA +1,8', isPositive: true }, { label: 'RELEVANCIA +1,0', isPositive: true }]]],
  ['DIL_TR_PESCA_MAR_ARG', 'Captura de Buque Pesquero Extranjero en Milla 201', 'La Prefectura captura un potero ilegal y te consultan sobre defensa marítima y base en Ushuaia.', ['Proponer equipamiento naval y multas duras', 'mostraste firmeza en defensa oceánica y soberanía.', { pos: 1.7, int: 1.4, voto: 1.0 }, [{ label: 'IMAGEN +1,7', isPositive: true }, { label: 'VOTOS +1,0 %', isPositive: true }]], ['Foco en convenios pesqueros con países vecinos', 'priorizaste diplomacia comercial multilateral.', { int: 1.1, rel: 0.7 }, [{ label: 'INTELIGENCIA +1,1', isPositive: true }, { label: 'RELEVANCIA +0,7', isPositive: true }]]],
  ['DIL_TR_SUBE_TARIFA', 'Aumento de Boleto Sacude Estaciones Terminal', 'La quita de subsidios encarece el viaje diario en tren y colectivo justo cuando grababas un spot en Constitución.', ['Anunciar SUBE social federal segmentada', 'propusiste tarifa social directa evitando enojo popular.', { voto: 1.6, pos: 1.5 }, [{ label: 'VOTOS +1,6 %', isPositive: true }, { label: 'IMAGEN +1,5', isPositive: true }]], ['Sincerar costo real y pedir fin de subsidios', 'mantuviste coherencia fiscal pese al malhumor.', { int: 1.9, neg: 1.3 }, [{ label: 'INTELIGENCIA +1,9', isPositive: true }, { label: 'NEGATIVA +1,3', isPositive: false }]]],
  ['DIL_TR_ALQUILERES_CABA', 'Movilización de Inquilinos en Plaza de Mayo', 'Jóvenes profesionales reclaman acceso a hipoteca y garantías menos abusivas para mudarse.', ['Presentar hipoteca UVA topada por salario', 'conectaste con clase media joven en busca de vivienda.', { voto: 1.6, int: 1.5, pos: 1.4 }, [{ label: 'VOTOS +1,6 %', isPositive: true }, { label: 'IMAGEN +1,4', isPositive: true }]], ['Defender desregulación total de contratos', 'ratificaste oferta libre y seguridad jurídica al propietario.', { int: 1.4, neg: 0.8 }, [{ label: 'INTELIGENCIA +1,4', isPositive: true }, { label: 'NEGATIVA +0,8', isPositive: false }]]],
  ['DIL_TR_MEME_RIVAL', 'Tu Jefe de Redes Sube Meme Fuerte Contra Rival', 'El posteo se vuelve trending topic en diez minutos pero genera quejas por cruzar el límite del humor político.', ['Dejarlo arriba y bancar la chicana', 'sostuviste tendencia explosiva en redes toda la tarde.', { rel: 3.3, conv: 1.2, neg: 1.3 }, [{ label: 'RELEVANCIA +3,3', isPositive: true }, { label: 'NEGATIVA +1,3', isPositive: false }]], ['Bajarlo y pedir campaña sobre propuestas', 'priorizaste tono presidencial reduciendo rechazo.', { pos: 1.5, neg: -0.9 }, [{ label: 'IMAGEN +1,5', isPositive: true }, { label: 'NEGATIVA -0,9', isPositive: true }]]],
  ['DIL_TR_CINE_CULTURA', 'Polémica en Festival de Cine y Cultura Nacional', 'Referentes culturales interpelan tu postura sobre financiamiento estatal audiovisual y patrimonio.', ['Proponer crédito fiscal privado y coproducciones', 'propusiste salida mixta moderna sin déficit público.', { pos: 1.6, int: 1.5 }, [{ label: 'IMAGEN +1,6', isPositive: true }, { label: 'INTELIGENCIA +1,5', isPositive: true }]], ['Ratificar recorte total de subsidios culturales', 'consolidaste apoyo duro contra gastos no esenciales.', { conv: 1.8, neg: 1.4 }, [{ label: 'CONVENCIMIENTO +1,8', isPositive: true }, { label: 'NEGATIVA +1,4', isPositive: false }]]],
  ['DIL_TR_GANADERIA_CARNE', 'Reclamo de Frigoríficos por Cupos y Tipo de Cambio', 'Exportadores de carne vacuna proponen abrir cuotas a China y Europa con menor carga impositiva.', ['Acordar baja tributaria contra oferta local', 'armonizaste exportación con precio de asado local.', { voto: 1.5, pos: 1.3, int: 1.2 }, [{ label: 'VOTOS +1,5 %', isPositive: true }, { label: 'IMAGEN +1,3', isPositive: true }]], ['Libertad absoluta de exportación desde día 1', 'ganaste aplauso del agroexportador en pleno debate.', { int: 1.6, budget: 7, neg: 0.6 }, [{ label: 'APORTES +7 ¥', isPositive: true }, { label: 'INTELIGENCIA +1,6', isPositive: true }]]],
  ['DIL_TR_BOLETA_ESCUELA', 'Autoridades de Mesa Piden Viáticos e Instructivo', 'El correo avisa demoras en capacitación de Boleta Única y faltan instructivos en el interior provincial.', ['Financiar simuladores barriales de Boleta Única', 'capacitaste votantes evitando votos nulos de tu lista.', { budget: -5.5, voto: 1.8, int: 1.0 }, [{ label: 'VOTOS +1,8 %', isPositive: true }, { label: 'PRESUPUESTO -5,5 ¥', isPositive: false }]], ['Concentrar campaña digital de cierre', 'apostaste al tramo mediático final sin gasto territorial.', { rel: 1.8, conv: 1.1 }, [{ label: 'RELEVANCIA +1,8', isPositive: true }, { label: 'CONVENCIMIENTO +1,1', isPositive: true }]]]
];

export const CAMPAIGN_DILEMMAS_CATALOG: CampaignMonthlyDilemma[] = [
  ...CORE_DILEMMAS,
  ...EXTRA_DILEMMA_SEEDS.map(([id, monthIndex, title, desc, a, b]) =>
    mkCampDilemma(
      id,
      monthIndex,
      title,
      desc,
      mkDilemmaOption(`${id}_A`, a[0], a[3], a[1], a[2]),
      mkDilemmaOption(`${id}_B`, b[0], b[3], b[1], b[2])
    )
  ),
  ...POOL_TRANSVERSAL_SEEDS.map(([id, title, desc, a, b], idx) =>
    mkCampDilemma(
      id,
      2 + (idx % 10),
      title,
      desc,
      mkDilemmaOption(`${id}_A`, a[0], a[3], a[1], a[2]),
      mkDilemmaOption(`${id}_B`, b[0], b[3], b[1], b[2])
    )
  )
];

function computeDilemmaHash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const MONTH_DATE_LABELS: Record<number, string> = {
  1: '1 de enero de 2027',
  2: '1 de febrero de 2027',
  3: '1 de marzo de 2027',
  4: '25 de abril de 2027',
  5: '1 de mayo de 2027',
  6: '1 de junio de 2027',
  7: '1 de julio de 2027',
  8: '8 de agosto de 2027',
  9: '1 de septiembre de 2027',
  10: '24 de octubre de 2027',
  11: '21 de noviembre de 2027'
};

function attachMonthLabel(dilemma: CampaignMonthlyDilemma, monthIndex: number): CampaignMonthlyDilemma {
  const formattedDate = MONTH_DATE_LABELS[monthIndex] ?? dilemma.formattedDate;
  return { ...dilemma, formattedDate };
}

function findDilemmaById(activeDilemmaId: string, monthIndex: number): CampaignMonthlyDilemma | null {
  const exact = CAMPAIGN_DILEMMAS_CATALOG.find((d) => d.id === activeDilemmaId);
  return exact ? attachMonthLabel(exact, monthIndex) : null;
}

function selectDilemmaFromPool(
  available: CampaignMonthlyDilemma[],
  monthIndex: number,
  seedKey?: string
): CampaignMonthlyDilemma {
  const monthMatches = available.filter((d) => d.monthIndex === monthIndex);
  const pool = monthMatches.length > 0 ? monthMatches : available;
  const hashSeed = `${seedKey ?? 'ARG2027'}-M${monthIndex}`;
  const pickIdx = computeDilemmaHash(hashSeed) % pool.length;
  return attachMonthLabel(pool[pickIdx]!, monthIndex);
}

function isValidDilemmaMonth(monthIndex: number): boolean {
  return monthIndex >= 2 && monthIndex <= 11;
}

export function resolveMonthlyDilemma(
  monthIndex: number,
  resolvedIds?: string[],
  activeDilemmaId?: string | null,
  seedKey?: string
): CampaignMonthlyDilemma | null {
  if (activeDilemmaId) {
    return findDilemmaById(activeDilemmaId, monthIndex);
  }
  if (!isValidDilemmaMonth(monthIndex)) {
    return null;
  }

  const resolved = new Set(resolvedIds ?? []);
  const available = CAMPAIGN_DILEMMAS_CATALOG.filter((d) => !resolved.has(d.id));
  if (available.length === 0) {
    return null;
  }
  return selectDilemmaFromPool(available, monthIndex, seedKey);
}
