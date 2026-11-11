const fs = require('fs');
const path = require('path');

const RAW_TEXT = `
Javier Milei
LLA · Liberalismo
Presidente de la Nación (escenario inicial)
Dificultad: Fácil · Dogmático

Patricia Bullrich
LLA · Liberalismo
Senadora nacional, exministra de Seguridad
Dificultad: Fácil · Dialoguista

Santiago Caputo
LLA · Liberalismo
Consultor y estratega político
Dificultad: Un poco fácil · Dialoguista

Karina Milei
LLA · Liberalismo
Secretaria general de la Presidencia
Dificultad: Un poco fácil · Dogmático

Victoria Villarruel
LLA · Liberalismo
Vicepresidenta de la Nación, distanciada de Milei
Dificultad: Un poco fácil · Dogmático

Luis Caputo
LLA · Liberalismo
Ministro de Economía
Dificultad: Un poco fácil · Dialoguista

Manuel Adorni
LLA · Liberalismo
Vocero y jefe de Gabinete
Dificultad: Normal · Dogmático

Diego Santilli
LLA · Liberalismo
Ministro del Interior, dirigente bonaerense
Dificultad: Normal · Dialoguista

Martín Menem
LLA · Liberalismo
Presidente de la Cámara de Diputados
Dificultad: Normal · Dialoguista

Federico Sturzenegger
LLA · Liberalismo
Ministro de Desregulación
Dificultad: Normal · Dogmático

Sandra Pettovello
LLA · Liberalismo
Ministra de Capital Humano
Dificultad: Normal · Dogmático

José Luis Espert
LLA · Liberalismo
Economista libertario, exdiputado nacional
Dificultad: Un poco difícil · Dogmático

Daniel Scioli
LLA · Liberalismo
Secretario de Turismo, Ambiente y Deportes; ex gobernador bonaerense
Dificultad: Normal · Dialoguista

Agustín Romo
LLA · Liberalismo
Legislador bonaerense y dirigente de LLA en la provincia
Dificultad: Un poco difícil · Dogmático

Guillermo Francos
LLA · Liberalismo
Exjefe de Gabinete de perfil negociador
Dificultad: Normal · Dialoguista

Alberto Benegas Lynch (h)
LLA · Liberalismo
Diputado libertario
Dificultad: Un poco difícil · Dogmático

Alejandra Monteoliva
LLA · Liberalismo
Ministra de Seguridad
Dificultad: Un poco difícil · Dialoguista

Luis Petri
LLA · Liberalismo
Diputado nacional de LLA, exministro de Defensa
Dificultad: Un poco difícil · Dialoguista

Pablo Quirno
LLA · Liberalismo
Canciller
Dificultad: Un poco difícil · Dialoguista

Sebastián Pareja
LLA · Liberalismo
Armador bonaerense de LLA
Dificultad: Un poco difícil · Dogmático

Mario Lugones
LLA · Liberalismo
Ministro de Salud
Dificultad: Un poco difícil · Dialoguista

Gabriel Bornoroni
LLA · Liberalismo
Titular de LLA en Córdoba
Dificultad: Un poco difícil · Dogmático

Pilar Ramírez
LLA · Liberalismo
Legisladora porteña de LLA
Dificultad: Un poco difícil · Dogmático

Carlos Presti
LLA · Liberalismo
Ministro de Defensa
Dificultad: Un poco difícil · Dialoguista

Omar De Marchi
LLA · Liberalismo
Dirigente mendocino de LLA
Dificultad: Un poco difícil · Dogmático

Nicolás Mayoraz
LLA · Liberalismo
Dirigente santafesino de LLA
Dificultad: Un poco difícil · Dogmático

Mauricio Macri
PRO · Conservadurismo
Presidente del PRO, expresidente
Dificultad: Un poco fácil · Dialoguista

Horacio Rodríguez Larreta
PRO · Conservadurismo
Exjefe de Gobierno porteño, enfrentado con la conducción del PRO
Dificultad: Normal · Dialoguista

María Eugenia Vidal
PRO · Conservadurismo
Exgobernadora bonaerense
Dificultad: Normal · Dialoguista

Jorge Macri
PRO · Conservadurismo
Jefe de Gobierno porteño
Dificultad: Un poco difícil · Dialoguista

Cristian Ritondo
PRO · Conservadurismo
Diputado nacional
Dificultad: Un poco difícil · Dialoguista

Ignacio Torres
PRO · Conservadurismo
Gobernador de Chubut
Dificultad: Un poco difícil · Dialoguista

Luis Juez
PRO · Conservadurismo
Senador nacional cordobés
Dificultad: Un poco difícil · Dialoguista

Rogelio Frigerio
PRO · Conservadurismo
Gobernador de Entre Ríos
Dificultad: Un poco difícil · Dialoguista

Guillermo Montenegro
PRO · Conservadurismo
Intendente de General Pueyrredón
Dificultad: Difícil · Dogmático

Waldo Wolff
PRO · Conservadurismo
Dirigente porteño
Dificultad: Difícil · Dogmático

Federico Pinedo
PRO · Conservadurismo
Dirigente institucionalista
Dificultad: Difícil · Dialoguista

Silvia Lospennato
PRO · Conservadurismo
Dirigente porteña
Dificultad: Difícil · Dialoguista

Marcos Peña
PRO · Conservadurismo
Exjefe de Gabinete
Dificultad: Difícil · Dialoguista

Margarita Stolbizer
PRO · Conservadurismo
Dirigente de GEN
Dificultad: Un poco difícil · Dialoguista

Marcelo Orrego
PRO · Conservadurismo
Gobernador de San Juan
Dificultad: Un poco difícil · Dialoguista

Claudio Poggi
PRO · Conservadurismo
Gobernador de San Luis
Dificultad: Un poco difícil · Dialoguista

Néstor Grindetti
PRO · Conservadurismo
Dirigente bonaerense, exintendente de Lanús
Dificultad: Difícil · Dialoguista

Fernando de Andreis
PRO · Conservadurismo
Dirigente del PRO
Dificultad: Difícil · Dialoguista

Pablo Javkin
PRO · Conservadurismo
Intendente de Rosario
Dificultad: Difícil · Dialoguista

Daniel Angelici
PRO · Conservadurismo
Operador político porteño
Dificultad: Difícil · Dialoguista

Luciano Laspina
PRO · Conservadurismo
Dirigente de PRO, economista
Dificultad: Difícil · Dialoguista

Germán Alfaro
PRO · Conservadurismo
Dirigente tucumano, exintendente de San Miguel
Dificultad: Difícil · Dialoguista

Soledad Acuña
PRO · Conservadurismo
Dirigente porteña
Dificultad: Difícil · Dialoguista

Alejandro Finocchiaro
PRO · Conservadurismo
Dirigente de PRO, exministro de Educación
Dificultad: Difícil · Dialoguista

Humberto Schiavoni
PRO · Conservadurismo
Dirigente misionero del PRO
Dificultad: Difícil · Dialoguista

Fernán Quirós
PRO · Conservadurismo
Médico y dirigente porteño
Dificultad: Difícil · Dialoguista

Jorge Triaca
PRO · Conservadurismo
Exministro de Trabajo
Dificultad: Difícil · Dialoguista

Hernán Lombardi
PRO · Conservadurismo
Dirigente del PRO
Dificultad: Difícil · Dogmático

Federico Angelini
PRO · Conservadurismo
Dirigente del PRO
Dificultad: Difícil · Dialoguista

Maximiliano Pullaro
UCR · Socialdemocracia
Gobernador de Santa Fe
Dificultad: Normal · Dialoguista

Martín Lousteau
UCR · Socialdemocracia
Presidente del Comité Nacional de la UCR, diputado nacional por la Ciudad
Dificultad: Normal · Dialoguista

Alfredo Cornejo
UCR · Socialdemocracia
Gobernador de Mendoza
Dificultad: Un poco difícil · Dialoguista

Gerardo Morales
UCR · Socialdemocracia
Exgobernador de Jujuy, expresidente de la UCR
Dificultad: Un poco difícil · Dialoguista

Gustavo Valdés
UCR · Socialdemocracia
Exgobernador de Corrientes
Dificultad: Un poco difícil · Dialoguista

Julio Cobos
UCR · Socialdemocracia
Exvicepresidente de la Nación
Dificultad: Un poco difícil · Dialoguista

Leandro Zdero
UCR · Socialdemocracia
Gobernador del Chaco
Dificultad: Difícil · Dialoguista

Carolina Losada
UCR · Socialdemocracia
Senadora nacional por Santa Fe
Dificultad: Difícil · Dialoguista

Ernesto Sanz
UCR · Socialdemocracia
Expresidente de la UCR
Dificultad: Un poco difícil · Dialoguista

Carlos Sadir
UCR · Socialdemocracia
Gobernador de Jujuy
Dificultad: Difícil · Dialoguista

Rodrigo de Loredo
UCR · Socialdemocracia
Dirigente radical cordobés
Dificultad: Difícil · Dialoguista

Maximiliano Abad
UCR · Socialdemocracia
Senador nacional por Buenos Aires
Dificultad: Difícil · Dialoguista

Mario Negri
UCR · Socialdemocracia
Dirigente radical cordobés, exdiputado
Dificultad: Un poco difícil · Dialoguista

Juan Pablo Valdés
UCR · Socialdemocracia
Gobernador de Corrientes
Dificultad: Difícil · Dialoguista

Emiliano Yacobitti
UCR · Socialdemocracia
Dirigente radical porteño
Dificultad: Difícil · Dialoguista

Ricardo Alfonsín
UCR · Socialdemocracia
Dirigente radical bonaerense, exdiputado
Dificultad: Difícil · Dialoguista

Eduardo Vischi
UCR · Socialdemocracia
Senador nacional por Corrientes, jefe del bloque radical
Dificultad: Difícil · Dialoguista

Luis Naidenoff
UCR · Socialdemocracia
Dirigente radical formoseño
Dificultad: Difícil · Dialoguista

Martín Tetaz
UCR · Socialdemocracia
Economista, exdiputado nacional
Dificultad: Difícil · Dialoguista

Fernando Carbajal
UCR · Socialdemocracia
Dirigente radical formoseño
Dificultad: Difícil · Dialoguista

Cristina Fernández de Kirchner
UxP · Socialismo
Expresidenta de la Nación
Dificultad: Fácil · Dogmático

Axel Kicillof
UxP · Socialismo
Gobernador de Buenos Aires
Dificultad: Fácil · Dialoguista

Sergio Massa
UxP · Socialismo
Exministro de Economía
Dificultad: Fácil · Dialoguista

Máximo Kirchner
UxP · Socialismo
Dirigente de La Cámpora
Dificultad: Un poco fácil · Dogmático

Alberto Fernández
UxP · Socialismo
Expresidente de la Nación
Dificultad: Normal · Dialoguista

Juan Grabois
UxP · Socialismo
Dirigente social
Dificultad: Normal · Dogmático

Eduardo "Wado" de Pedro
UxP · Socialismo
Senador y exministro del Interior
Dificultad: Normal · Dialoguista

Gabriel Katopodis
UxP · Socialismo
Dirigente bonaerense
Dificultad: Normal · Dialoguista

Jorge Capitanich
UxP · Socialismo
Exgobernador del Chaco
Dificultad: Normal · Dialoguista

Mayra Mendoza
UxP · Socialismo
Intendenta de Quilmes
Dificultad: Normal · Dogmático

Jorge Taiana
UxP · Socialismo
Excanciller y exministro de Defensa
Dificultad: Un poco difícil · Dialoguista

Juan Manzur
UxP · Socialismo
Exjefe de Gabinete, dirigente tucumano
Dificultad: Normal · Dialoguista

Sergio Berni
UxP · Socialismo
Dirigente de perfil de seguridad
Dificultad: Normal · Dogmático

Agustín Rossi
UxP · Socialismo
Dirigente santafesino, exministro
Dificultad: Normal · Dialoguista

Gildo Insfrán
UxP · Socialismo
Gobernador de Formosa
Dificultad: Un poco difícil · Dogmático

Andrés Larroque
UxP · Socialismo
Dirigente de La Cámpora
Dificultad: Un poco difícil · Dogmático

Ricardo Quintela
UxP · Socialismo
Gobernador de La Rioja
Dificultad: Un poco difícil · Dogmático

Osvaldo Jaldo
UxP · Socialismo
Gobernador de Tucumán
Dificultad: Normal · Dialoguista

Leandro Santoro
UxP · Socialismo
Dirigente porteño
Dificultad: Un poco difícil · Dialoguista

Teresa García
UxP · Socialismo
Senadora bonaerense, dirigente del kirchnerismo
Dificultad: Un poco difícil · Dogmático

Carlos Bianco
UxP · Socialismo
Ministro de Gobierno bonaerense
Dificultad: Un poco difícil · Dialoguista

Lucía Corpacci
UxP · Socialismo
Senadora nacional, exgobernadora
Dificultad: Un poco difícil · Dialoguista

Gustavo Bordet
UxP · Socialismo
Exgobernador de Entre Ríos
Dificultad: Normal · Dialoguista

Martín Soria
UxP · Socialismo
Exministro de Justicia
Dificultad: Un poco difícil · Dialoguista

Gerardo Zamora
UxP · Socialismo
Dirigente de Santiago del Estero
Dificultad: Un poco difícil · Dialoguista

Verónica Magario
UxP · Socialismo
Dirigente bonaerense
Dificultad: Un poco difícil · Dialoguista

Fernando Espinoza
UxP · Socialismo
Intendente de La Matanza
Dificultad: Un poco difícil · Dialoguista

Jorge Ferraresi
UxP · Socialismo
Intendente de Avellaneda
Dificultad: Un poco difícil · Dialoguista

Daniel Gollan
UxP · Socialismo
Ministro de Salud bonaerense
Dificultad: Un poco difícil · Dialoguista

Mariano Recalde
UxP · Socialismo
Senador nacional por la Ciudad
Dificultad: Un poco difícil · Dialoguista

Anabel Fernández Sagasti
UxP · Socialismo
Dirigente mendocina del peronismo
Dificultad: Un poco difícil · Dialoguista

José Luis Gioja
UxP · Socialismo
Exgobernador de San Juan, dirigente del PJ
Dificultad: Un poco difícil · Dialoguista

Julio Zamora
UxP · Socialismo
Intendente de Tigre
Dificultad: Un poco difícil · Dialoguista

Juan Pablo Luque
UxP · Socialismo
Intendente de Comodoro Rivadavia
Dificultad: Un poco difícil · Dialoguista

Adán Bahl
UxP · Socialismo
Intendente de Paraná
Dificultad: Un poco difícil · Dialoguista

Alicia Kirchner
UxP · Socialismo
Exgobernadora de Santa Cruz
Dificultad: Un poco difícil · Dogmático

Claudia Ledesma Abdala
UxP · Socialismo
Senadora nacional por Santiago del Estero
Dificultad: Un poco difícil · Dialoguista

Gustavo Menéndez
UxP · Socialismo
Intendente de Merlo
Dificultad: Un poco difícil · Dogmático

Juan Schiaretti
PF · Justicialismo
Exgobernador de Córdoba
Dificultad: Normal · Dialoguista

Martín Llaryora
PF · Justicialismo
Gobernador de Córdoba
Dificultad: Normal · Dialoguista

Miguel Ángel Pichetto
PF · Justicialismo
Dirigente rionegrino
Dificultad: Normal · Dialoguista

Juan Manuel Urtubey
PF · Justicialismo
Exgobernador de Salta
Dificultad: Un poco difícil · Dialoguista

Rolando Figueroa
PF · Justicialismo
Gobernador de Neuquén
Dificultad: Un poco difícil · Dialoguista

Gustavo Sáenz
PF · Justicialismo
Gobernador de Salta
Dificultad: Un poco difícil · Dialoguista

Florencio Randazzo
PF · Justicialismo
Exministro del Interior y Transporte
Dificultad: Un poco difícil · Dialoguista

Roberto Lavagna
PF · Justicialismo
Economista, exministro de Economía
Dificultad: Un poco difícil · Dialoguista

Eduardo Duhalde
PF · Justicialismo
Expresidente de la Nación
Dificultad: Un poco difícil · Dialoguista

Carlos Rovira
PF · Justicialismo
Líder del Encuentro Misionero
Dificultad: Un poco difícil · Dialoguista

Claudio Vidal
PF · Justicialismo
Gobernador de Santa Cruz
Dificultad: Un poco difícil · Dialoguista

Sergio Uñac
PF · Justicialismo
Exgobernador de San Juan
Dificultad: Un poco difícil · Dialoguista

Alberto Weretilneck
PF · Justicialismo
Gobernador de Río Negro
Dificultad: Un poco difícil · Dialoguista

Emilio Monzó
PF · Justicialismo
Dirigente de Encuentro Federal, exPRO
Dificultad: Un poco difícil · Dialoguista

Joaquín de la Torre
PF · Justicialismo
Intendente de San Miguel
Dificultad: Un poco difícil · Dialoguista

Hugo Passalacqua
PF · Justicialismo
Gobernador de Misiones
Dificultad: Un poco difícil · Dialoguista

Adolfo Rodríguez Saá
PF · Justicialismo
Dirigente puntano
Dificultad: Un poco difícil · Dogmático

Raúl Jalil
PF · Justicialismo
Gobernador de Catamarca
Dificultad: Un poco difícil · Dialoguista

Natalia de la Sota
PF · Justicialismo
Dirigente cordobesa de Hacemos
Dificultad: Un poco difícil · Dialoguista

Alberto Rodríguez Saá
PF · Justicialismo
Exgobernador de San Luis
Dificultad: Un poco difícil · Dialoguista

Omar Perotti
PF · Justicialismo
Exgobernador de Santa Fe
Dificultad: Un poco difícil · Dialoguista

Sergio Ziliotto
PF · Justicialismo
Gobernador de La Pampa
Dificultad: Difícil · Dogmático

Diego Bossio
PF · Justicialismo
Dirigente de perfil técnico
Dificultad: Difícil · Dialoguista

Juan Zabaleta
PF · Justicialismo
Exintendente de Hurlingham
Dificultad: Difícil · Dialoguista

Martín Insaurralde
PF · Justicialismo
Dirigente bonaerense
Dificultad: Difícil · Dialoguista

Myriam Bregman
FIT · Comunismo
Dirigente del PTS
Dificultad: Un poco difícil · Dialoguista

Nicolás del Caño
FIT · Comunismo
Dirigente del PTS
Dificultad: Un poco difícil · Dogmático

Romina del Plá
FIT · Comunismo
Dirigente del Partido Obrero
Dificultad: Difícil · Dogmático

Gabriel Solano
FIT · Comunismo
Dirigente del Partido Obrero
Dificultad: Difícil · Dogmático

Christian Castillo
FIT · Comunismo
Dirigente del PTS
Dificultad: Difícil · Dogmático

Alejandro Bodart
FIT · Comunismo
Dirigente del MST (FIT-U)
Dificultad: Difícil · Dogmático

Jorge Altamira
FIT · Comunismo
Dirigente de Política Obrera (fuera del FIT-U)
Dificultad: Difícil · Dogmático

Eduardo Belliboni
FIT · Comunismo
Dirigente del Polo Obrero
Dificultad: Difícil · Dogmático

Manuela Castañeira
FIT · Comunismo
Dirigente del Movimiento al Socialismo (MAS), fuera del FIT-U
Dificultad: Difícil · Dogmático

Cele Fierro
FIT · Comunismo
Dirigente del MST (FIT-U)
Dificultad: Difícil · Dogmático

Néstor Pitrola
FIT · Comunismo
Dirigente del Partido Obrero
Dificultad: Difícil · Dogmático

Juan Carlos Giordano
FIT · Comunismo
Dirigente de Izquierda Socialista
Dificultad: Difícil · Dogmático

Alejandro Vilca
FIT · Comunismo
Dirigente jujeño del PTS (FIT-U)
Dificultad: Difícil · Dialoguista

Vilma Ripoll
FIT · Comunismo
Dirigente de la izquierda socialista
Dificultad: Difícil · Dogmático

Nathalia González Seligra
FIT · Comunismo
Dirigente del PTS
Dificultad: Difícil · Dogmático

Raúl Godoy
FIT · Comunismo
Dirigente de Zanon, PTS
Dificultad: Difícil · Dogmático

Vanina Biasi
FIT · Comunismo
Dirigente del Partido Obrero
Dificultad: Difícil · Dogmático

Mónica Schlotthauer
FIT · Comunismo
Dirigente de Izquierda Socialista (FIT-U)
Dificultad: Difícil · Dogmático

Marcelo Ramal
FIT · Comunismo
Dirigente de Política Obrera (fuera del FIT-U)
Dificultad: Difícil · Dogmático

Liliana Olivero
FIT · Comunismo
Dirigente cordobesa de Izquierda Socialista (FIT-U)
Dificultad: Difícil · Dogmático
`;

