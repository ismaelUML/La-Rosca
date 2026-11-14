# Catálogo de Expansión — La Rosca (2027–2031)

Este documento junta **420 ideas nuevas y jugables** (**105 Medidas + 105 Reformas + 105 Leyes + 105 Eventos**) pensadas para agrandar **La Rosca** sin repetir lo que ya está cargado en el código.

> **Base ya implementada hoy en el repo (no repetida acá):**
> - **Medidas (`partiesAndPoliticians2027.ts`)**: 16 tarjetas (Ley de góndolas, Observatorio de precios, Libre importación de insumos, Metas de inflación, Defensa de la competencia, Ferias, Desregulación, Acuerdo de precios, Congelamiento de tarifas, Pacto social, Alimentos canasta básica, Dólar blend 80/20, Fondo de cese, Reversión Gasoducto Norte, Antimafia Rosario, Recompra de PUTs).
> - **Reformas (`reformasInstitucionalesEngine.ts`)**: 21 reformas fijas (PASO sí/no, medio término, unificación, reelección/6 años/indefinida, balotaje, voto voluntario/16/extranjeros, BUP/BUE, debates, paridad 50/50, reducción bancas, Senado proporcional, ampliación CSJN, Magistratura, elección de jueces).
> - **Leyes (`congressEngine.ts` + referencia `officialBillsCatalogQQG.ts`)**: 5 leyes activas en el recinto (Ley Bases 2.0, Déficit Cero, Reforma Laboral, Pacto Fiscal, Intervención Federal) y 46 títulos del catálogo base QQG.
> - **Eventos (`governmentEventsCatalog.ts` + `campaignDilemmasCatalog.ts`)**: 12 eventos de gobierno (Paro CGT, Sequía, Corrida, Audios Rosada, Apagones, Gobernadores, Cautelar DNU, FMI, Tasas Fed, Renuncia gabinete, Marcha universitaria, Inversión récord) + 3 dilemas de campaña.

La idea no es meter relleno: cada ítem tiene **tensión real**. Si te da caja o baja la inflación, te prende fuego la calle o te vacía el bloque; si te da gobernabilidad o imagen, te come reservas o déficit.

---

## 1. Medidas Ejecutivas Nuevas (105)

Resoluciones ministeriales, DNU puntuales, programas operativos y botonera del día a día. No pasan por el recinto (salvo que te metan una cautelar si te zarpás con el alcance).

### A. Macro, Dólar, Cepo y BCRA (M01–M15)

| # | ID sugerido | Medida | Cartera | Impacto y costo de rosca |
|---|---|---|---|---|
| 1 | `LIBERAR_CEPO_DIVIDENDOS` | Giro libre de dividendos para ejercicios nuevos | Economía / BCRA | Sube inversión externa y confianza; drena USD netos en meses de vencimientos |
| 2 | `BANDAS_FLOTACION_SUCIA` | Esquema de bandas cambiarias con piso y techo móviles | BCRA | Ordena expectativas devaluatorias; quema reservas si toca el techo antes de elecciones |
| 3 | `BOPREAL_PYME_DEUDA` | Nueva serie de bono importador para stock comercial PyME | BCRA | Destraba insumos industriales y frena parate; suma deuda futura del Central |
| 4 | `ENCAJES_REMUNERADOS_CERO` | Suba de encajes no remunerados a depósitos a la vista | BCRA | Seca pesos de la plaza y enfría la brecha; dispara tasas activas y quejas de bancos |
| 5 | `DESARME_LEFI_BANCA` | Licitación compulsiva para pasar encajes bancarios a Tesoro corto | Finanzas / BCRA | Limpia hoja del BCRA; sube vulnerabilidad si se cae un rollover mensual |
| 6 | `VENTANILLA_BLANQUEO_EFECTIVO` | Prórroga de regularización de cash para construcción e industria | Economía / ARCA | Inyecta dólares al circuito formal y sube actividad; desgaste moral con oposición |
| 7 | `DOLAR_TURISTA_TARJETA_LIBRE` | Eliminación de recargos sobre consumo con tarjeta en el exterior | Economía | Aplauso clase media y caída del dólar tarjeta; sangría mensual de reservas |
| 8 | `CREDITOS_UVA_COMPENSADOS` | Fondo de compensación tasa-inflación para hipotecarios UVA | Economía | Baja angustia de clase media endeudada y mejora humor; costo fiscal moderado |
| 9 | `CANJE_BONCER_2028` | Reperfilamiento voluntario de vencimientos CER antes de elecciones | Finanzas | Despeja pared de vencimientos por 12 meses; riesgo de señal de estrés en bonos |
| 10 | `SWAP_MULTILATERAL_COMERCIO` | Activación de línea de swap comercial en monedas locales para insumos | Cancillería / BCRA | Alivia caja en USD billete; ruido diplomático con Washington / FMI |
| 11 | `PROHIBIR_ADELANTOS_TRANSITORIOS` | Regla interna de emisión cero para financiar al Tesoro | BCRA | Ancla fuerte contra hiperinflación y calma riesgo país; te ata las manos ante shocks |
| 12 | `COMPRA_RESERVAS_CON_TESORO` | Compras diarias del Tesoro en el MULC con superávit primario | Economía | Acumula reservas netas reales sin emitir; mete presión alcista sobre el dólar oficial |
| 13 | `LIBRE_COMPETENCIA_MONEDAS_CONTRATOS` | Habilitación de facturación, alquileres y contratos en USD/EUR sin pesificar | Justicia / Economía | Formaliza economía bimonetaria y atrae ahorro; cae uso transaccional del peso |
| 14 | `LINEA_REPO_BANCOS_INTERNACIONALES` | Crédito REPO garantizado con oro/bonos para reforzar netas | BCRA / Finanzas | Blindaje rápido contra corrida cambiaria; costo financiero alto si sube el EMBI |
| 15 | `ARCA_CRUCE_CRIPTO_AUTOMATICO` | Fiscalización en tiempo real sobre exchanges y billeteras locales | ARCA | Sube recaudación en economía digital; bronca en jóvenes tech y libertarios |

### B. Comercio Interior, Precios y Consumo (M16–M28)

| # | ID sugerido | Medida | Cartera | Impacto y costo de rosca |
|---|---|---|---|---|
| 16 | `IMPORTACION_PUERTA_A_PUERTA_3000` | Suba de franquicia courier a USD 3.000 sin arancel para consumo personal | Producción | Baja precios locales de electrónica y ropa; UIA y textiles salen a matar al ministro |
| 17 | `ELIMINAR_SIRAS_TEXTIL_CALZADO` | Desregulación total de licencias no automáticas en textil y calzado | Comercio | Frena aumentos de indumentaria en IPC; cierres de talleres en Conurbano |
| 18 | `CUOTA_SIMPLE_PRODUCTOS_NACIONALES` | Financiación subsidiada en 12 cuotas solo para línea blanca nacional | Producción | Levanta ventas minoristas y humor comercial; costo fiscal en tasa |
| 19 | `TRANSPARENCIA_PRECIO_NETO_GONDOLA` | Obligación de discriminar IVA, IIBB y tasas municipales en cada ticket | Economía | Expone presión tributaria de provincias/intendentes y mejora narrativa oficial |
| 20 | `DESREGULACION_MEDICAMENTOS_LIBRES` | Venta libre de analgésicos y antigripales fuera de farmacias | Salud | Baja precios de botiquín básico y descomprime PAMI; paro de colegios farmacéuticos |
| 21 | `IMPORTACION_MEDICAMENTOS_INDIA_GEN` | Vía rápida ANMAT para genéricos importados con aprobación FDA/EMA | Salud | Recorta fuerte gasto PAMI y obras sociales; furia de laboratorios nacionales |
| 22 | `PREPAGAS_LIBRE_COMPETENCIA_PLANES` | Fin de topes pero multa automática por cartelización de cuotas | Comercio / Salud | Ordena mercado sin volver al control duro; tensión con gremio de empresas médicas |
| 23 | `MERCADO_CENTRAL_MAYORISTA_DIRECTO` | Nodos logísticos federales directos de cooperativas frutihortícolas | Agro / Interior | Recorta brecha productor-góndola en verduras; resistencia de intermediarios del GBA |
| 24 | `FIDEICOMISO_HARINA_CERO` | Cierre definitivo de fondos compensadores con retenciones cruzadas | Economía | Limpia distorsiones fiscales y mejora relación con molinos; suba de pan en 30 días |
| 25 | `ETIQUETADO_SIMPLIFICADO_MERCOSUR` | Homologación automática de rótulos bromatológicos de países vecinos | Comercio | Baja costo de importación de alimentos y acelera competencia; rechazo pymes alimentarias |
| 26 | `CONGELAMIENTO_TARIFAS_TRANSPORTE_AMBA` | Pisos tarifarios en colectivos y trenes del AMBA por 120 días | Transporte | Frena golpe en IPC y humor del Conurbano; dispara cuenta de subsidios y queja del Interior |
| 27 | `QUITA_SUBSIDIO_AMBA_AUMENTO_BOLETO` | Sinceramiento pleno de boleto AMBA con tarifa social nominal por SUBE | Transporte / Economía | Ahorro fiscal alto y aplauso de gobernadores del Interior; caída dura de imagen en PBA |
| 28 | `BILLETERAS_INTEROPERABILIDAD_SUBE` | Apertura obligatoria de molinetes y colectivos a cualquier QR y NFC | Transporte / Innovación | Comodidad inmediata y baja evasión; desgaste con concesionarios monopólicos |

### C. Industria, PyMEs, Exportaciones y Aduana (M29–M42)

| # | ID sugerido | Medida | Cartera | Impacto y costo de rosca |
|---|---|---|---|---|
| 29 | `FIN_IMPUESTOS_EXPORTACION_SERVICIOS` | Retención cero para software, ingeniería, audiovisual y consultoría | Economía / Cancillería | Dispara exportación de talento y dólares genuinos; menor recaudación de derechos |
| 30 | `REEMBOLSO_IVA_EXPORTADOR_48HS` | Devolución automática de saldo técnico IVA a exportadores en 48 hs | ARCA | Oxígeno financiero real para pymes exportadoras; impacto de caja en el mes |
| 31 | `REGIMEN_IMPORTACION_USADOS_BIENES` | Ingreso liberado de maquinaria agrícola, vial y tornos usados | Producción | Baja barrera de inversión para pymes; protesta de fabricantes locales de bienes de capital |
| 32 | `TIERRA_DEL_FUEGO_REDUCCION_GRADUAL` | Recorte progresivo de beneficios aduaneros electrónicos de Tierra del Fuego | Economía | Ahorro tributario gigante (~0.3% PBI); choque frontal con gobernador fueguino y UOM |
| 33 | `HIDROVIA_DRAGADO_PRIVADO_42_PIES` | Licitación internacional de profundización de la Hidrovía Paraná-Paraguay | Infraestructura | Baja flete cerealero por tonelada y sube exportaciones; ruido con sindicatos marítimos |
| 34 | `CIELOS_ABIERTOS_CABOTAJE_EXTRANJERO` | Habilitación de aerolíneas extranjeras en rutas de cabotaje interior | Transporte | Más conectividad provincial y pasajes baratos; paro total de gremios aeronáuticos |
| 35 | `PUERTO_BUENOS_AIRES_DESREGULADO` | Fin de exclusividad gremial de estiba y apertura de tarifas portuarias | Trabajo / Transporte | Recorta costo argentino exportador; bloqueo de puertos si no negociás antes |
| 36 | `CREDITO_BICE_MAQUINARIA_VERDE` | Línea blanda BICE para reconversión industrial y eficiencia energética | Producción | Sostiene empleo industrial y actividad; requiere fondeo o cupo del Tesoro |
| 37 | `SILENCIO_POSITIVO_HABILITACIONES` | Trámite exprés nacional: si el organismo no contesta en 15 días, queda habilitado | Desregulación | Alivio masivo para comercios y pymes; denuncia opositora por falta de controles |
| 38 | `VENTANILLA_UNICA_EXPORTACION_48H` | Despacho aduanero sin verificaciones físicas discrecionales salvo alerta | ARCA / Aduana | Destraba carga perecedera y liquida exportaciones más rápido; riesgo de contrabando |
| 39 | `POLOS_TECNOLOGICOS_PROVINCIALES` | Exención de contribuciones para centros de desarrollo en Córdoba, Mendoza, Tucumán | Innovación | Gana apoyo de gobernadores del Centro/Norte y empleo joven; costo recaudatorio |
| 40 | `RECONVERSION_AUTOMOTRIZ_AUTOPARTES` | Cupos sin arancel para importación de componentes si exportan vehículos | Producción | Fomenta plataformas globales exportadoras; tensión con autopartistas locales |
| 41 | `FIN_CERTIFICADOS_COBRO_SINDICATO_IND` | Cese de retenciones compulsivas de cámaras empresariales (INACAP/afines) | Desregulación | Aplauso unánime de pymes comerciales; malestar silencioso de cúpulas empresariales |
| 42 | `PARQUES_INDUSTRIALES_TREN_CARGA` | Ramal ferroviario de acceso directo financiado por concesión privada | Infraestructura | Mejora competitividad logística regional; demora 12 meses en madurar |

### D. Energía, Minería, Litio e Hidrocarburos (M43–M55)

