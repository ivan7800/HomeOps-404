# HomeOps 404

Gestión del hogar local-first · v1.1.2 · I. Roig

Tareas, mantenimiento, inventario, garantías, documentos, gastos y compras en una PWA estática, sin backend ni dependencias de ejecución externas.

## Publicar en GitHub Pages

1. Crea un repositorio, por ejemplo `HomeOps-404`.
2. Sube **todo el contenido de este paquete** a la raíz del repositorio. `index.html`, `app.js`, `styles.css`, etc. deben quedar directamente en la raíz.
3. Conserva las carpetas `assets` e `icons` y el archivo `.nojekyll`.
4. En GitHub: **Settings → Pages → Deploy from a branch → main → / (root)**.
5. Abre la dirección HTTPS que indique GitHub Pages. No se necesita compilación, Node ni un servidor propio.

La app utiliza rutas relativas y navegación por fragmentos (`#tasks`, `#items`...), por lo que admite una subruta de GitHub Pages.

Esta edición ya está preparada para GitHub Pages: no hay que entrar en ninguna carpeta ni mover archivos.

## Probar en el ordenador

Con Python 3 instalado, desde la carpeta del proyecto:

```bash
python -m http.server 8080
```

Abre `http://localhost:8080`. No abras `index.html` por doble clic: los módulos JavaScript, el almacenamiento y la PWA requieren un origen web apropiado.

## Primeros pasos

1. En **Mi hogar**, cambia el nombre y añade personas.
2. Registra una tarea, su fecha y su responsable.
3. Añade un electrodoméstico u otro objeto al inventario.
4. Desde su ficha, vincula una factura o un mantenimiento.
5. Añade gastos para ver totales mensuales y presupuesto.
6. Descarga una **copia completa JSON** cuando tengas datos que quieras conservar.

En un hogar vacío puedes pulsar **Explorar con ejemplos**. Los datos se identifican como ficticios. **Empezar con mis datos** pide confirmación y elimina el ejemplo y cualquier cambio que hayas hecho dentro de él.

## Funciones incluidas

| Área | Funciones |
| --- | --- |
| Resumen | Próximos 7 días, tareas pendientes, inventario, gasto mensual y vencimientos |
| Tareas | Crear, editar, completar, eliminar, responsables, zonas, prioridad, ubicación, etiquetas, búsqueda y filtros |
| Mantenimiento | Tareas programadas y registro histórico con fecha, coste, proveedor, notas y objeto vinculado |
| Inventario | Objetos, electrodomésticos, vehículos, marca, serie o matrícula, compra, garantía, ubicación y etiquetas |
| Documentos | PDF, JPG, PNG y WebP locales, vista previa según navegador, descarga, vínculo con objetos y caducidad |
| Gastos | Registro en céntimos, categoría, persona, gastos recurrentes, totales mensuales, visión anual, presupuesto e importación/exportación CSV |
| Compras | Cantidades, marcar comprado, editar, compartir, copiar, descargar texto e importar/exportar JSON compatible |
| Personas | Nombres locales para asignar tareas y gastos; eliminación sin borrar sus registros |
| Copias | Exportación JSON normal o cifrada con AES-GCM-256, validación de esquema, hash SHA-256 por adjunto y restauración atómica |
| Calendario | Exportación `.ics` de próximas tareas y vencimientos, con alarma propuesta un día antes |
| PWA | Manifest, iconos locales, caché del shell, aviso de actualización y ayuda de instalación |
| Accesibilidad | Controles etiquetados, diálogos nativos, navegación por teclado, foco visible, texto grande y movimiento reducido |

## Límites importantes

