# Hoja de Ruta Táctica: Evolución 3D, Simulaciones en Vivo y Diseño de Guerra Política

Acá bajé a tierra todas las ideas que le faltan al simulador para que deje de sentirse como un panel de menús y pase a sentirse como un **War Room político vivo**, con fierros 3D en Three.js, simulaciones en tiempo real y esa tensión bien argentina de estar sentado en el sillón de Rivadavia con el dólar picando en la pantalla y el Congreso prendido fuego..

---

## 1. Evolución 3D del Mapa Estratégico (`Argentina3DMapCanvas`)

Hoy el mapa 3D levanta las 24 jurisdicciones extruidas con bisel metálico, ríos y etiquetas dinámicas, pero todavía tiene margen para volverse un tablero vivo al estilo *Hearts of Iron IV* cruzado con *Victoria 3*.

### 1.1. Mini-Monumentos y Activos Estratégicos 3D sobre cada Provincia
En vez de que cada provincia sea solo el bloque extruido liso, podemos montar mallas 3D low-poly estilizadas (bronce, acero pavonado y luces de neón sutiles) que reaccionen al estado de la partida:
* **CABA y Conurbano (PBA):** Silueta 3D del Obelisco, Casa Rosada y el Palacio del Congreso con luces puntuales cálidas. Si hay apagón energético en verano (`blackout_de_verano`), los nodos lumínicos del AMBA titilan y se apagan en el mapa 3D.
* **Neuquén (Vaca Muerta):** Torres de perforación (`drilling rigs`) con llamita de venteo de gas animada cuando activás el RIGI de Hidrocarburos o subís la producción de barriles.
* **Jujuy, Salta y Catamarca (Triángulo del Litio):** Piletones de evaporación turquesa brillante en la Puna que aparecen a medida que aprobás proyectos RIGI mineros.
* **Santa Fe y Córdoba (Núcleo Agroindustrial):** Silobolsas, elevadores de granos en el puerto de Rosario y barcazas bajando por la Hidrovía del Paraná cuando es época de liquidación de cosecha gruesa.
* **Chubut, Santa Cruz y Tierra del Fuego:** Molinos eólicos girando en la Patagonia y plataformas offshore en la Cuenca Austral.

### 1.2. Rutas Logísticas, Gasoductos y Líneas de Alta Tensión en 3D
* **Shaders de Flujo Energético y Comercial:** Trazar sobre el relieve 3D el **Gasoducto Perito Moreno (ex Néstor Kirchner)** desde Tratayén (Neuquén) hasta Salliqueló y San Jerónimo (Santa Fe) con una línea de pulso luminoso (`LineDashedMaterial` animado en WebGL) que acelera su velocidad según el superávit energético.
* **Rutas Nacionales Críticas (RN 9, RN 3, RN 14, RN 40):** Mostrar el flujo de camiones hacia los puertos de Rosario y Bahía Blanca. Si estalla un paro de camioneros o piquetes nacionales, aparecen **barricadas rojas titilantes** con humo volumétrico sobre los accesos a CABA y Rosario, cortando literalmente el flujo visual en el mapa.

### 1.3. Clima Político y Meteorológico sobre el Tablero 3D
* **Sequía vs. Cosecha Récord en la Pampa Húmeda:** Cambiar el shader de rugosidad y color de Buenos Aires, Santa Fe, Córdoba y Entre Ríos cuando cae el evento de *La Niña / Sequía Histórica* (tierra resquebrajada ocre seco) frente a una campaña agrícola récord (verde esmeralda intenso).
* **Focos de Conflicto Social en Vivo:** Cuando la conflictividad social supera el 65%, que sobre las capitales provinciales rebeldes aparezcan íconos tácticos 3D de protesta con ondas expansivas (`ripple rings`) sobre la mesa estratégica y sirenas sutiles.
* **Ciclo Día / Noche y Modo "Mesa de Situación Nocturna":** Un switch en la barra superior para pasar el mapa 3D a modo nocturno satelital, donde se ven encendidas las manchas urbanas de Buenos Aires, Córdoba, Rosario, Mendoza y Tucumán sobre el territorio oscuro.