const COLOR_MAP = {
  LLA: '#8b5cf6',
  PRO: '#eab308',
  UCR: '#dc2626',
  UxP: '#0284c7',
  PF: '#2563eb',
  FIT: '#e11d48'
};

const DIFFICULTY_MAP = {
  'Fácil': 'VIENTO_DE_COLA',
  'Un poco fácil': 'ESTANDAR_2027',
  'Normal': 'ESTANDAR_2027',
  'Un poco difícil': 'HERENCIA_MALDITA',
  'Difícil': 'DICIEMBRE_2001'
};

function slugify(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function resolveRole(roleDesc) {
  const low = roleDesc.toLowerCase();
  if (low.includes('presidente de la nación') || low.includes('expresidente') || low.includes('expresidenta')) return 'PRESIDENTE';
  if (low.includes('gobernador') || low.includes('gobernadora') || low.includes('intendente') || low.includes('jefe de gobierno')) return 'GOBERNADOR';
  if (low.includes('senador') || low.includes('senadora')) return 'SENADOR';
  return 'DIPUTADO';
}

function resolveProvince(roleDesc, party) {
  const low = roleDesc.toLowerCase();
  if (low.includes('porteñ') || low.includes('jefe de gobierno')) return 'CABA';
  if (low.includes('bonaerense') || low.includes('buenos aires') || low.includes('matanza') || low.includes('quilmes') || low.includes('lanús') || low.includes('avellaneda') || low.includes('tigre') || low.includes('merlo') || low.includes('san miguel') || low.includes('hurlingham') || low.includes('general pueyrredón')) return 'PBA';
  if (low.includes('córdoba') || low.includes('cordobés') || low.includes('cordobesa')) return 'CORDOBA';
  if (low.includes('santa fe') || low.includes('santafesin') || low.includes('rosario')) return 'SANTA_FE';
  if (low.includes('mendoza') || low.includes('mendocin')) return 'MENDOZA';
  if (low.includes('tucumán') || low.includes('tucumano')) return 'TUCUMAN';
  if (low.includes('entre ríos') || low.includes('paraná')) return 'ENTRE_RIOS';
  if (low.includes('chubut') || low.includes('comodoro rivadavia')) return 'CHUBUT';
  if (low.includes('corrientes')) return 'CORRIENTES';
  if (low.includes('chaco')) return 'CHACO';
  if (low.includes('jujuy') || low.includes('jujeño')) return 'JUJUY';
  if (low.includes('misiones') || low.includes('misionero')) return 'MISIONES';
  if (low.includes('neuquén')) return 'NEUQUEN';
  if (low.includes('salta')) return 'SALTA';
  if (low.includes('san juan')) return 'SAN_JUAN';
  if (low.includes('san luis') || low.includes('puntano')) return 'SAN_LUIS';
  if (low.includes('santa cruz')) return 'SANTA_CRUZ';
  if (low.includes('santiago del estero')) return 'SANTIAGO_ESTERO';
  if (low.includes('la pampa')) return 'LA_PAMPA';
  if (low.includes('la rioja')) return 'LA_RIOJA';
  if (low.includes('formosa') || low.includes('formoseño')) return 'FORMOSA';
  return 'CABA';
}

const blocks = RAW_TEXT.trim().split(/\n\s*\n/);
const seenIds = new Set();
const politicians = [];

for (const b of blocks) {
  const lines = b.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 4) continue;
  const name = lines[0].replace(/^"|"$/g, '');
  const [partySigla, ideology] = lines[1].split('·').map(s => s.trim());
  const roleDescription = lines[2];
  const diffLine = lines[3]; // e.g. Dificultad: Fácil · Dogmático
  const diffParts = diffLine.replace('Dificultad:', '').split('·').map(s => s.trim());
  const difficultyLabel = diffParts[0];
  const styleTrait = diffParts[1] === 'Dogmático' ? 'Dogmático' : 'Dialoguista';

  let baseId = slugify(name);
  if (seenIds.has(baseId)) {
    baseId = `${baseId}_${partySigla}`;
  }
  seenIds.add(baseId);

  politicians.push({
    id: baseId,
    name,
    partyId: partySigla,
    partySigla,
    ideology: ideology || 'Ideología Nacional',
    roleDescription,
    difficultyLabel,
    difficulty: DIFFICULTY_MAP[difficultyLabel] || 'ESTANDAR_2027',
    styleTrait,
    accentColor: COLOR_MAP[partySigla] || '#8b5cf6',
    defaultRole: resolveRole(roleDescription),
    defaultProvinceId: resolveProvince(roleDescription, partySigla)
  });
}

console.log('Total parsed politicians:', politicians.length);

const outContent = `import type { RealPoliticianPreset } from '@argentina-sim/domain';

// Catálogo completo de las 158 figuras políticas reales de la Argentina 2027:
// LLA, PRO, UCR, UxP, Peronismo Federal y FIT, con ideologías, roles, dificultades y temperamentos.

export const REAL_POLITICIANS_2027: RealPoliticianPreset[] = ${JSON.stringify(politicians, null, 2)};
`;

fs.writeFileSync(
  path.join(__dirname, '../packages/simulation-infrastructure/src/datasets/realPoliticiansCatalog158.ts'),
  outContent,
  'utf8'
);
console.log('Saved to realPoliticiansCatalog158.ts successfully!');
