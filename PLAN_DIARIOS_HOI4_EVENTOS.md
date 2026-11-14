# Plan de Rediseño "Tapas de Diarios Argentinos" (Estilo HOI4) — Situación del Mes y Eventos

Plan integral para transformar las **Situaciones del Mes** (tanto de Campaña como de Gobierno) en **tapas de diarios argentinos estilo *Hearts of Iron IV***, con su propia carpeta de imágenes (`img/events/`), cabeceras diferenciadas según el tema y acoplamiento visual 100% consistente con el resto de **La Rosca**.

---

## 1. Diagnóstico del estado actual en el código

Hoy el juego tiene **dos modales distintos** que cumplen el rol de evento emergente ("Situación del Mes") y están desparejos entre sí:

| Modal actual | Archivo | Dónde aparece | Estado visual hoy | Cantidad de eventos |
|---|---|---|---|---|
| `CampaignMonthlyDilemmaModal` | `packages/web-presentation/src/features/campaign/CampaignMonthlyDilemmaModal.tsx` | Campaña Electoral 2027 (`campaignDilemmasCatalog.ts`) | **Viejo:** caja negra `rounded-3xl`, botones blancos SaaS, dice `SITUACIÓN DEL MES`, sin imagen | **3** (`DILEMMA_MES_5_EMPRESARIO`, `DILEMMA_MES_7_FILTRACION`, `DILEMMA_MES_9_BARONES`) |
| `GovernmentEventModal` | `packages/web-presentation/src/features/game-shell/GovernmentOverlays.tsx` | Gobierno (`governmentEventsCatalog.ts` + `governmentEventsExpansionCatalog.ts`) | **Intermedio:** ya usa papel `.hoi-paper-event` (`#f3f0e8`) pero genérico ("PARTE OFICIAL · CASA ROSADA"), sin diario ni fotografía | **117** (**12** base + **105** expansión) |

**Total a cubrir:** **120 eventos** (`3` de Campaña + `117` de Gobierno).

> **Decisión clave de diseño:** Unificar el lenguaje gráfico de **ambos modales** bajo un componente compartido `NewspaperEventModal.tsx` con estética de **tapa de diario impreso** sobre el tablero oscuro del juego, manteniendo la legibilidad de los badges de impacto (`verde = bueno / rojo-carmín = malo`).

---

## 2. Anatomía visual de la Tapa de Diario (inspirada en HOI4 + prensa argentina)

Tomando la estructura clásica de la captura *World News* de HOI4, adaptada al tablero acero/bronce de **La Rosca**:

```text
+-------------------------------------------------------------------+
| [VOLANTA SUPERIOR - BARRA EDITORIAL]    EDICIÓN N° 421 · $ 1.800  |  <- Fecha real del turno + Precio/Edición
+-------------------------------------------------------------------+
|  ■        MASTHEAD DEL DIARIO ARGENTINO (SVG/Serif)          ■    |  <- Ej: CLARÍN / LA NACIÓN / ÁMBITO / BOLETÍN OFICIAL
|           "El Gran Diario Argentino" · Año LXXXII                 |
+===================================================================+
|  +-------------------------------------------------------------+  |
|  |                                                             |  |
|  |   IMAGEN FOTOGRÁFICA (/img/events/<archivo>.webp)           |  |  <- Ratio 2.5:1 (800×320px), marco doble fino,
|  |   Filtro B&N prensa / grano papel / viñeta sutil            |  |     leyenda/epígrafe de foto al pie
|  |                                                             |  |
|  +-------------------------------------------------------------+  |
|  EPÍGRAFE: "Plaza de Mayo colmada desde las 14 hs. — Archivo"     |
+-------------------------------------------------------------------+
|                                                                   |
|           TITULAR PRINCIPAL SERIF EN NEGRITA (H2)                 |
|                                                                   |
|   Bajada corta o texto editorial en cuerpo tipo crónica de        |
|   prensa (serif legible, fondo papel #ebe5d5 con textura sutil    |
|   de pliegue central vertical en pantallas anchas).               |
|                                                                   |
+-------------------------------------------------------------------+
|  [ DECISIÓN 1: TÍTULO + BADGES ]  |  [ DECISIÓN 2 / 3 ... ]       |  <- Botones inferiores oscuros acero/bronce
|  [+APROBACIÓN] [-RIESGO PAÍS]     |  [-RESERVAS] [+CREDIBILIDAD]  |     (estilo exacto botón oscuro del evento HOI4)
+-------------------------------------------------------------------+
|  EXPEDIENTE N° ... · PRESIDENCIA / CAMPAÑA   |  ESTADO DEL TURNO  |
+-------------------------------------------------------------------+
```

### Reglas de diseño para que acople sin romper la vista
1. **Paleta papel prensa cálido dentro del marco táctico:** `#ebe5d5` / `#f3f0e8` con borde exterior oscuro `#1d2430` y doble filete tipográfico `#23272f` (reutilizando y refinando `.hoi-paper-event` en `index.css`).
2. **Pliegue de diario sutil (`linear-gradient`)** vertical al centro o textura sutil CSS pura (sin imágenes pesadas de fondo).
3. **Recorte fotográfico estilo prensa impresa:** cada imagen cargada desde `img/events/` se renderiza en contenedor `aspect-[5/2]` (`object-cover`) con filtro `grayscale contrast-125 sepia-[0.12]` + marco fino interior `border-[#2b303a]` y una **faja de epígrafe** inferior en fuente `font-mono` chica.
4. **Botones de decisión fieles a la captura HOI4:** barra oscura `#181d26` (hover `#242c39` con filete dorado `#b89342`) arriba/abajo de los badges de efecto, con contraste fuerte y colores semánticos consistentes (`emerald` = positivo, `rose` = negativo).

