# Especificación de Roles, Sistemas de Gobierno y Arquitectura de Pantallas: "La Rosca"

Mirá, te armé este documento exhaustivo para que dejemos de dar vueltas en el aire y tengamos TODO bien bajado a tierra antes de tirar una sola línea de código en TypeScript o en React. Vos me dijiste claramente: *"No programes nada, hacer un MD definiendo también qué debería ver cada ROL, hacé una carpeta llamada docs y poné ahí todos los MD y por cada implementación que hagamos quiero que lo planees bien para que yo te lo acepte"*.

Acá tenés el plan maestro completo. Nada de humo de asistente virtual ni frases de manual corporativo.. esto es la radiografía pura de cómo se juega, qué ve cada uno de los cuatro roles, cómo funcionan los 29 sectores del RIGI, los 17 impuestos reales (separando decreto de ley), las dos cámaras del Congreso con sus 257 diputados y 72 senadores, el sistema de apoyos de figuras políticas y la batalla electoral provincia por provincia.

---

## 0. Aclaración Fundamental: NADA se quita de lo existente, TODO se potencia

Que quede clarísimo desde el arranque porque ni en pedo vamos a tirar a la basura el laburo que ya hicimos:
- **La sección "Medidas" NO se quita:** Sigue estando 100% activa con sus 12 sectores (precios, empleo, industria, agro, etc.), sus decretos temporales y permanentes, y sus efectos directos en el motor de simulación.
- **La sección "Política económica" NO se quita:** Sigue con sus palancas macro (-2 a +2) y la calibración fina de la Mesa de Dinero del BCRA y CAMMESA.
- **"Despacho", "Gabinete", "Registro", "Indicadores", "Financiamiento" y "Territorio y Defensa":** Todo eso se MANTIENE.
- Lo que se agrega son las capas que faltaban de la política y la economía real que me pediste:
  1. La sección **RIGI** ahora pasa a tener los **29 sectores oficiales** (en vez de ser genérico).
  2. La sección **Impuestos** ahora pasa a tener los **17 tributos reales** clasificados por Decreto vs Ley.
  3. La sección **Cámaras** (en el grupo Político / Congreso) suma los dos **Hemiciclos interactivos de 257 Diputados y 72 Senadores**, con quórum y rosca de bloques.
  4. Se incorpora la pestaña **Apoyos** (con el carrusel de dirigentes y los pases de partido).
  5. Se incorpora la pestaña **Partido en las provincias** (con los 4 turnos desdoblados y los donuts electorales).

Acá tenés el mapa completo del Menú Lateral (Sidebar) para que veas cómo conviven todas las secciones:

```
+----------------------------------------------------------------------------------------------------+
|                                    MAPA GENERAL DEL MENÚ LATERAL (SIDEBAR)                         |
+----------------------+---------------------------------+-------------------------------------------+
| GRUPO                | SECCIÓN                         | ESTADO Y CONTENIDO                        |
+----------------------+---------------------------------+-------------------------------------------+
| DESPACHO             | · Despacho                      | Existente: Resumen del mandato y alertas  |
|                      | · Gabinete                      | Existente: Ministerios y secretarías      |
|                      | · Registro                      | Existente: Historial de decretos y leyes  |
+----------------------+---------------------------------+-------------------------------------------+
| ECONOMÍA             | · Indicadores                   | Mejorado: 38+ variables con colores vivos |
|                      | · Política económica            | Mejorado: Palancas y calibración BCRA     |
|                      | · Medidas                       | SE CONSERVA: 12 sectores y decretos       |
|                      | · CAMMESA y Paritarias          | Existente: Subsidios y salarios           |
+----------------------+---------------------------------+-------------------------------------------+
| PRESUPUESTO          | · Financiamiento                | Existente: Deuda, letras y FMI            |
|                      | · Impuestos                     | NUEVO: Los 17 tributos (Decreto vs Ley)   |
|                      | · Impuestos propios             | Existente / Provincial según rol          |
|                      | · RIGI                          | NUEVO: Grilla completa de los 29 sectores |
+----------------------+---------------------------------+-------------------------------------------+
| POLÍTICA Y CONGRESO  | · Cámaras (Diputados y Senado)  | NUEVO: Hemiciclos 257 y 72 + Gobernabilidad|
|                      | · Apoyos y Figuras              | NUEVO: Carrusel de dirigentes y pases     |
|                      | · Votaciones y Corte Suprema    | Existente: Pliegos y proyectos            |
+----------------------+---------------------------------+-------------------------------------------+
| FEDERALISMO Y DEF.   | · Partido en las Provincias     | NUEVO: Turnos 2030-2033 y donuts elect.   |
|                      | · 24 Provincias y FF.AA.        | Existente: Recursos provinciales y defensa|
+----------------------+---------------------------------+-------------------------------------------+
```

---

## 1. La Filosofía de los Cuatro Roles: Qué ve y qué juega cada uno

En la mayoría de los juegos te ponen un cartel que dice "Elegí tu cargo" pero después todas las pantallas son idénticas y solo te cambia el título arriba a la izquierda. Eso es una estafa. Si elegís ser Presidente no podés estar decidiendo si arreglás la vereda de un hospital en Formosa; y si sos Gobernador, no podés tener un botón para devaluar el tipo de cambio oficial o subir la tasa de política monetaria del BCRA porque te van a meter un cachetazo judicial y una intervención federal al segundo día..

Cada rol tiene su propio campo de batalla, sus propias armas, sus límites constitucionales y su propia forma de perder o ganar la partida:

```
+----------------------------------------------------------------------------------------------------+
|                                    LOS CUATRO ROLES DE "LA ROSCA"                                   |
+------------------------------------+---------------------------------------------------------------+
| ROL                                | ÁMBITO PRINCIPAL, BOTONERA Y FOCO JUGABLE                     |
+------------------------------------+---------------------------------------------------------------+
| 1. Presidente de la Nación         | La macro, el BCRA, Gabinete, DNU, Vetos, RIGI nacional,       |
|                                    | 17 impuestos, relación con gobernadores y cámaras.            |
+------------------------------------+---------------------------------------------------------------+
| 2. Gobernador de Provincia         | Caja provincial, IIBB, regalías, coparticipación / ATN,       |
|                                    | policía local, cuasimonedas ("Chachos"), liga de gobernadores.|
+------------------------------------+---------------------------------------------------------------+
| 3. Diputado Nacional               | El quórum de 129, comisiones, dictámenes de mayoría/minoría,  |
|                                    | mociones de privilegio, votos artículo por artículo, rosca.   |
+------------------------------------+---------------------------------------------------------------+
| 4. Senador Nacional                | Los 72 votos provinciales, pliegos de jueces / embajadores /  |
|                                    | BCRA, juicio político, coparticipación como cámara de origen. |
+------------------------------------+---------------------------------------------------------------+
```

---

### Rol 1: Presidente de la Nación (El sillón de Rivadavia)

El Presidente es el rol más macro y estratégico. Tenés la botonera de la Casa Rosada y la Quinta de Olivos, pero estás sentado arriba de un polvorín donde cualquier chispa te vuela el gobierno por el aire:

#### Pantallas y Módulos que VE el Presidente:
1. **Despacho Presidencial / Tablero de Comando:**
   - Métricas de supervivencia: Popularidad / Aprobación pública (0-100), Riesgo País (bps), Inflación mensual y anualizada, Reservas Netas del BCRA (en millones de USD, con alerta roja si están negativas), Resultado Fiscal Primario y Financiero (% PBI).
   - Nivel de conflictividad social y piquetes (días de paro general de la CGT, marchas en Plaza de Mayo).
2. **Mesa de Dinero BCRA & Secretaría de Energía:**
   - La botonera de calibración fina que rediseñamos:
     - *Crawling Peg:* Pisado al 1% o 2% (ancla de precios pero quema reservas) vs Devaluación al ritmo de la inflación (cuida reservas pero traslada fuego a la góndola).
     - *TNA LEFI / Pases / Deuda corta:* Tasa real positiva (enfría la economía pero engorda el déficit cuasifiscal) vs Tasa licuadora negativa (achica la deuda pero te empuja los pesos al dólar blue).
     - *Encajes bancarios:* Para regular liquidez de los bancos y evitar corridas sobre depósitos.
     - *CAMMESA y Tarifas de Energía:* Subsidiar luz/gas para cuidar el bolsillo popular (costo fiscal brutal) vs sincerar tarifas al 100% (baja el gasto pero desata cacerolazos y salta la inflación de regulados).
3. **El RIGI Nacional (Régimen de Incentivo para Grandes Inversiones):**
   - Catálogo federal completo de 29 sectores.
   - Habilitar o quitar regímenes sectoriales, definir el proyecto mínimo de inversión, seguir la madurez y proyectos en marcha, monitoreando el conflicto social y el costo fiscal a cambio de las exportaciones y el empleo proyectado.
4. **Matriz Tributaria Nacional (17 Impuestos Reales):**
   - Desglose de recaudación: 23,54% del PBI total.
   - Poder de fuego inmediato: 6 impuestos que el Presidente puede tocar por Decreto / Resolución ministerial (Retenciones al campo, energía e industria, aranceles de importación e impuestos a los combustibles).
   - Los 11 impuestos de Ley: Subir o bajar IVA, Ganancias, Cheque o Bienes Personales requiere negociar y mandar proyecto al Congreso.
5. **Cámaras Legislativas (El Hemiciclo de 257 Diputados y 72 Senadores):**
   - Monitoreo del Quórum, Bloque Propio, Gobernabilidad (%) y Capacidad de Negociación.
   - Tabla de relación política con cada fuerza partidaria (LLA, UxP, PRO, UCR, Peronismo Federal, FIT, etc.).
   - Envío de Proyectos de Ley, emisión de DNU (Decretos de Necesidad y Urgencia sujetos a la Comisión Bicameral Permanente) y Poder de Veto (Veto total o parcial, con riesgo de que el Congreso insista con 2/3).
6. **Partido en las Provincias y Comando de Campaña Provincial:**
   - Administración del presupuesto de campaña para sostener o ganar las 24 provincias.
   - Seguimiento del calendario electoral desdoblado (cuatro turnos electorales de 6 provincias cada uno: Turno 2030, 2031, 2032, 2033).
   - Donut charts con intención de voto para la fórmula propia frente a candidatos locales.
   - Mapa de Gobernadores con opción extrema de **Intervención Federal** (Art. 6 CN) si una provincia se desborda o se declara en rebeldía fiscal.
7. **Red de Apoyos Políticos y Fugas de Partido:**
   - Tablero de figuras políticas dialoguistas y dogmáticas.
   - Toggles interactivos para pedir apoyo público (sube imagen) o seducir dirigentes para que salten a tu espacio partidario (salto de bancada con probabilidad 20 pp menor).

---

### Rol 2: Gobernador de Provincia (El Señor Feudal)

El Gobernador juega un juego completamente distinto. No maneja la política monetaria ni la relación con el FMI, pero tiene en sus manos el territorio real, la policía armada provincial y el control de los servicios básicos (escuelas y hospitales).