---

## 2. Escenarios 3D Interactivos de Poder (Salir del Menú Plano)

No todo tiene que pasar arriba del mapa geográfico. Hay tres momentos del juego que piden a gritos una cámara 3D dedicada:

### 2.1. Hemiciclo 3D del Congreso de la Nación (Cámara Orbital)
Ya armamos el tablero electrónico nominal en tiempo real (`CongressRealtimeVoteModal`), pero el paso siguiente es renderizar el **recinto en 3D con Three.js**:
* Las **257 bancas de Diputados** (o las **72 del Senado**) dispuestas en abanico escalonado con pupitres de madera oscura y bronce.
* Cuando arranca la votación en tiempo real, la cámara hace un barrido lento desde el estrado de la Presidencia de la Cámara hacia las bancas mientras cada pupitre enciende su luz LED verde, roja o ámbar.
* Si un bloque aliado te traiciona a último minuto, la cámara hace un *zoom-in* dramático hacia ese sector del hemiciclo mientras el tablero mural del fondo cambia a `RECHAZADO`.

### 2.2. Despacho Presidencial 3D en Casa Rosada ("El Sillón de Rivadavia")
Una vista 3D isométrica o en primera persona desde el escritorio presidencial para la pestaña **Despacho**:
* **Objetos interactivos sobre el escritorio de caoba:**
  * **Carpeta de Decretos (DNU):** Al hacer clic se abre el firmador de decretos con sello húmedo del Poder Ejecutivo.
  * **Teléfono Rojo de Gobernadores y FMI:** Titila con una luz ámbar cuando tenés un ultimátum de los gobernadores patagónicos o una misión del Fondo Monetario esperando respuesta.
  * **Terminal Financiera Retro-Táctica:** Un monitor en una esquina del escritorio mostrando en tiempo real el ticker del Dólar Oficial, Blue, MEP, CCL, Riesgo País y Reservas Netas del BCRA.
  * **Pila de Diarios del Día:** Las tapas de *Clarín, La Nación, Página/12, Ámbito y Crónica* apiladas físicamente sobre una esquina de la mesa; al tocarlas se levanta el modal de lectura de prensa.
  * **Ventanal hacia Plaza de Mayo:** A través de las cortinas del balcón se ve si la Plaza está tranquila, vallada por Policía Federal o colmada de columnas sindicales y humo de bengalas.

### 2.3. Estudio de TV / Sala de Conferencias de Prensa en 3D
Para debates presidenciales en campaña y conferencias del Vocero Presidencial en gobierno:
* Atril oficial con micrófonos de los distintos canales, flashes de cámaras fotográficas y zócalos estilo televisión argentina en vivo debajo de la escena.

---

## 3. Nuevas Simulaciones en Tiempo Real y Mecánicas Profundas

Para que el juego tenga todavía más carne estratégica sin depender de ningún LLM externo (todo con motores deterministas, grafos de utilidad y autómatas celulares):

### 3.1. Votación Legislativa "En General" vs. "En Particular" (Articulado de Leyes)
En la política argentina real, muchas veces te aprueban la ley en general y te la vacían en la votación artículo por artículo (como pasó con la primera Ley Bases):
* Dividir las leyes grandes en **4 o 5 Capítulos Clave** (ej. *Cap. I: Emergencia Económica, Cap. II: Privatizaciones, Cap. III: Reforma Laboral, Cap. IV: Régimen Fiscal*).
* Si llegás justo con los votos (129 a 128), se aprueba en general pero entrás a una **segunda ronda relámpago por capítulos** donde los bloques dialoguistas (`UCR`, `Hacemos Coalición Federal`, `Innovación Federal`) pueden voltearte el capítulo de privatizaciones o jubilaciones a menos que cedas en vivo o retires ese artículo para salvar el resto de la ley.