---

## 3. Sistema de Diarios Argentinos (Mastheads) y Reglas de Asignación

Cada evento mostrará el diario que más sentido editorial tenga en Argentina según el tipo de noticia (y opcionalmente un `newspaperId` explícito por evento para casos icónicos como leyes en el Boletín Oficial o tapas del Campo):

| ID Diario | Cabecera visible | Bajada / Lema editorial | Estilo tipográfico | Cuándo sale por defecto |
|---|---|---|---|---|
| `BOLETIN_OFICIAL` | **BOLETÍN OFICIAL** *de la República Argentina* | *Primera Sección · Legislación y Avisos Oficiales* | Serif formal + Escudo Nacional estilizado | DNUs, cautelares contra decretos, intervención federal, pliegos, renuncias de gabinete |
| `CLARIN` | **Clarín** | *El gran diario argentino* | Sans/Display gruesa roja/negra en tira prensa | Paros masivos, incidentes sociales, saqueos, inseguridad, dengue, fútbol/calle, campañas |
| `LA_NACION` | **LA NACION** | *Fundado por Bartolomé Mitre en 1870* | Serif clásica espaciada negra/azul tinta | Corte Suprema, institucional, campo/Mesa de Enlace, coloquio empresario, geopolítica EE.UU./OCDE |
| `AMBITO` | **ámbito financiero** | *El diario de los negocios y mercados* | Condensed negrita con filete azul/celeste | Corrida cambiaria, brecha CCL, vencimientos Wall Street, FMI, tasas Fed, bancos, MSCI |
| `CRONISTA` | **El Cronista** | *Economía, Finanzas y Comercio Exterior* | Serif editorial clásica con acento verde oscuro | RIGI, minería/litio, energía/Vaca Muerta, tarifas, industria, comercio bilateral / Brasil |
| `PAGINA_12` | **Página/12** | *El país a diario* | Slab/Display compacta blanca sobre banda negra/celeste | Marchas universitarias, jubilados, hospitales, conflictos gremiales, filtraciones de inteligencia |
| `INFOBAE` | **infobae** *Edición Especial* | *Último momento · Política y Sociedad* | Bold moderna naranja/tinta impresa (adaptada a papel) | Audios filtrados, chats de gabinete, deepfakes, ciberataques RENAPER, escándalos virales |
| `VOZ_INTERIOR` | **La Voz del Interior** *(Red Federal)* | *Córdoba · Santa Fe · Patagonia · Cuyo · NOA* | Serif federal clásica | Reclamo de gobernadores, cuasimonedas provinciales, sequía, bajante del Paraná, incendios, sismos, paso Chile |

> **Nota técnica:** Las cabeceras se implementan en un módulo puro `newspaperMastheads.ts` (CSS + SVG liviano en línea, sin descargar logos externos ni violar licencias de assets).

---

## 4. Estructura de Carpetas y Convención de Imágenes (`img/events/`)

### Ubicación exacta en Vite
En Vite, la raíz pública servida como `/img/...` corresponde a `packages/web-presentation/public/`:

```text
packages/web-presentation/public/
└── img/
    └── events/
        ├── fallbacks/
        │   ├── economia.webp
        │   ├── social.webp
        │   ├── institucional.webp
        │   ├── energia.webp
        │   ├── externo.webp
        │   └── campana.webp
        ├── campaign_dilemma_mes_5_empresario.webp
        ├── paro_general_cgt.webp
        ├── sequia_pampeana.webp
        ├── corrida_cambiaria.webp
        └── ... (1 imagen dedicada por evento)
```

*(Nota: si también querés que exista físicamente una carpeta visible en la raíz del proyecto tipo `./img/events`, Vite puede exponer `publicDir` o copiarse, pero mantenerlas en `packages/web-presentation/public/img/events/` garantiza que tanto `npm run dev` en `http://127.0.0.1:5173/img/events/...` como `npm run build` en `dist/img/events/...` funcionen de una sin tocar rutas relativas).*

### Especificación técnica de cada imagen
- **Formato:** `.webp` (calidad 82, **800 × 320 px**, relación `5:2` idéntica al recuadro de foto de la captura de HOI4). Pesa ~35–55 KB por archivo (**~5–6 MB en total** las 120 imágenes, contra +100 MB si fueran PNG grandes).
- **Estilo visual unificado:** Fotoperiodismo argentino contemporáneo / documental en **blanco y negro de alto contraste** (o listo para pasar por el filtro prensa en CSS), planos horizontales claros, sin texto ni marcas de agua superpuestas dentro de la imagen.
- **Fallback automático (`onError` en `<img>`):** Si una imagen de un evento puntual todavía está en cola de producción, el componente cae automáticamente al fallback de su categoría (`public/img/events/fallbacks/<categoria>.webp`) para que nunca aparezca un ícono roto.

---

## 5. Inventario completo: Mapeo Diario + Imagen de los 120 Eventos

### A. Lote 0 — Prioridad Inmediata (3 Campaña + 12 Base de Gobierno = 15 imágenes)