| # | ID sugerido | Medida | Cartera | Impacto y costo de rosca |
|---|---|---|---|---|
| 43 | `SEGMENTACION_ESTRICTA_SIN_N2_ZONA_CALIDA` | Auditoría satelital y cruce patrimonial para depurar padrones de subsidio eléctrico | Energía | Recorta fuerte gasto en subsidios sin tocar vulnerables reales; protestas por errores de padrón |
| 44 | `MERCADO_A_TERMINO_GENERADORES` | Contrato libre entre generadoras eléctricas y distribuidoras sin pasar por CAMMESA | Energía | Normaliza pagos de energía e incentiva nuevas usinas; suba mayorista inicial |
| 45 | `AMPLIACION_GASODUCTO_PERITO_MORENO` | Compresión adicional para reemplazar 100% de importaciones de GNL invernal | Energía | Ahorra miles de millones de USD por año en invierno; requiere inversión inicial o peaje |
| 46 | `EXPORTACION_FIRME_GAS_CHILE_BRASIL` | Permisos de exportación plurianuales ininterrumpibles desde Neuquén | Energía | Entra divisa estable y sube confianza petrolera; crítica si hay faltante en pico de frío |
| 47 | `PLANTA_GNL_COMPETENCIA_PROVINCIAL` | Habilitación de terminales flotantes de licuefacción en Río Negro / Bahía Blanca | Energía | Dispara ingreso de USD futuros; pelea feroz entre gobernador de PBA y Patagonia |
| 48 | `PLAN_NUCLEAR_MODULAR_SMR` | Desarrollo de reactores modulares nacionales para abastecer data centers e industria | Energía / Ciencia | Prestigio científico, energía limpia y atracción de IA; costo presupuestario sostenido |
| 49 | `SUBASTA_LITIO_TRANSPARENTE_NORTE` | Sistema federal de trazabilidad ambiental y regalías estandarizadas en NOA | Minería | Acelera inversiones en Salta, Jujuy y Catamarca; resistencia de asambleas ambientales |
| 50 | `COBRE_ANDINO_CORREDOR_SAN_JUAN` | Infraestructura eléctrica compartida para proyectos de cobre en San Juan/Mendoza | Minería | Multiplicación exportadora en 3 años; disputa por uso de agua cordillerana |
| 51 | `PLAN_REFINACION_COMBUSTIBLES_PRIV` | Incentivo impositivo para ampliar capacidad local de refino de gasoil | Energía | Evita desabastecimiento en cosecha gruesa; menor ingreso por ICL en corto plazo |
| 52 | `MEDIDORES_INTELIGENTES_AMBA` | Despliegue obligatorio en Edenor/Edesur para cortar colgados y premiar valle | Energía | Reduce pérdidas técnicas y cortes de verano; conflicto en barrios informales |
| 53 | `TARIFA_GAS_PATAGONICA_FOCALIZADA` | Acotamiento de zona fría solo a hogares vulnerables y provincias de clima extremo | Economía / Energía | Ahorro fiscal alto; bloque patagónico en pie de guerra contra Nación |
| 54 | `YPF_DESINVERSION_AREAS_MADURAS` | Cesión de pozos convencionales de baja productividad a pymes regionales | Energía | Sostiene empleo en Santa Cruz y Chubut; rechazo sindical petrolero inicial |
| 55 | `SUBASTA_ALMACENAMIENTO_BATERIAS_GBA` | Instalación rápida de bancos de baterías en subestaciones críticas del Conurbano | Energía | Reduce apagones de verano de golpe; costo de importación de equipamiento |

### E. Campo, Agroindustria y Retenciones Operativas (M56–M66)

| # | ID sugerido | Medida | Cartera | Impacto y costo de rosca |
|---|---|---|---|---|
| 56 | `BAJA_TEMPORAL_RETENCIONES_COSECHA` | Ventana de 90 días con alícuota reducida contra liquidación adelantada | Economía / Agro | Entra avalancha rápida de dólares al BCRA; caída de recaudación en meses posteriores |
| 57 | `FIN_DERECHOS_ECONOMIAS_REGIONALES` | Cero retenciones permanente para peras, manzanas, yerba, vino, tabaco y limón | Agro | Gana gobernadores de Cuyo, NEA y NOA; impacto fiscal bajo pero simbólico |
| 58 | `CUPO_LIBRE_EXPORTACION_CARNE` | Eliminación total de cortes prohibidos y registros previos de exportación bovina | Agro | Mejora ingreso ganadero y divisas; suba de asado en carnicerías en 45 días |
| 59 | `SEGURO_MULTIRRIESGO_AGRICOLA_PRIV` | Cofinanciamiento de primas privadas contra sequía para evitar declaratorias de emergencia | Agro | Reemplaza subsidios discrecionales pos-sequía; sube costo fiscal inicial en presupuesto |
| 60 | `DESREGULACION_INASE_SEMILLAS` | Reconocimiento de propiedad intelectual de semillas mejoradas con canon pactado | Agro / Ciencia | Aumenta rindes de soja y trigo a mediano plazo; protesta de pequeños chacareros |
| 61 | `CAMION_BITREN_RUTAS_NACIONALES` | Habilitación plena de bitrenes en corredores troncales hacia Rosario y Bahía Blanca | Transporte | Recorta 20% costo logístico del agro; desgaste de rutas si no concesionás peajes |
| 62 | `SENASA_TRAZABILIDAD_ELECTRONICA` | Caravana electrónica obligatoria en rodeos para abrir mercados premium (UE/EE.UU.) | Agro | Sube precio promedio de tonelada exportada; queja por costo por cabeza en ganaderos |
| 63 | `APERTURA_EXPORTACION_LECHE_POLVO` | Fin de permisos discrecionales y estímulo a cuencas lecheras de Santa Fe y Córdoba | Agro | Respiro para tambos y apoyo rural del Centro; tensiona precio local de lácteos |
| 64 | `FIN_EXENCION_COOPERATIVAS_FINANCIERAS` | Igualación tributaria de grandes acopiadoras y mutuales agro-financieras | Economía | Empareja recaudación y cierra elusión; choque con Federación Agraria y CONINAGRO |
| 65 | `SISTEMA_WARRANTS_DIGITALES` | Warrant electrónico ágil para que el productor financie capital de trabajo sin malvender | Finanzas / Agro | Sube crédito privado rural; retrasa liquidación inmediata en pico de cosecha |
| 66 | `CANON_MINIMO_BOSQUE_NATIVO_RURAL` | Pagos por servicios ambientales atados a reserva real y fiscalización satelital | Ambiente / Agro | Evita trabas paraarancelarias europeas (EUDR); fricción con provincias del Norte |

### F. Trabajo, Gremios, Obras Sociales y Paritarias (M67–M78)

| # | ID sugerido | Medida | Cartera | Impacto y costo de rosca |
|---|---|---|---|---|
| 67 | `HOMOLOGACION_PARITARIA_TECHO_INFLACION` | No homologar convenios salariales que superen la pauta inflacionaria oficial | Trabajo / Economía | Frena inercia salarial en inflación; huelgas sectoriales en transporte y comercio |
| 68 | `DESREGULACION_OBRAS_SOCIALES_DIRECTA` | Traspaso sin intermediarios desde el primer día a cualquier prepaga o nueva obra social | Salud / Trabajo | Golpea caja histórica de sindicatos y mejora oferta para formal; furia total CGT |
| 69 | `FIN_CUOTA_SOLIDARIA_NO_AFILIADOS` | Prohibición por decreto reglamentario de descuentos compulsivos a no afiliados | Trabajo | Aplauso en trabajadores jóvenes y pymes; movilización inmediata de gremios |
| 70 | `LIBRO_SUELDOS_DIGITAL_UNICO` | Unificación de formularios AFIP/Sindicatos/ART en un click sin gestores | Desregulación | Baja costo administrativo pyme; reduce inspecciones informales recaudatorias |
| 71 | `INCENTIVO_BLANQUEO_SIN_MULTAS` | Ventana de 180 días para blanquear personal informal condonando deuda previa | Trabajo / ARCA | Pasa informales a registrados y sube aportes; crítica gremial por "perdonazo" |
| 72 | `DESCENTRALIZACION_CONVENIOS_EMPRESA` | Prioridad absoluta de convenios por empresa sobre convenios por actividad | Trabajo | Permite adaptar turnos y productividad en pymes del Interior; rompe poder de cúpulas |
| 73 | `LIMITE_INDEMNIZACION_PYME_CUOTAS` | Pago en hasta 12 cuotas actualizadas para empresas de menos de 25 empleados | Trabajo | Evita quiebra de pymes ante despidos sin causa; rechazo en juzgados laborales |
| 74 | `TOPE_INTERES_JUICIOS_LABORALES_CER` | Criterio único nacional de actualización judicial (IPC + tasa pura 3%) | Justicia / Trabajo | Frena industria del juicio y baja riesgo pyme; amparo masivo de colegios de abogados |
| 75 | `ESCUELAS_OFICIOS_DUALES_CON_EMPRESAS` | Prácticas rentadas deducibles de Ganancias para jóvenes de 18 a 24 años | Trabajo / Educación | Baja desempleo juvenil sin gasto directo de Tesoro; requiere control anti-abuso |
| 76 | `AUDITORIA_FONDOS_SUBSIDIO_SINDICAL` | Revisión integral de transferencias del Fondo Solidario de Redistribución (FSR) | Salud | Corta discrecionalidad y expone desvíos en causas judiciales; guerra fría con Gordos |
| 77 | `TELETRABAJO_EXTERIOR_COBRO_LIBRE` | Régimen simple de cobro de honorarios del exterior hasta USD 5.000 mensuales sin liquidar | Economía / Trabajo | Retiene talento local que ya no se va ni evade; quejas por inequidad frente al asalariado |
| 78 | `GUARDIA_MINIMA_PUERTOS_Y_ENERGIA` | Protocolo operativo de servicio esencial 75% en nodos exportadores y usinas | Trabajo / Seguridad | Evita desabastecimiento y parate exportador en paros; tensión jurídica por OIT |

### G. Desarrollo Social, Salud, PAMI y ANSES (M79–M90)

| # | ID sugerido | Medida | Cartera | Impacto y costo de rosca |
|---|---|---|---|---|
| 79 | `AUDITORIA_PENSIONES_INVALIDEZ` | Revalidación médica presencial y digital de pensiones no contributivas por invalidez | Capital Humano | Ahorro fiscal real (~0.15% PBI) y limpieza de clientelismo; ruido mediático por errores |
| 80 | `REEMPLAZO_INTERMEDIARIOS_TARJETA` | Migración 100% directa de programas sociales a billetera nominal sin punteros ni unidades ejecutoras | Capital Humano | Rompe aparato callejero piquetero y baja corrupción; marchas fuertes los primeros 60 días |
| 81 | `BONO_JUBILADOS_SEGMENTADO_HABER` | Refuerzo mensual exclusivo para jubilación mínima sin aporte estatal | ANSES / Economía | Contiene pobreza en tercera edad con costo acotado; achatamiento de pirámide genera juicios |
| 82 | `PAMI_LICITACION_TRANSPARENTE_PAÑALES` | Compra centralizada abierta de insumos y prótesis con entrega a domicilio | Salud / PAMI | Recorta sobreprecios de intermediarios y mejora servicio; lobby de droguerías |
| 83 | `VOUCHERS_GUARDERIAS_PRIMERA_INFANCIA` | Transferencia directa por hijo de 45 días a 3 años para jardín elegido por familia | Capital Humano | Facilita ingreso laboral femenino y sube imagen en clase media baja; resistencia gremios docentes |
| 84 | `HISTORIA_CLINICA_DIGITAL_FEDERAL` | Plataforma única interoperable entre hospitales nacionales, provinciales y PAMI | Salud | Reduce estudios duplicados y mala praxis; implementación lenta en provincias sin fibra |
| 85 | `RECONVERSION_PLANES_EN_EMPLEO_PRIVADO` | El beneficio social se mantiene 12 meses como parte del salario formal | Trabajo / Social | Saca gente de asistencia permanente hacia pyme formal; riesgo de rotación anual |
| 86 | `BECA_UNIVERSITARIA_ARRAIGO_TECNICO` | Triplicación de becas solo para ingenierías, enfermería, sistemas y geología | Educación | Orienta matrícula a cuello de botella productivo; rechazo en facultades de humanidades |
| 87 | `AUDITORIA_COMEDORES_GEORREFERENCIA` | Padrones con foto, CUIT y compras trazables en comedores comunitarios | Capital Humano | Destapa comedores fantasma y mejora relato anticorrupción; conflicto fuerte con organizaciones |
| 88 | `FONDO_EMERGENCIA_ONCOLOGICO_DIRECTO` | Compra conjunta de drogas de alto costo entre Nación y todas las provincias | Salud | Baja 40% precios unitarios y ordena provisión; demanda logística impecable |
| 89 | `JUBILACION_PROPORCIONAL_SIN_MORATORIA` | Prestación automática proporcional a los años aportados + pensión básica al adulto mayor | ANSES | Cierra canilla deficitaria de moratorias infinitas sin dejar gente sin piso |
| 90 | `TELEMEDICINA_NACIONAL_PAMI` | Atención clínica virtual 24 hs para descongestionar guardias en Conurbano e Interior | Salud | Baja colas y sube satisfacción en adultos mayores; curva de aprendizaje digital |

### H. Seguridad, Defensa, Transporte e Infraestructura (M91–M105)

| # | ID sugerido | Medida | Cartera | Impacto y costo de rosca |
|---|---|---|---|---|
| 91 | `PROTOCOLO_ANTIPIQUETES_ESTRICTS_CABA` | Despeje coordinado de arterias nacionales sin negociación previa con piqueteros | Seguridad | Baja corte de tránsito y mejora imagen en orden público; riesgo de incidente filmado |
| 92 | `REQUISA_INTELIGENTE_PENALES_FEDERALES` | Bloqueadores de señal celular totales e inhibidores de drones en cárceles federales | Seguridad | Corta delitos ordenados desde pabellones (Rosario/GBA); motines puntuales el primer mes |
| 93 | `RADARIZACION_FRONTERA_NORTE_24_7` | Cobertura continua en Salta, Formosa y Misiones con derribo disuasivo de vuelos ilegales | Defensa / Seguridad | Frena ingreso aéreo de narcóticos; requiere horas de vuelo y nafta en presupuesto |
| 94 | `CONCESION_CORREDORES_VIALES_PPP` | Entrega de rutas troncales a privados contra peaje por obra hecha (sin anticipo) | Infraestructura | Reactiva asfalto sin poner plata hoy del Tesoro; queja de camioneros por peajes |
| 95 | `SUBASTA_ESPECTRO_5G_Y_SATELITAL` | Liberación de bandas y permiso pleno a internet satelital directo a celular en zonas rurales | Innovación | Ingreso fiscal de caja en USD + conectividad rural total; presión de telcos tradicionales |
| 96 | `RECONVERSION_TREN_CARGA_PRIVADO` | Acceso abierto (open access) en vías estatales para operadores privados con locomotoras propias | Transporte | Multiplica volumen de cargas en interior sin déficit de Belgrano Cargas; huelga ferroviaria |
| 97 | `DESARME_FLOTA_OFICIAL_Y_VIATICOS` | Remate de vehículos ministeriales, aviones sanitarios VIP y recorte de choferes 60% | Desregulación | Ahorro chico pero golpe mediático brutal de austeridad; enojo interno en estructura |
| 98 | `SISTEMA_SUBSIDIO_OBRAS_CON_MUNICIPIOS` | Obras menores solo si el municipio cofinancia 50% y rinde online cada certificado | Interior | Desinfla clientelismo de intendentes y mejora transparencia; baja lealtad en Conurbano |
| 99 | `CUOTA_MUNICIPAL_MAXIMA_BOLETA_LUZ` | Prohibición de cargar tasas municipales dentro de facturas de luz y gas | Economía / Energía | Baja boleta final al ciudadano (~12–18%); rebelión inmediata de intendentes de todos los signos |
| 100 | `PROTOCOLO_CIBERSEGURIDAD_ESTATAL` | Cierre de servidores vulnerables en ministerios, ANSES y Renaper con auditoría cero confianza | Defensa / Innovación | Evita filtraciones masivas de padrones; inversión tecnológica en dólares |
| 101 | `EQUIPAMIENTO_AVANZADO_FFAA_PATAGONIA` | Compra financiada a largo plazo de patrulleros oceánicos y sistemas antiaéreos | Defensa | Control de milla 200 contra pesca ilegal y apoyo castrense; crítica por gasto militar con pobreza |
| 102 | `TRASPASO_SUBTES_Y_LINEAS_AMBA` | Cesión definitiva de líneas ferroviarias urbanas y regulación a CABA/PBA | Transporte | Alivia tesoro nacional en subsidios de AMBA; pleito judicial inmediato de Provincia/Ciudad |
| 103 | `VENTA_INMUEBLES_OCIOSOS_AABE` | Subasta mensual online de terrenos ferroviarios y edificios públicos en desuso | Desregulación | Caja rápida de capital sin subir impuestos; amparos por espacio verde y patrimonio |
| 104 | `DIGITALIZACION_REGISTROS_AUTOMOTORES` | Cierre del 80% de registros seccionales y patente/transferencia única por app | Justicia / Desregulación | Alivio masivo para cualquiera que compra un auto; lobby brutal de titulares de registros |
| 105 | `PLAN_ACUEDUCTOS_NORTE_CON_CORFO` | Cofinanciamiento con organismos internacionales para agua potable en Chaco, Santiago y Salta | Infraestructura | Mejora sanitaria estructural y baja conflictividad en Norte Grande; impacto en imagen lento pero sólido |