### 3.2. Rueda Intradía del BCRA y Simulación de Corrida Cambiaria ("Minuto a Minuto")
Cuando se dispara una crisis cambiaria o anunciás la salida del cepo, en vez de que sea solo un número que cambia al pasar de mes, abrir una **Simulación de Rueda Cambiaria de 10 segundos (10:00 hs a 15:00 hs)**:
* Ves la pantalla del **MULC (Mercado Único y Libre de Cambios)** con ofertas de cerealeras y demanda de importadores y bancos.
* El precio del CCL y el Riesgo País se mueven tick a tick en un gráfico de velas en vivo.
* Tenés 3 botones de intervención de emergencia en caliente mientras corre la rueda:
  1. **Rifar Reservas del BCRA** (frena la suba del dólar hoy pero te vacía las arcas).
  2. **Subir la Tasa de Política Monetaria de emergencia (+1500 bps)** (frena el dólar pero te hunde el PBI y encarece el roll-over del Tesoro).
  3. **Llamar a los Bancos y Cerealeras ("Mesa de Dinero")** (gasta capital político o promete dólar blend para que liquiden en los últimos minutos de la rueda).

### 3.3. Noche Electoral con Telegramas por Provincia y "Mesas Testigo"
Hoy el modal de `ElectionNightModal` muestra el escrutinio nacional y el mapa de resultados, pero podemos llevar la adrenalina al máximo:
* **Carga progresiva del escrutinio del 0% al 99,4% en 15 segundos:** Primero entran las mesas de Córdoba, Mendoza y CABA (que suelen cargarse más rápido y dan ventaja a fuerzas liberales/centro-derecha), y recién a partir del 65% de mesas escrutadas empiezan a entrar de golpe los telegramas de **La Matanza, Lomas de Zamora, Quilmes y Moreno (Tercera y Primera Sección Electoral de PBA)** dando vuelta o achicando la elección minuto a minuto.
* **Búnker Electoral en Vivo:** Comentarios dinámicos del jefe de campaña (*"Están entrando las mesas de Mar del Plata, descontamos dos puntos.."*, *"Cuidado que todavía falta cargar el 40% del Conurbano Sur.."*).

### 3.4. Simulador de Debates Presidenciales y Conferencias de Prensa con "Chicanas"
En los meses previos a las Generales y al Balotaje (o tras un escándalo de gabinete):
* Un duelo por turnos cortos con **Derechos a Réplica (30 segundos)** frente a los otros candidatos.
* Elegís el tono de cada intervención: **Técnico-Ortodoxo** (suma en clase media/mercados, aburre al voto blando), **Chicana al Hueso** (sube fervor militante y viralidad en redes, espanta moderados) o **Institucional-Moderado** (suma indecisos, te deja tibio frente a tu núcleo duro).
* Medidor en vivo de **Impacto en Redes vs. Credibilidad Institucional**.

### 3.5. Cumbre de Gobernadores ("Pacto Federal") y Toma y Daca Interactivo
Una mesa redonda interactiva donde se sientan los **24 gobernadores** agrupados por ligas regionales (*Liga Patagónica, Norte Grande, Región Centro, PBA y CABA*):
* Podés negociar paquetes cruzados en una sola sesión: obras de infraestructura vial/energética, transferencia de cajas previsionales, alícuota de Aportes del Tesoro Nacional (ATN) y coparticipación del Impuesto al Cheque a cambio de que instruyan a sus senadores y diputados a votar tu paquete fiscal.

### 3.6. Crisis Institucionales Extremas: Juicio Político, Acefalía y Helicóptero
Si jugás al límite con la gobernabilidad por el piso, inflación desbordada y sin escudo legislativo (menos de 1/3 de la Cámara):
* **Comisión de Juicio Político:** Se activa un proceso de varias etapas donde tenés que quebrar la mayoría especial de **2/3 de Diputados (172 votos)** para evitar la acusación, o defenderte en el **Senado** para evitar la destitución.
* **Rebelión del Vicepresidente:** Si la relación con tu Vicepresidente cae a cero por desplazarlo de las decisiones, empieza a operar con bloques opositores en el Senado para habilitar sesiones especiales en tu contra.