#### Dilemas de Campaña (`SITUACIÓN DEL MES`)
| ID | Titular | Diario asignado | Archivo en `img/events/` | Escena fotográfica |
|---|---|---|---|---|
| `DILEMMA_MES_5_EMPRESARIO` | Un empresario ofrece un aporte | `CLARIN` | `dilemma_mes_5_empresario.webp` | Reunión reservada de dos hombres de traje junto a planos de obra pública y maletín en café porteño |
| `DILEMMA_MES_7_FILTRACION` | Operación mediática en la previa a las PASO | `INFOBAE` | `dilemma_mes_7_filtracion.webp` | Estudio de TV nocturno con monitores de último momento y micrófonos de prensa |
| `DILEMMA_MES_9_BARONES` | Pacto de no agresión en el Conurbano | `CLARIN` | `dilemma_mes_9_barones.webp` | Urnas, mesas electorales y punteros con boletas de papel en escuela del Conurbano |

#### Eventos Base de Gobierno (`governmentEventsCatalog.ts`)
| ID | Titular | Diario asignado | Archivo en `img/events/` | Escena fotográfica |
|---|---|---|---|---|
| `PARO_GENERAL_CGT` | Paro general de la CGT | `CLARIN` | `paro_general_cgt.webp` | Plaza de Mayo colmada de manifestantes, banderas sindicales y calles vacías de colectivos |
| `SEQUIA_PAMPEANA` | Sequía en la zona núcleo | `LA_NACION` | `sequia_pampeana.webp` | Campo de soja seco con tierra agrietada y cielo despejado en la pampa húmeda |
| `CORRIDA_CAMBIARIA` | Corrida cambiaria | `AMBITO` | `corrida_cambiaria.webp` | Microcentro porteño (calle Florida), pantallas de cotización del dólar y ahorristas en fila |
| `AUDIOS_EN_LA_ROSADA` | Audios filtrados en la Rosada | `INFOBAE` | `audios_en_la_rosada.webp` | Fachada de Casa Rosada de noche rodeada de móviles de TV con luces y grabadores de prensa |
| `BLACKOUT_DE_VERANO` | Ola de calor y apagones | `CLARIN` | `blackout_de_verano.webp` | Avenida porteña completamente a oscuras de noche, semáforos apagados y autos con luces altas |
| `GOBERNADORES_RECLAMAN` | Los gobernadores levantan la voz | `VOZ_INTERIOR` | `gobernadores_reclaman.webp` | Mesa larga del Consejo Federal de Inversiones con mandatarios provinciales y carpetas |
| `CAUTELAR_CONTRA_DNU` | Una cautelar frena tu DNU | `BOLETIN_OFICIAL` | `cautelar_contra_dnu.webp` | Fachada de Tribunales / Palacio de Justicia en Buenos Aires con expedientes apilados |
| `REVISION_FMI` | Revisión del programa con el FMI | `AMBITO` | `revision_fmi.webp` | Sala de reuniones en el Ministerio de Economía frente a escalinata con carpeta oficial y banderas |
| `FED_SUBE_TASAS` | La Reserva Federal sube las tasas | `AMBITO` | `fed_sube_tasas.webp` | Tablero bursátil en Wall Street en rojo y edificio neoclásico financiero |
| `RENUNCIA_MINISTRO` | Renuncia sonada en el gabinete | `BOLETIN_OFICIAL` | `renuncia_ministro.webp` | Escritorio ministerial vacío con carpeta cerrada y puerta del Salón Blanco entreabierta |
| `MARCHA_FEDERAL` | Marcha federal universitaria | `PAGINA_12` | `marcha_federal.webp` | Columna multitudinaria de estudiantes y libros en alto frente al Congreso Nacional |
| `INVERSION_RECORD` | Anuncio de inversión récord | `CRONISTA` | `inversion_record.webp` | Salar andino de litio con maquinaria minera y cordillera de fondo |

---

### B. Lote 1 — Economía, Corridas, Deuda y Mercados (E01–E20)

