/* =========================================================================
   parser.js — Motor local de interpretación de dictado de laboratorios
   Funciona 100% en el navegador, sin servidor y sin conexión.
   ========================================================================= */
(function (root) {
  "use strict";

  /* ---------- 1. Diccionario de analitos ---------------------------------
     sin  : variantes que puede producir el reconocimiento de voz
     rango: valores plausibles en adultos; fuera de rango -> se marca aviso
     ---------------------------------------------------------------------- */
  var DICCIONARIO = [
    // Hemograma
    { id: "hb", nom: "Hemoglobina", uni: "g/dL", cat: "Hemograma", rango: [3, 22], sin: ["hemoglobina", "hb", "hemo globina"] },
    { id: "hto", nom: "Hematocrito", uni: "%", cat: "Hemograma", rango: [10, 70], sin: ["hematocrito", "hto", "hemato crito"] },
    { id: "leu", nom: "Leucocitos", uni: "/mm3", cat: "Hemograma", rango: [500, 200000], sin: ["leucocitos", "globulos blancos", "leucositos", "recuento de leucocitos"] },
    { id: "neu", nom: "Neutrófilos", uni: "%", cat: "Hemograma", rango: [1, 100], sin: ["neutrofilos", "neutrofilo", "polimorfonucleares"] },
    { id: "lin", nom: "Linfocitos", uni: "%", cat: "Hemograma", rango: [1, 100], sin: ["linfocitos", "linfositos"] },
    { id: "plt", nom: "Plaquetas", uni: "/mm3", cat: "Hemograma", rango: [5000, 1500000], sin: ["plaquetas", "recuento de plaquetas", "placas"] },
    { id: "vcm", nom: "VCM", uni: "fL", cat: "Hemograma", rango: [50, 130], sin: ["vcm", "volumen corpuscular medio", "ve ce eme"] },
    { id: "hcm", nom: "HCM", uni: "pg", cat: "Hemograma", rango: [15, 45], sin: ["hcm", "hemoglobina corpuscular media"] },
    { id: "rdw", nom: "RDW", uni: "%", cat: "Hemograma", rango: [8, 35], sin: ["rdw", "ancho de distribucion eritrocitaria"] },

    // Función renal
    { id: "cr", nom: "Creatinina", uni: "mg/dL", cat: "Función renal", rango: [0.2, 20], sin: ["creatinina", "creatinina serica", "creatina serica", "creatinina en suero"] },
    { id: "bun", nom: "BUN", uni: "mg/dL", cat: "Función renal", rango: [2, 200], sin: ["bun", "nitrogeno ureico", "be u ene", "nitrogeno ureico en sangre"] },
    { id: "urea", nom: "Urea", uni: "mg/dL", cat: "Función renal", rango: [5, 400], sin: ["urea"] },
    { id: "tfg", nom: "TFG", uni: "mL/min/1.73m2", cat: "Función renal", rango: [1, 180], sin: ["tfg", "tasa de filtracion glomerular", "filtracion glomerular", "depuracion de creatinina", "ckd epi", "egfr"] },
    { id: "au", nom: "Ácido úrico", uni: "mg/dL", cat: "Función renal", rango: [0.5, 20], sin: ["acido urico", "uricemia"] },

    // Electrolitos
    { id: "na", nom: "Sodio", uni: "mEq/L", cat: "Electrolitos", rango: [100, 180], sin: ["sodio", "natremia", "na serico"] },
    { id: "k", nom: "Potasio", uni: "mEq/L", cat: "Electrolitos", rango: [1.5, 9], sin: ["potasio", "kalemia", "ka serico"] },
    { id: "cl", nom: "Cloro", uni: "mEq/L", cat: "Electrolitos", rango: [70, 140], sin: ["cloro", "cloruro"] },
    { id: "ca", nom: "Calcio", uni: "mg/dL", cat: "Electrolitos", rango: [4, 18], sin: ["calcio", "calcio serico", "calcio total"] },
    { id: "mg", nom: "Magnesio", uni: "mg/dL", cat: "Electrolitos", rango: [0.5, 6], sin: ["magnesio"] },
    { id: "p", nom: "Fósforo", uni: "mg/dL", cat: "Electrolitos", rango: [0.5, 12], sin: ["fosforo", "fosfato"] },

    // Perfil lipídico
    { id: "ct", nom: "Colesterol total", uni: "mg/dL", cat: "Perfil lipídico", rango: [50, 600], sin: ["colesterol total", "colesterol"] },
    { id: "ldl", nom: "Colesterol LDL", uni: "mg/dL", cat: "Perfil lipídico", rango: [10, 500], sin: ["ldl", "colesterol ldl", "ele de ele", "ldl colesterol"] },
    { id: "hdl", nom: "Colesterol HDL", uni: "mg/dL", cat: "Perfil lipídico", rango: [5, 150], sin: ["hdl", "colesterol hdl", "hache de ele", "hdl colesterol"] },
    { id: "tg", nom: "Triglicéridos", uni: "mg/dL", cat: "Perfil lipídico", rango: [20, 3000], sin: ["trigliceridos", "triglicerido"] },
    { id: "lpa", nom: "Lipoproteína (a)", uni: "mg/dL", cat: "Perfil lipídico", rango: [1, 400], sin: ["lipoproteina a", "lp a", "lipoproteina pequeña a"] },
    { id: "apob", nom: "Apolipoproteína B", uni: "mg/dL", cat: "Perfil lipídico", rango: [10, 300], sin: ["apolipoproteina b", "apo b"] },

    // Metabólico
    { id: "glu", nom: "Glucemia", uni: "mg/dL", cat: "Metabólico", rango: [20, 900], sin: ["glucemia", "glucosa", "glicemia", "glucosa en ayunas", "azucar"] },
    { id: "a1c", nom: "HbA1c", uni: "%", cat: "Metabólico", rango: [3, 20], sin: ["hemoglobina glicosilada", "hemoglobina glicada", "hba1c", "a1c", "hache be a uno ce"] },
    { id: "ins", nom: "Insulina", uni: "µUI/mL", cat: "Metabólico", rango: [0.5, 300], sin: ["insulina", "insulinemia"] },

    // Hepático
    { id: "ast", nom: "AST", uni: "U/L", cat: "Hepático", rango: [3, 5000], sin: ["ast", "tgo", "aspartato aminotransferasa", "transaminasa oxalacetica"] },
    { id: "alt", nom: "ALT", uni: "U/L", cat: "Hepático", rango: [3, 5000], sin: ["alt", "tgp", "alanino aminotransferasa", "transaminasa piruvica"] },
    { id: "fa", nom: "Fosfatasa alcalina", uni: "U/L", cat: "Hepático", rango: [10, 2000], sin: ["fosfatasa alcalina"] },
    { id: "ggt", nom: "GGT", uni: "U/L", cat: "Hepático", rango: [3, 2000], sin: ["ggt", "gamma glutamil transferasa", "gama glutamil"] },
    { id: "bt", nom: "Bilirrubina total", uni: "mg/dL", cat: "Hepático", rango: [0.1, 40], sin: ["bilirrubina total", "bilirrubina"] },
    { id: "bd", nom: "Bilirrubina directa", uni: "mg/dL", cat: "Hepático", rango: [0.02, 30], sin: ["bilirrubina directa"] },
    { id: "alb", nom: "Albúmina", uni: "g/dL", cat: "Hepático", rango: [1, 6], sin: ["albumina", "albumina serica"] },

    // Cardíaco
    { id: "ntprobnp", nom: "NT-proBNP", uni: "pg/mL", cat: "Cardíaco", rango: [5, 70000], sin: ["nt probnp", "ntprobnp", "nt pro bnp", "en te pro be ene pe", "pro bnp", "probnp", "nt pro b n p"] },
    { id: "bnp", nom: "BNP", uni: "pg/mL", cat: "Cardíaco", rango: [2, 5000], sin: ["bnp", "peptido natriuretico", "be ene pe"] },
    { id: "tnths", nom: "Troponina T ultrasensible", uni: "ng/L", cat: "Cardíaco", rango: [1, 50000], sin: ["troponina t ultrasensible", "troponina ultrasensible", "troponina t us", "troponina t", "troponina"] },
    { id: "tni", nom: "Troponina I", uni: "ng/L", cat: "Cardíaco", rango: [1, 50000], sin: ["troponina i", "troponina uno"] },
    { id: "cpk", nom: "CPK", uni: "U/L", cat: "Cardíaco", rango: [10, 50000], sin: ["cpk", "ck total", "creatin quinasa", "ce pe ka"] },
    { id: "ckmb", nom: "CK-MB", uni: "ng/mL", cat: "Cardíaco", rango: [0.2, 500], sin: ["ck mb", "ckmb", "ce ka eme be"] },

    // Tiroideo
    { id: "tsh", nom: "TSH", uni: "µUI/mL", cat: "Tiroideo", rango: [0.005, 200], sin: ["tsh", "te ese hache", "hormona estimulante de tiroides", "tirotropina"] },
    { id: "t4l", nom: "T4 libre", uni: "ng/dL", cat: "Tiroideo", rango: [0.1, 10], sin: ["t4 libre", "te cuatro libre", "tiroxina libre", "t 4 libre"] },
    { id: "t3", nom: "T3", uni: "ng/dL", cat: "Tiroideo", rango: [20, 600], sin: ["t3", "te tres", "triyodotironina"] },

    // Coagulación
    { id: "inr", nom: "INR", uni: "", cat: "Coagulación", rango: [0.5, 12], sin: ["inr", "i ene erre", "razon normalizada internacional"] },
    { id: "pt", nom: "PT", uni: "segundos", cat: "Coagulación", rango: [8, 120], sin: ["pt", "tiempo de protrombina", "protrombina"] },
    { id: "ptt", nom: "PTT", uni: "segundos", cat: "Coagulación", rango: [15, 200], sin: ["ptt", "tiempo parcial de tromboplastina", "tromboplastina"] },
    { id: "fib", nom: "Fibrinógeno", uni: "mg/dL", cat: "Coagulación", rango: [30, 1200], sin: ["fibrinogeno"] },
    { id: "dd", nom: "Dímero D", uni: "ng/mL", cat: "Coagulación", rango: [10, 60000], sin: ["dimero d", "dimero de", "di mero d"] },

    // Metabolismo del hierro
    { id: "fer", nom: "Ferritina", uni: "ng/mL", cat: "Metabolismo del hierro", rango: [1, 20000], sin: ["ferritina"] },
    { id: "fe", nom: "Hierro sérico", uni: "µg/dL", cat: "Metabolismo del hierro", rango: [5, 600], sin: ["hierro serico", "hierro", "sideremia"] },
    { id: "trf", nom: "Transferrina", uni: "mg/dL", cat: "Metabolismo del hierro", rango: [50, 600], sin: ["transferrina"] },
    { id: "ist", nom: "Saturación de transferrina", uni: "%", cat: "Metabolismo del hierro", rango: [1, 100], sin: ["saturacion de transferrina", "indice de saturacion de transferrina", "saturacion de la transferrina", "ist"] },
    { id: "tibc", nom: "Capacidad total de fijación de hierro", uni: "µg/dL", cat: "Metabolismo del hierro", rango: [100, 900], sin: ["capacidad total de fijacion de hierro", "tibc", "capacidad de fijacion"] },

    // Inflamación / otros
    { id: "pcr", nom: "PCR", uni: "mg/L", cat: "Inflamación", rango: [0.05, 600], sin: ["pcr", "proteina c reactiva", "pe ce erre"] },
    { id: "vsg", nom: "VSG", uni: "mm/h", cat: "Inflamación", rango: [1, 150], sin: ["vsg", "velocidad de sedimentacion", "sedimentacion globular"] },
    { id: "vitd", nom: "Vitamina D", uni: "ng/mL", cat: "Inflamación", rango: [2, 200], sin: ["vitamina d", "veinticinco hidroxi vitamina d", "25 hidroxivitamina d"] },
    { id: "b12", nom: "Vitamina B12", uni: "pg/mL", cat: "Inflamación", rango: [30, 3000], sin: ["vitamina b12", "vitamina be doce", "cobalamina"] },
    { id: "tsat", nom: "Ácido fólico", uni: "ng/mL", cat: "Inflamación", rango: [0.2, 40], sin: ["acido folico", "folatos", "folato"] },

    // Orina
    { id: "malb", nom: "Microalbuminuria", uni: "mg/L", cat: "Orina", rango: [0.5, 5000], sin: ["microalbuminuria", "micro albuminuria", "albuminuria"] },
    { id: "rac", nom: "Relación albúmina/creatinina urinaria", uni: "mg/g", cat: "Orina", rango: [0.5, 10000], sin: ["relacion albumina creatinina", "rac", "relacion albuminuria creatinuria", "cociente albumina creatinina"] },
    { id: "prot24", nom: "Proteinuria de 24 horas", uni: "mg/24h", cat: "Orina", rango: [10, 30000], sin: ["proteinuria de 24 horas", "proteinuria en 24 horas", "proteinuria"] },

    // Gases arteriales
    { id: "ph", nom: "pH", uni: "", cat: "Gases arteriales", rango: [6.6, 7.9], sin: ["ph", "pe hache"] },
    { id: "pao2", nom: "PaO2", uni: "mmHg", cat: "Gases arteriales", rango: [20, 600], sin: ["pao2", "pa o2", "presion arterial de oxigeno", "po2"] },
    { id: "paco2", nom: "PaCO2", uni: "mmHg", cat: "Gases arteriales", rango: [10, 130], sin: ["paco2", "pa co2", "presion arterial de dioxido de carbono", "pco2"] },
    { id: "hco3", nom: "HCO3", uni: "mEq/L", cat: "Gases arteriales", rango: [3, 60], sin: ["hco3", "bicarbonato", "hache ce o tres"] },
    { id: "sato2", nom: "SatO2", uni: "%", cat: "Gases arteriales", rango: [30, 100], sin: ["saturacion de oxigeno", "sato2", "sat o2", "saturacion"] },
    { id: "lac", nom: "Lactato", uni: "mmol/L", cat: "Gases arteriales", rango: [0.2, 30], sin: ["lactato", "acido lactico"] }
  ];

  var CATEGORIAS = ["Hemograma", "Función renal", "Electrolitos", "Perfil lipídico", "Metabólico",
    "Hepático", "Cardíaco", "Tiroideo", "Coagulación", "Metabolismo del hierro", "Inflamación",
    "Orina", "Gases arteriales", "Otros"];

  /* Estudios descriptivos: su texto va al bloque narrativo, no a la tabla */
  var NARRATIVOS = [
    { nom: "Ecocardiograma", sin: ["ecocardiograma", "ecocardiografia", "eco transtoracico", "eco doppler", "ecocardiograma transesofagico"] },
    { nom: "Electrocardiograma", sin: ["electrocardiograma", "ekg", "ecg"] },
    { nom: "Holter", sin: ["holter"] },
    { nom: "Prueba de esfuerzo", sin: ["prueba de esfuerzo", "test de esfuerzo", "ergometria"] },
    { nom: "AngioTAC", sin: ["angiotac", "angio tac", "tac de torax", "tomografia", "escanografia", "tac contrastado"] },
    { nom: "Radiografía de tórax", sin: ["radiografia de torax", "rayos x de torax", "placa de torax"] },
    { nom: "Resonancia cardíaca", sin: ["resonancia cardiaca", "resonancia magnetica", "cardio resonancia"] },
    { nom: "Cateterismo", sin: ["cateterismo", "coronariografia", "arteriografia coronaria"] },
    { nom: "Espirometría", sin: ["espirometria"] },
    { nom: "Caminata de 6 minutos", sin: ["caminata de 6 minutos", "test de caminata", "caminata de seis minutos"] },
    { nom: "Polisomnografía", sin: ["polisomnografia"] }
  ];

  /* ---------- 2. Utilidades de texto --------------------------------------
     "plano" conserva la longitud del texto original: cada carácter se
     reemplaza por uno solo. Así los índices de búsqueda siguen sirviendo
     sobre el texto original y no se pierden tildes ni mayúsculas.
     ---------------------------------------------------------------------- */
  function plano(t) {
    var out = "";
    for (var i = 0; i < t.length; i++) {
      var c = t.charAt(i).toLowerCase();
      var d = c.normalize("NFD").charAt(0);
      out += /[a-z0-9]/.test(d) ? d : " ";
    }
    return out;
  }

  function normalizar(t) {
    return (t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
  }

  var UNIDADES_HABLADAS = [
    [/miligramos? por decilitro/g, "mg/dL"],
    [/gramos? por decilitro/g, "g/dL"],
    [/microgramos? por decilitro/g, "µg/dL"],
    [/nanogramos? por mililitro/g, "ng/mL"],
    [/nanogramos? por litro/g, "ng/L"],
    [/picogramos? por mililitro/g, "pg/mL"],
    [/miliequivalentes? por litro/g, "mEq/L"],
    [/milimoles? por litro/g, "mmol/L"],
    [/micromoles? por litro/g, "µmol/L"],
    [/unidades? por litro/g, "U/L"],
    [/miligramos? por litro/g, "mg/L"],
    [/milimetros? de mercurio/g, "mmHg"],
    [/por ?ciento/g, "%"]
  ];

  var RELLENO = /\b(?:es|esta|estaba|era|de|del|en|con|un|una|el|la|los|las|valor|reporta|reporte|dio|quedo|quedó|resultado|fue|tiene|traia|traía|igual a|a)\b/g;

  /* Números en palabras -> cifras (0 – 999.999) */
  var UNI = { cero: 0, un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, trece: 13, catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18, diecinueve: 19, veinte: 20, veintiuno: 21, veintiun: 21, veintidos: 22, veintitres: 23, veinticuatro: 24, veinticinco: 25, veintiseis: 26, veintisiete: 27, veintiocho: 28, veintinueve: 29 };
  var DEC = { treinta: 30, cuarenta: 40, cincuenta: 50, sesenta: 60, setenta: 70, ochenta: 80, noventa: 90 };
  var CEN = { cien: 100, ciento: 100, doscientos: 200, trescientos: 300, cuatrocientos: 400, quinientos: 500, seiscientos: 600, setecientos: 700, ochocientos: 800, novecientos: 900 };

  function esNum(w) { return UNI[w] !== undefined || DEC[w] !== undefined || CEN[w] !== undefined || w === "mil"; }

  function palabrasANumero(tokens) {
    var total = 0, actual = 0, uso = false;
    for (var i = 0; i < tokens.length; i++) {
      var w = tokens[i];
      if (w === "y") continue;
      if (w === "mil") { actual = (actual === 0 ? 1 : actual) * 1000; total += actual; actual = 0; uso = true; continue; }
      if (CEN[w] !== undefined) { actual += CEN[w]; uso = true; continue; }
      if (DEC[w] !== undefined) { actual += DEC[w]; uso = true; continue; }
      if (UNI[w] !== undefined) { actual += UNI[w]; uso = true; continue; }
    }
    return uso ? total + actual : null;
  }

  function nucleo(tok) {
    // devuelve {palabra, cola}: la parte alfanumérica sin tildes y lo que la sigue
    var p = plano(tok);
    var ini = p.search(/[a-z0-9]/);
    if (ini === -1) return { palabra: "", cola: tok };
    var fin = ini;
    while (fin < p.length && /[a-z0-9]/.test(p.charAt(fin))) fin++;
    return { palabra: p.slice(ini, fin), cola: tok.slice(fin) };
  }

  function convertirNumerosHablados(t) {
    var tok = t.split(/\s+/);
    var out = [], buf = [];
    function volcar() {
      if (!buf.length) return;
      var n = palabrasANumero(buf);
      out.push(n === null ? buf.join(" ") : String(n));
      buf = [];
    }
    for (var i = 0; i < tok.length; i++) {
      var n1 = nucleo(tok[i]);
      if (esNum(n1.palabra)) {
        buf.push(n1.palabra);
        if (n1.cola.trim()) { volcar(); out.push(n1.cola.trim()); }
        continue;
      }
      if (n1.palabra === "y" && buf.length && tok[i + 1] && esNum(nucleo(tok[i + 1]).palabra)) continue;
      volcar();
      out.push(tok[i]);
    }
    volcar();
    return out.join(" ").replace(/\s+/g, " ").trim();
  }

  /* Limpia el texto descriptivo sin perder tildes ni mayúsculas */
  function pulirNarrativo(t) {
    t = t.replace(/\s*por ?ciento/gi, "%");
    t = convertirNumerosHablados(t);
    t = t.replace(/(\d)\s+%/g, "$1%");
    t = t.replace(/(\d)\s*(?:coma|punto)\s*(\d)/gi, "$1,$2");
    return t.replace(/\s+([,.%])/g, "$1").replace(/\s+/g, " ").trim();
  }

  function arreglarCifras(t) {
    // separador de miles: 8.500 / 210.000 / 8,500 -> 8500 / 210000
    t = t.replace(/\b(\d{1,3}(?:[.,]\d{3})+)\b/g, function (m) { return m.replace(/[.,]/g, ""); });
    // decimales dictados: "14 coma 2" / "1 punto 1" -> 14,2 / 1,1
    t = t.replace(/(\d)\s*(?:coma|punto)\s*(\d)/g, "$1,$2");
    t = t.replace(/(\d)\s*\.\s*(\d)/g, "$1,$2");
    t = t.replace(/(\d)\s*,\s*(\d)/g, "$1,$2");
    return t;
  }

  function preparar(texto) {
    var t = normalizar(texto);
    UNIDADES_HABLADAS.forEach(function (p) { t = t.replace(p[0], p[1]); });
    t = convertirNumerosHablados(t);
    t = arreglarCifras(t);
    return t;
  }

  /* ---------- 3. Fecha ----------------------------------------------------- */
  var MESES = { enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6, julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12 };
  function pad(x) { x = String(x); return x.length === 1 ? "0" + x : x; }

  function extraerFecha(t) {
    var m = t.match(/\b(\d{1,2})\s*[\/-]\s*(\d{1,2})\s*[\/-]\s*(\d{2,4})\b/);
    if (m) return pad(m[1]) + "/" + pad(m[2]) + "/" + (m[3].length === 2 ? "20" + m[3] : m[3]);
    var re = new RegExp("\\b(\\d{1,2}) de (" + Object.keys(MESES).join("|") + ")(?: de (\\d{4}))?", "i");
    var m2 = t.match(re);
    if (m2) return pad(m2[1]) + "/" + pad(MESES[m2[2]]) + "/" + (m2[3] || String(new Date().getFullYear()));
    return "";
  }

  /* ---------- 4. Extracción ------------------------------------------------ */
  var UNI_RE = "%|mg\\/dL|g\\/dL|µg\\/dL|ng\\/mL|ng\\/L|pg\\/mL|mEq\\/L|mmol\\/L|µmol\\/L|U\\/L|mg\\/L|mmHg|mm\\/h|fL|pg|mg\\/g|mg\\/24h|segundos";
  var RE_NUM = new RegExp("(\\d+(?:,\\d{1,3})?)\\s*(" + UNI_RE + ")?", "i");

  var UNI_CANON = {};
  ["%", "mg/dL", "g/dL", "µg/dL", "ng/mL", "ng/L", "pg/mL", "mEq/L", "mmol/L", "µmol/L",
    "U/L", "mg/L", "mmHg", "mm/h", "fL", "pg", "mg/g", "mg/24h", "segundos"]
    .forEach(function (u) { UNI_CANON[u.toLowerCase()] = u; });
  function canonUnidad(u) { return u ? (UNI_CANON[u.toLowerCase()] || u) : u; }

  function aNumero(s) { return parseFloat(String(s).replace(",", ".")); }
  function escaparRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  function construirIndice() {
    var items = [];
    DICCIONARIO.forEach(function (d) { d.sin.forEach(function (s) { items.push({ tipo: "lab", clave: normalizar(s), def: d }); }); });
    NARRATIVOS.forEach(function (d) { d.sin.forEach(function (s) { items.push({ tipo: "narrativo", clave: normalizar(s), def: d }); }); });
    items.sort(function (a, b) { return b.clave.length - a.clave.length; });
    return items;
  }
  var INDICE = construirIndice();

  function limpiarNarrativo(seg) {
    var t = seg.replace(/^[\s,.:;-]+/, "").replace(/[\s,.;:]+$/, "");
    t = t.replace(/^(?:del|de|el|que|con|muestra|reporta|informa|dice)\s+/i, "");
    var f = extraerFecha(preparar(t.slice(0, 40)));
    if (f) t = t.replace(/^\d{1,2}\s*[\/-]\s*\d{1,2}\s*[\/-]\s*\d{2,4}/, "")
                .replace(new RegExp("^\\d{1,2} de (" + Object.keys(MESES).join("|") + ")(?: de \\d{4})?", "i"), "")
                .replace(/^[\s,.:;-]+/, "");
    t = pulirNarrativo(t);
    if (t) t = t.charAt(0).toUpperCase() + t.slice(1);
    return { fecha: f, texto: t };
  }

  function analizar(textoOriginal) {
    var orig = (textoOriginal || "").replace(/\s+/g, " ").trim();
    var pl = plano(orig);

    var marcas = [];
    INDICE.forEach(function (it) {
      var patron = escaparRegex(it.clave).replace(/\\?\s+/g, "\\s+");
      var re = new RegExp("(?:^|[^a-z0-9])(" + patron + ")(?![a-z0-9])", "g");
      var m;
      while ((m = re.exec(pl)) !== null) {
        var ini = m.index + m[0].length - m[1].length;
        var fin = ini + m[1].length;
        var choca = marcas.some(function (x) { return ini < x.fin && fin > x.ini; });
        if (!choca) marcas.push({ ini: ini, fin: fin, tipo: it.tipo, def: it.def });
        re.lastIndex = m.index + 1;
      }
    });
    marcas.sort(function (a, b) { return a.ini - b.ini; });

    var resultados = [], narrativo = [], avisos = [], sueltos = [];
    var corteNarrativo = marcas.length ? (marcas.filter(function (m) { return m.tipo === "narrativo"; })[0] || {}).ini : undefined;
    var fecha = extraerFecha(preparar(orig.slice(0, corteNarrativo !== undefined ? corteNarrativo : orig.length)));

    if (!marcas.length && orig) sueltos.push(orig);

    for (var i = 0; i < marcas.length; i++) {
      var mk = marcas[i];
      var hasta = i + 1 < marcas.length ? marcas[i + 1].ini : orig.length;
      var seg = orig.slice(mk.fin, hasta);

      if (mk.tipo === "narrativo") {
        var lim = limpiarNarrativo(seg);
        narrativo.push({ nom: mk.def.nom, texto: lim.texto, fecha: lim.fecha });
        continue;
      }

      var prep = preparar(seg).replace(RELLENO, " ").replace(/\s+/g, " ").trim();
      var mm = prep.match(RE_NUM);
      if (!mm || mm.index > 6) {
        avisos.push("Falta el valor de " + mk.def.nom + ". Escríbalo a mano o repita el dictado.");
        if (prep.replace(/[\s,.]/g, "").length > 3) sueltos.push(seg.trim());
        continue;
      }
      var cifra = mm[1];
      var unidad = mm[2] ? canonUnidad(mm[2]) : mk.def.uni;
      var num = aNumero(cifra);
      if (mk.def.rango && (num < mk.def.rango[0] || num > mk.def.rango[1])) {
        avisos.push(mk.def.nom + " " + cifra + (unidad ? " " + unidad : "") + " está fuera del rango habitual. Confirme el dato.");
      }
      var sobra = prep.slice(mm.index + mm[0].length).trim();
      if (sobra.replace(/[\s,.]/g, "").length > 3) sueltos.push(sobra);

      resultados.push({ cat: mk.def.cat, nom: mk.def.nom, valor: cifra, uni: unidad, id: mk.def.id });
    }

    return {
      fecha: fecha,
      resultados: resultados,
      narrativo: narrativo,
      avisos: avisos,
      sinInterpretar: sueltos.filter(function (s) { return s && s.length > 3; }).join(" · ")
    };
  }

  /* ---------- 5. Redacción del texto final --------------------------------- */
  function redactar(datos, opts) {
    opts = opts || {};
    var sep = opts.decimal === "." ? "." : ",";
    var formato = opts.formato || "parrafo";
    var agrupar = opts.orden !== "dictado";
    var fecha = opts.fecha !== undefined ? opts.fecha : datos.fecha;
    var items = datos.resultados || [];
    var narr = datos.narrativo || [];
    if (!items.length && !narr.length) return "";

    function cifra(v) {
      var p = String(v).split(",");
      var mil = sep === "." ? "," : ".";
      var ent = p[0].length > 3 ? p[0].replace(/\B(?=(\d{3})+(?!\d))/g, mil) : p[0];
      return p[1] ? ent + sep + p[1] : ent;
    }
    function pieza(r) {
      var v = cifra(r.valor);
      if (!r.uni) return r.nom + " " + v;
      if (r.uni === "%") return r.nom + " " + v + "%";
      return r.nom + " " + v + " " + r.uni;
    }

    var bloques;
    if (agrupar) {
      var g = {};
      items.forEach(function (r) { (g[r.cat] = g[r.cat] || []).push(r); });
      bloques = CATEGORIAS.filter(function (c) { return g[c]; }).map(function (c) { return { cat: c, filas: g[c] }; });
    } else {
      bloques = [{ cat: "", filas: items }];
    }

    var cab = "Laboratorios" + (fecha ? " (" + fecha + ")" : "") + ":";
    var cuerpo;
    if (!items.length) {
      cuerpo = "";
    } else if (formato === "lineas") {
      cuerpo = cab + "\n" + bloques.map(function (b) {
        return b.filas.map(function (r) { return "- " + pieza(r); }).join("\n");
      }).join("\n");
    } else if (formato === "categorias") {
      cuerpo = cab + "\n" + bloques.map(function (b) {
        return (b.cat ? b.cat + ": " : "") + b.filas.map(pieza).join(", ") + ".";
      }).join("\n");
    } else {
      cuerpo = cab + " " + bloques.map(function (b) { return b.filas.map(pieza).join(", "); }).join(", ") + ".";
    }

    narr.forEach(function (n) {
      var linea = n.nom + (n.fecha ? " (" + n.fecha + ")" : "") + (n.texto ? ": " + n.texto : "");
      cuerpo += "\n" + linea.replace(/\.?$/, ".");
    });
    return cuerpo.trim();
  }

  root.LabParser = {
    DICCIONARIO: DICCIONARIO,
    CATEGORIAS: CATEGORIAS,
    NARRATIVOS: NARRATIVOS,
    preparar: preparar,
    analizar: analizar,
    redactar: redactar
  };
})(typeof window !== "undefined" ? window : globalThis);