#### Qué NO VE ni maneja el Gobernador:
- No ve la mesa de dinero del BCRA ni puede fijar el tipo de cambio ni las tasas nacionales.
- No cobra ni fija el IVA general ni los derechos de exportación (retenciones) ni los aranceles aduaneros nacionales.
- No decide sobre el presupuesto del Estado Nacional.

#### Pantallas y Módulos que VE el Gobernador:
1. **Casa de Gobierno Provincial / Tesorería de la Provincia:**
   - *Recaudación Provincial Propia:* Ingresos Brutos (IIBB) —el impuesto más distorsivo pero que sostiene el 70% de los recursos propios provinciales—, Impuesto Inmobiliario (Urbano y Rural), Sellos y Patentes Automotor.
   - *Regalías:* Regalías hidrocarburíferas en provincias petroleras (Neuquén, Chubut, Santa Cruz, Mendoza) o regalías mineras (San Juan, Catamarca, Salta, Jujuy).
   - *La Canilla Nacional:* Coparticipación Federal de Impuestos recibida por goteo diario automático vs Transferencias Discrecionales (ATN y obras nacionales) que el Presidente te abre o te cierra según si tus diputados le votan las leyes.
2. **Gasto Provincial y Paritarias:**
   - La masa salarial pública: Sueldos de docentes provinciales (CERA / gremios locales), médicos de hospitales provinciales, y personal de la Policía Provincial.
   - Si no hay plata para paritarias: huelgas por tiempo indeterminado, escuelas cerradas y riesgo de amotinamiento policial (la pesadilla de cualquier gobernador).
3. **El Botón Rojo Provincial: Las Cuasimonedas ("Chachos", "Patacones", "Bocade"):**
   - Si el Presidente te corta los giros discrecionales y no tenés reservas para pagar sueldos, podés promulgar por ley provincial la emisión de **bonos de cancelación de deuda / cuasimonedas**.
   - Efectos: Pagás los sueldos y zafás del estallido inmediato, pero los comerciantes locales te aplican un recargo del 20% o 30%, la gente se enfurece y tu relación con la Casa Rosada se rompe por completo.
4. **Comandos de Presión y Ligas de Gobernadores:**
   - Armar frentes regionales con provincias vecinas: Liga del Norte Grande, Liga Patagónica (con la amenaza de cortar el suministro de gas y crudo hacia Buenos Aires), o Región Centro (Córdoba, Santa Fe, Entre Ríos con el reclamo agropecuario).
   - Coordinar con tus pares provinciales para bloquear iniciativas presidenciales en el Senado o exigir aumentos en el piso del impuesto a las Ganancias coparticipable.
5. **Tus Bancas en el Congreso Nacional:**
   - El Gobernador tiene una mini-pestaña estratégica: *"Mis Legisladores en Buenos Aires"*.
   - Podés ordenarle a tus 3, 4 o 5 diputados nacionales y a tus 2 o 3 senadores que den o quiten quórum, o que voten a favor/en contra de un proyecto de la Rosada. Esta es tu moneda de cambio para negociar obra pública para tu provincia.

---

### Rol 3: Diputado Nacional (El Barro Parlamentario y las 257 Bancas)

Ser Diputado Nacional no es ser espectador: es jugar en el barro de la negociación minuto a minuto. El juego acá se vive desde el recinto de la Cámara Baja.

#### Qué VE el Diputado:
1. **El Hemiciclo de 257 Bancas en Tiempo Real:**
   - El tablero visual con los 257 escaños pintados con los colores de los bloques.
   - **El Tablero de Quórum (El número 129):**
     - Reloj de 30 minutos de tolerancia para que bajen 129 diputados a sentarse a la banca y habilitar la sesión.
     - Lista de presentes, ausentes con aviso y diputados "remolones" que están negociando en el Salón de Pasos Perdidos a cambio de fondos o cargos en comisiones.
2. **Trabajo en Comisiones:**
   - Pertenecer a comisiones clave: Presupuesto y Hacienda, Asuntos Constitucionales, Legislación General, Juicio Político.
   - La batalla de dictámenes: Dictamen de Mayoría vs Dictámenes de Minoría. Si tu espacio no junta las firmas de comisión, la ley no puede tratarse en el recinto a menos que consigas dos tercios (2/3) de los votos para un tratamiento sobre tablas.
3. **Mecánica de Votación en el Recinto:**
   - Votación en General: Aprueba la idea global de la ley.
   - Votación en Particular (Artículo por Artículo): Acá se define el destino de un gobierno. Podés votar a favor en general pero votar en contra de un inciso de facultades extraordinarias, un capítulo de privatizaciones o un régimen fiscal, desguazando la ley por completo (como pasó históricamente con la Ley Ómnibus).
4. **Disciplina de Bloque vs Traición y Rebelión:**
   - Indicador de "Disciplina Partidaria": Si votás lo que manda el jefe de bloque, sumás puntos de aparato y te aseguran un lugar en la lista para reelegir en la próxima elección legislativa.
   - Si te rebelás o armás un monobloque propio: Podés negociar directamente con el Poder Ejecutivo tus votos sueltos a cambio de obras para tu municipio o provincia, pero corrés el riesgo de que tu partido te eche, te llamen "traidor" en los medios y te filtren carpetazos.
5. **Operaciones Políticas y Carpetazos:**
   - Usar tu influencia para pedir mociones de privilegio, interpelar a ministros de la Nación o denunciar irregularidades de adversarios para voltear su imagen pública antes de una votación crítica.

---