| # | ID | Diario | Archivo en `img/events/` | Escena fotográfica |
|---|---|---|---|---|
| 1 | `VENCIMIENTO_BONO_WALL_STREET_DURO` | `AMBITO` | `vencimiento_bono_wall_street_duro.webp` | Rascacielos financieros de Manhattan y relojes de mercados |
| 2 | `CORRIDA_BANCARIA_RUMOR_CORRALITO` | `CLARIN` | `corrida_bancaria_rumor_corralito.webp` | Cola larga de gente esperando en puerta de sucursal bancaria |
| 3 | `FONDOS_BUITRE_EMBARGO_EMBAJADA` | `LA_NACION` | `fondos_buitre_embargo_embajada.webp` | Corte Federal de Nueva York y bandera diplomática |
| 4 | `RECALIFICACION_EMERGING_MARKETS` | `AMBITO` | `recalificacion_emerging_markets.webp` | Pantallas de bolsa de comercio porteña BYMA con gráficos |
| 5 | `CAIDA_BRUTAL_PRECIO_SOJA` | `LA_NACION` | `caida_brutal_precio_soja.webp` | Silobolsas cerradas al costado de ruta rural nublada |
| 6 | `BOOM_COMMODITIES_LITIO_COBRE` | `CRONISTA` | `boom_commodities_litio_cobre.webp` | Planta de extracción minera y piletas de litio en la Puna |
| 7 | `DEVALUACION_BRASIL_REAL_650` | `CRONISTA` | `devaluacion_brasil_real_650.webp` | Puente internacional con filas de camiones de carga detenidos |
| 8 | `QUIEBRA_BANCO_MEDIANO_PROVINCIAL` | `AMBITO` | `quiebra_banco_mediano_provincial.webp` | Persiana baja de banco regional con cartel de cierre temporal |
| 9 | `DISPARADA_BRECHA_CCL_45` | `AMBITO` | `disparada_brecha_ccl_45.webp` | Pizarra cambiaria y operadores en mesa de dinero con teléfonos |
| 10 | `INFLACION_REBOTA_ALIMENTARIOS` | `CLARIN` | `inflacion_rebota_alimentarios.webp` | Góndola de supermercado con remarcadores y changuito semivacío |
| 11 | `PARATE_CONSTRUCCION_CONURBANO` | `CLARIN` | `parate_construccion_conurbano.webp` | Obra pública a medio hacer sin obreros y vallas quietas |
| 12 | `HUIDA_DEPOSITOS_FONDOS_MONEY_MARKET` | `AMBITO` | `huida_depositos_fondos_money_market.webp` | Sala de trading con pantallas en caída abrupta |
| 13 | `ANUNCIO_MEGAPLANTA_IA_PATAGONIA` | `CRONISTA` | `anuncio_megaplanta_ia_patagonia.webp` | Aerogeneradores patagónicos junto a nave industrial moderna |
| 14 | `CIERRE_CADENA_TEXTIL_HISTORICA` | `PAGINA_12` | `cierre_cadena_textil_historica.webp` | Fábrica textil antigua con telares apagados y portón cerrado |
| 15 | `RECLAMO_MOROSIDAD_PROVEEDORES_ESTADO` | `CRONISTA` | `reclamo_morosidad_proveedores_estado.webp` | Camiones de reparto medicinales frenados frente a depósito público |
| 16 | `GUERRA_COMERCIAL_ARANCELES_EEUU` | `CRONISTA` | `guerra_comercial_aranceles_eeuu.webp` | Contenedores portuarios apilados bajo grúas paradas |
| 17 | `BOOM_TURISTICO_POR_ATRASO_INVERSO` | `CLARIN` | `boom_turistico_por_atraso_inverso.webp` | Aeropuerto internacional Ezeiza repleto de pasajeros con valijas |
| 18 | `CRISIS_FINANCIAMIENTO_PYME_CHEQUES` | `AMBITO` | `crisis_financiamiento_pyme_cheques.webp` | Taller metalúrgico pequeño con escritorio lleno de boletas |
| 19 | `INFORME_INDEC_POBREZA_SUBA` | `PAGINA_12` | `informe_indec_pobreza_suba.webp` | Comedor comunitario en barrio popular con ollas y fila |
| 20 | `COMPRA_MULTINACIONAL_BANCO_LOCAL` | `AMBITO` | `compra_multinacional_banco_local.webp` | Torres corporativas en Catalinas Norte al atardecer |

---

### C. Lote 2 — Gremios, Calle, Seguridad y Conflictos Sociales (S01–S20)

| # | ID | Diario | Archivo en `img/events/` | Escena fotográfica |
|---|---|---|---|---|
| 21 | `PARO_CAMIONEROS_DESABASTECIMIENTO` | `CLARIN` | `paro_camioneros_desabastecimiento.webp` | Fila interminable de camiones detenidos en autopista de acceso |
| 22 | `TOMA_PLANTA_NEUMATICOS` | `CLARIN` | `toma_planta_neumaticos.webp` | Portón de planta industrial con cubiertas apiladas y fogata |
| 23 | `LOCKOUT_CAMPO_NO_LIQUIDACION` | `LA_NACION` | `lockout_campo_no_liquidacion.webp` | Cruce de ruta rural con tractores estacionados en la banquina |
| 24 | `PARO_AEROPORTOS_VACACIONES_INVIERNO` | `CLARIN` | `paro_aeroportos_vacaciones_invierno.webp` | Hall de Aeroparque lleno de familias sentadas en valijas y tablero cancelado |
| 25 | `ACAMPE_PIQUETERO_9_DE_JULIO` | `CLARIN` | `acampe_piquetero_9_de_julio.webp` | Carpas montadas sobre la Avenida 9 de Julio frente al Ministerio |
| 26 | `HUELGA_SUBTES_Y_TRENES_HORA_PICO` | `CLARIN` | `huelga_subtes_y_trenes_hora_pico.webp` | Molinetes cerrados en estación Constitución en horario pico |
| 27 | `PROTESTA_MEDICOS_RESIDENTES_GARRAHAN` | `PAGINA_12` | `protesta_medicos_residentes_garrahan.webp` | Médicos con guardapolvos blancos y carteles en escalinata hospitalaria |
| 28 | `SAQUEOS_COORDINADOS_CONURBANO` | `INFOBAE` | `saqueos_coordinados_conurbano.webp` | Supermercado con persianas metálicas bajadas y patrullero nocturno |
| 29 | `MARCHA_JUBILADOS_CONGRESO_REPRESION` | `PAGINA_12` | `marcha_jubilados_congreso_represion.webp` | Jubilados con carteles frente a vallado frente al Congreso |
| 30 | `PARO_ESTIBA_PUERTOS_GRAN_ROSARIO` | `CRONISTA` | `paro_estiba_puertos_gran_rosario.webp` | Buques cerealeros fondeados quietos en el río Paraná frente a elevadores |
| 31 | `REBELION_TAXIS_CONTRA_APPS` | `CLARIN` | `rebelion_taxis_contra_apps.webp` | Taxis estacionados en fila bloqueando carril hacia autopista |
| 32 | `HUELGA_DOCENTE_INICIO_CLASES` | `PAGINA_12` | `huelga_docente_inicio_clases.webp` | Aula vacía con pupitres apilados y pizarrón en blanco |
| 33 | `CONFLICTO_PETROLERO_VACA_MUERTA` | `CRONISTA` | `conflicto_petrolero_vaca_muerta.webp` | Torres de perforación quietas en estepa patagónica |
| 34 | `MOVILIZACION_INQUILINOS_Y_DESALOJOS` | `PAGINA_12` | `movilizacion_inquilinos_y_desalojos.webp` | Edificios urbanos con cartel de alquiler y gente reunida en esquina |
| 35 | `PARO_BANCARIO_NACIONAL_PRIVATIZACION` | `PAGINA_12` | `paro_bancario_nacional_privatizacion.webp` | Fachada de banco central/histórico en Plaza de Mayo con gremialistas |
| 36 | `ASAMBLEAS_AMBIENTALES_CORTAN_RUTA_MINERA` | `VOZ_INTERIOR` | `asambleas_ambientales_cortan_ruta_minera.webp` | Vecinos cortando ruta de montaña con pancartas por el agua |
| 37 | `PROTESTA_CHOFERES_COLECTIVOS_SIN_NAFTA` | `VOZ_INTERIOR` | `protesta_choferes_colectivos_sin_nafta.webp` | Terminal de ómnibus provincial vacía de colectivos en dársenas |
| 38 | `MARCHA_CGT_CON_SECTOR_EMPRESARIO_PYME` | `CLARIN` | `marcha_cgt_con_sector_empresario_pyme.webp` | Palco conjunto en avenida de Mayo con dirigentes fabriles y obreros |
| 39 | `RECLAMO_INTENDENTES_CONURBANO_SEGURIDAD` | `INFOBAE` | `reclamo_intendentes_conurbano_seguridad.webp` | Operativo de Gendarmería nocturno en cruce urbano del GBA |
| 40 | `DENUNCIA_VIOLENCIA_INST_EN_MARCHA` | `PAGINA_12` | `denuncia_violencia_inst_en_marcha.webp` | Cámaras de fotógrafos rodeando esquina tras tumulto |