---

## 2. Reformas Estructurales e Institucionales Nuevas (105)

Pensadas para la pestaña **Reformas del Sistema Político** (`ReformasInstitucionalesSection.tsx`), con distinción clara entre **Mayoría Ordinaria** (`129 Dip / 37 Sen`) y **Reforma Constitucional 2/3** (`172 Dip / 48 Sen`, marcada como `[2/3 CN]`). Varias son mutuamente excluyentes entre sí para dar juego en múltiples partidas.

### A. Sistema Electoral y Reglas de Competencia (R01–R18)

| # | ID sugerido | Reforma | Mayoría | Dinámica de rosca |
|---|---|---|---|---|
| 1 | `BALOTAJE_45_10_STRICT` | Mantener balotaje 45% o 40% + 10 puntos de diferencia (modelo actual) | `[2/3 CN]` | Excluye balotaje 50% y vuelta única; favorece frentes amplios de segunda vuelta |
| 2 | `SISTEMA_DOBLE_VOTO_PROVINCIAL` | Prohibición nacional de Ley de Lemas en cualquier elección provincial | Ordinaria | Desarma aparatos feudales provinciales; rechazo furioso de gobernadores del Norte/Sur |
| 3 | `FIN_LISTAS_COLECTORAS_ESPEJO` | Prohibición total de listas colectoras y acoples en todo el país | Ordinaria | Clarifica boleta y corta clientelismo de aparatos municipales; furia en Tucumán y PBA |
| 4 | `UMBRAL_BANCA_5_PCT` | Piso del 5% del padrón distrital para ingresar diputados (contra micro-bloques) | Ordinaria | Concentra poder en 3 o 4 bloques grandes; FIT y partidos provinciales chicos en llamas |
| 5 | `CIRCUNSCRIPCIONES_UNINOMINALES_50` | Mitad de Diputados elegidos por distrito uninominal de barrio/departamento | `[2/3 CN]` | Acerca diputados al votante local; rompe poder absoluto de lapiceras partidarias |
| 6 | `LISTAS_ABIERTAS_PREFERENCIA` | El votante puede marcar preferencia para alterar el orden de la lista | Ordinaria | Premia candidatos conocidos sobre puestos "sábana" ocultos |
| 7 | `FINANCIAMIENTO_PRIVADO_TOPE_CERO_PUBLICO` | Fin total de pauta y aportes públicos de campaña; solo aportes privados bancarizados | Ordinaria | Ahorro fiscal y narrativa anticasta; ventaja para partidos con sponsors empresarios |
| 8 | `FINANCIAMIENTO_100_PUBLICO_SIN_EMPRESAS` | Campañas pagadas exclusivamente por Estado según votos previos; cero aporte privado | Ordinaria | Frena lobby empresario sobre candidatos; costo fiscal en año electoral |
| 9 | `PROHIBIR_TESTIMONIALES_CON_MULTA` | Inhabilitación de 8 años para quien asuma banca y renuncie antes de 2 años para otro cargo | Ordinaria | Aplauso masivo de opinión pública; frena truco de intendentes y ministros en boleta |
| 10 | `VOTO_EXTERIOR_CORREO_CONSULAR` | Simplificación y voto postal automático para argentinos residentes en el exterior | Ordinaria | Mejora voto de diáspora pro-mercado; queja del peronismo tradicional |
| 11 | `REQUISITO_RESIDENCIA_5_ANOS` | Exigencia estricta de 5 años continuos de residencia efectiva para representar distrito | Ordinaria | Corta paracaidistas porteños en listas de Provincia de Buenos Aires |
| 12 | `PADRON_INHABILES_DEUDORES_ALIMENTARIOS` | Exclusión temporal del derecho a postularse a deudores alimentarios morosos | Ordinaria | Altísima aprobación pública; baja resistencia en recinto |
| 13 | `RENOVACION_MITAD_DIPUTADOS_CADA_2` | Mantener renovación parcial por mitades (vs renovación total cada 4) | `[2/3 CN]` | Excluye eliminar medio término; obliga a gobernar en campaña perpetua |
| 14 | `DESDOBLAMIENTO_PROHIBIDO` | Todas las provincias obligadas a votar gobernador el mismo día que presidente | Ordinaria | Ordena calendario y ahorra plata; todos los gobernadores ponen el grito en el cielo |
| 15 | `PROHIBICION_CADENA_NACIONAL_90D` | Veda de publicidad de actos de gobierno y pauta oficial 90 días antes de votar | Ordinaria | Empareja cancha electoral; te quita herramienta propagandística oficial |
| 16 | `RECUENTO_INFORMATICO_BLOCKCHAIN_ABIERTO` | Auditoría pública en vivo de telegramas y carga de escrutinio con código abierto | Ordinaria | Cierra acusaciones de fraude antes de que arranquen |
| 17 | `VOTO_ELECTRONICO_PRUEBA_CABA_MENDOZA` | Regulación federal con auditoría física en papel en distritos urbanos | Ordinaria | Acelera carga nocturna sin perder trazabilidad en urna |
| 18 | `LIMITACION_ENCUESTAS_15D` | Veda ampliada de publicación de sondeos 15 días antes de los comicios | Ordinaria | Evita operación de encuestas pagas sobre indecisos de última semana |

### B. Congreso, Poder Ejecutivo y Control Republicano (R19–R35)

| # | ID sugerido | Reforma | Mayoría | Dinámica de rosca |
|---|---|---|---|---|
| 19 | `REFORMA_LEY_DNU_30_DIAS` | Un DNU cae automáticamente si en 30 días hábiles no lo aprueban las DOS cámaras | Ordinaria | Te obliga a negociar toda ley; sube credibilidad institucional ante mercados y CSJN |
| 20 | `LIMITACION_FACULTADES_DELEGADAS` | Cese de delegaciones legislativas extraordinarias salvo guerra o emergencia declarada 2/3 | Ordinaria | Cierra puerta a decretazos; muy valorada por oposición dialoguista |
| 21 | `JEFE_GABINETE_MOCION_SIMPLE` | Remoción del Jefe de Gabinete por mayoría simple de Diputados | `[2/3 CN]` | Vuelve semi-parlamentario el sistema; peligro constante de crisis ministerial |
| 22 | `DISOLUCION_PARCIAL_CONGRESO` | Facultad presidencial única de llamar a anticipadas si le voltean dos presupuestos | `[2/3 CN]` | Arma nuclear del Ejecutivo ante bloqueo opositor crónico |
| 23 | `PRESUPUESTO_RECONDUCIDO_PROHIBIDO` | Obligación de aprobar presupuesto antes del 15/12 o caída de discrecionalidad de partidas | Ordinaria | Termina con la caja libre por prórroga de presupuesto viejo |
| 24 | `REDUCCION_MINISTERIOS_TOPE_8` | Tope constitucional de 8 ministerios nacionales y tope a cargos políticos | `[2/3 CN]` | Ancla de austeridad estatal permanente; limita moneda de cambio en gabinete |
| 25 | `SANCION_FALTAS_LEGISLADORES` | Descuento de dieta y pérdida de banca por más de 25% de inasistencias injustificadas | Ordinaria | Altísima aprobación social; bronca sorda en el recinto |
| 26 | `AUDITORIA_AGN_PRESIDIDA_OPOSICION_VETO` | Facultad de AGN vinculante para suspender contratos con sobreprecio > 20% | Ordinaria | Disuade corrupción ministerial; frena velocidad de licitaciones |
| 27 | `TOPE_ASESORES_POR_BANCA_3` | Límite máximo de 3 asesores pagos por diputado y 5 por senador | Ordinaria | Limpieza fuerte de ñoquis legislativos; resistencia de presidencias de ambas cámaras |
| 28 | `SESIONES_ORDINARIAS_11_MESES` | Congreso sesionando de febrero a diciembre sin receso largo de verano | `[2/3 CN]` | Mayor productividad parlamentaria y menos margen para gobernar por decreto |
| 29 | `TRANSPARENCIA_LOBBY_OBLIGATORIO` | Registro público diario de audiencias de ministros, jueces y legisladores | Ordinaria | Expone lobby empresario y sindical; incomoda a todos los sectores |
| 30 | `INICIATIVA_POPULAR_VINCULANTE` | Proyecto con 3% del padrón debe votarse sí o sí en 90 días o va a plebiscito | Ordinaria | Abre puerta a temas populares (seguridad/ambiente); riesgo de demagogia fiscal |
| 31 | `REVOCATORIA_MANDATO_POPULAR` | Plebiscito revocatorio a mitad de mandato con firmas del 20% del padrón | `[2/3 CN]` | Presión permanente de gobernabilidad; puede destrabar parálisis terminales |
| 32 | `FIN_FUEROS_ARRESTO_CORRUPCION` | Desafuero automático en delitos de corrupción con confirmación de Cámara de Casación | `[2/3 CN]` | Bandera anticorrupción fortísima; genera pánico en bloques tradicionales |
| 33 | `VOTO_NOMINAL_SECRETO_PROHIBIDO` | Todas las votaciones de comisiones y plenarios con registro nominal público online | Ordinaria | Impide borrar el voto de diputados en dictámenes clave |
| 34 | `INFORME_PRESUPUESTARIO_OPC_VINCULANTE` | Ninguna ley con gasto puede votarse sin dictamen de financiamiento previo de la OPC | Ordinaria | Mata leyes populistas sin fondos antes de llegar al recinto |
| 35 | `INCOMPATIBILIDAD_CARGO_5_ANOS` | Ex ministros de Economía/Energía/BCRA no pueden trabajar en bancos o concesionarias 5 años | Ordinaria | Corta puerta giratoria corporativa; dificulta reclutar ejecutivos del sector privado |

### C. Federalismo, Coparticipación y Provincias (R36–R52)

| # | ID sugerido | Reforma | Mayoría | Dinámica de rosca |
|---|---|---|---|---|
| 36 | `DEVOLUCION_IVA_Y_GANANCIAS_CAJAS_PROV` | Fin de coparticipación automática: cada provincia cobra sus impuestos y gira cuota fija | `[2/3 CN]` | Revolución fiscal: PBA y Córdoba aplauden; Norte Grande amenaza con secesión fiscal |
| 37 | `CORRECCION_REPRESENTACION_PBA_DIPUTADOS` | Actualización de bancas al último Censo (PBA gana ~20 diputados) | Ordinaria | Justicia demográfica; todas las provincias chicas bloquean el recinto juntas |
| 38 | `TERCERA_CAMARA_CONSEJO_FEDERAL` | Órgano consultivo vinculante de gobernadores para infraestructura y minería | `[2/3 CN]` | Institucionaliza la rosca federal fuera de pasillos oscuros |
| 39 | `FIN_ATN_DISCRECIONALES` | Prorrateo automático por fórmula de Aportes del Tesoro Nacional | Ordinaria | Corta látigo y billetera de Rosada; perdés herramienta clave para comprar votos en Senado |
| 40 | `PROHIBICION_CUASIMONEDAS_PENAL` | Penalización automática con recorte de transferencias si una provincia emite bonos propios | Ordinaria | Ancla monetaria federal; choque extremo con gobernadores en crisis fiscal |
| 41 | `AUTONOMIA_MUNICIPAL_PLENA_PBA` | Régimen de cartas orgánicas municipales y descentralización de policías locales | `[2/3 CN]` | Empodera intendentes urbanos frente al gobernador de turno |
| 42 | `REGIONES_PRODUCTIVAS_CONSTITUCIONALES` | Agrupación fiscal de Región Centro, Norte Grande y Patagonia con presupuesto propio | `[2/3 CN]` | Permite grandes obras interprovinciales de riego, tren y energía |
| 43 | `INFORME_PUBLICO_EMPLEO_PROVINCIAL` | Regla de tope de planta estatal provincial para acceder a avales de deuda externa | Ordinaria | Ordena provincias deficitarias; choca con cajas políticas locales |
| 44 | `REFORMA_CAPITAL_FEDERAL_TRASLADO` | Traslado gradual de ministerios administrativos al Centro/Patagonia manteniendo sede | Ordinaria | Descomprime AMBA y simboliza federalismo; costo inicial y paro de estatales nacionales |
| 45 | `CUOTA_MUNICIPAL_TOPE_INGRESOS_BRUTOS` | Consenso nacional que reemplaza IIBB y tasas municipales por IVA provincial uniforme | `[2/3 CN]` | Baja brutal de costo argentino en cascada; pelea de muerte con gobernadores e intendentes |
| 46 | `INTERVENCION_CAUSA_DEFAULT_PROVINCIAL` | Sindicatura federal automática cuando una provincia cae en cesación de pagos de sueldos | Ordinaria | Rescate ordenado a cambio de ajuste fiscal obligatorio |
| 47 | `FONDO_CONURBANO_INDEXADO_POBLACION` | Actualización automática del Fondo del Conurbano sin techo nominal fijo | Ordinaria | Gana apoyo en PBA y pierde apoyo en resto de los 23 distritos |
| 48 | `DOMINIO_RECURSOS_MARITIMOS_SHARED` | Regalías compartidas entre Nación y provincias atlánticas en exploración offshore | Ordinaria | Destraba Vaca Muerta offshore frente a Mar del Plata y Patagonia |
| 49 | `CORTE_PROVINCIAL_ACUERDO_MINIMO` | Límite a reelecciones indefinidas de gobernadores e intendentes en todo el país | `[2/3 CN]` | Pone fin a feudos provinciales históricos; altísima tensión con gobernadores del Norte |
| 50 | `CAJAS_PREVISIONALES_TRANSFERENCIA_ZERO` | Cierre del giro automático a 13 cajas provinciales no transferidas salvo armonización | Ordinaria | Ahorro fiscal alto; Córdoba, Santa Fe y Entre Ríos se abroquelan contra vos |
| 51 | `ZONAS_FRANCAS_PROVINCIALES_LIBRES` | Unificación de régimen aduanero abierto en pasos fronterizos de cada región | Ordinaria | Boom comercial en Mendoza, Misiones y Jujuy; reclamo industrial porteño |
| 52 | `GARANTIA_PAGO_BONOS_COPARTICIPACION` | Permiso de afectación de coparticipación directa sin paso por Tesoro provincial | Ordinaria | Baja tasas de crédito para infraestructura provincial |

