# Comparativa Exhaustiva con QQG ("¿Quién quiere gobernar?") y Relevamiento de Faltantes

> Análisis técnico y funcional derivado de las 9 capturas reales del juego original ¿Quién quiere gobernar? (QQG) de cara a la versión completa del Simulador Argentino 2027.

---

## 1. Lo que tiene QQG en estas capturas vs lo que tenemos en el simulador

| Módulo / Sistema en QQG | Detalle en Capturas de QQG | Estado Actual en Nuestro Proyecto | Qué nos falta para alcanzar paridad total |
| :--- | :--- | :--- | :--- |
| **1. Resumen de Campaña** | - Imagen desglosada en **Positiva**, **Negativa** y **Desconocimiento** (la suma da 100 %).<br>- Métricas de **Intención de Voto**, **Piso (Bronce)** y **Techo (Azul)**.<br>- Encuesta general con barras horizontales de todos los partidos. | Mostramos atributos personales (inteligencia, convencimiento, etc.) e intención general. | Falta estructurar la tríada `Positiva + Negativa + Desconocimiento = 100%` y el cálculo de `Piso / Techo electoral`. |
| **2. Imagen y Mapa Segmentado** | - 3 paneles en paralelo: **Por ideología** (izq, centro, der con peso del padrón), **Por edad** (16-29, 30-44, 45-59, 60+), **Por poder adquisitivo** (bajo, medio, alto).<br>- Toggle de mapa: `Por provincia` / `Por departamento`. | Tenemos pestañas separadas en `Demografía`, pero no consolidadas en una sola pantalla visual. | Falta la pantalla unificada de segmentación con barras comparativas + mapa conmutador provincia/departamento. |
| **3. Dinámica de Coaliciones y Rechazos** | - Alerta superior: `[Fuerza] rechazó la alianza`.<br>- Regla explícita: si tu socio aporta más votos, él encabeza y vos vas de vice (o viceversa).<br>- Bloqueo estricto a **Máximo 2 socios**.<br>- Costo visible por romper coalición (`-3,4 pts imagen y votos`).<br>- Alianzas opositoras dinámicas (ej. UxP + FIT o LLA + PRO). | Tenemos tarjetas de coalición pero sin límites duros, sin alianzas entre IAs opositoras y sin cálculo de encabezamiento por votos. | Implementar el límite de 2 socios, la alerta de rechazo, el costo de ruptura y las fusiones de listas opositoras. |
| **4. Elección de Vicepresidente** | - Pantalla modal dedicada: *"Elegí a tu vicepresidente"*, que salta al ganar la interna o consolidar la fórmula.<br>- Pool de candidatos de tu partido (relevancia > 40) o de tus socios de coalición (ej. Pullaro, Lousteau, Cornejo, Morales, Valdés si te aliaste con la UCR).<br>- Cada vice muestra su **Relevancia** y su **Estructura territorial**. | La fórmula es unipersonal y no permite seleccionar vice con peso territorial de los socios. | Pantalla de selección de Vicepresidente con impacto en estructura de campaña y territorialidad. |
| **5. Dilemas y Eventos Emergentes de Campaña** | - Pop-up modal: *"Situación del mes · 1 de Mayo de 2027"*, ej. *Un empresario ofrece un aporte*.<br>- Decisiones binarias con píldoras verde/roja de impacto:<br>  * Aceptar dinero (+Presupuesto, +Vulnerabilidad, +Dependencia empresarial).<br>  * Rechazarlo (+Inteligencia percibida).<br>- Cláusula: *"Esta situación no vuelve a aparecer en la partida"*. | El motor tiene eventos históricos en el registro pero no el modal interactivo de decisión mensual con consecuencias. | Implementar el modal de dilemas éticos y políticos de campaña con impacto inmediato en variables. |
| **6. Noches Electorales y Escrutinio Oficial** | - **PASO (8 de Agosto de 2027)**: "Ganaste las PASO" / "Quedaste segundo", tabla con Votos nominales exactos (ej. 8.459.599), %, Participación (66,1%), Blancos/Nulos y Abstención.<br>- **Generales (24 de Octubre de 2027)**: "Vas a segunda vuelta", tabla con balotaje formal (Axel Kicillof 35,5% vs Tu espacio 35,3%), votos y mapa.<br>- **Balotaje (21 de Noviembre de 2027)**: "Ganaste" (61,4% vs 38,6%), mapa bicolor nacional y desbloqueo de logro. | Avanzamos de fase automáticamente con una card de resumen sin la experiencia solemne de escrutinio provisorio con millones de votos. | Crear las 3 pantallas oficiales de escrutinio (PASO, General, Balotaje) con datos censales reales (36 M electores), participación y mapas de escrutinio. |

---

## 2. Los pilares que nosotros ya tenemos y superan ampliamente a QQG

QQG es un juego eminentemente político y electoral, pero su modelo económico es superficial. Nuestro simulador ya cuenta con:
1. **Motor Macroeconómico de Caja Blanca**:
   - Ecuaciones transparentes de inflación (Inercia REM, Pass-through, Brecha cambiaria, Déficit fiscal).
   - Mesa de Dinero del BCRA (crawling peg, reservas netas, tasa de política monetaria, exposición bancaria al sector público).
2. **Matriz Energética y Paritarias Reales**:
   - Costo monómico de CAMMESA, despacho MEM, subsidios a usuarios N1/N2/N3 y rueda de 8 paritarias sindicales.
3. **RIGI Completo de 29 Sectores Oficiales**:
   - Los 29 sectores de la Ley Bases con montos mínimos, exportaciones proyectadas y conflictividad social.
4. **17 Impuestos Oficiales Calibrados**:
   - Distinción constitucional entre facultades delegadas por Decreto (retenciones, aranceles) y Leyes del Congreso (IVA, Ganancias, Cheque).
5. **Cámaras Legislativas Vectoriales**:
   - Hemiciclos de 257 Diputados y 72 Senadores con cálculo de quórum y mayorías agravadas.

---

## 3. Plan de Acción para la Integración Total

Para incorporar los faltantes de QQG sin romper la arquitectura existente:

1. **Fase A - Refactor del Eje de Campaña**:
   - Ajustar `CampaignResumenView`: integrar la fórmula de imagen (`Positiva + Negativa + Desconocimiento = 100`) y las métricas de `Piso / Techo`.
   - Ajustar `CampaignImageAndMapView`: unificar los 3 paneles de barras segmentadas (ideología, edad, poder adquisitivo) con el selector provincia/departamento.

2. **Fase B - Negociación de Coaliciones y Vicepresidencia**:
   - Integrar la regla de exclusividad de candidatura y el límite de 2 partidos socios.
   - Habilitar la pantalla de selección de Vicepresidente con dirigentes propios o del socio mayoritario.

3. **Fase C - Dilemas Emergentes de Campaña ("Situación del Mes")**:
   - Crear un catálogo de 12 dilemas mensuales típicos de la política argentina (empresarios con valijas, carpetazos de inteligencia, fotos de Olivos, tomas de fábricas, marchas universitarias) con opciones binarias y píldoras de impacto.

4. **Fase D - Escrutinio de Noche Electoral (PASO, Generales y Balotaje)**:
   - Pantalla solemne de resultados con padrón electoral real (36.262.373 electores), conteo de votos nominales, cálculo constitucional de balotaje (Art. 97 y 98 CN) y mapa de resultados pintado por fuerza.

