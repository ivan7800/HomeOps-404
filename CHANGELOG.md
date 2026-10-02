# Cambios

## 1.1.2 — 2026-09-07

- Edición web para GitHub Pages con todos los recursos publicables en la raíz.
- Añadido `ABRIR-LOCAL.bat` para iniciar un servidor local de forma sencilla.
- Añadida ayuda visible cuando el HTML se abre directamente con `file://`.
- Actualizada la caché del service worker.

## 1.1.1 — 2026-09-07

- Corregida la gráfica anual: sus alturas ya no dependen de estilos inline bloqueados por la CSP.
- Actualizada la versión de caché del service worker para que la corrección llegue a instalaciones existentes.

## 1.1.0 — 2026-09-07

- Asistente inicial para preparar un hogar nuevo y migración compatible con datos v1.0.
- Historial de mantenimiento independiente: trabajo, objeto, fecha, coste, proveedor y notas.
- Ubicación y etiquetas en tareas y objetos, con búsqueda ampliada.
- Gastos recurrentes semanales, mensuales, trimestrales o anuales, con expansión segura por mes.
- Visión anual de gastos con gráfico accesible y resumen mensual.
- Antelación y activación de avisos configurables.
- Copias cifradas con AES-GCM-256 y derivación PBKDF2-SHA-256; la contraseña nunca se persiste.
- Importación y exportación JSON de lista de compras para mover datos con Compra 404 sin servidor.
- Service worker actualizado a la caché 1.1.0.
- 34 pruebas automatizadas superadas.

No incluye cuentas, sincronización online, notificaciones garantizadas con la app cerrada, OCR, lector/generador QR ni cifrado de los datos abiertos en IndexedDB.

## 1.0.0 — 2026-09-06

- Primera versión funcional de HomeOps 404.
- Resumen del hogar, tareas, mantenimiento, inventario, documentos, gastos y compras.
- Gestión de personas locales, preferencias de legibilidad y presupuesto mensual.
- Almacenamiento local en IndexedDB con transacciones de datos y adjuntos.
- Conflictos entre pestañas detectados por revisión; borradores de formulario conservados durante refrescos.
- Copia JSON completa y restauración validada con integridad de adjuntos.
- CSV de gastos y exportación CSV del inventario.
- Calendario ICS, compartición de compras y enlace independiente a Compra 404.
- PWA con recursos locales, ámbito relativo y caché aislada de otras apps.
- Ayuda de instalación para navegadores que no muestran el diálogo automático.
- 31 pruebas de lógica, copias y contrato del service worker superadas.

No incluye sincronización remota, cuentas familiares, cifrado documental, automatismos con la app cerrada ni pruebas de navegador certificadas.