---

### D. Lote 3 — Rosca Política, Congreso, Gabinete y Gobernadores (P01–P20)

| # | ID | Diario | Archivo en `img/events/` | Escena fotográfica |
|---|---|---|---|---|
| 41 | `REBELION_INTERNA_EN_TU_BLOQUE` | `LA_NACION` | `rebelion_interna_en_tu_bloque.webp` | Diputados discutiendo acaloradamente en pasillo lateral de bancas |
| 42 | `PACTO_OCULTO_OPOSICION_MAYORIA` | `LA_NACION` | `pacto_oculto_oposicion_mayoria.webp` | Recinto de Diputados con tablero electrónico encendido de votación |
| 43 | `AMENAZA_CUASIMONEDA_PROVINCIAL` | `VOZ_INTERIOR` | `amenaza_cuasimoneda_provincial.webp` | Imprenta provincial con planchas de bonos locales numerados |
| 44 | `CARPETAZO_CONGRESO_VALIJAS_SENADO` | `INFOBAE` | `carpetazo_congreso_valijas_senado.webp` | Hemiciclo del Senado semi vacío de madrugada bajo luz tenue |
| 45 | `RENUNCIA_VICEPRESIDENTE_DISTANCIAMIENTO` | `LA_NACION` | `renuncia_vicepresidente_distanciamiento.webp` | Sillón de la Presidencia del Senado vacío y puerta entreabierta |
| 46 | `LIGA_GOBERNADORES_PATAGONICOS_CORTE_GAS` | `VOZ_INTERIOR` | `liga_gobernadores_patagonicos_corte_gas.webp` | Válvulas de gasoducto patagónico en paisaje ventoso del sur |
| 47 | `ACUERDO_INTERBLOQUES_JUICIO_POLITICO` | `CLARIN` | `acuerdo_interbloques_juicio_politico.webp` | Sala de comisión parlamentaria repleta de periodistas y micrófonos |
| 48 | `MUERTE_LIDER_HISTORICO_OPOSITOR` | `LA_NACION` | `muerte_lider_historico_opositor.webp` | Salón de los Pasos Perdidos en el Congreso con bandera a media asta |
| 49 | `RUPTURA_ALIADO_ELECTORAL_CLAVE` | `CLARIN` | `ruptura_aliado_electoral_clave.webp` | Dos dirigentes saliendo por puertas opuestas sin mirarse |
| 50 | `PEDIDO_INTERVENCION_FEDERAL_CRISIS_PROV` | `BOLETIN_OFICIAL` | `pedido_intervencion_federal_crisis_prov.webp` | Casa de Gobierno provincial cercada con manifestantes afuera |
| 51 | `ENCUENTRO_SECRETO_EN_EXILIO_OPOSICION` | `INFOBAE` | `encuentro_secreto_en_exilio_oposicion.webp` | Toma lejana de dos figuras conversando en mesa discreta de restaurante |
| 52 | `VETO_COMPENSADO_UNIVERSIDADES_JUBILADOS` | `BOLETIN_OFICIAL` | `veto_compensado_universidades_jubilados.webp` | Lapicera estilográfica sobre texto de decreto de veto presidencial |
| 53 | `DISPUTA_PRESIDENCIA_PROVISIONAL_SENADO` | `LA_NACION` | `disputa_presidencia_provisional_senado.webp` | Jefes de bloque parlamentarios dialogando de pie en hemiciclo |
| 54 | `RECLAMO_CORDOBA_SANTA_FE_HIDROVIA` | `VOZ_INTERIOR` | `reclamo_cordoba_santa_fe_hidrovia.webp` | Barcazas graneleras remolcadas por el Paraná rumbo al puerto |
| 55 | `FILTRACION_CHATS_GABINETE` | `INFOBAE` | `filtracion_chats_gabinete.webp` | Pantalla de teléfono con burbujas borrosas sobre escritorio |
| 56 | `CUMBRE_EMPRESARIA_IDEA_COLOQUIO_FRIO` | `CRONISTA` | `cumbre_empresaria_idea_coloquio_frio.webp` | Auditorio empresario en Mar del Plata frente al mar y atril |
| 57 | `PROYECTO_OPOSITOR_PLEBISCITO` | `PAGINA_12` | `proyecto_opositor_plebiscito.webp` | Mesas callejeras juntando planillas de firmas en esquina céntrica |
| 58 | `NEGOCIACION_PLIEGOS_EMBAJADORES` | `BOLETIN_OFICIAL` | `negociacion_pliegos_embajadores.webp` | Palacio San Martín y carpetas diplomáticas lacradas |
| 59 | `MEDIO_HEGEMONICO_CAMBIA_LINEA` | `CLARIN` | `medio_hegemonico_cambia_linea.webp` | Rotativa de diario imprimiendo miles de ejemplares de tapa crítica |
| 60 | `ENCUESTA_EMPATE_TECNICO_ULTIMA_SEMANA` | `CLARIN` | `encuesta_empate_tecnico_ultima_semana.webp` | Gráfico electoral parejo sobre escritorio de comando de campaña |

