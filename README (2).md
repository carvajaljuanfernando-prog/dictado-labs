# Dictado de laboratorios

Aplicación web estática para transcribir por voz los resultados de laboratorio que el paciente trae a la consulta, asignarles las unidades usadas en Colombia y entregar un texto listo para pegar en la historia clínica.

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
2. Lea de corrido: *"hemoglobina catorce coma dos, creatinina uno punto uno, potasio cuatro coma dos, NT proBNP mil ochocientos cincuenta"*. No hace falta decir las unidades.
3. Al detener el dictado los resultados se organizan solos. También puede pulsar **Organizar resultados** o usar `Ctrl + Enter`.
4. Revise la tabla, corrija lo que haga falta y pulse **Copiar**.

Qué reconoce:

- **Analitos**: unos 70 exámenes de uso frecuente en cardiología y medicina interna, con sus sinónimos y las deformaciones típicas del reconocimiento de voz (*"en te pro be ene pe"* → NT-proBNP).
- **Números hablados**: *"mil ochocientos cincuenta"* → 1.850; *"catorce coma dos"* → 14,2.
- **Separador de miles**: *8.500* y *210.000* se interpretan como cifras enteras, no como decimales.
- **Fechas**: *"del 12 de junio de 2026"* → 12/06/2026.
- **Estudios descriptivos**: ecocardiograma, EKG, Holter, angioTAC, cateterismo, espirometría y otros pasan a un bloque de texto aparte, no a la tabla numérica.

Qué **no** hace, a propósito:

- No calcula ni estima nada. No deriva TFG, ni LDL por Friedewald, ni índices. Solo transcribe lo dictado.
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

Para los estudios descriptivos, la lista es `NARRATIVOS` y solo necesita `nom` y `sin`.

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