### D. Poder Judicial, Corte, Ministerio Público y Penal (R53–R70)

| # | ID sugerido | Reforma | Mayoría | Dinámica de rosca |
|---|---|---|---|---|
| 53 | `JUICIO_POR_JURADOS_FEDERAL` | Jurados populares obligatorios en toda causa federal grave y corrupción | Ordinaria | Democratiza fallos y acelera causas; incomoda a Comodoro Py |
| 54 | `AUTARQUIA_REAL_PODER_JUDICIAL` | Eliminación de privilegio de exención de Ganancias a jueces pero con presupuesto fijo | Ordinaria | Altísima aprobación social; rebelión total en la Asociación de Magistrados |
| 55 | `JUBILACION_JUECES_REGIMEN_GENERAL` | Fin de jubilaciones de privilegio del Poder Judicial y Servicio Exterior | Ordinaria | Ahorro y popularidad inmediata; avalancha de amparos internos |
| 56 | `TOPE_MANDATO_CORTE_SUPREMA_12_ANOS` | Jueces de la CSJN duran 12 años no renovables en vez de vitalicios hasta los 75 | `[2/3 CN]` | Evita cortes eternas desconectadas de la época; oposición judicial corporativa |
| 57 | `CUPO_FEDERAL_Y_GENERO_CSJN` | Obligación de que ninguna región tenga más de 1 juez y paridad en las 5/9 sillas | Ordinaria | Destraba vacantes federales ganando senadores del Interior |
| 58 | `CORTE_SUPREMA_7_SALAS_TEMATICAS` | Corte de 9 miembros dividida en salas Penal, Tributaria, Laboral y Constitucional | Ordinaria | Acelera resolución de miles de expedientes parados; sospecha de "ampliación adicta" |
| 59 | `SISTEMA_ACUSATORIO_FEDERAL_COMPLETO` | Fiscales investigan y jueces solo garantizan en todo el país (fin del juez instructor) | Ordinaria | Reduce plazos de causas de 10 años a 18 meses; quita poder a jueces federales históricos |
| 60 | `PLAZO_PERENTORIO_CORRUPCION_3_ANOS` | Si la causa contra funcionario no llega a juicio en 3 años, sanción al tribunal | Ordinaria | Combate cajoneo de expedientes políticos según quién gobierna |
| 61 | `IMPRESCRIPTIBILIDAD_CORRUPCION_FUNCIONARIOS` | Delitos contra la administración pública con dolo no prescriben nunca | `[2/3 CN]` | Símbolo republicano transversal de enorme impacto |
| 62 | `EXTINCION_DE_DOMINIO_EXPRESS` | Decomiso civil previo de bienes narco y corruptos antes de condena penal firme | Ordinaria | Entra plata recuperada al fisco y seguridad; alerta constitucional sobre presunción inocencia |
| 63 | `BAJA_IMPUTABILIDAD_14_ANOS` | Régimen penal juvenil especializado desde los 14 años para delitos graves | Ordinaria | Demanda social masiva de seguridad; choque fuerte con organismos de DD.HH. y bloques progresistas |
| 64 | `FIN_PERPETUIDAD_REINCIDENTES_LIBERTAD` | Prohibición de salidas transitorias ni libertad condicional para homicidas y violadores reincidentes | Ordinaria | Aplauso en clase media/baja golpeada por inseguridad; saturación de penales |
| 65 | `SEPARACION_MINISTERIO_PUBLICO_OPOSICION` | Procurador General elegido por 2/3 del Senado a propuesta rotativa y duración fija 6 años | `[2/3 CN]` | Blinda independencia de fiscales frente a presidentes de turno |
| 66 | `POLICIA_JUDICIAL_INDEPENDIENTE` | Cuerpo técnico investigador dependiente de Fiscales y no de fuerzas del Ministerio de Seguridad | Ordinaria | Investigaciones limpias contra narcopolicías y bandas estatales |
| 67 | `SUBASTA_INMEDIATA_BIENES_DECOMISADOS` | Remate en 90 días de autos/inmuebles narco para equipar comisarías y patrulleros | Ordinaria | Financia seguridad sin presupuesto extra |
| 68 | `ELIMINACION_FERIA_JUDICIAL_ENERO_JULIO` | Turnos rotativos en tribunales todo el año sin cierre total por 45 días | Ordinaria | Aplauso de ciudadanos y empresarios; paro de empleados judiciales |
| 69 | `TRANSPARENCIA_DECLARACIONES_JUECES` | Declaración patrimonial completa pública en web sin reserva sobre bienes en exterior | Ordinaria | Cierra zonas grises en patrimonios de magistrados |
| 70 | `FUERO_UNICO_NACIONAL_TRABAJO_PROVINCIAL` | Traspaso total de la Justicia Nacional del Trabajo y Civil de CABA a la Ciudad | Ordinaria | Cumple Constitución 1994 y frena fallos ultra-indexatorios porteños; paro de judiciales |

### E. Régimen Previsional, Laboral y Sindical de Fondo (R71–R88)

| # | ID sugerido | Reforma | Mayoría | Dinámica de rosca |
|---|---|---|---|---|
| 71 | `EDAD_JUBILATORIA_IGUALADA_65_INDEXADA` | Equiparación gradual a 65 años y ajuste futuro atado a esperanza de vida | Ordinaria | Salva sustentabilidad de ANSES a 15 años; caída brutal de imagen en mayores de 50 |
| 72 | `SISTEMA_MIXTO_PISO_SOLIDARIO_CAP_VOLUNTARIA` | Pensión básica universal estatal + ahorro individual heredable sobre excedente salarial | Ordinaria | Crea mercado de capitales local gigante; fantasma AFJP explota en medios opositores |
| 73 | `LIMITE_MANDATO_SINDICAL_UNICO` | Máximo una reelección (8 años) en secretarías generales de sindicatos y confederaciones | Ordinaria | Sacude cúpulas de 30 años en el poder; paro general automático si se aprueba |
| 74 | `VOTO_ELECTRONICO_SECRETO_SINDICAL` | Elecciones internas obligatorias con padrón verificado y veedores judiciales | Ordinaria | Abre sindicatos a oposición interna; resistencia de burocracia sindical |
| 75 | `CUOTA_SINDICAL_OPTATIVA_DECLARADA` | El trabajador debe firmar autorización explícita anual para aportar cuota gremial | Ordinaria | Recorta caja de sindicatos en 40–60% |
| 76 | `FONDO_CESE_OBLIGATORIO_UNIVERSAL` | Reemplazo total de indemnización Art. 245 LCT por cuenta de capitalización laboral | Ordinaria | Desarma miedo a contratar en pymes; rechazos masivos de trabajadores estables antiguos |
| 77 | `FIN_ULTRAACTIVIDAD_CONVENIOS_75` | Los convenios colectivos vencidos caducan a los 2 años si no se renegocian | Ordinaria | Moderniza convenios obsoletos de 1975; guerra total de gremios |
| 78 | `SEGURO_DESEMPLEO_UNIVERSAL_INFORMATIZADO` | Unificación de programas sociales y seguro por despido con capacitación obligatoria | Ordinaria | Ordena gasto social y movilidad laboral |
| 79 | `TRASPASO_OBRAS_SOCIALES_CONTROL_SSN` | Supervisión contable igual que prepagas con solvencia técnica mínima obligatoria | Ordinaria | Transparenta déficits y frena rescates ocultos a gremios |
| 80 | `ESCALA_APORTES_REDUCIDA_MENOR_30` | Descuento de 50% en cargas patronales para menores de 30 años primer empleo | Ordinaria | Reduce informalidad joven; costo recaudatorio de corto plazo en ANSES |
| 81 | `BANCO_HORAS_ANUALIZADO_ESTACIONAL` | Flexibilización horaria pactada por temporada en turismo, agro e industria | Ordinaria | Baja costos de horas extras en picos productivos |
| 82 | `SANCION_BLOQUEOS_EMPRESA_CARCEL` | Tipificación penal específica de bloqueo de plantas/depósitos como extorsión agravada | Ordinaria | Garantiza derecho a trabajar en pymes logísticas; choque con Camioneros |
| 83 | `REGIMEN_REGULADO_PLATAFORMAS_REPARTO` | Estatuto propio independiente con cobertura por accidentes sin relación de dependencia clásica | Ordinaria | Formaliza 300 mil repartidores sin destruir demanda de apps |
| 84 | `FIN_REGIMENES_ESPECIALES_PREVISIONALES` | Unificación gradual de cajas especiales (luz y fuerza, diplomáticos, etc.) con regla general | Ordinaria | Equidad previsional y ahorro de largo plazo; paro en sectores estratégicos |
| 85 | `CONSEJO_PRESUPUESTARIO_TRABAJO_PRODUCTIVIDAD` | Salario mínimo regionalizado por canasta local provincial en lugar de valor único | Ordinaria | Permite formalizar empleo en provincias de menor productividad sin asfixiarlas |
| 86 | `LIBERACION_CONTRATO_TIEMPO_PARCIAL` | Fomento de jornadas de 20 hs con cargas proporcionales para estudiantes y jubilados | Ordinaria | Sube empleo registrado complementario |
| 87 | `AUDITORIA_ART_Y_LITIGIOSIDAD_PROVINCIAL` | Comisiones médicas previas obligatorias uniformes y adhesión provincial vinculante | Ordinaria | Baja costo asegurador en provincias no adheridas |
| 88 | `PARTICIPACION_UTILIDADES_VOLUNTARIA_DESGRAVADA` | Exención de Ganancias a empresas que paguen bonos de productividad atados a utilidades | Ordinaria | Alinea salarios con resultado sin indexar base fija |

### F. Educación, Ciencia, Estado y Empresas Públicas (R89–R105)

| # | ID sugerido | Reforma | Mayoría | Dinámica de rosca |
|---|---|---|---|---|
| 89 | `SISTEMA_EVALUACION_DOCENTE_ESCALAFON` | Sueldo e incremento atado a capacitación acreditada y desempeño en aula, no solo antigüedad | Ordinaria | Mejora aprendizaje real en primaria/secundaria; paro docente nacional prolongado |
| 90 | `EDUCACION_SERVICIO_ESENCIAL_180_DIAS` | Garantía de 75% de escuelas abiertas y descuentos por día de paro | Ordinaria | Aplauso de padres laburantes; choque frontal con CTERA y gremios provinciales |
| 91 | `EXAMEN_INGRESO_Y_PERMANENCIA_UNIV` | Nivelación obligatoria y pérdida de gratuidad tras exceder el doble de duración nominal | Ordinaria | Ahorro universitario y orden académico; toma masiva de facultades y marchas |
| 92 | `FINANCIAMIENTO_UNIVERSIDADES_POR_EGRESADOS` | Fondeo estatal asignado 50% por matrícula activa y 50% por graduados en tiempo | Ordinaria | Corta caja a facultades con deserción crónica del 85% |
| 93 | `CONICET_TRANSFERENCIA_PRIVADA_MIXTA` | Patentes registradas en joint-venture público-privada con regalías para el investigador | Ordinaria | Vincula ciencia básica con industria y agro; recelo en áreas sociales |
| 94 | `CARRERA_ADMINISTRATIVA_POR_MERITO_CONCURSO` | Estabilidad estatal real solo tras 3 años de evaluación favorable y concurso abierto | `[2/3 CN]` | Profesionaliza administración pública y corta ingresos partidarios de fin de mandato |
| 95 | `PRIVATIZACION_TOTAL_SOCIEDADES_ESTATALES` | Autorización marco de venta de Aerolíneas, Télam, AySA, Correo y medios públicos | Ordinaria | Baja déficit de empresas públicas de raíz; costo enorme en bloque dialoguista y opinión |
| 96 | `MODELO_CONCESION_PARTICIPACION_EMPLEADOS` | Entrega de acciones a trabajadores (PPP) con operación privada sin aporte del Tesoro | Ordinaria | Solución intermedia para destrabar Senado con gremios propios |
| 97 | `GOBIERNO_CORPORATIVO_OCDE_EMPRESAS_PUB` | Directorios independientes sin nombramientos políticos en YPF, BNA y Nucleoeléctrica | Ordinaria | Sube valuación de activos estatales y evita uso como caja partidaria |
| 98 | `PRESUPUESTO_BASE_CERO_BIANUAL` | Cada organismo nacional debe justificar desde cero su existencia cada 2 años o se cierra | Ordinaria | Mata reparticiones zombis creadas hace décadas |
| 99 | `VENTA_ACCIONES_FGS_FONDO_GARANTIA` | Liquidación ordenada de participaciones accionarias de ANSES en empresas privadas | Ordinaria | Liquidez en dólares para rescate o inversión; acusación de "regalar joyas de la abuela" |
| 100 | `EDUCACION_FINANCIERA_Y_PROGRAMACION_SEC` | Reforma curricular nacional obligatoria desde 1er año de secundaria | Ordinaria | Prepara mano de obra 2030 sin aumentar gasto docente total |
| 101 | `DESBUROCRATIZACION_CONSECIONES_PARQUES_NAC` | Gestión privada de servicios turísticos en Parques Nacionales bajo control ambiental | Ordinaria | Multiplica ingreso turístico en Patagonia y Misiones; crítica ecologista |
| 102 | `PRIVATIZACION_MEDIOS_PUBLICOS_REGIONALES` | Venta o cierre de señales deficitarias de radio/TV pública nacional | Ordinaria | Ahorro y golpe político simbólico; protesta gremial de prensa |
| 103 | `ACREDITACION_INTERNACIONAL_TITULOS_TECNICOS` | Reconocimiento exprés de títulos médicos, ingenieros y enfermeros extranjeros en 60 días | Ordinaria | Cubre déficit médico en Interior profundo; enojo de colegios profesionales |
| 104 | `COMPRA_PUBLICA_SUBASTA_INVERSA` | Obligación de subasta abierta en vivo online para toda compra estándar estatal | Ordinaria | Recorta sobreprecios 20–30% de entrada; fricción en proveedores históricos |
| 105 | `PLAN_NACIONAL_RESIDUOS_ENERGIA` | Marco para concesionar generación eléctrica desde basura en cinturones urbanos (CEAMSE+) | Ordinaria | Limpia basurales a cielo abierto y suma megavatios locales |