### Rol 4: Senador Nacional (Los 72 Votos de las Provincias y el Tribunal)

El Senado de la Nación es el santuario de las provincias: 72 bancas (3 por cada provincia: 2 por el partido que ganó y 1 por la primera minoría). Acá no hay proporcionalidad poblacional: el voto de un senador de Tierra del Fuego vale exactamente lo mismo que el voto de un senador de la Provincia de Buenos Aires.

#### Qué VE el Senador:
1. **El Hemiciclo de 72 Senadores:**
   - Arcos concéntricos con los 72 puntos.
   - **Quórum Estricto: 37 Senadores.**
   - Cada voto es quirúrgico: con dos o tres senadores indecisos se gana o se pierde una ley histórica.
2. **La Comisión de Acuerdos (La Aduana del Estado):**
   - El Presidente NO puede nombrar a quien quiera en los puestos vitalicios del Estado sin la aprobación del Senado.
   - Tratar y votar pliegos para:
     - Jueces de la Corte Suprema de Justicia de la Nación (mayoría calificada de 2/3 de los presentes).
     - Jueces y fiscales de Cámaras Federales en todo el país.
     - Embajadores políticos en el exterior.
     - Ascensos de la cúpula militar de las Fuerzas Armadas.
     - Designación del Presidente y Directorio del Banco Central (BCRA).
3. **Cámara de Origen Federal Obligatoria:**
   - La Constitución Nacional (Art. 75 inc. 2) exige que cualquier modificación del régimen de **Coparticipación Federal de Impuestos** o leyes marco de desarrollo regional nazca obligatoriamente en el Senado. Si el Presidente manda una ley de coparticipación a Diputados, es nula de nulidad absoluta.
4. **El Senado como Tribunal de Juicio Político (Art. 59 y 60 CN):**
   - Cuando la Cámara de Diputados vota la acusación (el impeachment) contra el Presidente, el Vicepresidente o jueces de la Corte, el Senado se transforma en **Tribunal Judicial**.
   - Los senadores prestan juramento especial.
   - Se debate la destitución: si dos tercios (2/3) de los senadores presentes votan la culpabilidad, el Presidente queda destituido en el acto y asume la línea de sucesión presidencial.
5. **La Doble Lealtad del Senador:**
   - Un dilema que vas a tener que gestionar en cada turno: ¿le obedecés al Presidente de tu partido nacional, o le obedecés al Gobernador de tu provincia que te puso en la boleta? Si el Presidente te pide que votes una ley que le quita fondos a tu provincia, tu lealtad se pone a prueba al 100%.

---

## 2. El Catálogo Completo del RIGI: Los 29 Sectores Reales

El RIGI (Régimen de Incentivo para Grandes Inversiones) no es una variable abstracta: es un tablero interactivo con los **29 sectores y ramas productivas** definidos con exactitud de datos reales, proyectos mínimos, madurez, empleo, impacto fiscal y conflictividad:

```
+----+----------------------------------------+----------------+----------+-----------+-------------+------------+-------------+---------------+
| #  | SECTOR / PROYECTO                      | RAMA           | MIN. USD | INV. REG. | EXPORTACIONES| EMPLEO     | COSTO FISC. | CONFLICTIVIDAD|
+----+----------------------------------------+----------------+----------+-----------+-------------+------------+-------------+---------------+
| 1  | Minería de cobre                       | Minería        | 200 M    | +0,45 pp  | +3,2 mil M  | -0,050 pp  | 0,030 % PIB | 12 % mensual  |
| 2  | Litio                                  | Minería        | 200 M    | +0,30 pp  | +2,0 mil M  | -0,030 pp  | 0,020 % PIB | 10 % mensual  |
| 3  | Oro y plata                            | Minería        | 200 M    | +0,20 pp  | +1,8 mil M  | -0,030 pp  | 0,020 % PIB | 10 % mensual  |
| 4  | Potasio y fertilizantes                | Minería        | 200 M    | +0,12 pp  | +0,8 mil M  | -0,020 pp  | 0,010 % PIB | 5 % mensual   |
| 5  | Petróleo (shale y convencional)        | Energía        | 200 M    | +0,55 pp  | +4,5 mil M  | -0,050 pp  | 0,040 % PIB | 8 % mensual   |
| 6  | Gas natural                            | Energía        | 200 M    | +0,30 pp  | +1,5 mil M  | -0,030 pp  | 0,020 % PIB | 5 % mensual   |
| 7  | Gas natural licuado (GNL)              | Energía        | 500 M    | +0,35 pp  | +3,0 mil M  | -0,040 pp  | 0,030 % PIB | 10 % mensual  |
| 8  | Oleoductos y gasoductos                | Energía        | 250 M    | +0,20 pp  | +0,5 mil M  | -0,020 pp  | 0,020 % PIB | 5 % mensual   |
| 9  | Energías renovables                    | Energía        | 200 M    | +0,25 pp  | +0,3 mil M  | -0,030 pp  | 0,020 % PIB | 4 % mensual   |
| 10 | Hidrógeno verde                        | Energía        | 200 M    | +0,12 pp  | +0,8 mil M  | -0,010 pp  | 0,015 % PIB | 4 % mensual   |
| 11 | Energía nuclear                        | Energía        | 300 M    | +0,10 pp  | +0,3 mil M  | -0,015 pp  | 0,015 % PIB | 15 % mensual  |
| 12 | Líneas de transmisión eléctrica        | Infraestructura| 200 M    | +0,12 pp  | +0,1 mil M  | -0,020 pp  | 0,010 % PIB | 3 % mensual   |
| 13 | Puertos y vías navegables              | Infraestructura| 200 M    | +0,12 pp  | +0,6 mil M  | -0,020 pp  | 0,010 % PIB | 4 % mensual   |
| 14 | Ferrocarriles de carga                 | Infraestructura| 250 M    | +0,15 pp  | +0,4 mil M  | -0,025 pp  | 0,015 % PIB | 5 % mensual   |
| 15 | Concesiones viales                     | Infraestructura| 200 M    | +0,15 pp  | +0,1 mil M  | -0,030 pp  | 0,015 % PIB | 4 % mensual   |
| 16 | Telecomunicaciones y fibra óptica      | Tecnología     | 200 M    | +0,12 pp  | +0,1 mil M  | -0,020 pp  | 0,010 % PIB | 2 % mensual   |
| 17 | Centros de datos e IA                  | Tecnología     | 200 M    | +0,15 pp  | +0,4 mil M  | -0,010 pp  | 0,015 % PIB | 4 % mensual   |
| 18 | Aeroespacial y satélites               | Tecnología     | 200 M    | +0,04 pp  | +0,2 mil M  | -0,005 pp  | 0,005 % PIB | 2 % mensual   |
| 19 | Biotecnología y farmacéutica           | Industria      | 200 M    | +0,10 pp  | +0,5 mil M  | -0,015 pp  | 0,010 % PIB | 2 % mensual   |
| 20 | Siderurgia y metales                   | Industria      | 250 M    | +0,12 pp  | +0,6 mil M  | -0,020 pp  | 0,010 % PIB | 5 % mensual   |
| 21 | Petroquímica                           | Industria      | 250 M    | +0,12 pp  | +0,7 mil M  | -0,020 pp  | 0,010 % PIB | 6 % mensual   |
| 22 | Automotriz y autopartes                | Industria      | 200 M    | +0,10 pp  | +0,9 mil M  | -0,020 pp  | 0,012 % PIB | 3 % mensual   |
| 23 | Industria naval                        | Industria      | 200 M    | +0,04 pp  | +0,2 mil M  | -0,010 pp  | 0,005 % PIB | 3 % mensual   |
| 24 | Agroindustria y alimentos              | Agro           | 200 M    | +0,14 pp  | +1,2 mil M  | -0,030 pp  | 0,010 % PIB | 3 % mensual   |
| 25 | Forestoindustria y celulosa            | Agro / Silvi   | 200 M    | +0,10 pp  | +0,7 mil M  | -0,020 pp  | 0,010 % PIB | 6 % mensual   |
| 26 | Pesca y acuicultura                    | Marítimo       | 200 M    | +0,06 pp  | +0,5 mil M  | -0,015 pp  | 0,008 % PIB | 5 % mensual   |
| 27 | Turismo e infraestructura turística    | Servicios      | 200 M    | +0,08 pp  | +0,4 mil M  | -0,025 pp  | 0,010 % PIB | 2 % mensual   |
| 28 | Economía del conocimiento y servicios  | Servicios / TIC| 200 M    | +0,12 pp  | +1,0 mil M  | -0,025 pp  | 0,012 % PIB | 1 % mensual   |
| 29 | Desarrollos inmobiliarios y viviendas   | Construcción   | 200 M    | +0,15 pp  | +0,0 mil M  | -0,040 pp  | 0,015 % PIB | 3 % mensual   |
+----+----------------------------------------+----------------+----------+-----------+-------------+------------+-------------+---------------+
```

#### Mecánicas del RIGI en el Simulador:
- **Botón "Habilitar / Quitar Régimen":** Al adherir un sector, se disparan incentivos tributarios (exención de aranceles de importación de bienes de capital, libre disponibilidad de divisas a partir del año 3 y tasa de Ganancias reducida al 25%).
- **Línea de Madurez y Pipeline de Inversiones:** Los proyectos no aparecen de un día para el otro. Cada sector tiene una barra de madurez porcentual (ej: 0% a 100%) y un conteo de proyectos aprobados con su monto acumulado (ej. GNL: 5 proyectos por 5.350 M USD con madurez 100%; Minería de cobre: 4 proyectos por 1.614 M USD con madurez 81%).
- **Efectos cruzados:** Aumenta la inversión privada y las exportaciones a futuro (inyección genuina de dólares que relaja la restricción externa), pero a corto plazo tiene costo fiscal por desgravaciones impositivas y puede disparar conflictividad ambiental o sindical según la rama.

---

## 3. La Estructura Tributaria: Los 17 Impuestos Reales

En la Argentina el Presidente no puede cambiar los impuestos a piacere como si fuera un emperador romano. Hay impuestos que son potestad delegada del Ejecutivo y otros que están blindados por el principio de legalidad tributaria (Art. 17 y 99 inc. 3 de la Constitución: **los DNU no pueden legislar en materia tributaria ni penal**).

La recaudación total de referencia del sistema alcanza **23,54% del PBI** (equivalente a unos **13.540 millones de USD mensuales** en una economía de escala normal):