- **Los datos permanecen en este navegador y origen web.** Otra dirección, navegador, perfil o dispositivo puede mostrar un hogar distinto.
- No hay cuentas, sincronización familiar, fusión de copias ni colaboración remota. Las personas son responsables locales, no usuarios conectados.
- El asistente inicial configura nombre, presupuesto, responsable y antelación de avisos en un hogar nuevo. Los hogares v1.0 se migran automáticamente con valores seguros.
- No hay notificaciones programadas con la app cerrada. La campana se calcula al usar la app. Para avisos externos, importa el `.ics` en tu calendario y verifica sus alarmas.
- El calendario exportado es una instantánea. Exporta de nuevo después de cambiar fechas. Tu calendario decide cómo gestionar las importaciones repetidas.
- Las tareas periódicas crean una única próxima fecha futura al completarlas. Se conserva el día de referencia cuando un mes corto obliga a ajustarlo.
- La fecha de garantía se introduce manualmente. No se calculan derechos o plazos legales.
- Un solo hogar por origen web. EUR como moneda. Presupuesto mensual único, no histórico de presupuestos.
- La lista de compras se comparte como texto. El enlace abre Compra 404 por separado; **no existe sincronización automática**.
- Los documentos almacenados en el navegador no tienen cifrado propio. La copia protegida usa AES-GCM-256, PBKDF2-SHA-256 y una contraseña que HomeOps no guarda. Protege también el dispositivo y el archivo cifrado; no es una caja fuerte ni un antivirus.
- Adjuntos: 5 MB por archivo y 60 MB en total. Copias de restauración: máximo 90 MB. CSV: 2 MB / 5.000 filas por importación. Límite de validación: 10.000 registros por colección.
- CSV admite importación de **gastos**; el inventario tiene exportación CSV. Para restaurar todo el proyecto doméstico, usa JSON.
- La importación CSV añade filas y no detecta duplicados. Usa su plantilla y revisa el resumen antes de confirmar.
- Borrar datos del sitio, usar navegación privada, perder el dispositivo o una expulsión del almacenamiento por el navegador puede causar pérdida de datos. Descarga copias externas.
- Una vista previa de PDF depende del visor del navegador; si no se ve, utiliza Descargar.
- La detección de cabecera de archivo y SHA-256 comprueban tipo aparente e integridad, **no ausencia de malware ni autenticidad**.

## Privacidad y seguridad

La app utiliza IndexedDB. No contiene analítica, APIs externas, claves o cargas de datos a servidores. La imagen y los iconos se sirven localmente. El proveedor de alojamiento puede conservar sus propios registros técnicos de acceso.

Las escrituras de datos y archivos se agrupan en una transacción. Los formularios comprueban la revisión de los registros para no sobrescribir silenciosamente cambios de otra pestaña. Los borradores de los formularios en pantalla se conservan durante una actualización de datos, pero no sobreviven a cerrar o recargar la página.

Los datos importados se reconstruyen con una lista de campos permitidos. Los textos se escapan al renderizar. La exportación CSV neutraliza prefijos de fórmula. La CSP no permite scripts inline, `eval` ni recursos remotos. Los enlaces a otra app usan `noopener noreferrer`.

El service worker solo gestiona sus propios archivos del shell. No intercepta registros, adjuntos, otros sitios o escrituras. Su limpieza de caché se limita al prefijo y ámbito de HomeOps, sin borrar cachés de otras apps 404 del mismo dominio. No se aplica una actualización pendiente sin confirmación.

## Verificación incluida

La auditoría técnica de la aplicación superó **34 pruebas automatizadas** de lógica, serialización, cifrado y contrato de service worker, además de comprobaciones de sintaxis, rutas, acciones, recursos, manifest y precaché. Consulta `VERIFICACION.md` y `AUDITORIA-RELEASE-v1.1.2.md` para conocer el alcance y lo pendiente.

Estas pruebas **no sustituyen pruebas reales de navegador**, de IndexedDB nativo, de interacción táctil o de instalación en iPhone, Android y PC. No se afirma una ausencia absoluta de bugs ni una auditoría de accesibilidad certificada.

## Estructura

- `index.html`, `app.js`, `styles.css` y módulos: aplicación publicable sin compilación.
- `assets/` e `icons/`: recursos locales.
- `ABRIR-LOCAL.bat`: lanzador de servidor local para Windows.
- `README.md`: uso, publicación, privacidad y límites.
- `CHANGELOG.md`: cambios de la versión.
- `VERIFICACION.md`: comprobaciones realizadas y checklist de navegador.

## Actualizaciones futuras

Cambia la versión de caché en `sw.js` cuando cambies archivos de la app. Mantén la base de datos y añade migraciones explícitas si modificas su estructura; no borres los datos para actualizar. Valida una copia real antes de cambiar el esquema.

La fotografía del salón es un recurso original generado para esta app. Es ilustrativa y no representa la vivienda del usuario. Los iconos son gráficos vectoriales de interfaz del proyecto.
