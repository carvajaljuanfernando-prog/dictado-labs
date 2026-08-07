# Dictado clínico de laboratorios y estudios

Aplicación web estática para transcribir por voz los resultados que el paciente trae a la consulta —laboratorios y estudios cardiovasculares—, asignarles las unidades usadas en Colombia y entregar un texto listo para pegar en la historia clínica.

No necesita servidor, ni compilación, ni dependencias. Son tres archivos.

---

## Publicar en GitHub Pages

1. Cree un repositorio nuevo, por ejemplo `dictado-labs`.
2. Suba los tres archivos a la raíz: `index.html`, `parser.js`, `README.md`.
3. En el repositorio vaya a **Settings → Pages**.
4. En *Source* elija **Deploy from a branch**; en *Branch* elija `main` y la carpeta `/ (root)`. Guarde.
5. A los pocos minutos queda publicada en:
   `https://<su-usuario>.github.io/dictado-labs/`

Si el repositorio es público, cualquiera puede abrir esa dirección. La aplicación no guarda ni transmite datos, pero si prefiere que no sea accesible, use un repositorio privado con GitHub Pages habilitado en un plan que lo permita, o publíquela en Netlify con protección por contraseña.

Para probar antes de publicar, abra `index.html` directamente en Chrome desde su computador. El micrófono solo funciona en `https://` o en `localhost`, así que en local conviene levantar un servidor rápido:

```bash
python3 -m http.server 8000
# luego abra http://localhost:8000
```

---

## Uso en consulta

1. Pulse **Dictar resultados** y autorice el micrófono la primera vez.
2. Lea de corrido: *"hemoglobina catorce coma dos, creatinina uno coma uno. Cateterismo derecho del doce de junio, presión arterial pulmonar media cuarenta y cinco, presión capilar pulmonar doce, gasto cardíaco cuatro coma dos"*. No hace falta decir las unidades.
3. Al detener el dictado los resultados se organizan solos. También puede pulsar **Organizar resultados** o usar `Ctrl + Enter`.
4. Revise la tabla, corrija lo que haga falta y pulse **Copiar**.

Qué reconoce:

- **Analitos de laboratorio**: unos 70 exámenes de uso frecuente en cardiología y medicina interna, con sus sinónimos y las deformaciones típicas del reconocimiento de voz (*"en te pro be ene pe"* → NT-proBNP).
- **Estudios cardiovasculares con sus variables y unidades**: ecocardiograma, Holter, MAPA, mesa basculante, cateterismo derecho, arteriografía coronaria, prueba de esfuerzo, caminata de 6 minutos, electrocardiograma, angioTAC, resonancia cardíaca, espirometría, polisomnografía y radiografía de tórax.
- **Números hablados**: *"mil ochocientos cincuenta"* → 1.850; *"catorce coma dos"* → 14,2; *"menos treinta grados"* → -30 grados.
- **Valores pareados**: *"138 sobre 84"* → 138/84 mmHg, para presión arterial en MAPA, mesa basculante y prueba de esfuerzo.
- **Separador de miles**: *8.500* y *210.000* se interpretan como cifras enteras, no como decimales.
- **Fechas**: *"del 12 de junio de 2026"* → 12/06/2026, tanto la general como la de cada estudio por separado.
- **Descripciones cualitativas**: en arteriografía, *"coronaria derecha ocluida"* o *"tronco sin lesiones"* se conservan como valor.
- **Calificadores cortos**: *"descendente anterior 70 por ciento proximal"* → Descendente anterior 70% (proximal).
- **Valor dictado antes del nombre**: *"62 por ciento del predicho"* se asigna correctamente.

### El nombre del estudio abre un ámbito

Mientras un estudio está activo, sus variables tienen prioridad. Por eso conviene nombrarlo antes de dictar sus datos:

| Dictado | Interpretación |
|---|---|
| Cateterismo derecho… **PAD** 8 | Presión auricular derecha 8 mmHg |
| MAPA… **PAD promedio** 92 | Presión arterial diastólica promedio 92 mmHg |
| Ecocardiograma… **presión sistólica de la arteria pulmonar** 55 | PSAP 55 mmHg |
| Cateterismo derecho… **presión sistólica de la arteria pulmonar** 55 | PAP sistólica 55 mmHg |