---

## 3. Proyectos de Ley para Rosquear en Cámaras Nuevos (105)

Proyectos concretos con articulado negociable (`Artículos suavizables`), pensado para negociar concesiones de obra pública, gobernadores o cupos en gabinete frente a PRO, UCR, Peronismo Federal, Provinciales y UxP.

### A. Paquete Fiscal, Tributario y Presupuestario (L01–L18)

| # | ID sugerido | Proyecto de Ley | Rosca en Congreso (quién traba / cómo se destraba) |
|---|---|---|---|
| 1 | `LEY_FIN_IVA_ALIMENTOS_FOCALIZADA` | Devolución directa de IVA en canasta básica para deciles 1–4 y baja general gradual | Costo fiscal alto; pasa suavizando techo mensual y usando coparticipación |
| 2 | `LEY_ELIMINACION_IMPUESTO_CHEQUE` | Cronograma de derogación en 4 años del Impuesto a Créditos y Débitos | Los gobernadores te exigen compensación por lo que hoy va a ANSES |
| 3 | `LEY_COMPENSACION_IIBB_EXPORTACIONES` | Prohibición legal de cobrar Ingresos Brutos sobre exportaciones industriales/agro | Rebelión de 24 ministros de Hacienda provinciales; requiere pacto con ATN |
| 4 | `LEY_ESTABILIDAD_FISCAL_PYME_10_ANOS` | Seguro legal que congela alícuotas a pymes que tomen 3 empleados netos | Pasa rápido con PRO, UCR y Peronismo Federal |
| 5 | `LEY_INOCENCIA_FISCAL_SIMPLIFICADA` | Presunción a favor del contribuyente y prescindencia de causa penal por error formal | Tensión con UxP y FIT por "blanqueo encubierto"; alta aceptación emprendedora |
| 6 | `LEY_REGIMEN_UNICO_MONOTRIBUTO_PRO` | Unificación de Monotributo, IIBB simplificado y tasa municipal en un pago | Requiere adhesión provincial; gran alivio en comercio y profesionales |
| 7 | `LEY_IMPUESTO_EXTRAORDINARIO_RENTA_FINANCIERA` | Gravamen transitorio sobre ganancias por pases y bonos soberanos | UxP y provinciales la aman; destroza paridades de bonos y confianza de mercado |
| 8 | `LEY_REFORMA_GANANCIAS_CUARTA_CATEGORIA` | Suba fuerte del mínimo no imponible a cambio de eliminar exenciones de magistrados y viáticos | Negociación tensa en Senado; patagónicos exigen deducción diferencial 22% |
| 9 | `LEY_PRESUPUESTO_PLURIANUAL_OBRAS_PRIORITARIAS` | Blindaje de partidas de 5 corredores viales y energía por 4 años | Moneda de oro para comprar votos de gobernadores del Norte y Centro |
| 10 | `LEY_TECHO_GASTO_PRIMARIO_REGLA_PIB` | Prohibición legal de que el gasto crezca por encima del crecimiento real del PIB | Pasa suavizando excepción por catástrofe o recesión severa |
| 11 | `LEY_RECONOCIMIENTO_DEUDA_PROVINCIAL_BONOS` | Consolidación de deudas cruzadas Nación-Provincias (cajas vs energía) | Cada provincia pide su anexo particular en comisión |
| 12 | `LEY_DEROGACION_BIENES_PERSONALES_5_ANOS` | Reducción escalonada hasta cero de Bienes Personales para repatriar contribuyentes | Choque ideológico duro en Diputados; requiere quórum justo de bloques centro |
| 13 | `LEY_SUBSIDIOS_TRANSPARENTES_NOMINALES` | Conversión de todo subsidio a la oferta en transferencia nominal al DNI | Piden gradualismo en Senado para evitar tarifazo de invierno |
| 14 | `LEY_DEVOLUCION_SALDOS_AFIP_INTERESADOS` | Si ARCA demora más de 60 días un reintegro, devenga tasa activa BNA | Pasa con apoyo de campo, pymes y exportadores |
| 15 | `LEY_CUENTAS_BANCARIAS_INEMBARGABLES_CAPITAL` | Protección contra embargos preventivos ARCA por deudas discutidas sin sentencia | Alivio gigante para comercios; Ministerio de Economía pierde caja compulsiva rápida |
| 16 | `LEY_FIN_IMP_PAIS_RESIDUAL_Y_SELLOS` | Prohibición de impuestos provinciales de Sellos sobre créditos hipotecarios y leasing | Furia de ministros provinciales; requiere compensación |
| 17 | `LEY_FONDO_ANTICICLICO_LITIO_SOJA` | Reserva soberana en dólares con excedente de años récord para cubrir futuras sequías | Gran señal de madurez institucional ante FMI |
| 18 | `LEY_AUDITORIA_DEUDA_EXTERNA_CONGRESO` | Requisito de aprobación bicameral específica para cada nueva emisión bajo ley Nueva York | Frena discrecionalidad de Economía; sube incertidumbre sobre capacidad de rollover |

### B. Código Laboral, Previsional y Obras Sociales (L19–L34)

| # | ID sugerido | Proyecto de Ley | Rosca en Congreso (quién traba / cómo se destraba) |
|---|---|---|---|
| 19 | `LEY_MODERNIZACION_PYME_SIN_INDEMNIZACION_DOBLE` | Capítulo PyME: prueba de 12 meses, cálculo claro y tope por despido | Se negocia excluyendo grandes empresas (>250 emp.) para conseguir a UCR/PRO |
| 20 | `LEY_PORTABILIDAD_OBRA_SOCIAL_REAL` | Libre elección de cobertura desde el primer mes y caja de compensación automática | Bloque sindicalista en Diputados y Senado la traba a muerte |
| 21 | `LEY_EQUIDAD_PREVISIONAL_PUAM_APORTES` | Escala gradual según años efectivamente aportados entre 10 y 30 años | Resuelve fin de moratorias sin dejar sin cobertura a mayores de 65 |
| 22 | `LEY_DERECHO_A_LA_DESCONEXION_Y_HORARIO_FLEX` | Acuerdo individual de turnos de 4x3 o 10 hs sin recargo extraordinario | Pasa si se incluye derecho explícito de negativa sin represalia |
| 23 | `LEY_TRANSPARENCIA_CUOTAS_SINDICALES` | Rendición anual obligatoria auditada externamente de gremios y cámaras | Pasa si alcanza tanto a sindicatos como a UIA/CAME/cámaras empresarias |
| 24 | `LEY_LICENCIA_PARENTAL_COMPARTIDA` | Extensión optativa de licencias compartidas entre madre y padre financiadas por ANSES | Alto apoyo en centro y progresismo; costo fiscal moderado |
| 25 | `LEY_PASANTIAS_EDUCATIVAS_REMUNERADAS` | Contrato de aprendizaje de 18 meses sin indemnización para estudiantes terciarios/univ | Bloque universitario UCR y PRO la empujan; resistencia de centrales obreras |
| 26 | `LEY_MULTA_ZERO_REGISTRACION_VOLUNTARIA` | Extinción definitiva de acciones penales tributarias al regularizar empleo oculto | Acompañan provinciales buscando empleo formal |
| 27 | `LEY_ACTUALIZACION_MENSUAL_JUBILACIONES_IPC_MAS` | Fórmula fija IPC + 20% de variación real de salarios formales (RIPTE) | Tensión fiscal en Economía; imposible vetarla sin costo en opinión |
| 28 | `LEY_FONDO_ASISTENCIA_TRANSPORTE_INTERIOR` | Equilibrio legal de subsidios por unidad entre AMBA e Interior | Unión total de gobernadores del Interior contra diputados del Conurbano |
| 29 | `LEY_INCOMPATIBILIDAD_JUBILACION_PRIVILEGIO` | Eliminación de haberes de privilegio para ex presidentes, vices y diplomáticos | Símbolo muy fácil de aprobar si se cede el articulado retroactivo |
| 30 | `LEY_CREACION_CUENTAS_INDIVIDUALES_JUBILACION` | Pilar complementario voluntario deducible 100% de Ganancias | Pasa suavizando topes de inversión en activos argentinos |
| 31 | `LEY_COOPERATIVAS_TRABAJO_CONTROLADAS` | Auditoría real contra cooperativas de trabajo truchas usadas para fraude laboral | Apoyo de sindicatos formales y pymes que compiten en blanco |
| 32 | `LEY_INDEMNIZACION_ACCIDENTES_BAREMO_UNICO` | Uso obligatorio del baremo nacional médico en todas las jurisdicciones | Baja litigiosidad de ART; oposición del colegio de abogados laboralistas |
| 33 | `LEY_REGULARIZACION_TRABAJO_RURAL_ESTACIONAL` | Libre compatibilidad entre trabajo temporario de cosecha y planes sociales | Piden provincias de Cuyo y NOA para levantar cosechas (uva, tabaco, limón) |
| 34 | `LEY_PROTECCION_EMPLEO_DISCAPACIDAD_PYME` | Deducción de 150% del salario en Ganancias al contratar personas con discapacidad | Aprobación casi unánime con gran retorno de imagen humana |

### C. Seguridad Interior, Narco, Defensa y Justicia Penal (L35–L50)

| # | ID sugerido | Proyecto de Ley | Rosca en Congreso (quién traba / cómo se destraba) |
|---|---|---|---|
| 35 | `LEY_DERRIBO_TRANSITO_AEREO_IRREGULAR` | Reglas de enfrentamiento aéreo contra vuelos clandestinos en frontera Norte | Piden salvaguardas de aviso previo para no trabarse en Senado |
| 36 | `LEY_FFAA_CUSTODIA_INFRAESTRUCTURA_CRITICA` | Reforma Ley Defensa/Seguridad Interior para que militares cuiden fronteras, represas y nodos | Ruido histórico por rol de FF.AA.; se destraba limitando a "zona de seguridad" |
| 37 | `LEY_REINCIDENCIA_Y_REITERANCIA_PENAL` | Prisión preventiva por reiterancia múltiple antes de condena firme | Altísima demanda social; objeciones de garantías constitucionales |
| 38 | `LEY_LEGITIMA_DEFENSA_AMPLIADA` | Presunción a favor del ciudadano y fuerza de seguridad ante irrupción armada en domicilio/servicio | Apoyo de derecha y centro; rechazo de bloques garantistas |
| 39 | `LEY_PENAL_JUVENIL_SOCIOEDUCATIVO` | Baja de edad punible (14 o 15 años según redacción suavizada) con institutos diferenciados | Se negocia monto de pena máxima y presupuesto de centros de menores |
| 40 | `LEY_AGRAVAMIENTO_PENAS_LAVADO_NARCO` | Trazabilidad inmobiliaria y financiera agravada con penas de 8 a 20 años | Consenso amplio si incluye reporte obligatorio de cuevas y escribanías |
| 41 | `LEY_CONSTRUCCION_CARCELES_PPP_PROVINCIALES` | Concesión de módulos penitenciarios privados con pago por plaza operativa | Descomprime comisarías en GBA y Santa Fe; rechazo ideológico de izquierda |
| 42 | `LEY_EXTRADICION_INMEDIATA_EXTRANJEROS` | Expulsión en 15 días de extranjeros condenados por delitos dolosos con prohibición perpetua | Popularidad enorme en todo el espectro urbano |
| 43 | `LEY_TOBILLERAS_ELECTRONICAS_PRISION_DOMICILIARIA` | Fin de domiciliarias sin monitoreo satelital activo pagado por el condenado | Consenso transversal en cámaras |
| 44 | `LEY_PROTECCION_IDENTIDAD_POLICIAS_ANTINARCO` | Juicios con testigos y agentes encubiertos con identidad reservada en causas federales | Pide Santa Fe urgente por Rosario |
| 45 | `LEY_REGULACION_DROGA_DISUASIVA_NARCOMENUDEO` | Desfederalización voluntaria con fondos coparticipados para combatir quioscos locales | Piden recursos los gobernadores si se les pasa la competencia |
| 46 | `LEY_CIBERDELITO_Y_ESTAFAS_VIRTUALES` | Penas agravadas a suplantación de identidad, phishing y estafas cripto | Gran aceptación social ante ola de estafas |
| 47 | `LEY_ARMAS_TENENCIA_SIMPLIFICADA_REGISTRO` | Renovación digital unificada de CLU y trazabilidad balística automática de munición | Debate fuerte entre halcones de derecha y bloques urbanos pro-desarme |
| 48 | `LEY_PENALIDAD_CORTES_FERROVIARIOS_Y_RUTAS` | Elevación de pena no excarcelable a interrupción de rutas troncales y aeropuertos | Apoyo en centro/derecha; paro de movimientos sociales si avanza |
| 49 | `LEY_INDULTO_PROHIBIDO_CORRUPCION_Y_NARCO` | Exclusión constitucional/legal de indultos o conmutaciones en corrupción y narcotráfico | Pasa con amplio consenso |
| 50 | `LEY_FONDO_COMPENSACION_VICTIMAS_DELITO` | Indemnización estatal rápida financiada con decomisos de bienes ilícitos | Alto rédito en opinión pública |

### D. Energía, Minería, Litio, RIGI Ampliado e Infraestructura (L51–L66)