```
+-----------------------------------------------------------------------------------------------------------------------------+
|                                             SISTEMA DE LOS 17 IMPUESTOS NACIONALES                                          |
+----+------------------------------------+-----------------+-------------+-------------+------------+------------+-----------+
| #  | NOMBRE DEL TRIBUTO                 | CATEGORÍA       | ALÍCUOTA    | INICIAL     | RECAUDACIÓN| USD/MES    | VÍA LEGAL |
+----+------------------------------------+-----------------+-------------+-------------+------------+------------+-----------+
| 1  | Retenciones: Soja                  | Comercio Ext.   | 20 %        | 24 %        | 1,10 % PIB | 632 M USD  | DECRETO   |
| 2  | Retenciones: Maíz y Trigo          | Comercio Ext.   | 5 %         | 8,5 %       | 0,45 % PIB | 258 M USD  | DECRETO   |
| 3  | Retenciones: Carne y Lácteos       | Comercio Ext.   | 3 %         | 5 %         | 0,18 % PIB | 103 M USD  | DECRETO   |
| 4  | Retenciones: Industria y Energía   | Comercio Ext.   | 2 %         | 3 %         | 0,12 % PIB | 69 M USD   | DECRETO   |
| 5  | Aranceles de Importación (AEC)     | Comercio Ext.   | 8 %         | 11 %        | 0,65 % PIB | 373 M USD  | DECRETO   |
| 6  | Combustibles Líquidos (ICL / IDC)  | Consumo         | 49 %        | 100 % índice| 0,55 % PIB | 316 M USD  | DECRETO   |
| 7  | IVA General                        | Consumo         | 18 %        | 21 %        | 6,80 % PIB | 3.910 M USD| POR LEY   |
| 8  | IVA Reducido (alimentos / salud)   | Consumo         | 10,5 %      | 10,5 %      | 1,20 % PIB | 690 M USD  | POR LEY   |
| 9  | Impuestos Internos (autos, tabaco) | Consumo         | 9 %         | 10 %        | 0,90 % PIB | 517 M USD  | POR LEY   |
| 10 | Ganancias: Sociedades              | Renta           | 35 %        | 35 %        | 2,90 % PIB | 1.667 M USD| POR LEY   |
| 11 | Ganancias: Personas Humanas        | Renta           | 35 %        | 35 %        | 2,10 % PIB | 1.207 M USD| POR LEY   |
| 12 | Impuesto a los Dividendos          | Renta           | 7 %         | 7 %         | 0,25 % PIB | 143 M USD  | POR LEY   |
| 13 | Régimen Simplificado (Monotributo) | Renta / Régimen | 100 % índice| 100 % índice| 0,40 % PIB | 230 M USD  | POR LEY   |
| 14 | Contribuciones Patronales          | Trabajo         | 20,4 %      | 20,4 %      | 2,85 % PIB | 1.638 M USD| POR LEY   |
| 15 | Aportes Personales Jubilatorios    | Trabajo         | 17 %        | 17 %        | 2,10 % PIB | 1.207 M USD| POR LEY   |
| 16 | Impuesto sobre Créditos y Débitos  | Financiero      | 1,20 %      | 1,20 %      | 1,35 % PIB | 776 M USD  | POR LEY   |
| 17 | Bienes Personales                  | Patrimonio      | 0,50 %      | 0,50 %      | 0,39 % PIB | 224 M USD  | POR LEY   |
+----+------------------------------------+-----------------+-------------+-------------+------------+------------+-----------+
```

#### Reglas de Simulación de la Matriz Impositiva:
1. **Los 6 Impuestos por Decreto:**
   - Podés mover el slider o valor directamente en la pantalla de Hacienda. El efecto sobre la caja del Tesoro, la inflación y los sectores productivos se aplica de forma INMEDIATA en el siguiente turno mensual.
   - *Riesgo político:* Si subís las retenciones al campo, los productores te paran la comercialización de granos y se te dispara la protesta agraria; si bajás los combustibles líquidos, baja la inflación pero te queda un agujero fiscal gigante.
2. **Los 11 Impuestos que requieren Ley:**
   - No se aplican con un clic. Al mover la alícuota deseada, el panel te avisa: *"Requiere aprobación del Congreso Nacional. Se redactará un Proyecto de Reforma Tributaria"*.
   - El proyecto pasa a la Comisión de Presupuesto y Hacienda de Diputados, y tenés que conseguir el quórum de 129 y la mayoría simple para que pase al Senado.

---

## 4. Las Cámaras Legislativas: Hemiciclos de 257 Diputados y 72 Senadores

La representación visual del poder legislativo tiene que ser un espectáculo visual interactivo basado exactamente en las capturas de infografía parlamentaria que aportaste:

### 4.1. Cámara de Diputados de la Nación (257 Bancas)
- **Hemiciclo semicircular reactivo:** Arcos concéntricos con 257 esferas que representan las bancas, pintadas según la bancada de cada diputado:
  - *La Libertad Avanza (LLA):* Violeta (#8b5cf6 / #a855f7)
  - *Unión por la Patria (UxP):* Celeste (#38bdf8 / #0284c7)
  - *Propuesta Republicana (PRO):* Amarillo (#eab308 / #facc15)
  - *Unión Cívica Radical (UCR):* Rojo y blanco (#ef4444 / #dc2626)
  - *Peronismo Federal / Hacemos Coalición Federal:* Azul oscuro (#1e40af / #2563eb)
  - *Innovación Federal / Provincialistas:* Azul noche (#1d4ed8)
  - *Frente de Izquierda (FIT):* Rojo fuego (#b91c1c)
  - *Otros / Monobloques:* Varios colores identificatorios.
- **Gráfico Donut de Diversidad Parlamentaria:** Porcentaje Hombres vs Mujeres (ej. 57,2% hombres vs 42,8% mujeres) con el desglose exacto de bancas por bloque y renovación bianual.

### 4.2. Senado de la Nación (72 Bancas)
- **Hemiciclo de 72 esferas:**
  - 3 senadores por provincia (24 distritos x 3 = 72).
  - Distribución por bloques con conteo visible en el centro del arco.

### 4.3. El Panel Superior de Inteligencia Política:
- **Tarjeta 1: BLOQUE PROPIO:** Número neto de legisladores que te responden de forma incondicional (ej: 64 en Diputados).
- **Tarjeta 2: GOBERNABILIDAD:** Medidor porcentual (ej: 66%) que calcula la probabilidad combinada de aprobar leyes según las mayorías construidas.
- **Tarjeta 3: CAPACIDAD DE NEGOCIACIÓN:** Indicador de 0 a 100 (ej: 99,9) basado en tu capital político, fondos disponibles para transferencias y cargos para ofrecer.
- **Tabla "Relación con cada fuerza":**
  - Fuerza partidaria (con logo/isotipo oficial).
  - Cantidad de bancas en Cámara de Diputados.
  - Cantidad de bancas en Senado.
  - Nivel de Relación (0 a 100): Determina si los legisladores de esa fuerza bajan a dar quórum o votan en contra por disciplina opositora.

---

## 5. El Sistema de Apoyos y Dirigentes Políticos

No gobernás solo con números: gobernás con personas reales que tienen ego, ambición y territorio. El módulo de **Apoyos** traslada la rosca viva de los pasillos políticos a un carrusel interactivo:

```
+----------------------------------------------------------------------------------------------------+
|                                    SISTEMA DE APOYOS Y PASES                                       |
+----------------------------------------------------------------------------------------------------+
| Filtros por Fuerza: [ LLA ] [ PRO ] [ UCR ] [ UxP ] [ PF ] [ FIT ]            Te apoyan: 70 figuras|
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|  +-------------------------+    +-------------------------+    +-------------------------+         |
|  | Maximiliano Pullaro     |    | Alfredo Cornejo         |    | Martín Lousteau         |         |
|  | [UCR] Rojo y blanco     |    | [UCR] Rojo y blanco     |    | [UCR] Rojo y blanco     |         |
|  | DIALOGUISTA             |    | DIALOGUISTA             |    | DIALOGUISTA             |         |
|  | FUNCIONARIO             |    | FUNCIONARIO             |    | FUNCIONARIO             |         |
|  | Gobernador de Santa Fe  |    | Gobernador de Mendoza   |    | Pdte Comité UCR / CABA  |         |
|  | Relevancia: 60          |    | Relevancia: 58          |    | Relevancia: 57          |         |
|  | Influencia: 64          |    | Influencia: 66          |    | Influencia: 60          |         |
|  |                         |    |                         |    |                         |         |
|  | (o) Es candidato de     |    | [====O] Probabilidad 80%|    | [===O ] Probabilidad 46%|         |
|  |     otra fuerza (OFF)   |    |                         |    |                         |         |
|  |                         |    | [Pedir Apoyo]           |    | [Pedir Apoyo]           |         |
|  | [Pedir Apoyo (disabled)]|    | [Invitar a tu Partido]  |    | [Invitar a tu Partido]  |         |
|  |                         |    |                         |    |                         |         |
|  | Pase: No disponible     |    | Pase: Probabilidad ~60% |    | Pase: Probabilidad ~26% |         |
|  | (candidato rival)       |    | (-20 pp que el apoyo)   |    | (-20 pp que el apoyo)   |         |
|  +-------------------------+    +-------------------------+    +-------------------------+         |
+----------------------------------------------------------------------------------------------------+
```

#### Reglas de Juego para las Figuras Políticas:
1. **Tipología de Dirigente:**
   - **Dialoguista:** Está dispuesto a negociar con cualquier gobierno si le ofrecés fondos para su provincia/municipio, cargos ejecutivos o leyes de su interés.
   - **Dogmático:** Solo apoya a gobiernos con afinidad ideológica cercana. Si estás en las antípodas (ej. FIT frente a LLA, o kirchnerismo duro frente a halcones del PRO), el interruptor aparece apagado por defecto con el cartel *"Diferencia ideológica insalvable"*.
2. **Métricas Clave:**
   - **Relevancia:** Nivel de conocimiento público e imagen positiva en los medios. Si te apoya, sube tu aprobación pública en las encuestas de opinión.
   - **Influencia:** Capacidad de alinear votos de diputados y senadores. Un dirigente con Influencia 80 te asegura el voto disciplinado de 6 o 7 legisladores de su provincia.
3. **Mecánica de Pase de Partido (Salto de Bancada):**
   - El botón *"Invitar a tu partido"* representa el clásico pase de bando de la política criolla.
   - **Regla matemática dura:** La probabilidad de que un dirigente rompa su bloque y se pase formalmente a tus filas es **exactamente 20 puntos porcentuales (pp) menor** que la probabilidad de que te dé un simple apoyo legislativo coyuntural (ej: si apoyo es 80%, el pase es 60%; si apoyo es 46%, el pase es 26%).
   - Si acepta, te suma una banca permanente en el Congreso y resta una banca a la oposición.

---

## 6. Partido en las Provincias y Calendario Electoral Federal

Argentina es un país profundamente federal donde el calendario electoral nunca para. El Presidente y los líderes partidarios no compiten en una sola elección cada cuatro años: están en campaña permanente.

### 6.1. Métricas de Cabecera del Comando de Campaña Provincial:
- **PRESUPUESTO DE LAS CAMPAÑAS:** Recursos monetarios y de aparato partidario disponibles para destinar a publicidad, actos y punteros (ej: 880 fondos).
- **CAMPAÑAS EN CURSO:** Número de provincias que están activamente en proceso electoral (ej: 6).
- **GOBERNACIONES GANADAS:** Conteo histórico acumulado (ej: 18 de 24).
- **GOBERNADORES PROPIOS:** Cantidad de mandatarios provinciales que pertenecen a tu mismo sello o coalición orgánica (ej: 18 de 24).

### 6.2. La Regla del Desdoblamiento Electoral:
- Las 24 jurisdicciones provinciales votan en **cuatro turnos de 6 provincias cada uno** (Turno 2030, Turno 2031, Turno 2032, Turno 2033, y cada cuatro años después).
- **En año de elección presidencial (ej. 2027) no se elige ningún gobernador**, salvo casos atípicos o que coincidan por ley especial.
- La fórmula provincial se define **un año antes de cada elección**, lo que te obliga a cerrar listas con 12 meses de anticipación.

### 6.3. Donut Charts por Provincia en Disputa:
Cada provincia en campaña muestra su gráfico circular con la intención de voto de la fórmula de tu espacio frente a los competidores locales:
- *Tierra del Fuego (14 de marzo):* 29,6% tu fórmula · Badge: `FALTAN 3 MESES`
- *Misiones (11 de abril):* 38,0% tu fórmula · Badge: `TU FÓRMULA LIDERA`
- *La Pampa (9 de mayo):* 21,8% tu fórmula · Badge: `FALTAN 5 MESES`
- *Mendoza (13 de junio):* 47,5% tu fórmula · Badge: `TU FÓRMULA LIDERA`
- *Chaco (11 de julio):* 42,8% tu fórmula · Badge: `TU FÓRMULA LIDERA`
- *Buenos Aires (12 de septiembre):* 30,4% tu fórmula · Badge: `FALTAN 9 MESES`

### 6.4. El Mapa de Gobernadores y la Intervención Federal (Art. 6 CN):
Pestaña estratégica que muestra el mapa político de las 24 provincias pintadas con el color de la fuerza que gobierna cada una.
- Si una provincia cae en hiperendeudamiento, no paga los sueldos de la policía, desconoce las leyes federales o sufre un estallido institucional violento, el Presidente puede enviar un proyecto de **Intervención Federal** al Congreso para desplazar al Gobernador y nombrar a un Interventor Nacional con facultades plenipotenciarias.

---

## 7. Plan de Implementación Paso a Paso (Roadmap para Aprobación)

Para no romper nada y avanzar con calidad de ingeniería quirúrgica (manteniendo $CC \le 5$, $MI \ge 75$ y tests al 100%), este es el cronograma de trabajo por fases que te propongo ejecutar una vez que apruebes este documento:

```
+----------------------------------------------------------------------------------------------------+
|                                    ROADMAP DE DESARROLLO POR FASES                                 |
+---------+---------------------------------------------------------------------+--------------------+
| FASE    | ALCANCE TÉCNICO Y PANTALLAS                                         | ENTREGABLE         |
+---------+---------------------------------------------------------------------+--------------------+
| FASE 1  | Modelado de Dominio en Core: Interfaces TS de RIGI (29 sectores),    | Tipos, Stores de   |
|         | 17 Impuestos, Cámaras (Diputados 257 / Senadores 72) y Campañas.    | Zustand y Lógica   |
+---------+---------------------------------------------------------------------+--------------------+
| FASE 2  | Vista de Cámaras Legislativas: Componente visual de los dos         | Componente React   |
|         | Hemiciclos en SVG con 257 y 72 bancas, filtros, quórum y relación.  | con interacción    |
+---------+---------------------------------------------------------------------+--------------------+
| FASE 3  | Tablero RIGI Completo: Grilla interactiva con los 29 sectores,       | Panel RIGI         |
|         | madurez, sliders de inversión, costos fiscales y conflictividad.    | funcional          |
+---------+---------------------------------------------------------------------+--------------------+
| FASE 4  | Matriz de los 17 Impuestos: Separación de 6 tributos por decreto    | Panel Tributario   |
|         | y 11 por ley con simulación de recaudación macroeconómica.          | interactivo        |
+---------+---------------------------------------------------------------------+--------------------+
| FASE 5  | Módulo de Apoyos y Figuras Políticas: Carrusel con toggles de        | Componente Apoyos  |
|         | probabilidad de apoyo e invitación al partido (-20 pp).             | con filtros        |
+---------+---------------------------------------------------------------------+--------------------+
| FASE 6  | Comando de Campaña Provincial: Turnos electorales (2030-2033),      | Pantalla Campaña   |
|         | donuts provinciales, mapa de gobernadores e intervención federal.   | Provincial         |
+---------+---------------------------------------------------------------------+--------------------+
| FASE 7  | Adaptación de Interfaz según el Rol Seleccionado al Iniciar Partida  | Filtro de Vistas   |
|         | (Presidente vs Gobernador vs Diputado vs Senador).                  | por Cargo          |
+---------+---------------------------------------------------------------------+--------------------+
```

---

Resumen:
- Se creó la carpeta `docs/` y se alojó allí la documentación integral del proyecto (`INVESTIGACION_SIMULADOR_ARGENTINA.md` y este archivo de especificación).
- Se definieron con precisión quirúrgica los 4 roles (Presidente, Gobernador, Diputado, Senador) estableciendo exactamente qué ve y qué juega cada uno.
- Se incorporaron las especificaciones completas de los 29 sectores del RIGI, los 17 impuestos reales (6 por decreto y 11 por ley), los hemiciclos de Diputados (257) y Senado (72), el sistema de Apoyos y el Comando de Campaña Provincial.
- Cero código de producción fue modificado en este turno, cumpliendo a rajatabla tu instrucción de planificar primero para tu aprobación.

Saludos! Quedo a la espera de tu visto bueno sobre este plan maestro para arrancar con la Fase 1 cuando me des luz verde.

