# Auditoría de release · HomeOps 404 v1.1.2

Fecha: 7 de septiembre de 2026

## Estado final

**PUBLICABLE CON LIMITACIONES**

La aplicación arranca como PWA estática, no requiere backend ni dependencias de ejecución, supera las pruebas automatizadas y queda preparada para GitHub Pages. La publicación no se clasifica como verificada al 100 % porque la versión alojada solicita inicio de sesión y no ha sido posible ejecutar el flujo de usuario dentro del navegador de auditoría.

## Diagnóstico

- Tecnología: HTML, CSS y JavaScript ES Modules sin build obligatorio.
- Arquitectura: aplicación local-first; IndexedDB para estado y documentos; Web Crypto para copias cifradas; service worker para el shell offline.
- Función principal: gestionar tareas, mantenimiento, inventario, documentos, gastos, compras y copias del hogar en el dispositivo.
- Destino: hosting estático HTTPS, especialmente GitHub Pages con los archivos publicables en la raíz.
- Alcance: edición web aplanada; aproximadamente 277 KB de aplicación.

## Hallazgo corregido

### [REL-001] Estilo inline incompatible con CSP en la gráfica anual

- **Severidad:** MEDIA
- **Estado:** CORREGIDO
- **Evidencia:** la gráfica generaba `style="height: ..."` mientras `index.html` declaraba `style-src 'self'`.
- **Impacto:** las barras podían quedar sin altura en navegadores que aplican la directiva CSP a atributos de estilo.
- **Corrección:** las alturas se redondean a clases `h0`–`h100` y se definen en `styles.css`.
- **Verificación:** no quedan atributos `style`; sintaxis, 34 pruebas y comprobación estática superadas.

## Funciones

| Función | Clasificación | Evidencia |
| --- | --- | --- |
| Navegación, tareas y filtros | REAL | Implementación y acciones asociadas revisadas; lógica cubierta parcialmente por pruebas |
| Mantenimiento programado e histórico | REAL | CRUD, vínculos y pruebas de dominio |
| Inventario y garantías | REAL | CRUD, vínculos y avisos |
| Documentos locales | REAL | IndexedDB, límites, previsualización/descarga y copias |
| Gastos, recurrencias, CSV y gráfica | REAL | Lógica probada; gráfica corregida frente a CSP |
| Compras e intercambio con Compra 404 | REAL | JSON/texto/compartición implementados; sin sincronización automática |
| Copias JSON y cifradas | REAL | AES-GCM-256, PBKDF2-SHA-256, validación e integridad probadas |
| Calendario ICS | REAL | Fechas, alarmas, plegado UTF-8 y neutralización de saltos probados |
| PWA/offline | REAL con verificación limitada | Manifest, rutas, precaché y contrato del service worker probados; instalación real pendiente |
| Cuentas, sincronización y colaboración | AUSENTE | Limitación declarada; no se presentan como implementadas |

## Comprobaciones ejecutadas

- `node --check` sobre módulos, tests y herramientas: correcto.
- `node --test tests/*.test.mjs`: **34 correctas, 0 fallidas**.
- `node tools/check.mjs`: correcto; 13 archivos estáticos, recursos presentes, acciones con manejador, manifest y caché coherentes.
- Búsqueda de estilos inline: sin resultados después de la corrección.
- Revisión de URLs, CSP, scripts inline, `eval`, `new Function` y recursos externos: sin incidencia crítica conocida.
- Inventario, estructura y extracción del ZIP: correctos.
- `unzip -t`: correcto para el paquete original revisado.

## No ejecutado o no certificable

- Flujo end-to-end en navegador real con IndexedDB nativo.
- QA visual y táctil en iPhone, Android, Safari, Firefox, Edge y distintos anchos.
- Instalación real y actualización de PWA.
- Prueba offline real tras cerrar y volver a abrir.
- Auditoría formal WCAG 2.2 AA, criptográfica o antivirus.
- Publicación y recarga desde el repositorio GitHub Pages final del usuario.

La URL alojada disponible durante la auditoría mostró una pantalla de inicio de sesión de ChatGPT. No se introdujeron credenciales ni se transmitieron datos personales.

## Puntuación condicionada

Estimación técnica, limitada por las pruebas manuales pendientes: **9,2/10**.

Para alcanzar una clasificación superior hay que ejecutar el checklist del `VERIFICACION.md` en dispositivos y navegadores reales, especialmente persistencia, documentos, copias cifradas, instalación y modo offline.

## Instrucciones de publicación

Publicar todo el contenido de este paquete en la raíz del repositorio GitHub Pages. Mantener `index.html`, `app.js`, `styles.css`, los módulos, `manifest.webmanifest`, `sw.js`, `assets/`, `icons/` y `.nojekyll`.