---

### E. Lote 4 — Justicia, Corte Suprema, Escándalos y Medios (J01–J18)

| # | ID | Diario | Archivo en `img/events/` | Escena fotográfica |
|---|---|---|---|---|
| 61 | `FALLO_CORTE_INCONSTITUCIONAL_DNU` | `BOLETIN_OFICIAL` | `fallo_corte_inconstitucional_dnu.webp` | Cuarto piso del Palacio de Tribunales con los jueces de frente |
| 62 | `CAUSA_SOBREPRECIOS_PAMI_O_COMPRAS` | `CLARIN` | `causa_sobreprecios_pami_o_compras.webp` | Depósito de cajas médicas junto a carpetas de auditoría |
| 63 | `PROCESAMIENTO_EX_PRESIDENTE_CASACION` | `LA_NACION` | `procesamiento_ex_presidente_casacion.webp` | Escalinata de Comodoro Py 2002 repleta de cámaras de TV |
| 64 | `AMPARO_PREPAGAS_O_TARIFAS_MENDOZA` | `VOZ_INTERIOR` | `amparo_prepagas_o_tarifas_mendoza.webp` | Boleta de gas sobre mesa de cocina familiar y sello judicial |
| 65 | `ESCANDALO_SERVICIOS_INTELIGENCIA` | `PAGINA_12` | `escandalo_servicios_inteligencia.webp` | Archivador abierto con carpetas confidenciales desclasificadas |
| 66 | `CRIPTOESTAFAS_O_PUBLICIDAD_OFICIAL` | `INFOBAE` | `criptoestafas_o_publicidad_oficial.webp` | Gráfico de vela roja desplomándose en pantalla de celular |
| 67 | `FILTRACION_PANDORA_CUENTAS_MINISTRO` | `INFOBAE` | `filtracion_pandora_cuentas_ministro.webp` | Redacción periodística de investigación iluminada de noche |
| 68 | `HACKERS_ROBAN_BASE_RENAPER_O_ANses` | `INFOBAE` | `hackers_roban_base_renaper_o_anses.webp` | Sala de servidores oscurecida con luces de advertencia rojas |
| 69 | `JUICIO_YPF_EMBARGO_ACCIONES_EEUU` | `AMBITO` | `juicio_ypf_embargo_acciones_eeuu.webp` | Torre YPF en Puerto Madero y tribunales del Distrito Sur de NY |
| 70 | `JUEZ_FEDERAL_LIBERA_CAPO_NARCO` | `CLARIN` | `juez_federal_libera_capo_narco.webp` | Patrullero federal en avenida costera de Rosario al anochecer |
| 71 | `CONFLICTO_LICITACION_PASAPORTES_DNI` | `BOLETIN_OFICIAL` | `conflicto_licitacion_pasaportes_dni.webp` | Pasaportes argentinos apilados junto a sello de suspensión judicial |
| 72 | `FALLO_LABORAL_MULTIMILLONARIO_PYME` | `LA_NACION` | `fallo_laboral_multimillonario_pyme.webp` | Cartel de liquidación en frente de taller PyME cerrado |
| 73 | `OPERACION_CAMBIO_REGISTRO_PARTIDO` | `BOLETIN_OFICIAL` | `operacion_cambio_registro_partido.webp` | Cajas con fichas de afiliación partidaria en juzgado electoral |
| 74 | `INVESTIGACION_APORTES_TRUCHOS_CAMPANA` | `INFOBAE` | `investigacion_aportes_truchos_campana.webp` | Planillas contables auditadas bajo lámpara de escritorio judicial |
| 75 | `OPERETA_DEEPFAKE_EN_ELECCION` | `INFOBAE` | `opereta_deepfake_en_eleccion.webp` | Mesa de edición de video manipulando cuadro televisivo nocturno |
| 76 | `EXIGENCIA_OCDE_ESTANDAR_INSTITUCIONAL` | `LA_NACION` | `exigencia_ocde_estandar_institucional.webp` | Sala de conferencia internacional con traductores y carpeta técnica |
| 77 | `CRISIS_MIGRATORIA_O_CRIME_FRONTERA_BRASIL_PAR` | `CLARIN` | `crisis_migratoria_o_crime_frontera_brasil_par.webp` | Control nocturno de Prefectura y Gendarmería en puente fronterizo |
| 78 | `DEBATE_PRESIDENCIAL_CRUCE_VIRAL` | `CLARIN` | `debate_presidencial_cruce_viral.webp` | Atriles iluminados en escenario de debate televisado nacional |