| # | ID sugerido | Proyecto de Ley | Rosca en Congreso (quién traba / cómo se destraba) |
|---|---|---|---|
| 51 | `LEY_RIGI_PYME_INVERSION_MEDIA` | RIMI / RIGI intermedio para proyectos desde USD 15 millones (agro, turismo, pyme industrial) | Aplauso unánime de gobernadores y cámaras industriales que quedaron afuera del piso 200M |
| 52 | `LEY_HIDROGENO_VERDE_ESTABILIDAD_30A` | Marco fiscal de 30 años para mega-plantas eólicas en Patagonia Sur | Pasa si garantizás participación de proveedores locales chubutenses/santacruceños |
| 53 | `LEY_MODIFICACION_LEY_GLACIARES_PERIGLACIAR` | Precisión técnica de zonas periglaciares sin cuerpo hídrico para destrabar cobre andino | Choque monumental con ambientalistas; San Juan, Mendoza y Catamarca operan a full |
| 54 | `LEY_REGALIAS_MINERAS_TOPE_5_FEDERAL` | Modificación del tope legal de 3% a boca de mina (negociación a 4% o 5%) | Piden gobernadores cordilleranos para votar otras leyes nacionales |
| 55 | `LEY_ENERGIA_NUCLEAR_EXPORTACION_URANIO` | Apertura de exploración uranífera con operadores privados y venta de reactores | Debate fuerte en Chubut y Río Negro |
| 56 | `LEY_BIOCOMBUSTIBLES_CORTE_LIBRE_15` | Suba de corte obligatorio de bioetanol y biodiesel al 15% con licitación competitiva | Córdoba, Tucumán y Santa Fe la votan con las dos manos; choque con petroleras |
| 57 | `LEY_GENERACION_DISTRIBUIDA_PRIVADA` | Derecho garantizado de cualquier hogar o fábrica a vender sobrante solar a la red a precio mercado | Traban distribuidoras locales hasta negociar peaje técnico |
| 58 | `LEY_TRANSPORTE_ELECTRICO_CONCESION_PRIV` | Permiso de líneas de alta tensión privadas (AMBA–NOA–Comahue) pagadas por generadores | Destraba cuello de botella de renovables sin usar un peso del Tesoro |
| 59 | `LEY_OBRA_PUBLICA_CERO_ANTICIPO_MODELO_CHILENO` | Contratos solo por peaje/disponibilidad contra obra terminada y auditoría | Pide UOCRA garantía de empleo local |
| 60 | `LEY_FERROCARRIL_TRANSANDINO_Y_PATAGONICO` | Declaración de interés estratégico y garantía soberana para tren a Vaca Muerta y paso Chile | Negocia Neuquén, Río Negro y Mendoza |
| 61 | `LEY_PESCA_LICITACION_CUOTAS_MILLAS_200` | Licitación abierta transparente de cupos pesqueros en Mar Argentino contra canon | Choque duro con pesqueras tradicionales de Mar del Plata y Chubut |
| 62 | `LEY_AGUA_RIEGO_INTERPROVINCIAL_COMAHUE` | Acuerdo legal de cuencas para multiplicar hectáreas bajo riego en Patagonia Norte | Negociación fina entre Mendoza, La Pampa, Neuquén y Río Negro |
| 63 | `LEY_DESREGULACION_SERVICIOS_PETROLEROS` | Libre importación temporal de equipos de fractura y perforación sin aranceles | Acelera curva productiva de Vaca Muerta; rechazo metalúrgico nacional |
| 64 | `LEY_TIERRA_Y_PROPIEDAD_EXTRANJERA_LIMITES` | Apertura (o blindaje según votación) de compra de tierras rurales productivas | Debate simbólico nacionalista muy fuerte en el recinto |
| 65 | `LEY_DESARROLLO_INFRAESTRUCTURA_DATA_CENTERS` | Régimen de energía limpia directa y exención de importación de GPUs en zonas frías | Atrae inversiones de IA global a Patagonia |
| 66 | `LEY_PUERTOS_PROVINCIALES_LIBRE_COMPETENCIA` | Incentivo a nuevas terminales privadas en Río Negro, Santa Cruz y Entre Ríos | Rompe concentración portuaria del Gran Rosario y Buenos Aires |

### E. Campo, Economía del Conocimiento, Industria y Comercio (L67–L82)

| # | ID sugerido | Proyecto de Ley | Rosca en Congreso (quién traba / cómo se destraba) |
|---|---|---|---|
| 67 | `LEY_DESGRAVACION_FERTILIZANTES_Y_SEGUROS` | Cero IVA y arancel cero permanente a urea, fosfatos y seguros climáticos | Pasa rápido con bloque agroindustrial del Centro |
| 68 | `LEY_LEASING_MAQUINARIA_CAMPO_INDUSTRIA` | Amortización acelerada en 1 año para bienes de capital de fabricación regional | Acuerdo fácil con UIA, pymes santafesinas y cordobesas |
| 69 | `LEY_DERECHO_COMPETENCIA_ANTIMONOPOLIO` | Tribunal técnico independiente que parte carteles y multa hasta 10% facturación | Resistencia silenciosa de grupos concentrados (alimentos, acero, aluminio) |
| 70 | `LEY_PROPIEDAD_INTELECTUAL_BIOTECNOLOGIA` | Marco moderno de patentes genéticas y semillas con regalías claras por bolsa | Mesa de Enlace dividida: grandes pro-tecnología vs chacareros chicos |
| 71 | `LEY_LEY_ECONOMIA_CONOCIMIENTO_2035` | Estabilidad hasta 2035 con exención parcial Patronales y libre disponibilidad de divisas | Consenso alto entre oficialismo, PRO y UCR |
| 72 | `LEY_MERCADO_CAPITALES_PYME_FACTURA_LIBRE` | Negociación obligatoria instantánea de Factura Electrónica de Crédito para cobrar al instante | Oxígeno vital para miles de pymes proveedoras de grandes cadenas |
| 73 | `LEY_QUIEBRAS_Y_REESTRUCTURACION_PREVENTIVA` | Modernización de concursos preventivos con salvataje rápido de empresas en marcha | Apoyo de cámaras empresarias y bancos |
| 74 | `LEY_DESREGULAR_COLEGIOS_PROFESIONALES` | Prohibición de aranceles mínimos obligatorios de escribanos, abogados, arquitectos y martilleros | Baja costos de alquiler y escrituración; furia corporativa en comisiones |
| 75 | `LEY_CONTRATOS_DE_ALQUILER_INCENTIVO_OFERTA` | Deducción de Ganancias 100% sobre renta de viviendas nuevas volcadas a alquiler tradicional | Alivia crisis habitacional sin volver a controlar precios |
| 76 | `LEY_CREDITO_HIPOTECARIO_SEGURO_UVA_SALARIO` | Opción legal de techo de cuota atado a salario con compensación estatal financiada por prima | Destraba crédito a 20 años para clase media |
| 77 | `LEY_LIBERALIZACION_COMERCIO_INTERIOR_INTERPROV` | Declaración de ilegalidad de aduanas interiores (retenciones de IIBB en rutas) | Aplauso logístico; resistencia brutal de Misiones y Tucumán |
| 78 | `LEY_FORESTACION_Y_BONOS_CARBONO` | Estabilidad fiscal a bosques implantados en Corrientes/Misiones con venta global de créditos | Impulsa bloque del NEA |
| 79 | `LEY_INDUSTRIA_NAVAL_Y_MARINA_MERCANTE` | Bandera competitiva para recuperar cargas fluviales nacionales hoy bajo bandera paraguaya | Choque con sindicatos de tripulantes hasta negociar convenio nuevo |
| 80 | `LEY_PROTECCION_TURISMO_RECEPTIVO_DEV_IVA` | Devolución total instantánea de IVA a turistas extranjeros en hotelería y gastronomía | Dispara gasto turístico en USD en Mendoza, CABA, Iguazú y Bariloche |
| 81 | `LEY_SANCION_DUMPING_CHINA_COMERCIO` | Mecanismo objetivo técnico de defensa contra importaciones subsidiadas por Estados extranjeros | Contenta a industria local sin cerrar la economía |
| 82 | `LEY_MERCADO_CARBONO_AGROPECUARIO` | Certificación oficial de siembra directa como captura neta para exportar con prima verde | Agrega valor a soja, maíz y carne argentina en Europa |

### F. Salud, Educación, Cultura, Ambiente y Digital (L83–L105)

| # | ID sugerido | Proyecto de Ley | Rosca en Congreso (quién traba / cómo se destraba) |
|---|---|---|---|
| 83 | `LEY_TRANSPARENCIA_COSTOS_UNIVERSIDADES` | Obligación de auditoría directa de la AGN y balance mensual abierto para recibir giros | Debate acalorado con rectores radicales y peronistas |
| 84 | `LEY_INCENTIVO_PRIVADO_UNIVERSIDADES_BECAS` | Mecenazgo universitario: deducción fiscal para empresas que becan alumnos y equipan laboratorios | Modera dependencia exclusiva del presupuesto nacional |
| 85 | `LEY_SISTEMA_VOUCHERS_ESCOLARES_OPTAR` | Programa piloto federal para familias de bajos ingresos en zonas con déficit de vacantes estatales | Polarización ideológica máxima con gremios docentes |
| 86 | `LEY_ALFABETIZACION_INICIAL_OBLIGATORIA` | Plan vinculante nacional con pruebas censales en 3er grado por escuela publicadas online | Altísimo apoyo social; objeciones provinciales sobre autonomía |
| 87 | `LEY_ARANCEL_UNIVERSITARIO_NO_RESIDENTES` | Habilitación a universidades nacionales a cobrar matrícula real a extranjeros no residentes | Debate muy popular en provincias fronterizas y AMBA |
| 88 | `LEY_RECUPERO_SALUD_EXTRANJEROS_TRANSITORIOS` | Cobertura paga o seguro médico obligatorio de ingreso para extranjeros no residentes | Replicando modelo Salta/Jujuy a nivel nacional; tensiones diplomáticas regionales |
| 89 | `LEY_SALUD_MENTAL_REFORMA_URGENCIA` | Facilita internación involuntaria con junta médica rápida y creación de centros de adicciones | Demanda gigante de madres de barrios vulnerables; choque con sectores psicólogos |
| 90 | `LEY_CANNABIS_MEDICINAL_Y_CANAMO_LIBRE` | Apertura industrial plena para exportación de cáñamo textil, fibra y aceites estandarizados | Crea industria regional rápida en Jujuy, San Juan y Buenos Aires |
| 91 | `LEY_INCAA_AUTOFINANCIAMIENTO_Y_CULTURA` | Tope de gasto administrativo 15% y apoyo solo por taquilla/coproducción privada | Guerra mediática de actores; aplauso fiscal |
| 92 | `LEY_MECENAZGO_CULTURAL_Y_DEPORTIVO_NACIONAL` | Deducción de Ganancias por hasta 5% para patrocinar clubes de barrio, museos y bibliotecas | Gana votos en todos los bloques |
| 93 | `LEY_PROTECCION_DATOS_PERSONALES_IA` | Marco moderno tipo GDPR adaptado para atraer inversión de IA sin asfixiar pymes | Consenso amplio de bloques técnicos |
| 94 | `LEY_IDENTIDAD_DIGITAL_Y_FIRMA_MOVIL` | Validez plena de contratos y trámites notariales simples desde app oficial | Ahorra costos a ciudadanos y empresas; resiste colegio de escribanos |
| 95 | `LEY_APOSTAS_ONLINE_PROHIBICION_PUBLICIDAD` | Veda total de publicidad de sitios de apuestas en fútbol y redes + verificación biométrica +18 | Demanda enorme de padres y escuelas; fuerte lobby de clubes y medios |
| 96 | `LEY_REGULACION_ALCOHOL_CERO_Y_MULTAS_PRO` | Unificación de scoring nacional de licencias y cobro efectivo de multas contra patente | Resisten provincias vitivinícolas (Mendoza/San Juan) |
| 97 | `LEY_TRANSICION_FORESTAL_Y_FUEGO` | Brigadas profesionales permanentes financiadas por seguro obligatorio de hectáreas productivas | Mejora respuesta a incendios en Córdoba, Corrientes y Patagonia |
| 98 | `LEY_TRAZABILIDAD_PESQUERA_SATELITAL` | Monitoreo continuo obligatorio y multas millonarias con incautación inmediata | Protege caladeros y mejora relación con Europa |
| 99 | `LEY_DONACION_ALIMENTOS_DESGRAVACION` | Exención de responsabilidad civil y bonus fiscal para supermercados que donen antes de vencer | Pasa por unanimidad; baja desperdicio en comedores |
| 100 | `LEY_TRANSPARENCIA_OBRAS_SOCIEDAD_CIVIL` | Derecho ciudadano a auditar en mapa online avance físico vs plata girada de cada obra | Altísimo apoyo transversal |
| 101 | `LEY_SUBSIDIO_DEPORTE_OLIMPICO_PRIVADO` | Fin del impuesto al teléfono en ENARD reemplazado por fideicomiso mixto auditado | Mantiene becas deportivas limpiando impuestos distorsivos |
| 102 | `LEY_MODIFICACION_LEY_ESPECTACULOS_REVENTA` | Blanqueo digital de entradas nominales para liquidar mafia de reventa y trapitos | Popularidad rápida urbana |
| 103 | `LEY_RECONOCIMIENTO_DERECHOS_AUTORES_IA` | Reglas claras de licencias colectivas para entrenamiento de modelos con prensa y música local | Debate moderno con medios y editoriales |
| 104 | `LEY_PRIVACIDAD_CAMARAS_URBANAS_ANPR` | Integración legal de lectores de patentes privados y municipales para búsqueda de robados | Mejora tasa de esclarecimiento policial rápido |
| 105 | `LEY_REGIMEN_ESPACIAL_Y_SATELITAL_INVAP` | Contrato marco plurianual para cohetes/satélites en joint-venture comercial con privados | Prestigio geopolítico, exportación de alto valor y apoyo transversal |

---

## 4. Eventos Dinámicos Nuevos (105)

Sucesos que saltan por turno según tus variables (reservas, inflación, pobreza, tensión sindical, elecciones o azar internacional), todos con **opciones reales de decisión** para no ser solo texto pasivo.

### A. Economía, Corridas, Deuda y Mercados (E01–E20)