Si dicta variables inconfundibles sin nombrar el estudio (*"PAP media 52, PCP 10, gasto cardíaco 3,8"*), la aplicación abre el bloque de cateterismo derecho por su cuenta.

Nota sobre dos términos ambiguos: *"cateterismo"* a secas se interpreta como cateterismo derecho, y *"coronariografía"*, *"arteriografía"* o *"cateterismo izquierdo"* como arteriografía coronaria.

Qué **no** hace, a propósito:

- No calcula ni estima nada. No deriva TFG, ni LDL por Friedewald, ni RVP a partir de las presiones, ni ningún índice hemodinámico. Solo transcribe lo dictado.
- No inventa valores. Si nombró un examen pero no se entendió la cifra, lo dice en *Revisar antes de pegar* y deja la fila fuera.
- Si un valor queda fuera del rango habitual en adultos, lo señala para que lo confirme. Es un aviso, no una corrección: nunca cambia el número que usted dictó.
- El dictado que no logró clasificar se muestra completo, para que nada se pierda en silencio.

---

## Privacidad

Todo el procesamiento ocurre en el navegador. La aplicación no envía los datos a ningún servidor propio ni de terceros y no guarda historial: al cerrar la pestaña no queda nada, salvo sus preferencias de formato.

Advertencia: el reconocimiento de voz de Chrome procesa el audio en los servidores de Google, igual que el dictado del teclado del sistema. Por eso **no dicte nombre, documento ni datos de identificación del paciente**, solo los valores.

---

## Agregar analitos

Todo el vocabulario vive en `parser.js`, en la lista `DICCIONARIO`. Para añadir uno, copie el patrón:

```js
{ id: "nt",  nom: "Nombre en la historia clínica",
  uni: "mg/dL",              // unidad que se escribe si no dicta otra
  cat: "Cardíaco",           // debe existir en CATEGORIAS
  rango: [0.1, 50],          // valores plausibles; fuera de esto se avisa
  sin: ["nombre dictado", "sigla", "como suena en el dictado"] },
```

En `sin` conviene incluir cómo lo transcribe el reconocimiento de voz, no solo cómo se escribe. Las variantes se comparan sin tildes y sin mayúsculas.

Los estudios están en la lista `ESTUDIOS`, cada uno con su propio conjunto de variables:

```js
{ id: "cd", nom: "Cateterismo derecho",
  sin: ["cateterismo derecho", "hemodinamia derecha"],
  params: [
    { nom: "PAP media", uni: "mmHg", rango: [3, 100],
      sin: ["presion arterial pulmonar media", "pap media", "papm"] },
    { nom: "PA promedio 24 horas", uni: "mmHg", par: true, sin: [...] },   // valor 138/84
    { nom: "Descendente anterior", uni: "%", cual: true, sin: [...] },     // admite "ocluida"
    { nom: "Dominancia", tipo: "texto", sin: [...] }                       // captura palabras
  ] }
```

- `par: true` acepta valores pareados (138/84).
- `cual: true` acepta descripciones en vez de cifras (ocluida, sin lesiones, permeable).
- `tipo: "texto"` captura la frase completa, sin buscar números.

Cuando dos estudios comparten un término, el ámbito activo decide. Si ninguno está activo, gana el estudio que aparezca primero en `ESTUDIOS`.

## Cambiar la presentación

Los colores están al inicio de `index.html`, en el bloque `:root`. `--navy` es el color principal y `--amber` el de acento.

---

## Compatibilidad

| Navegador | Dictado por voz | Resto de la aplicación |
|---|---|---|
| Chrome y Edge (escritorio y Android) | Sí | Sí |
| Safari (Mac y iOS) | Parcial, según versión | Sí |
| Firefox | No | Sí |

Donde no haya reconocimiento de voz, el cuadro de texto acepta el dictado del teclado del sistema (Windows: `Win + H`; iPhone y Android: micrófono del teclado) y el resto funciona igual.