---

## 4. Mejoras de Inmersión, Audio Diegético y UX Táctica

### 4.1. Zócalo de Noticias en Vivo ("El Ticker de la Rosca")
Una cinta inferior opcional en la pantalla de juego que imita los zócalos de la televisión argentina cambiando de estilo según lo que esté pasando en el país:
* **Placa Roja estilo Crónica TV** cuando explota una corrida, renuncia un ministro o hay paro general (*"ÚLTIMO MOMENTO: SE DISPARA EL RIESGO PAÍS Y HAY TENSIÓN EN LA CITY"*).
* **Cinta Financiera estilo Bloomberg / Ámbito** durante días hábiles normales con cotizaciones de Soja Chicago, Brent, Litio, Merval en USD y Bonos Globales.

### 4.2. Paisaje Sonoro Diegético (Web Audio API / Sintetizador Táctico)
Expandir el motor de sonido (`gameFeedback.ts`) para que cada pantalla tenga su firma acústica sin necesitar archivos MP3 pesados:
* **Chicharra oficial de llamada a votar del Congreso** cuando se abre el tablero electrónico de Diputados o Senado.
* **Golpe seco de sello de goma y pluma** al firmar un DNU o vetar una ley.
* **Murmullo de recinto / rotativa de imprenta** al abrir la tapa del diario del mes.
* **Teletipo de mercado** cuando cambian bruscamente los indicadores de inflación o reservas.

### 4.3. Comparador Histórico de Mandatos ("El Archivo de la Historia")
Al terminar los 4 años de mandato (o en cualquier momento desde la pestaña de Indicadores):
* Poder superponer tus curvas de **Inflación, PBI, Pobreza, Salario Real en USD y Reservas** contra líneas de referencia históricas argentinas (*Convertibilidad 1991-2001, Rebote Post-2003, Estanflación 2011-2023, Ajuste 2024-2026*) para ver en qué lugar de la historia económica quedaste parado.
* **Pantalla Final de Legado Histórico:** Un libro de historia argentino de 2045 que redacta el capítulo de tu presidencia según tus métricas reales, las leyes que sancionaste y si lograste la reelección o terminaste entregando el bastón antes de tiempo.

---

## 5. Orden Recomendado de Implementación (Por Impacto vs. Complejidad)

| Prioridad | Módulo Propuesto | Impacto Visual / Jugable | Complejidad Técnica |
| :--- | :--- | :--- | :--- |
| **1. Alta** | **Monumentos, Vaca Muerta, Litio y Gasoductos 3D en el Mapa** | Altísimo (transforma el mapa de fondo) | Media (mallas procedurales Three.js) |
| **2. Alta** | **Votación En General vs. En Particular (Capítulos de Leyes)** | Altísimo (realismo parlamentario puro) | Media (extensión del modal nominal) |
| **3. Alta** | **Noche Electoral Progresiva (Mesas Testigo + Carga del Conurbano)** | Altísimo (tensión dramática en elecciones) | Baja-Media |
| **4. Media** | **Rueda Intradía del BCRA (Mini-simulación de Corrida Cambiaria)** | Muy Alto (hace tangible la macroeconomía) | Media |
| **5. Media** | **Hemiciclo 3D con Cámara Orbital en Votaciones** | Altísimo (espectáculo visual) | Media-Alta (escena Three.js dedicada) |
| **6. Media** | **Zócalo de TV Dinámico + Chicharra de Quórum en Congreso** | Alto (inmersión constante) | Baja |
| **7. Futura** | **Despacho Presidencial 3D Interactivo en Casa Rosada** | Altísimo | Alta |