| # | ID sugerido | Evento | Disparador y opciones de decisión |
|---|---|---|---|
| 1 | `VENCIMIENTO_BONO_WALL_STREET_DURO` | Se junta pared de USD 4.500 M de Globales sin rollover fluido | **A:** Usar netas y quedar seco · **B:** Canje caro con bancos locales · **C:** Pedir puente al FMI |
| 2 | `CORRIDA_BANCARIA_RUMOR_CORRALITO` | Cadena viral en redes de que se restringen extracciones de argendólares | **A:** Mostrar billetes físicos en sucursales + suba de tasa · **B:** Cadena nacional y multa a bancos · **C:** Feriado cambiario 48 hs |
| 3 | `FONDOS_BUITRE_EMBARGO_EMBAJADA` | Juez de Nueva York autoriza medida cautelar sobre activos por juicio heredado | **A:** Negociar quita confidencial con pago · **B:** Apelar y congelar pagos · **C:** Emitir bono de arreglo largo |
| 4 | `RECALIFICACION_EMERGING_MARKETS` | MSCI evalúa sacar a Argentina de mercado fronterizo tras levantamiento de cepo | **A:** Sostener apertura aunque vibre el dólar · **B:** Frenar apertura y perder ascenso |
| 5 | `CAIDA_BRUTAL_PRECIO_SOJA` | Cosecha récord en EE.UU./Brasil derrumba soja a USD 310 la tonelada | **A:** Bajar retenciones de emergencia · **B:** Devaluar un escalón · **C:** Ajustar gasto de golpe |
| 6 | `BOOM_COMMODITIES_LITIO_COBRE` | Crisis de oferta global dispara litio y cobre 40% | **A:** Capturar renta vía regalías · **B:** Acelerar aprobaciones RIGI · **C:** Guardar en fondo anticíclico |
| 7 | `DEVALUACION_BRASIL_REAL_650` | El real brasileño se devalúa fuerte y deja carísimos los productos argentinos | **A:** Acompañar con crawling más rápido · **B:** Poner arancel compensatorio · **C:** Aguantar tipo de cambio real |
| 8 | `QUIEBRA_BANCO_MEDIANO_PROVINCIAL` | Una entidad regional no supera estrés de liquidez tras caída de bonos | **A:** Rescate BCRA con costo · **B:** Absorción por Banco Nación · **C:** Liquidación ordenando garantías |
| 9 | `DISPARADA_BRECHA_CCL_45` | El dólar financiero salta por encima de la banda tras ruido político | **A:** Intervenir con bonos AL30 · **B:** Subir tasa 800 pb · **C:** Ignorarlo y enfriar emisión |
| 10 | `INFLACION_REBOTA_ALIMENTARIOS` | Estacionalidad + carne vuelven a meter IPC arriba del dígito mensual objetivo | **A:** Abrir importación exprés de carne/cerdo · **B:** Sostener ancla fiscal sin intervenir · **C:** Pacto con supermercados |
| 11 | `PARATE_CONSTRUCCION_CONURBANO` | Desempleo en albañiles llega a récord tras frenar obra pública | **A:** Activar línea de créditos hipotecarios · **B:** Relanzar obras puntuales con intendentes · **C:** Mantener ajuste |
| 12 | `HUIDA_DEPOSITOS_FONDOS_MONEY_MARKET` | Desarme masivo de FCI genera demanda explosiva de dólar MEP | **A:** Subir encajes y ofrecer instrumento atado al dólar · **B:** Dejar subir tipo de cambio libre |
| 13 | `ANUNCIO_MEGAPLANTA_IA_PATAGONIA` | Consorcio estadounidense pide estabilidad energética y agua fría para USD 3.000 M | **A:** Darle exención total y energía dedicada · **B:** Exigir compra nacional y capacitación |
| 14 | `CIERRE_CADENA_TEXTIL_HISTORICA` | Fábrica emblemática con 1.200 operarios presenta quiebra por importaciones | **A:** Salvar con crédito BNA · **B:** Dejar quebrar e indemnizar · **C:** Dar subsidio reconversión |
| 15 | `RECLAMO_MOROSIDAD_PROVEEDORES_ESTADO` | Constructoras y farmacéuticas cortan entregas por deuda acumulada | **A:** Pagar con bono a 3 años · **B:** Cancelar en efectivo recortando otra partida · **C:** Auditar facturas primero |
| 16 | `GUERRA_COMERCIAL_ARANCELES_EEUU` | Washington mete aranceles a aluminio y biodiésel argentino | **A:** Negociar cuota bilateral cediendo patentes · **B:** Redirigir exportaciones a Asia/UE |
| 17 | `BOOM_TURISTICO_POR_ATRASO_INVERSO` | El peso se aprecia tanto que todo el país viaja a Chile y Brasil en verano | **A:** Reponer percepción tarjeta · **B:** Aprovechar para bajar inflación importada |
| 18 | `CRISIS_FINANCIAMIENTO_PYME_CHEQUES` | Cadena de pagos se corta con 12% de cheques rechazados | **A:** Bajar tasa de referencia · **B:** Fondo garantía FOGAR de emergencia · **C:** Dejar limpiar mercado |
| 19 | `INFORME_INDEC_POBREZA_SUBA` | Se publica dato semestral con suba fuerte de indigencia en el Gran Buenos Aires | **A:** Reforzar AUH/Tarjeta Alimentar ya · **B:** Relato de sinceramiento heredado · **C:** Convocar mesa social |
| 20 | `COMPRA_MULTINACIONAL_BANCO_LOCAL` | Banco europeo oferta USD 1.800 M para quedarse con red financiera nacional | **A:** Aprobar sin trabas · **B:** Exigir líneas blandas pymes como condición |

### B. Calle, Gremios, Piquetes y Conflictos Sectoriales (E21–E38)

| # | ID sugerido | Evento | Disparador y opciones de decisión |
|---|---|---|---|
| 21 | `PARO_CAMIONEROS_DESABASTECIMIENTO` | Moyano/sucesores bloquean centros de distribución de nafta y alimentos por paritaria | **A:** Conciliación obligatoria + Gendarmería en playones · **B:** Homologar suba · **C:** Convocar pymes transportistas |
| 22 | `TOMA_PLANTA_NEUMATICOS` | Gremio combativo frena exportación y corta accesos fabriles | **A:** Desalojo judicial firme · **B:** Liberar importación de cubiertas · **C:** Mediación del Ministerio |
| 23 | `LOCKOUT_CAMPO_NO_LIQUIDACION` | Mesa de Enlace frena ventas 15 días en protesta por brecha o retenciones | **A:** Bajar 3 puntos retención a cambio de liquidez · **B:** Aguantar y buscar USD por repo · **C:** Amenazar cupos |
| 24 | `PARO_AEROPORTOS_VACACIONES_INVIERNO` | Gremios aeronáuticos cancelan vuelos en Aeroparque y Ezeiza con miles varados | **A:** Desregular rampas y traer operadores externos · **B:** Sentarse a negociar bonos · **C:** Aplicar multas gremiales |
| 25 | `ACAMPE_PIQUETERO_9_DE_JULIO` | Organizaciones sociales vuelven a cortar el centro porteño 72 hs seguidas | **A:** Aplicar protocolo antipiquetes con costo de imagen si hay choque · **B:** Quitar planes a identificados · **C:** Abrir mesa |
| 26 | `HUELGA_SUBTES_Y_TRENES_HORA_PICO` | Parálisis total del transporte ferroviario del AMBA por conflicto salarial | **A:** Descontar días y contratar emergencia en colectivos · **B:** Ceder en paritaria · **C:** Escalar por servicio esencial |
| 27 | `PROTESTA_MEDICOS_RESIDENTES_GARRAHAN` | Conflicto en hospitales nacionales emblemáticos con enorme apoyo emocional social | **A:** Recomposición salarial inmediata · **B:** Reordenar guardias con caja propia · **C:** No ceder y perder imagen |
| 28 | `SAQUEOS_COORDINADOS_CONURBANO` | Incidentes simultáneos en supermercados chinos del GBA en diciembre | **A:** Despliegue masivo fuerzas federales + emergencia social · **B:** Acusar desestabilización opositora y bajar planes |
| 29 | `MARCHA_JUBILADOS_CONGRESO_REPRESION` | Fotos de forcejeo policial con adultos mayores se vuelven portada mundial | **A:** Anunciar bono compensatorio y apartar jefe operativo · **B:** Respaldar a Seguridad y mostrar infiltrados |
| 30 | `PARO_ESTIBA_PUERTOS_GRAN_ROSARIO` | Frenan 40 buques cargando soja en plena liquidación de divisas | **A:** Intervenir puertos bajo emergencia logística · **B:** Negociar bono dólar-linked |
| 31 | `REBELION_TAXIS_CONTRA_APPS` | Bloqueos en accesos aeroportuarios contra desregulación total de Uber/Cabify | **A:** Mantener apertura libre y despejar accesos · **B:** Equiparar seguro profesional a apps |
| 32 | `HUELGA_DOCENTE_INICIO_CLASES` | 6 semanas sin clases en medio país por caída de incentivo salarial nacional | **A:** Restituir fondo incentivo focalizado por presentismo · **B:** Mantener postura fiscal y descargar culpa en provincias |
| 33 | `CONFLICTO_PETROLERO_VACA_MUERTA` | Sindicato neuquino para yacimientos exigiendo adicional por inflación patagónica | **A:** Arbitraje rápido con operadoras · **B:** Garantizar operación con técnicos si falta gas |
| 34 | `MOVILIZACION_INQUILINOS_Y_DESALOJOS` | Ola de conflictos urbanos tras dolarización de contratos habitacionales | **A:** Crear garantía estatal para alquileres en pesos · **B:** No intervenir en mercado libre |
| 35 | `PARO_BANCARIO_NACIONAL_PRIVATIZACION` | Bancarios cierran atención 48 hs por intento de convertir BNA en sociedad anónima | **A:** Retroceder solo en BNA · **B:** Digitalización total y mantener proyecto · **C:** Ofrecer acciones a empleados |
| 36 | `ASAMBLEAS_AMBIENTALES_CORTAN_RUTA_MINERA` | Bloqueo en Catamarca/San Juan frena camiones hacia proyecto de cobre o litio | **A:** Audiencia técnica con veedores independientes · **B:** Despeje de ruta nacional |
| 37 | `PROTESTA_CHOFERES_COLECTIVOS_SIN_NAFTA` | Empresarios del transporte del Interior paran por atraso en giro de subsidios | **A:** Girar deuda de inmediato · **B:** Pasar responsabilidad legal total a gobernadores |
| 38 | `MARCHA_CGT_CON_SECTOR_EMPRESARIO_PYME` | Foto inédita de sindicatos junto a pymes industriales en Plaza de Mayo | **A:** Recibir a pymes por separado para romper el frente · **B:** Ignorarlos con fuerte discurso |

### C. Rosca Política, Gobernadores, Congreso y Carpetazos (E39–E58)

| # | ID sugerido | Evento | Disparador y opciones de decisión |
|---|---|---|---|
| 39 | `REBELION_INTERNA_EN_TU_BLOQUE` | 12 diputados propios amenazan con armar bloque aparte por destrato político | **A:** Darles presidencia de comisión · **B:** Echar al líder y disciplinar por redes |
| 40 | `PACTO_OCULTO_OPOSICION_MAYORIA` | Peronismo y dialoguistas se juntan para voltear un veto presidencial clave | **A:** Comprar 4 votos clave con ATN y obra pública · **B:** Ir a batalla pública denunciando "golpe fiscal" |
| 41 | `AMENAZA_CUASIMONEDA_PROVINCIAL` | Dos gobernadores importantes anuncian bonos locales para pagar sueldos | **A:** Cortar todo giro discrecional y redescuento BNA · **B:** Negociar rescate contra ajuste |
| 42 | `CARPETAZO_CONGRESO_VALIJAS_SENADO` | Rumor periodístico de pagos ocultos a senadores tras votación reñida | **A:** Pedir investigación de oficio y sacrificar operador · **B:** Contraatacar acusando operación de inteligencia |
| 43 | `RENUNCIA_VICEPRESIDENTE_DISTANCIAMIENTO` | Tu vice se diferencia en votación empates del Senado y arma agenda propia | **A:** Vaciarle equipo y aislarlo en la Rosada · **B:** Sentarse a pactar tregua por gobernabilidad |
| 44 | `LIGA_GOBERNADORES_PATAGONICOS_CORTE_GAS` | Gobernadores amenazan con trabar permisos si no reciben compensación fiscal | **A:** Ceder mejora en regalías o rutas · **B:** Demanda penal inmediata ante Corte por sedición económica |
| 45 | `ACUERDO_INTERBLOQUES_JUICIO_POLITICO` | La oposición logra número en comisión para abrir investigación al Presidente o Ministro | **A:** Entregar ministro como fusible · **B:** Polarizar al extremo buscando apoyo de la calle |
| 46 | `MUERTE_LIDER_HISTORICO_OPOSITOR` | Fallece referente central de la oposición y cambia de golpe el mapa de liderazgos | **A:** Tributo de Estado y diálogo con nueva generación · **B:** Silencio frío y acelerar agenda |
| 47 | `RUPTURA_ALIADO_ELECTORAL_CLAVE` | El PRO o UCR rompen el interbloque tras pelea por lugares en listas | **A:** Repartir 3 cargos en directorio de empresas públicas · **B:** Competir solos absorbiendo sus cuadros |
| 48 | `RECLAMO_INTENDENTES_CONURBANO_SEGURIDAD` | Jefes comunales exigen despliegue de Gendarmería tras ola de homicidios | **A:** Enviar fuerzas federales pidiendo apoyo legislativo de sus diputados · **B:** Exigir que se arregle PBA |
| 49 | `PEDIDO_INTERVENCION_FEDERAL_CRISIS_PROV` | Parálisis institucional y acefalía de facto en provincia del Norte | **A:** Mandar proyecto de intervención al Congreso · **B:** Apoyar solución institucional local |
| 50 | `OPERACION_CAMBIO_REGISTRO_PARTIDO` | La justicia electoral cuestiona avales o personería de tu sello en distrito grande | **A:** Acordar alianza con sello provincial prestado · **B:** Apelar ante Cámara Electoral |
| 51 | `ENCUENTRO_SECRETO_EN_EXILIO_OPOSICION` | Se filtra foto de operador propio negociando con referente opositor duro | **A:** Echar al operador en vivo · **B:** Blanquear que es diálogo institucional normal |
| 52 | `VETO_COMPENSADO_UNIVERSIDADES_JUBILADOS` | Congreso aprueba ley de alto costo fiscal por amplia mayoría; toca vetar o ceder | **A:** Veto total y buscar 1/3 en Diputados · **B:** Veto parcial negociando reasignación |
| 53 | `DISPUTA_PRESIDENCIA_PROVISIONAL_SENADO` | Batalla feroz por la línea sucesoria en la Cámara Alta al abrir sesiones | **A:** Ceder silla a aliado federal a cambio de votos en leyes · **B:** Imponer senador propio |
| 54 | `RECLAMO_CORDOBA_SANTA_FE_HIDROVIA` | La Región Centro exige participación en el directorio de control de la Hidrovía | **A:** Sumar a los tres gobernadores · **B:** Mantener control federal centralizado |
| 55 | `FILTRACION_CHATS_GABINETE` | Capturas reales de ministros peleándose a muerte en grupo interno de WhatsApp | **A:** Mover piezas del gabinete esa misma noche · **B:** Negar autenticidad y perseguir filtración |
| 56 | `CUMBRE_EMPRESARIA_IDEA_COLOQUIO_FRIO` | Círculo rojo pide certidumbre política antes de hundir inversiones | **A:** Prometer baja de retenciones e impuestos con fecha · **B:** Retarlos por "pedir favores del Estado" |
| 57 | `PROYECTO_OPOSITOR_PLEBISCITO` | Bloque rival junta firmas para plebiscitar privatizaciones o reforma laboral | **A:** Adelantar consulta propia más favorable · **B:** Bloquear en Corte por inconstitucionalidad fiscal |
| 58 | `NEGOCIACION_PLIEGOS_EMBAJADORES` | Senadores frenan 20 embajadores en comisión pidiendo obras locales | **A:** Aprobar obras chicas en 5 provincias · **B:** Designar en comisión por decreto |

### D. Justicia, Causas, Medios y Operetas (E59–E74)