---

### F. Lote 5 — Clima, Energía, Catástrofes y Logística (N01–N16)

| # | ID | Diario | Archivo en `img/events/` | Escena fotográfica |
|---|---|---|---|---|
| 79 | `INUNDACIONES_LITORAL_Y_NUCLEO` | `VOZ_INTERIOR` | `inundaciones_litoral_y_nucleo.webp` | Campos y ruta nacional cubiertos por agua desbordada del río |
| 80 | `OLA_POLAR_FALTA_GNC_E_INDUSTRIA` | `CLARIN` | `ola_polar_falta_gnc_e_industria.webp` | Estación de GNC con mangueras atadas y faja de cierre en mañana helada |
| 81 | `INCENDIOS_FORESTALES_CORDOBA_PATAGONIA` | `VOZ_INTERIOR` | `incendios_forestales_cordoba_patagonia.webp` | Frente de fuego en sierras cordobesas y avión hidrante pasando |
| 82 | `BAJANTE_HISTORICA_RIO_PARANA` | `VOZ_INTERIOR` | `bajante_historica_rio_parana.webp` | Costa de barrancas secas en el Paraná con muelle alto sin agua |
| 83 | `APAGON_MASIVO_NACIONAL_TRANSENER` | `CLARIN` | `apagon_masivo_nacional_transener.webp` | Línea de alta tensión en campo abierto al atardecer sin luces |
| 84 | `PLAGA_CHICHARRITA_MAIZ_PERDIDA_30` | `LA_NACION` | `plaga_chicharrita_maiz_perdida_30.webp` | Cultivo de maíz seco y quebrado en lote agrícola |
| 85 | `CORTE_PASO_CRISTO_REDENTOR_NIEVE` | `VOZ_INTERIOR` | `corte_paso_cristo_redentor_nieve.webp` | Ruta cordillerana tapada por nieve con camiones parados en fila |
| 86 | `CRISIS_HIDRICA_CUYO_MENDOZA_SAN_JUAN` | `VOZ_INTERIOR` | `crisis_hidrica_cuyo_mendoza_san_juan.webp` | Dique andino con nivel de agua muy bajo y acequias secas |
| 87 | `COLAPSO_PUENTE_RUTA_NACIONAL_CLAVE` | `VOZ_INTERIOR` | `colapso_puente_ruta_nacional_clave.webp` | Tramo de puente carretero colapsado sobre río mesopotámico |
| 88 | `EPIDEMIA_DENGUE_VERANO_RECORRIDO` | `CLARIN` | `epidemia_dengue_verano_recorrido.webp` | Guardia hospitalaria colmada y farmacia con cartel sin stock |
| 89 | `BROTE_FIEBRE_AFTOSA_O_GRIPE_AVIAR` | `LA_NACION` | `brote_fiebre_aftosa_o_gripe_aviar.webp` | Tranquera rural con cartel de cuarentena sanitaria SENASA |
| 90 | `DERRAME_HIDROCARBUROS_CUENCA_SUR` | `VOZ_INTERIOR` | `derrame_hidrocarburos_cuenca_sur.webp` | Operarios ambientales conteniendo mancha en cañadón patagónico |
| 91 | `TORMENTA_CONVECTIVA_DESTRUYE_BAHIA_O_AMBA` | `CLARIN` | `tormenta_convectiva_destruye_bahia_o_amba.webp` | Árboles caídos, chapas y postes de luz derribados tras temporal |
| 92 | `CAIDA_REPRESA_COMAHUE_MANTENIMIENTO` | `CRONISTA` | `caida_represa_comahue_mantenimiento.webp` | Sala de turbinas hidroeléctricas abierta para reparación urgente |
| 93 | `INVASION_ALGAS_O_MAREA_ROJA_PESCA` | `VOZ_INTERIOR` | `invasion_algas_o_marea_roja_pesca.webp` | Flota de barcos pesqueros amarillos amarrados en muelle patagónico |
| 94 | `SISMO_EN_CUYO_INFRAESTRUCTURA` | `VOZ_INTERIOR` | `sismo_en_cuyo_infraestructura.webp` | Fachada de escuela cuyana acordonada con grietas tras temblor |

---

### G. Lote 6 — Geopolítica y Año Electoral / Medio Término (G01–G11)

