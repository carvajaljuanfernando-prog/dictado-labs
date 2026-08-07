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

  /* ---------- 1b. Estudios con variables propias --------------------------
     Cada estudio abre un "ámbito": mientras está activo, sus variables tienen
     prioridad sobre las de otros estudios. Así "PAD" es presión auricular
     derecha dentro de un cateterismo y presión arterial diastólica dentro
     de un MAPA, sin que el usuario tenga que aclararlo.
       par  : true  -> valor pareado, tipo 135/85
       cual : true  -> admite valor cualitativo (ocluida, sin lesiones…)
       tipo : "texto" -> captura palabras, no cifras
     ---------------------------------------------------------------------- */
  var ESTUDIOS = [

    /* ---------------- Ecocardiograma ---------------- */
    {
      id: "eco", nom: "Ecocardiograma",
      sin: ["ecocardiograma", "ecocardiografia", "eco transtoracico", "ecocardiograma transtoracico",
            "eco doppler", "ecocardiograma doppler", "ecocardiograma transesofagico", "eco transesofagico", "ecoscopia"],
      params: [
        { nom: "FEVI", uni: "%", rango: [5, 85], sin: ["fraccion de eyeccion del ventriculo izquierdo", "fraccion de eyeccion", "fevi", "fe del ventriculo izquierdo", "fraccion de eyeccion ventricular izquierda"] },
        { nom: "FEVD", uni: "%", rango: [5, 85], sin: ["fraccion de eyeccion del ventriculo derecho", "fevd"] },
        { nom: "TAPSE", uni: "mm", rango: [3, 40], sin: ["tapse", "excursion sistolica del anillo tricuspideo"] },
        { nom: "PSAP", uni: "mmHg", rango: [10, 150], sin: ["presion sistolica de la arteria pulmonar", "psap", "presion pulmonar estimada", "presion sistolica pulmonar", "presion arterial pulmonar sistolica estimada"] },
        { nom: "Onda S tricuspídea", uni: "cm/s", rango: [3, 30], sin: ["onda s tricuspidea", "onda s del anillo tricuspideo", "s prima tricuspidea"] },
        { nom: "Relación TAPSE/PSAP", uni: "mm/mmHg", rango: [0.05, 3], sin: ["relacion tapse psap", "tapse sobre psap", "tapse psap"] },
        { nom: "Diámetro de aurícula izquierda", uni: "mm", rango: [15, 90], sin: ["diametro de auricula izquierda", "diametro auricular izquierdo", "auricula izquierda"] },
        { nom: "Volumen indexado de aurícula izquierda", uni: "mL/m2", rango: [8, 200], sin: ["volumen indexado de auricula izquierda", "volumen auricular izquierdo indexado", "vaii", "volumen indexado auricular izquierdo"] },
        { nom: "DDVI", uni: "mm", rango: [20, 100], sin: ["ddvi", "diametro diastolico del ventriculo izquierdo", "diametro diastolico final"] },
        { nom: "DSVI", uni: "mm", rango: [10, 90], sin: ["dsvi", "diametro sistolico del ventriculo izquierdo", "diametro sistolico final"] },
        { nom: "Septum interventricular", uni: "mm", rango: [3, 35], sin: ["septum interventricular", "espesor del septum", "septo interventricular", "tabique interventricular"] },
        { nom: "Pared posterior", uni: "mm", rango: [3, 35], sin: ["pared posterior", "espesor de la pared posterior"] },
        { nom: "Masa ventricular indexada", uni: "g/m2", rango: [20, 350], sin: ["masa ventricular indexada", "indice de masa ventricular izquierda", "masa del ventriculo izquierdo indexada"] },
        { nom: "Strain longitudinal global", uni: "%", rango: [-35, 35], sin: ["strain longitudinal global", "slg", "gls", "strain global longitudinal", "deformacion longitudinal global"] },
        { nom: "Relación E/A", uni: "", rango: [0.1, 6], sin: ["relacion e a", "relacion e sobre a", "cociente e a", "e sobre a"] },
        { nom: "Relación E/e'", uni: "", rango: [1, 40], sin: ["relacion e e prima", "e sobre e prima", "relacion e sobre e prima", "cociente e e prima"] },
        { nom: "Onda e' septal", uni: "cm/s", rango: [1, 25], sin: ["onda e prima septal", "e prima septal"] },
        { nom: "Onda e' lateral", uni: "cm/s", rango: [1, 30], sin: ["onda e prima lateral", "e prima lateral"] },
        { nom: "Gradiente medio", uni: "mmHg", rango: [1, 150], sin: ["gradiente medio", "gradiente transvalvular medio"] },
        { nom: "Gradiente máximo", uni: "mmHg", rango: [1, 250], sin: ["gradiente maximo", "gradiente pico", "gradiente transvalvular maximo"] },
        { nom: "Velocidad máxima", uni: "m/s", rango: [0.5, 8], sin: ["velocidad maxima", "vmax", "v maxima", "velocidad pico"] },
        { nom: "Área valvular aórtica", uni: "cm2", rango: [0.1, 5], sin: ["area valvular aortica", "area de la valvula aortica", "ava"] },
        { nom: "Área valvular mitral", uni: "cm2", rango: [0.1, 8], sin: ["area valvular mitral", "area de la valvula mitral", "avm"] },
        { nom: "Vena contracta", uni: "mm", rango: [0.5, 25], sin: ["vena contracta"] },
        { nom: "Orificio regurgitante efectivo", uni: "cm2", rango: [0.01, 2], sin: ["orificio regurgitante efectivo", "ore", "area del orificio regurgitante"] },
        { nom: "Volumen regurgitante", uni: "mL", rango: [1, 200], sin: ["volumen regurgitante"] },
        { nom: "Diámetro de vena cava inferior", uni: "mm", rango: [3, 45], sin: ["diametro de vena cava inferior", "vena cava inferior", "vci"] },
        { nom: "Diámetro de raíz aórtica", uni: "mm", rango: [15, 90], sin: ["diametro de raiz aortica", "raiz aortica", "aorta ascendente"] },
        { nom: "Derrame pericárdico", uni: "mm", rango: [1, 60], sin: ["derrame pericardico", "derrame"] }
      ]
    },

    /* ---------------- Holter de ritmo ---------------- */
    {
      id: "holter", nom: "Holter",
      sin: ["holter", "holter de ritmo", "holter de 24 horas", "monitoreo holter", "holter de arritmias", "monitoria de holter"],
      params: [
        { nom: "FC promedio", uni: "lpm", rango: [20, 220], sin: ["frecuencia cardiaca promedio", "fc promedio", "frecuencia promedio", "frecuencia cardiaca media", "fc media"] },
        { nom: "FC mínima", uni: "lpm", rango: [15, 200], sin: ["frecuencia cardiaca minima", "fc minima", "frecuencia minima"] },
        { nom: "FC máxima", uni: "lpm", rango: [30, 260], sin: ["frecuencia cardiaca maxima", "fc maxima", "frecuencia maxima"] },
        { nom: "Total de latidos", uni: "latidos", rango: [1000, 400000], sin: ["total de latidos", "latidos totales", "numero total de latidos"] },
        { nom: "Extrasístoles ventriculares", uni: "latidos", rango: [0, 200000], sin: ["extrasistoles ventriculares", "extrasistolia ventricular", "ectopia ventricular", "complejos ventriculares prematuros", "eev", "cvp"] },
        { nom: "Carga de extrasístoles ventriculares", uni: "%", rango: [0, 100], sin: ["carga de extrasistoles ventriculares", "carga ventricular", "carga de ectopia ventricular", "porcentaje de extrasistoles ventriculares"] },
        { nom: "Extrasístoles supraventriculares", uni: "latidos", rango: [0, 200000], sin: ["extrasistoles supraventriculares", "extrasistolia supraventricular", "ectopia supraventricular", "esv"] },
        { nom: "Episodios de TVNS", uni: "episodios", rango: [0, 5000], sin: ["episodios de tvns", "taquicardia ventricular no sostenida", "tvns", "rachas de taquicardia ventricular"] },
        { nom: "Episodios de TSV", uni: "episodios", rango: [0, 5000], sin: ["episodios de tsv", "taquicardia supraventricular", "tsv", "rachas supraventriculares"] },
        { nom: "Pausa máxima", uni: "segundos", rango: [0.5, 30], sin: ["pausa maxima", "pausa mas larga", "pausa mayor", "pausas"] },
        { nom: "Número de pausas", uni: "pausas", rango: [0, 5000], sin: ["numero de pausas", "total de pausas", "cantidad de pausas"] },
        { nom: "Carga de fibrilación auricular", uni: "%", rango: [0, 100], sin: ["carga de fibrilacion auricular", "carga de fa", "porcentaje de fibrilacion auricular"] },
        { nom: "Duración del registro", uni: "horas", rango: [1, 360], sin: ["duracion del registro", "tiempo de registro", "duracion del holter"] },
        { nom: "Ritmo de base", tipo: "texto", sin: ["ritmo de base", "ritmo predominante", "ritmo basal"] }
      ]
    },

    /* ---------------- MAPA ---------------- */
    {
      id: "mapa", nom: "MAPA",
      sin: ["mapa", "monitoreo ambulatorio de presion arterial", "monitoria ambulatoria de presion arterial",
            "holter de presion", "holter de presion arterial", "mapa de 24 horas", "monitoreo ambulatorio de la presion arterial"],
      params: [
        { nom: "PA promedio 24 horas", uni: "mmHg", par: true, sin: ["presion arterial promedio de 24 horas", "promedio de 24 horas", "presion promedio de 24 horas", "pa promedio 24 horas", "promedio en 24 horas", "presion arterial de 24 horas"] },
        { nom: "PA promedio diurna", uni: "mmHg", par: true, sin: ["presion arterial promedio diurna", "promedio diurno", "presion promedio diurna", "pa diurna", "presion diurna", "periodo diurno", "promedio de vigilia"] },
        { nom: "PA promedio nocturna", uni: "mmHg", par: true, sin: ["presion arterial promedio nocturna", "promedio nocturno", "presion promedio nocturna", "pa nocturna", "presion nocturna", "periodo nocturno", "promedio de sueño"] },
        { nom: "PAS promedio", uni: "mmHg", rango: [60, 260], sin: ["presion arterial sistolica promedio", "pas promedio", "sistolica promedio", "presion sistolica promedio"] },
        { nom: "PAD promedio", uni: "mmHg", rango: [30, 160], sin: ["presion arterial diastolica promedio", "pad promedio", "diastolica promedio", "presion diastolica promedio"] },
        { nom: "PAM", uni: "mmHg", rango: [40, 200], sin: ["presion arterial media", "pam", "presion media"] },
        { nom: "Presión de pulso", uni: "mmHg", rango: [10, 150], sin: ["presion de pulso", "presion diferencial"] },
        { nom: "Carga sistólica", uni: "%", rango: [0, 100], sin: ["carga sistolica", "carga de presion sistolica", "carga hipertensiva sistolica"] },
        { nom: "Carga diastólica", uni: "%", rango: [0, 100], sin: ["carga diastolica", "carga de presion diastolica", "carga hipertensiva diastolica"] },
        { nom: "Carga hipertensiva", uni: "%", rango: [0, 100], sin: ["carga hipertensiva", "carga de presion", "carga total"] },
        { nom: "Descenso nocturno", uni: "%", rango: [-40, 60], sin: ["descenso nocturno", "dipping", "caida nocturna", "reduccion nocturna", "descenso nocturno de la presion"] },
        { nom: "FC promedio", uni: "lpm", rango: [30, 180], sin: ["frecuencia cardiaca promedio", "fc promedio", "frecuencia promedio"] },
        { nom: "Lecturas válidas", uni: "%", rango: [0, 100], sin: ["lecturas validas", "porcentaje de lecturas validas", "tomas validas", "registros validos"] },
        { nom: "Patrón", tipo: "texto", sin: ["patron", "patron de descenso", "clasificacion del patron"] }
      ]
    },

    /* ---------------- Mesa basculante ---------------- */
    {
      id: "tilt", nom: "Mesa basculante",
      sin: ["mesa basculante", "prueba de mesa basculante", "tilt test", "test de inclinacion",
            "prueba de inclinacion", "mesa inclinada", "tilt table"],
      params: [
        { nom: "Tipo de respuesta", tipo: "texto", sin: ["tipo de respuesta", "patron de respuesta"] },
        { nom: "Tiempo hasta el síncope", uni: "minutos", rango: [0.1, 60], sin: ["tiempo hasta el sincope", "tiempo al sincope", "minuto del sincope", "latencia del sincope"] },
        { nom: "PA en el síncope", uni: "mmHg", par: true, sin: ["presion arterial en el sincope", "pa en el sincope", "presion en el sincope", "presion minima", "pa minima"] },
        { nom: "FC mínima", uni: "lpm", rango: [0, 180], sin: ["frecuencia cardiaca minima", "fc minima", "frecuencia minima"] },
        { nom: "Asistolia", uni: "segundos", rango: [0.5, 60], sin: ["asistolia", "pausa asistolica", "duracion de la asistolia"] },
        { nom: "Duración de la fase pasiva", uni: "minutos", rango: [1, 90], sin: ["duracion de la fase pasiva", "fase pasiva"] },
        { nom: "Duración de la fase farmacológica", uni: "minutos", rango: [1, 90], sin: ["duracion de la fase farmacologica", "fase farmacologica", "fase con nitroglicerina", "fase sensibilizada"] }
      ]
    },

    /* ---------------- Cateterismo derecho ---------------- */
    {
      id: "cd", nom: "Cateterismo derecho",
      sin: ["cateterismo derecho", "cateterismo cardiaco derecho", "cateterismo de camaras derechas",
            "cateterismo cardiaco de camaras derechas", "hemodinamia derecha", "estudio hemodinamico derecho", "cateterismo"],
      params: [
        { nom: "PAP media", uni: "mmHg", rango: [3, 100], sin: ["presion arterial pulmonar media", "presion media de la arteria pulmonar", "pap media", "papm", "presion pulmonar media", "media de arteria pulmonar"] },
        { nom: "PAP sistólica", uni: "mmHg", rango: [5, 180], sin: ["presion arterial pulmonar sistolica", "presion sistolica de la arteria pulmonar", "pap sistolica", "paps", "presion pulmonar sistolica"] },
        { nom: "PAP diastólica", uni: "mmHg", rango: [1, 100], sin: ["presion arterial pulmonar diastolica", "presion diastolica de la arteria pulmonar", "pap diastolica", "papd", "presion pulmonar diastolica"] },
        { nom: "PCP", uni: "mmHg", rango: [1, 60], sin: ["presion capilar pulmonar", "presion de enclavamiento", "presion de cuña", "presion en cuña", "pcp", "paop", "wedge", "presion de oclusion de la arteria pulmonar"] },
        { nom: "PAD", uni: "mmHg", rango: [0, 40], sin: ["presion auricular derecha", "presion de auricula derecha", "pad", "presion media de auricula derecha"] },
        { nom: "PVD sistólica", uni: "mmHg", rango: [5, 180], sin: ["presion sistolica del ventriculo derecho", "pvd sistolica", "presion ventricular derecha sistolica"] },
        { nom: "PVD diastólica final", uni: "mmHg", rango: [0, 45], sin: ["presion diastolica final del ventriculo derecho", "pvd diastolica final", "presion telediastolica del ventriculo derecho"] },
        { nom: "Gasto cardíaco", uni: "L/min", rango: [1, 15], sin: ["gasto cardiaco", "debito cardiaco", "gc por termodilucion", "gc por fick", "gasto por termodilucion", "gasto por fick", "gc"] },
        { nom: "Índice cardíaco", uni: "L/min/m2", rango: [0.5, 8], sin: ["indice cardiaco", "ic"] },
        { nom: "RVP", uni: "UW", rango: [0.2, 40], sin: ["resistencia vascular pulmonar", "resistencias vasculares pulmonares", "resistencias pulmonares", "rvp"] },
        { nom: "RVS", uni: "dyn·s·cm-5", rango: [200, 4000], sin: ["resistencia vascular sistemica", "resistencias vasculares sistemicas", "rvs"] },
        { nom: "Gradiente transpulmonar", uni: "mmHg", rango: [0, 60], sin: ["gradiente transpulmonar", "gtp"] },
        { nom: "Gradiente diastólico pulmonar", uni: "mmHg", rango: [-10, 40], sin: ["gradiente diastolico pulmonar", "gdp"] },
        { nom: "SvO2", uni: "%", rango: [20, 90], sin: ["saturacion venosa mixta", "svo2", "sat venosa mixta", "saturacion de oxigeno venosa mixta"] },
        { nom: "SaO2", uni: "%", rango: [40, 100], sin: ["saturacion arterial", "sao2", "saturacion arterial de oxigeno"] },
        { nom: "PAPi", uni: "", rango: [0.1, 20], sin: ["papi", "indice de pulsatilidad arterial pulmonar", "indice de pulsatilidad pulmonar"] },
        { nom: "Volumen sistólico", uni: "mL", rango: [10, 150], sin: ["volumen sistolico", "volumen latido"] },
        { nom: "Índice de volumen sistólico", uni: "mL/m2", rango: [5, 90], sin: ["indice de volumen sistolico", "volumen sistolico indexado"] },
        { nom: "Compliance arterial pulmonar", uni: "mL/mmHg", rango: [0.2, 12], sin: ["compliance arterial pulmonar", "distensibilidad arterial pulmonar", "compliance pulmonar"] },
        { nom: "Prueba de vasorreactividad", tipo: "texto", sin: ["prueba de vasorreactividad", "test de vasorreactividad", "vasorreactividad", "prueba con oxido nitrico"] }
      ]
    },

    /* ---------------- Arteriografía coronaria ---------------- */
    {
      id: "cor", nom: "Arteriografía coronaria",
      sin: ["arteriografia coronaria", "arteriografia", "coronariografia", "angiografia coronaria",
            "cateterismo izquierdo", "cateterismo cardiaco izquierdo", "angiografia de coronarias", "coronariografia diagnostica"],
      params: [
        { nom: "Tronco común izquierdo", uni: "%", rango: [0, 100], cual: true, sin: ["tronco comun izquierdo", "tronco coronario izquierdo", "tronco principal izquierdo", "tci", "tronco"] },
        { nom: "Descendente anterior", uni: "%", rango: [0, 100], cual: true, sin: ["descendente anterior", "arteria descendente anterior", "da", "ada"] },
        { nom: "Circunfleja", uni: "%", rango: [0, 100], cual: true, sin: ["circunfleja", "arteria circunfleja", "cx"] },
        { nom: "Coronaria derecha", uni: "%", rango: [0, 100], cual: true, sin: ["coronaria derecha", "arteria coronaria derecha", "cd"] },
        { nom: "Primera diagonal", uni: "%", rango: [0, 100], cual: true, sin: ["primera diagonal", "diagonal", "dg", "primera rama diagonal"] },
        { nom: "Obtusa marginal", uni: "%", rango: [0, 100], cual: true, sin: ["obtusa marginal", "marginal obtusa", "om", "rama marginal"] },
        { nom: "Descendente posterior", uni: "%", rango: [0, 100], cual: true, sin: ["descendente posterior", "arteria descendente posterior", "dp"] },
        { nom: "FFR", uni: "", rango: [0.2, 1.05], sin: ["ffr", "reserva fraccional de flujo", "reserva de flujo fraccional"] },
        { nom: "iFR", uni: "", rango: [0.2, 1.05], sin: ["ifr", "indice diastolico instantaneo"] },
        { nom: "Puntaje SYNTAX", uni: "puntos", rango: [0, 90], sin: ["puntaje syntax", "score de syntax", "syntax score", "syntax"] },
        { nom: "Flujo TIMI", uni: "", rango: [0, 3], sin: ["flujo timi", "timi"] },
        { nom: "Dominancia", tipo: "texto", sin: ["dominancia", "circulacion dominante"] }
      ]
    },

    /* ---------------- Prueba de esfuerzo ---------------- */
    {
      id: "esf", nom: "Prueba de esfuerzo",
      sin: ["prueba de esfuerzo", "test de esfuerzo", "ergometria", "prueba de banda sin fin", "prueba de esfuerzo convencional"],
      params: [
        { nom: "METs alcanzados", uni: "METs", rango: [1, 25], sin: ["mets alcanzados", "mets", "equivalentes metabolicos", "capacidad funcional"] },
        { nom: "FC máxima alcanzada", uni: "lpm", rango: [40, 240], sin: ["frecuencia cardiaca maxima alcanzada", "fc maxima alcanzada", "frecuencia cardiaca maxima", "fc maxima"] },
        { nom: "Porcentaje de FC máxima teórica", uni: "%", rango: [10, 130], sin: ["porcentaje de la frecuencia cardiaca maxima teorica", "porcentaje de fc maxima teorica", "porcentaje de la maxima teorica"] },
        { nom: "Duración del ejercicio", uni: "minutos", rango: [0.5, 40], sin: ["duracion del ejercicio", "tiempo de ejercicio", "duracion de la prueba"] },
        { nom: "PA máxima", uni: "mmHg", par: true, sin: ["presion arterial maxima", "pa maxima", "presion maxima alcanzada"] },
        { nom: "Depresión del ST", uni: "mm", rango: [0.2, 10], sin: ["depresion del st", "infradesnivel del st", "descenso del st"] },
        { nom: "Puntaje de Duke", uni: "puntos", rango: [-25, 15], sin: ["puntaje de duke", "score de duke", "duke treadmill score", "escala de duke"] },
        { nom: "Motivo de suspensión", tipo: "texto", sin: ["motivo de suspension", "razon de suspension", "motivo de terminacion"] }
      ]
    },

    /* ---------------- Caminata de 6 minutos ---------------- */
    {
      id: "c6m", nom: "Caminata de 6 minutos",
      sin: ["caminata de 6 minutos", "caminata de seis minutos", "test de caminata", "prueba de caminata de 6 minutos", "tc6m", "test de marcha de 6 minutos"],
      params: [
        { nom: "Distancia recorrida", uni: "metros", rango: [10, 900], sin: ["distancia recorrida", "distancia caminada", "metros recorridos", "distancia"] },
        { nom: "Porcentaje del predicho", uni: "%", rango: [5, 150], sin: ["porcentaje del predicho", "porcentaje del valor predicho", "del predicho"] },
        { nom: "SpO2 basal", uni: "%", rango: [40, 100], sin: ["saturacion basal", "spo2 basal", "saturacion inicial"] },
        { nom: "SpO2 final", uni: "%", rango: [40, 100], sin: ["saturacion final", "spo2 final", "saturacion al final", "saturacion minima"] },
        { nom: "Borg final", uni: "puntos", rango: [0, 10], sin: ["borg final", "escala de borg", "borg"] },
        { nom: "FC final", uni: "lpm", rango: [40, 220], sin: ["frecuencia cardiaca final", "fc final"] }
      ]
    },

    /* ---------------- Espirometría ---------------- */
    {
      id: "espiro", nom: "Espirometría",
      sin: ["espirometria", "espirometria pre y post broncodilatador", "prueba de funcion pulmonar", "pruebas de funcion pulmonar"],
      params: [
        { nom: "FEV1", uni: "L", rango: [0.2, 6], sin: ["fev1", "volumen espiratorio forzado en el primer segundo", "vef1"] },
        { nom: "FEV1 del predicho", uni: "%", rango: [5, 160], sin: ["fev1 del predicho", "porcentaje del fev1", "vef1 del predicho"] },
        { nom: "CVF", uni: "L", rango: [0.3, 8], sin: ["cvf", "capacidad vital forzada", "fvc"] },
        { nom: "Relación FEV1/CVF", uni: "%", rango: [10, 100], sin: ["relacion fev1 cvf", "indice de tiffeneau", "fev1 sobre cvf", "relacion vef1 cvf"] },
        { nom: "DLCO", uni: "%", rango: [5, 160], sin: ["dlco", "capacidad de difusion", "difusion de monoxido de carbono"] }
      ]
    },

    /* ---------------- Polisomnografía ---------------- */
    {
      id: "psg", nom: "Polisomnografía",
      sin: ["polisomnografia", "poligrafia respiratoria", "estudio de sueño", "poligrafia"],
      params: [
        { nom: "IAH", uni: "eventos/h", rango: [0, 150], sin: ["iah", "indice de apnea hipopnea", "indice apnea hipopnea"] },
        { nom: "SpO2 mínima", uni: "%", rango: [30, 100], sin: ["saturacion minima", "spo2 minima", "saturacion mas baja"] },
        { nom: "Tiempo con SpO2 menor de 90%", uni: "%", rango: [0, 100], sin: ["tiempo con saturacion menor de 90", "t90", "tiempo por debajo de 90"] },
        { nom: "Índice de desaturación", uni: "eventos/h", rango: [0, 150], sin: ["indice de desaturacion", "odi"] }
      ]
    },

    /* ---------------- Estudios sin variables numéricas fijas ---------------- */
    { id: "ekg", nom: "Electrocardiograma", sin: ["electrocardiograma", "ekg", "ecg", "electro"], params: [
        { nom: "FC", uni: "lpm", rango: [15, 260], sin: ["frecuencia cardiaca", "fc", "frecuencia"] },
        { nom: "PR", uni: "ms", rango: [60, 500], sin: ["intervalo pr", "pr"] },
        { nom: "QRS", uni: "ms", rango: [40, 300], sin: ["duracion del qrs", "qrs"] },
        { nom: "QTc", uni: "ms", rango: [250, 700], sin: ["qtc", "qt corregido", "intervalo qt corregido"] },
        { nom: "Eje eléctrico", uni: "grados", rango: [-180, 180], sin: ["eje electrico", "eje del qrs", "eje"] },
        { nom: "Ritmo", tipo: "texto", sin: ["ritmo"] }
      ] },
    { id: "angiotac", nom: "AngioTAC", sin: ["angiotac", "angio tac", "angiotomografia", "tac de torax", "tomografia de torax", "escanografia de torax", "tac contrastado"], params: [
        { nom: "Puntaje de calcio", uni: "unidades Agatston", rango: [0, 6000], sin: ["puntaje de calcio", "score de calcio", "calcio coronario", "agatston"] }
      ] },
    { id: "rmc", nom: "Resonancia cardíaca", sin: ["resonancia cardiaca", "resonancia magnetica cardiaca", "cardio resonancia", "resonancia magnetica"], params: [
        { nom: "FEVI", uni: "%", rango: [5, 85], sin: ["fraccion de eyeccion del ventriculo izquierdo", "fraccion de eyeccion", "fevi"] },
        { nom: "FEVD", uni: "%", rango: [5, 85], sin: ["fraccion de eyeccion del ventriculo derecho", "fevd"] },
        { nom: "T1 nativo", uni: "ms", rango: [700, 1600], sin: ["t1 nativo", "mapeo t1"] },
        { nom: "T2", uni: "ms", rango: [20, 120], sin: ["mapeo t2", "t2"] },
        { nom: "Volumen extracelular", uni: "%", rango: [15, 70], sin: ["volumen extracelular", "vec", "ecv"] },
        { nom: "Realce tardío", tipo: "texto", sin: ["realce tardio", "realce tardio de gadolinio", "realce"] }
      ] },
    { id: "rxt", nom: "Radiografía de tórax", sin: ["radiografia de torax", "rayos x de torax", "placa de torax", "rx de torax"], params: [
        { nom: "Índice cardiotorácico", uni: "", rango: [0.2, 0.95], sin: ["indice cardiotoracico", "ict"] }
      ] }
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

  /* Unidades dictadas en palabras -> símbolo. Las más largas primero. */
  var UNIDADES_HABLADAS = [
    [/litros? por minuto por metro cuadrado/g, "L/min/m2"],
    [/mililitros? por milimetro de mercurio/g, "mL/mmHg"],
    [/mililitros? por metro cuadrado/g, "mL/m2"],
    [/mililitros?/g, "mL"],
    [/miligramos? por decilitro/g, "mg/dL"],
    [/gramos? por decilitro/g, "g/dL"],
    [/gramos? por metro cuadrado/g, "g/m2"],
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
    [/milimetros?/g, "mm"],
    [/centimetros? cuadrados?/g, "cm2"],
    [/centimetros? por segundo/g, "cm/s"],
    [/centimetros?/g, "cm"],
    [/litros? por minuto/g, "L/min"],
    [/litros?/g, "L"],
    [/latidos? por minuto/g, "lpm"],
    [/unidades? wood/g, "UW"],
    [/unidades? agatston/g, "unidades Agatston"],
    [/metros? por segundo/g, "m/s"],
    [/eventos? por hora/g, "eventos\/h"],
    [/milisegundos?/g, "ms"],
    [/por ?ciento/g, "%"]
  ];

  var RELLENO = /\b(?:es|esta|estaba|era|fue|de|del|en|con|un|una|el|la|los|las|valor|reporta|reporte|dio|quedo|resultado|tiene|traia|igual|a|al|por)\b/g;

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

  function arreglarCifras(t) {
    t = t.replace(/\b(\d{1,3}(?:[.,]\d{3})+)\b/g, function (m) { return m.replace(/[.,]/g, ""); });
    t = t.replace(/(\d)\s*(?:coma|punto)\s*(\d)/g, "$1,$2");
    t = t.replace(/(\d)\s*\.\s*(\d)/g, "$1,$2");
    t = t.replace(/(\d)\s*,\s*(\d)/g, "$1,$2");
    return t;
  }

  /* Texto listo para leer cifras: unidades, números hablados y decimales */
  function preparar(texto) {
    var t = normalizar(texto);
    UNIDADES_HABLADAS.forEach(function (p) { t = t.replace(p[0], p[1]); });
    t = convertirNumerosHablados(t);
    t = t.replace(/(\d)\s+%/g, "$1%");
    t = arreglarCifras(t);
    t = t.replace(/\bmenos\s+(\d)/g, "-$1");
    return t;
  }

  /* Texto descriptivo: mismas conversiones, pero conservando tildes */
  function pulirNarrativo(t) {
    t = t.replace(/\s*por ?ciento/gi, "%");
    t = convertirNumerosHablados(t);
    t = t.replace(/(\d)\s+%/g, "$1%");
    t = t.replace(/(\d)\s*(?:coma|punto)\s*(\d)/gi, "$1,$2");
    t = t.replace(/\b(\d{1,3}(?:[.,]\d{3})+)\b/g, function (m) {
      return m.replace(/[.,]/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    });
    return t.replace(/\s+([,.%])/g, "$1").replace(/\s+/g, " ").replace(/^[\s,.:;–-]+/, "").replace(/[\s,;:]+$/, "").trim();
  }

  /* ---------- 3. Fecha ----------------------------------------------------- */
  var MESES = { enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6, julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12 };
  function pad(x) { x = String(x); return x.length === 1 ? "0" + x : x; }

  function extraerFecha(t) {
    var m = t.match(/\b(\d{1,2})\s*[\/-]\s*(\d{1,2})\s*[\/-]\s*(\d{2,4})\b/);
    if (m) return pad(m[1]) + "/" + pad(m[2]) + "/" + (m[3].length === 2 ? "20" + m[3] : m[3]);
    var re = new RegExp("\\b(\\d{1,2}) de (" + Object.keys(MESES).join("|") + ")(?: de (\\d{4}))?", "i");
    var m2 = t.match(re);
    if (m2) return pad(m2[1]) + "/" + pad(MESES[m2[2].toLowerCase()]) + "/" + (m2[3] || String(new Date().getFullYear()));
    return "";
  }
  function quitarFecha(t) {
    t = t.replace(/\b\d{1,2}\s*[\/-]\s*\d{1,2}\s*[\/-]\s*\d{2,4}\b/, "")
         .replace(new RegExp("\\b\\d{1,2} de (" + Object.keys(MESES).join("|") + ")(?: de \\d{4})?", "i"), "");
    var antes;
    do {
      antes = t;
      t = t.replace(/^[\s,.:;–-]+/, "").replace(/[\s,.:;–-]+$/, "")
           .replace(/^(?:del|de|el|la|que|realizado|realizada|tomado|tomada|hecho|practicado|con fecha)\b/i, "")
           .replace(/\b(?:del|de|el|la|con fecha|realizado|realizada|tomado|tomada)$/i, "");
    } while (t !== antes);
    return t.trim();
  }

  /* ---------- 4. Índice de términos --------------------------------------- */
  var UNIDADES_SIMBOLO = ["mL/mmHg", "L/min/m2", "mL/m2", "mm/mmHg", "L/min", "eventos/h", "mg/dL", "g/dL",
    "µg/dL", "ng/mL", "ng/L", "pg/mL", "mEq/L", "mmol/L", "µmol/L", "mg/L", "g/m2", "U/L", "cm/s", "m/s",
    "cm2", "mmHg", "mm/h", "unidades Agatston", "UW", "lpm", "METs", "mL", "ms", "fL", "pg", "mg/g",
    "mg/24h", "segundos", "minutos", "grados", "metros", "latidos", "episodios", "pausas", "puntos", "horas", "mm", "cm", "L", "%"];
  var UNI_CANON = {};
  UNIDADES_SIMBOLO.forEach(function (u) { UNI_CANON[u.toLowerCase()] = u; });
  function canonUnidad(u) { return u ? (UNI_CANON[u.toLowerCase()] || u) : u; }

  function escaparRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  var UNI_RE = UNIDADES_SIMBOLO.map(escaparRegex).join("|");
  var RE_PAR = new RegExp("(-?\\d+(?:,\\d{1,3})?)\\s*(?:\\/|sobre|barra)\\s*(-?\\d+(?:,\\d{1,3})?)");
  var RE_NUM = new RegExp("(-?\\d+(?:,\\d{1,3})?)\\s*(" + UNI_RE + ")?", "i");
  var RE_CUAL = /\b(ocluida|ocluido|oclusion total|oclusion cronica total|sin lesiones significativas|sin lesiones|sin obstrucciones|lesion no significativa|no significativa|permeable|normal|irregularidades parietales|ateromatosis no obstructiva)\b/i;

  /* clave normalizada -> lista de dueños posibles */
  var CLAVES = {};
  function registrar(clave, dueno) {
    var k = normalizar(clave);
    if (!k) return;
    (CLAVES[k] = CLAVES[k] || []).push(dueno);
  }
  DICCIONARIO.forEach(function (d) {
    d.sin.forEach(function (s) { registrar(s, { tipo: "lab", def: d }); });
  });
  ESTUDIOS.forEach(function (e) {
    e.sin.forEach(function (s) { registrar(s, { tipo: "estudio", est: e }); });
    (e.params || []).forEach(function (p) {
      p.sin.forEach(function (s) { registrar(s, { tipo: "param", def: p, est: e }); });
    });
  });
  var FRASES = Object.keys(CLAVES).sort(function (a, b) { return b.length - a.length; });

  /* ---------- 5. Análisis --------------------------------------------------- */
  var RE_ANTES = new RegExp("(-?\\d+(?:,\\d{1,3})?)\\s*(" + UNI_RE + ")?\\s*[,.]?\\s*$", "i");

  /* Valor dictado ANTES del nombre: "62% del predicho", "35% de fracción de eyección" */
  function valorPrevio(cola, p) {
    if (!cola) return null;
    var m = cola.match(RE_ANTES);
    if (!m) return null;
    return { valor: m[1], uni: m[2] ? canonUnidad(m[2]) : (p.uni !== undefined ? p.uni : ""), consumido: m[0] };
  }

  function valorDe(prep, p) {
    // 1) valor pareado tipo 135/85
    if (p.par) {
      var mp = prep.match(RE_PAR);
      if (mp && prep.indexOf(mp[0]) <= 8) return { valor: mp[1] + "/" + mp[2], uni: p.uni, fin: prep.indexOf(mp[0]) + mp[0].length };
    }
    // 2) cifra con unidad opcional
    var mm = prep.match(RE_NUM);
    if (mm && mm.index <= 8) {
      return { valor: mm[1], uni: mm[2] ? canonUnidad(mm[2]) : (p.uni !== undefined ? p.uni : ""), fin: mm.index + mm[0].length };
    }
    // 3) descripción cualitativa (vasos coronarios)
    if (p.cual) {
      var mc = prep.match(RE_CUAL);
      if (mc && mc.index <= 12) return { valor: mc[1], uni: "", fin: mc.index + mc[0].length };
    }
    return null;
  }

  function analizar(textoOriginal) {
    var orig = (textoOriginal || "").replace(/\s+/g, " ").trim();
    if (!orig) return { fecha: "", resultados: [], estudios: [], avisos: [], sinInterpretar: "" };
    var pl = plano(orig);

    /* --- 5a. localizar frases, la más larga gana --- */
    var spans = [];
    FRASES.forEach(function (frase) {
      var patron = escaparRegex(frase).replace(/\\?\s+/g, "\\s+");
      var re = new RegExp("(?:^|[^a-z0-9])(" + patron + ")(?![a-z0-9])", "g");
      var m;
      while ((m = re.exec(pl)) !== null) {
        var ini = m.index + m[0].length - m[1].length;
        var fin = ini + m[1].length;
        var choca = spans.some(function (x) { return ini < x.fin && fin > x.ini; });
        if (!choca) spans.push({ ini: ini, fin: fin, duenos: CLAVES[frase] });
        re.lastIndex = m.index + 1;
      }
    });
    spans.sort(function (a, b) { return a.ini - b.ini; });

    /* --- 5b. resolver a quién pertenece cada frase, según el ámbito --- */
    var resultados = [], estudios = [], avisos = [], sueltos = [];
    var ambito = null;

    function abrirEstudio(e) {
      var ya = estudios.filter(function (x) { return x.id === e.id; })[0];
      if (ya) { ambito = ya; return ya; }
      var nuevo = { id: e.id, nom: e.nom, fecha: "", texto: "" };
      estudios.push(nuevo);
      ambito = nuevo;
      return nuevo;
    }

    function resolver(duenos) {
      var i;
      for (i = 0; i < duenos.length; i++) if (duenos[i].tipo === "estudio") return duenos[i];
      if (ambito) for (i = 0; i < duenos.length; i++) if (duenos[i].tipo === "param" && duenos[i].est.id === ambito.id) return duenos[i];
      for (i = 0; i < duenos.length; i++) if (duenos[i].tipo === "lab") return duenos[i];
      return duenos[0];
    }

    /* sobra del término anterior: puede contener el valor del siguiente */
    var pendiente = null;

    function guardarSobra(txt) {
      var limpio = (txt || "").trim();
      if (!limpio) { pendiente = null; return; }
      pendiente = { texto: limpio, indice: sueltos.length };
      sueltos.push(limpio);
    }
    function usarPendiente() {
      if (pendiente) { sueltos[pendiente.indice] = ""; pendiente = null; }
    }
    /* Cola descriptiva corta -> nota de la fila; si no, va a "sin interpretar" */
    function repartirSobra(texto, fila) {
      var t = (texto || "").replace(/^[\s,.;:]+/, "").replace(/[\s,.;:]+$/, "");
      if (!t) { pendiente = null; return; }
      if (fila && !/\d/.test(t) && t.length <= 28 && /^[a-zñ\s]+$/i.test(t)) { fila.nota = t; pendiente = null; return; }
      guardarSobra(t);
    }
    function agregar(fila) {
      var previa = resultados.filter(function (r) { return r.cat === fila.cat && r.nom === fila.nom; })[0];
      if (previa && !/^-?\d/.test(String(previa.valor)) && !/^-?\d/.test(String(fila.valor))) {
        previa.valor += " " + fila.valor;   // dos trozos del mismo dato descriptivo
        return previa;
      }
      resultados.push(fila);
      return fila;
    }

    for (var s = 0; s < spans.length; s++) {
      var sp = spans[s];
      var hasta = s + 1 < spans.length ? spans[s + 1].ini : orig.length;
      var seg = orig.slice(sp.fin, hasta);
      var d = resolver(sp.duenos);

      /* --- nombre de estudio: abre ámbito y captura fecha + texto introductorio --- */
      if (d.tipo === "estudio") {
        pendiente = null;
        var est = abrirEstudio(d.est);
        var f = extraerFecha(preparar(seg.slice(0, 45)));
        if (f && !est.fecha) est.fecha = f;
        var libre = pulirNarrativo(f ? quitarFecha(seg) : seg);
        if (libre) {
          libre = libre.charAt(0).toUpperCase() + libre.slice(1);
          est.texto = est.texto ? est.texto + ". " + libre : libre;
        }
        continue;
      }

      /* --- variable de un estudio --- */
      if (d.tipo === "param") {
        if (!ambito || ambito.id !== d.est.id) abrirEstudio(d.est);
        var pp = d.def;

        if (pp.tipo === "texto") {
          pendiente = null;
          var libreP = pulirNarrativo(seg).replace(/^[:,.\s]+/, "");
          if (libreP) agregar({ grupo: "estudio", cat: d.est.nom, nom: pp.nom, valor: libreP, uni: "" });
          else avisos.push("Falta el dato de " + pp.nom + " en " + d.est.nom + ".");
          continue;
        }

        var prepP = preparar(seg).replace(RELLENO, " ").replace(/\s+/g, " ").trim();
        var vp = valorDe(prepP, pp);
        var filaP;
        if (!vp) {
          var previoP = valorPrevio(pendiente && pendiente.texto, pp);
          if (previoP) {
            usarPendiente();
            filaP = agregar({ grupo: "estudio", cat: d.est.nom, nom: pp.nom, valor: previoP.valor, uni: previoP.uni });
            repartirSobra(prepP, filaP);
            continue;
          }
          avisos.push("Falta el valor de " + pp.nom + " (" + d.est.nom + "). Escríbalo a mano o repita el dictado.");
          repartirSobra(prepP, null);
          continue;
        }
        if (pp.rango && !pp.par && /^-?\d/.test(vp.valor)) {
          var nv = parseFloat(vp.valor.replace(",", "."));
          if (nv < pp.rango[0] || nv > pp.rango[1]) {
            avisos.push(pp.nom + " " + vp.valor + (vp.uni ? " " + vp.uni : "") + " está fuera del rango habitual. Confirme el dato.");
          }
        }
        filaP = agregar({ grupo: "estudio", cat: d.est.nom, nom: pp.nom, valor: vp.valor, uni: vp.uni });
        repartirSobra(prepP.slice(vp.fin), filaP);
        continue;
      }

      /* --- analito de laboratorio --- */
      var def = d.def;
      var prep = preparar(seg).replace(RELLENO, " ").replace(/\s+/g, " ").trim();
      var v = valorDe(prep, def);
      var fila;
      if (!v) {
        var previo = valorPrevio(pendiente && pendiente.texto, def);
        if (previo) {
          usarPendiente();
          fila = agregar({ grupo: "lab", cat: def.cat, nom: def.nom, valor: previo.valor, uni: previo.uni });
          repartirSobra(prep, fila);
          continue;
        }
        avisos.push("Falta el valor de " + def.nom + ". Escríbalo a mano o repita el dictado.");
        repartirSobra(prep, null);
        continue;
      }
      var num = parseFloat(String(v.valor).replace(",", "."));
      if (def.rango && (num < def.rango[0] || num > def.rango[1])) {
        avisos.push(def.nom + " " + v.valor + (v.uni ? " " + v.uni : "") + " está fuera del rango habitual. Confirme el dato.");
      }
      fila = agregar({ grupo: "lab", cat: def.cat, nom: def.nom, valor: v.valor, uni: v.uni });
      repartirSobra(prep.slice(v.fin), fila);
    }

    /* fecha general: la del texto antes del primer estudio */
    var corte = spans.length ? spans[0].ini : orig.length;
    var primerEstudio = null;
    for (var q = 0; q < spans.length; q++) {
      if (resolver(spans[q].duenos).tipo === "estudio") { primerEstudio = spans[q].ini; break; }
    }
    var fechaGeneral = extraerFecha(preparar(orig.slice(0, primerEstudio === null ? orig.length : primerEstudio)));

    if (!spans.length) sueltos.push(orig);

    return {
      fecha: fechaGeneral,
      resultados: resultados,
      estudios: estudios,
      avisos: avisos,
      sinInterpretar: sueltos.filter(function (x) { return x && x.trim().length > 3; }).join(" · ")
    };
  }

  /* ---------- 6. Redacción del texto final --------------------------------- */
  function redactar(datos, opts) {
    opts = opts || {};
    var sep = opts.decimal === "." ? "." : ",";
    var formato = opts.formato || "parrafo";
    var agrupar = opts.orden !== "dictado";
    var fecha = opts.fecha !== undefined ? opts.fecha : datos.fecha;
    var items = datos.resultados || [];
    var estudios = datos.estudios || [];

    function cifra(v) {
      var p = String(v).split(",");
      var mil = sep === "." ? "," : ".";
      var ent = p[0].replace("-", "");
      ent = ent.length > 3 ? ent.replace(/\B(?=(\d{3})+(?!\d))/g, mil) : ent;
      if (p[0].charAt(0) === "-") ent = "-" + ent;
      return p[1] ? ent + sep + p[1] : ent;
    }
    function pieza(r) {
      var nota = r.nota ? " (" + r.nota + ")" : "";
      if (!/^-?[\d]/.test(String(r.valor))) return r.nom + " " + r.valor + nota;   // valor descriptivo
      var v = String(r.valor).indexOf("/") > -1
        ? String(r.valor).split("/").map(cifra).join("/")
        : cifra(r.valor);
      if (!r.uni) return r.nom + " " + v + nota;
      if (r.uni === "%") return r.nom + " " + v + "%" + nota;
      return r.nom + " " + v + " " + r.uni + nota;
    }

    var lineas = [];

    /* --- bloque de laboratorio --- */
    var labs = items.filter(function (r) { return r.grupo !== "estudio"; });
    if (labs.length) {
      var cab = "Laboratorios" + (fecha ? " (" + fecha + ")" : "") + ":";
      var bloques;
      if (agrupar) {
        var g = {};
        labs.forEach(function (r) { (g[r.cat] = g[r.cat] || []).push(r); });
        bloques = CATEGORIAS.filter(function (c) { return g[c]; }).map(function (c) { return { cat: c, filas: g[c] }; });
      } else {
        bloques = [{ cat: "", filas: labs }];
      }
      if (formato === "lineas") {
        lineas.push(cab + "\n" + bloques.map(function (b) {
          return b.filas.map(function (r) { return "- " + pieza(r); }).join("\n");
        }).join("\n"));
      } else if (formato === "categorias") {
        lineas.push(cab + "\n" + bloques.map(function (b) {
          return (b.cat ? b.cat + ": " : "") + b.filas.map(pieza).join(", ") + ".";
        }).join("\n"));
      } else {
        lineas.push(cab + " " + bloques.map(function (b) { return b.filas.map(pieza).join(", "); }).join(", ") + ".");
      }
    }

    /* --- un bloque por estudio, en el orden en que fueron dictados --- */
    estudios.forEach(function (e) {
      var filas = items.filter(function (r) { return r.grupo === "estudio" && r.cat === e.nom; });
      if (!filas.length && !e.texto) return;
      var cabE = e.nom + (e.fecha ? " (" + e.fecha + ")" : "") + ":";
      var intro = e.texto ? " " + e.texto.replace(/\.?$/, ".") : "";
      var cuerpo = "";
      if (filas.length) {
        cuerpo = formato === "lineas"
          ? "\n" + filas.map(function (r) { return "- " + pieza(r); }).join("\n")
          : " " + filas.map(pieza).join(", ") + ".";
      }
      lineas.push(cabE + intro + cuerpo);
    });

    return lineas.join("\n").trim();
  }

  root.LabParser = {
    DICCIONARIO: DICCIONARIO,
    CATEGORIAS: CATEGORIAS,
    ESTUDIOS: ESTUDIOS,
    preparar: preparar,
    analizar: analizar,
    redactar: redactar
  };
})(typeof window !== "undefined" ? window : globalThis);