| # | ID sugerido | Evento | Disparador y opciones de decisión |
|---|---|---|---|
| 59 | `FALLO_CORTE_INCONSTITUCIONAL_DNU` | La CSJN declara nulo un capítulo entero de desregulación vigente hace meses | **A:** Reenviarlo como ley fraccionada al Congreso · **B:** Criticar fallo y buscar acuerdo para vacantes |
| 60 | `CAUSA_SOBREPRECIOS_PAMI_O_COMPRAS` | Denuncia periodística con facturas muestra intermediarios cercanos al oficialismo | **A:** Echar funcionario y presentarse como querellante · **B:** Defender gestión y acusar pauta perdida |
| 61 | `PROCESAMIENTO_EX_PRESIDENTE_CASACION` | Condena firme a principal figura opositora sacude tablero electoral | **A:** Perfil bajo institucional ("dejar actuar a la justicia") · **B:** Usarlo en campaña polarizando |
| 62 | `AMPARO_PREPAGAS_O_TARIFAS_MENDOZA` | Juez federal frena aumento de gas en pleno invierno en toda una región | **A:** Saltar por per saltum directo a Corte Suprema · **B:** Modificar esquema con tope de aumento |
| 63 | `ESCANDALO_SERVICIOS_INTELIGENCIA` | Denuncia de escuchas ilegales a periodistas y opositores desde SIDE | **A:** Disolver unidad y mostrar auditoría ante Bicameral · **B:** Respaldar al titular bajo secreto de Estado |
| 64 | `CRIPTOESTAFAS_O_PUBLICIDAD_OFICIAL` | Polémica viral por promoción en redes de un activo privado que colapsa en horas | **A:** Borrar tuit y abrir investigación ética interna · **B:** Redoblar apuesta culpando a especuladores |
| 65 | `MEDIO_HEGEMONICO_CAMBIA_LINEA` | Principal grupo multimedia pasa de aliado tibio a fuego cruzado tras fin de pauta/licencia | **A:** Pactar reglas de negocio o pauta indirecta · **B:** Guerra total por streaming y redes sociales |
| 66 | `FILTRACION_PANDORA_CUENTAS_MINISTRO` | Aparece sociedad offshore no declarada de tu Ministro de Economía o Canciller | **A:** Reemplazarlo en 24 hs aunque tiemblen mercados · **B:** Sostenerlo explicando que es previa al cargo |
| 67 | `HACKERS_ROBAN_BASE_RENAPER_O_ANses` | Venta pública en dark web de datos de 45 millones de argentinos | **A:** Reconocer falla, invertir en ciberseguridad y remover cúpula · **B:** Minimizar impacto técnico |
| 68 | `DENUNCIA_VIOLENCIA_INST_EN_MARCHA` | Video viral muestra abuso claro de un efectivo federal contra manifestante pacífico | **A:** Separar al agente y sumar protocolo de cámaras corporales · **B:** Defensa corporativa absoluta |
| 69 | `JUICIO_YPF_EMBARGO_ACCIONES_EEUU` | Sentencia adversa exige entregar acciones o depositar USD 16.000 M en plazo perentorio | **A:** Negociar pago estructurado en bonos largos · **B:** Litigar hasta última instancia dilatoria |
| 70 | `INVESTIGACION_APORTES_TRUCHOS_CAMPANA` | Auditoría electoral detecta miles de aportantes apócrifos en tu partido | **A:** Rectificar y multar tesorero · **B:** Echarle la culpa a punteros distritales |
| 71 | `JUEZ_FEDERAL_LIBERA_CAPO_NARCO` | Escándalo nacional cuando juez suelta por error técnico a jefe banda en Rosario | **A:** Impulsar juicio político inmediato en Magistratura · **B:** Redoblar custodia policial de calle |
| 72 | `OPERETA_DEEPFAKE_EN_ELECCION` | Video falso hiperrealista de vos anunciando corralito 48 hs antes de abrir urnas | **A:** Desmentida urgente en cadena con bancos + denuncia penal · **B:** Ignorarlo esperando que pase |
| 73 | `CONFLICTO_LICITACION_PASAPORTES_DNI` | Freno judicial por presunto direccionamiento en compra tecnológica millonaria | **A:** Anular licitación y hacer subasta transparente · **B:** Defender urgencia operativa |
| 74 | `FALLO_LABORAL_MULTIMILLONARIO_PYME` | Condena absurda de 800 millones quiebra empresa de 40 empleados y se hace viral | **A:** Enviar ya ley tope intereses al Congreso · **B:** Subsidiar salvataje puntual |

### E. Clima, Energía, Campo y Catástrofes (E75–E90)

| # | ID sugerido | Evento | Disparador y opciones de decisión |
|---|---|---|---|
| 75 | `INUNDACIONES_LITORAL_Y_NUCLEO` | Desborde del Paraná y lluvias récord cortan rutas y aíslan ciudades en Santa Fe/Corrientes | **A:** Giro urgente ATN + Fuerzas Armadas · **B:** Línea de crédito BNA postergando vencimientos |
| 76 | `OLA_POLAR_FALTA_GNC_E_INDUSTRIA` | Frío extremo récord dispara consumo residencial y obliga a cortar gas a fábricas y estaciones | **A:** Comprar buques GNL carísimos en dólares · **B:** Priorizar hogares e industria exportadora |
| 77 | `INCENDIOS_FORESTALES_CORDOBA_PATAGONIA` | Fuegos fuera de control arrasan miles de hectáreas en zonas turísticas | **A:** Contratar aviones hidrantes al exterior y declarar emergencia · **B:** Desplegar Ejército y voluntarios |
| 78 | `BAJANTE_HISTORICA_RIO_PARANA` | Buques salen cargando 35% menos de Rosario por bajante extrema | **A:** Financiar dragado extra de emergencia · **B:** Desviar carga por camión a Quequén y Bahía Blanca |
| 79 | `APAGON_MASIVO_NACIONAL_TRANSENER` | Falla en línea de alta tensión del Comahue deja sin luz a medio país por 14 hs | **A:** Auditoría punitiva a concesionaria · **B:** Lanzar plan urgente de redes privadas |
| 80 | `PLAGA_CHICHARRITA_MAIZ_PERDIDA_30` | Enfermedad agrícola destruye 30% de la cosecha tardía de maíz | **A:** Emergencia agropecuaria sin cobro de anticipos ARCA · **B:** Reimportar semillas resistentes exprés |
| 81 | `CORTE_PASO_CRISTO_REDENTOR_NIEVE` | 15 días cerrado el paso a Chile con 3.000 camiones varados en alta montaña | **A:** Habilitar pasos alternativos sur/norte · **B:** Asistencia logística y exención aduanera temporal |
| 82 | `CRISIS_HIDRICA_CUYO_MENDOZA_SAN_JUAN` | Falta nieve cordillerana genera pelea entre riego agrícola y proyectos mineros | **A:** Financiar impermeabilización de canales · **B:** Cupos estrictos de consumo industrial |
| 83 | `COLAPSO_PUENTE_RUTA_NACIONAL_CLAVE` | Cae puente estratégico dejando aislada provincia del NEA o Mesopotamia | **A:** Puente Bailey militar ya + obra directa · **B:** Licitación rápida por peaje |
| 84 | `EPIDEMIA_DENGUE_VERANO_RECORRIDO` | Saturación de guardias en NOA/NEA/AMBA y falta de repelentes en góndolas | **A:** Liberar importación arancel cero de insumos/vacunas · **B:** Campaña gratuita focalizada en provincias críticas |
| 85 | `BROTE_FIEBRE_AFTOSA_O_GRIPE_AVIAR` | Alerta sanitaria internacional suspende exportaciones de carne o pollos por 60 días | **A:** Rifle sanitario y compensación inmediata al productor · **B:** Negociar regionalización ante OMSA |
| 86 | `DERRAME_HIDROCARBUROS_CUENCA_SUR` | Accidente ambiental de operadora petrolera impacta río o costa patagónica | **A:** Multa récord e intervención técnica · **B:** Remediar rápido sin frenar producción |
| 87 | `TORMENTA_CONVECTIVA_DESTRUYE_BAHIA_O_AMBA` | Ráfagas de 150 km/h vuelan techos, torres de luz y puertos graneleros | **A:** Fondo extraordinario reconstrucción + créditos blandos · **B:** Reasignar partidas viales |
| 88 | `CAIDA_REPRESA_COMAHUE_MANTENIMIENTO` | Turbina clave sale de servicio por falta de repuestos antes del pico estival | **A:** Compra directa de repuestos urgentes · **B:** Sostener con generación térmica cara |
| 89 | `INVASION_ALGAS_O_MAREA_ROJA_PESCA` | Parate de zafra pesquera de langostino deja sin trabajo 4 meses a puertos del Sur | **A:** Repro / asistencia temporal a marineros · **B:** Adelantar cupos en áreas sanas |
| 90 | `SISMO_EN_CUYO_INFRAESTRUCTURA` | Temblor fuerte en San Juan/Mendoza daña escuelas y acueductos | **A:** Despliegue inmediato + giro directo sin burocracia · **B:** Créditos blandos de vivienda |

### F. Geopolítica, FMI, Región y Campaña Electoral (E91–E105)

| # | ID sugerido | Evento | Disparador y opciones de decisión |
|---|---|---|---|
| 91 | `CUMBRE_MERCOSUR_UE_FIRMA_O_ROTURA` | Oportunidad real de cerrar acuerdo comercial con cupos agrícolas limitados | **A:** Firmar cediendo capítulos industriales graduales · **B:** Exigir apertura agrícola plena o patear mesa |
| 92 | `TENSION_PESCA_ILEGAL_MILLAS_200` | Flota extranjera de 300 poteros depreda calamar en el borde económico | **A:** Hundimiento/captura firme con Prefectura y Armada · **B:** Nota diplomática y multas |
| 93 | `CRISIS_MIGRATORIA_O_CRIME_FRONTERA_BRASIL_PAR` | Bandas brasileñas (PCC/CV) operan en triple frontera o pasos de Salta | **A:** Comando conjunto de seguridad con países vecinos · **B:** Militarizar pasos e implementar visas |
| 94 | `APROXIMACION_CHINA_BASE_O_INFRAESTRUCTURA` | Beijing ofrece USD 5.000 M para represas/tren a cambio de concesión portuaria | **A:** Aceptar plata y enfrentar furia de EE.UU. · **B:** Rechazar y pedir crédito occidental equivalente |
| 95 | `EXIGENCIA_OCDE_ESTANDAR_INSTITUCIONAL` | Comité de ingreso pide avanzar en lavado, justicia independiente y estadísticas | **A:** Acelerar reformas de transparencia · **B:** Priorizar velocidad ejecutiva por decreto |
| 96 | `DESAIRE_O_ROCE_CON_BRASILIA` | Cruce público con presidente brasileño traba exportaciones de autos y trigo | **A:** Bajar tono en cumbre bilateral por interés comercial · **B:** Doblar apuesta ideológica |
| 97 | `GUERRA_ORIENTE_MEDIO_SUBA_PETROLEO` | Barril de crudo salta a USD 120: Argentina exporta más pero sube el gasoil local | **A:** Capturar boom dejando precio interno a paridad exportación · **B:** Amortiguar surtidores con ICL |
| 98 | `INVITACION_BILATERAL_CASA_BLANCA` | Foto presidencial en Washington sube fuerte imagen pero pide alineamiento en geopolítica | **A:** Aceptar alineamiento completo · **B:** Ir con agenda comercial balanceada |
| 99 | `DEBATE_PRESIDENCIAL_CRUCE_VIRAL` | En plena campaña, un rival te acorrala con cifra sensible de pobreza o deuda | **A:** Responder con dato macro duro y contragolpear corrupción · **B:** Conectar con empatía prometiendo alivio |
| 100 | `BAJA_INTERNA_PROVINCIAL_CLAVE` | Tu candidato mejor posicionado en Córdoba o Santa Fe renuncia por escándalo personal | **A:** Poner extrapartidario conocido de último minuto · **B:** Subir a cuadro puro del partido |
| 101 | `APAGON_FISCALIZACION_CONURBANO_BOLETAS` | Faltan 8.000 fiscales a 10 días de la elección en tercera sección electoral | **A:** Pactar fiscales cruzados con fuerza aliada/intendente · **B:** Campaña relámpago de voluntarios |
| 102 | `CANDIDATO_OUTSIDER_TE_ROBA_VOTO_JOVEN` | Influencer viral irrumpe sacando 9% en sub-25 con discurso anti-todo | **A:** Sumarlo con lista propia o cargo futuro · **B:** Ignorarlo para no darle entidad |
| 103 | `ENCUESTA_EMPATE_TECNICO_ULTIMA_SEMANA` | A 7 días de las urnas estás a 0.8% de ganar en primera vuelta o entrar a balotaje | **A:** Anunciar medida popular de impacto inmediato · **B:** Apostar todo a estabilidad y "no volver atrás" |
| 104 | `INCIDENTE_CARAVANA_CAMPANA_INT` | Piedrazos o escaramuza violenta en acto de cierre en Conurbano | **A:** Seguir acto con chaleco y épica · **B:** Suspender y victimizar en prime time de TV |
| 105 | `TRIUNFO_O_DERROTA_AJUSTADA_MEDIO_TERMINO` | Resultado legislativo 2029 define si tenés bloqueo propio de vetos o quedás en minoría | **A:** Convocar ya Pacto de Gobernabilidad al centro · **B:** Redoblar mandato duro apoyado en la gente |

---

## Nota de implementación rápida para el motor

Si los vas a meter en fases dentro de **La Rosca**:
1. **Medidas** (`M01–M105`): entran derecho extendiendo el array en `partiesAndPoliticians2027.ts` respetando `SectorMeasureCard` (lo único que conviene revisar es que `domainModifiersEngine.ts` hoy clampea el efecto agregado en inflación `[-1.5, 2.5]` y aprobación `[-2.5, 2.5]` para que activar 40 medidas juntas no rompa la curva).
2. **Reformas** (`R01–R105`): entran en `INITIAL_FIXED_REFORMS` de `reformasInstitucionalesEngine.ts` agregando `mutuallyExclusiveWith` en pares lógicos (ej. `BALOTAJE_45_10_STRICT` vs `ELIMINAR_BALOTAJE`, `DEVOLUCION_IVA_Y_GANANCIAS_CAJAS_PROV` vs `FONDO_CONURBANO_INDEXADO_POBLACION`).
3. **Leyes** (`L01–L105`): entran en `INITIAL_CONGRESS_BILLS` con filtros por categoría/mandato o un mazo de "agenda legislativa activa" (ej. 12 proyectos disponibles por año para no saturar las pestañas horizontales).
4. **Eventos** (`E01–E105`): entran en `GOVERNMENT_EVENTS` + `CAMPAIGN_DILEMMAS_CATALOG` con disparadores condicionados por estado real (reservas bajas, EMBI alto, paro gremial, año electoral), así cada partida se siente distinta.