| # | ID | Diario | Archivo en `img/events/` | Escena fotográfica |
|---|---|---|---|---|
| 95 | `CUMBRE_MERCOSUR_UE_FIRMA_O_ROTURA` | `LA_NACION` | `cumbre_mercosur_ue_firma_o_rotura.webp` | Mesa diplomática con banderas sudamericanas y europeas |
| 96 | `TENSION_PESCA_ILEGAL_MILLAS_200` | `CLARIN` | `tension_pesca_ilegal_millas_200.webp` | Luces de barcos poteros extranjeros en el horizonte nocturno del Atlántico Sur |
| 97 | `APROXIMACION_CHINA_BASE_O_INFRAESTRUCTURA` | `CRONISTA` | `aproximacion_china_base_o_infraestructura.webp` | Tren de carga moderno en construcción y puerto ferroviario |
| 98 | `DESAIRE_O_ROCE_CON_BRASILIA` | `LA_NACION` | `desaire_o_roce_con_brasilia.webp` | Camiones en frontera Paso de los Libres y cancillerías distantes |
| 99 | `GUERRA_ORIENTE_MEDIO_SUBA_PETROLEO` | `AMBITO` | `guerra_oriente_medio_suba_petroleo.webp` | Surtidor de nafta nocturno y buque petrolero en mar abierto |
| 100 | `INVITACION_BILATERAL_CASA_BLANCA` | `LA_NACION` | `invitacion_bilateral_casa_blanca.webp` | Saludo protocolar frente a columnata de Casa Blanca |
| 101 | `BAJA_INTERNA_PROVINCIAL_CLAVE` | `CLARIN` | `baja_interna_provincial_clave.webp` | Silla vacía en conferencia de cierre de listas partidarias |
| 102 | `APAGON_FISCALIZACION_CONURBANO_BOLETAS` | `INFOBAE` | `apagon_fiscalizacion_conurbano_boletas.webp` | Voluntarios ordenando pilas de boletas en local partidario de madrugada |
| 103 | `CANDIDATO_OUTSIDER_TE_ROBA_VOTO_JOVEN` | `INFOBAE` | `candidato_outsider_te_roba_voto_joven.webp` | Estudio joven de streaming con micrófonos de podcast y aro de luz |
| 104 | `INCIDENTE_CARAVANA_CAMPANA_INT` | `CLARIN` | `incidente_caravana_campana_int.webp` | Escena movida de calle con cordón de seguridad y humo en esquina |
| 105 | `TRIUNFO_O_DERROTA_AJUSTADA_MEDIO_TERMINO` | `LA_NACION` | `triunfo_o_derrota_ajustada_medio_termino.webp` | Mapa hemiciclo del Congreso dividido mitades sobre pantalla electoral |

---

## 6. Arquitectura de código y orden de ejecución recomendado

### Paso 1 · Infraestructura visual + Unificación de Modales (sin romper tests)
1. Crear `packages/web-presentation/public/img/events/` y `packages/web-presentation/public/img/events/fallbacks/`.
2. Agregar campo opcional `imageKey?: string` y `newspaperId?: NewspaperId` en `GovernmentEventDefinition` y `CampaignMonthlyDilemma` (retrocompatible al 100%, sin tocar la lógica del dominio).
3. Crear en `packages/web-presentation/src/features/events-newspaper/`:
   - `newspaperMastheads.ts`: configuración de los 8 diarios argentinos (título, lema, estilo tipográfico, acento discreto, mapeo por `category` + overrides por `eventId`).
   - `NewspaperEventModal.tsx`: componente único tipo tapa de diario HOI4 con:
     - Barra superior editorial (edición, fecha del juego, volanta).
     - Masthead SVG/tipográfico del diario asignado.
     - Recuadro fotográfico `/img/events/<id>.webp` con `onError` al fallback de su categoría (`/img/events/fallbacks/<cat>.webp`).
     - Titular serif, bajada y cuerpo en 2 columnas (`columns-1 md:columns-2`).
     - Tarjetas/botones de decisión estilo HOI4.
4. Reemplazar el JSX interno de `GovernmentEventModal` en [GovernmentOverlays.tsx](file:///c:/Users/Danie/OneDrive/Desktop/Estudio%20Y%20Proyectos/Complete/packages/web-presentation/src/features/game-shell/GovernmentOverlays.tsx) y de [CampaignMonthlyDilemmaModal.tsx](file:///c:/Users/Danie/OneDrive/Desktop/Estudio%20Y%20Proyectos/Complete/packages/web-presentation/src/features/campaign/CampaignMonthlyDilemmaModal.tsx) para que ambos usen `NewspaperEventModal`.

### Paso 2 · Generación de imágenes en `img/events/` por lotes
Para no trabar el repo ni clavar la sesión generando 120 assets de un saque sin control:
1. **Primera tanda (Prioritaria):** los **6 fallbacks por categoría** + las **15 imágenes del Lote 0** (`3` campaña + `12` base de gobierno = **21 imágenes** reales), verificando en vivo cómo lucen dentro de las tapas de diario en el navegador.
2. **Segunda tanda (Lotes 1 al 6):** producir las **105 imágenes restantes** por bloques temáticos (`E01–E20`, `S01–S20`, `P01–P20`, `J01–J18`, `N01–N16`, `G01–G11`), optimizando tamaño a `.webp` (`800×320`).

### Paso 3 · Verificación
- `npm test` (mantener los 62 tests pasando).
- `npm run lint:complexity` (`CC <= 5`, `MI >= 75` también en los componentes nuevos).
- `npm run build` (`vite build` copiando `public/img/events/` a `dist/img/events/`).
- Chequeo visual en `http://127.0.0.1:5173/` tanto en Campaña (mes 5, 7, 9) como en Gobierno (al saltar una Situación del Mes).

