# Verificación de HomeOps 404 v1.1.2

Fecha: 7 de septiembre de 2026.

## Resultado comprobado

- 34 pruebas automatizadas: **34 correctas, 0 fallidas**.
- Sintaxis JavaScript de los módulos y el service worker correcta en Node 24.
- Recursos locales del HTML y módulos importados presentes.
- Manifest con inicio y ámbito relativos, iconos PNG 192/512 y SVG.
- Todos los recursos de ejecución contemplados en el precaché.
- Acciones literales declaradas con manejador asociado.
- El esquema admite datos v1.0 y añade valores por defecto para las nuevas colecciones y preferencias.
- No hay `eval`, `new Function`, scripts inline ni CSS importado desde una CDN.
- Edición web aplanada: los archivos publicables quedan directamente en la raíz del paquete.

## Cobertura de las 34 pruebas

- Fechas imposibles, bisiestos y cálculo por día sin desplazamientos de zona horaria.
- Repeticiones semanal, mensual, trimestral y anual, incluyendo día 31 y retrasos.
- Importes en céntimos, límites numéricos y suma por mes/categoría.
- Validación de esquema, versiones, referencias, IDs y campos permitidos.
- Completar tareas, historial y creación de la próxima ocurrencia sin duplicación.
- Avisos próximos y vencidos.
- CSV con acentos, comillas, saltos, separadores, fórmulas e importes inválidos.
- Escape HTML y calendario ICS con plegado UTF-8 y saltos de línea seguros.
- Copias completas y vacías: ida y vuelta de datos y bytes de adjuntos.
- Rechazo de copias con adjuntos ausentes, corruptos o de tipo distinto.
- Rechazo de HTML, SVG y ejecutables como adjuntos, según cabecera.
- Service worker en un entorno simulado: precaché, subruta, aislamiento de cachés, respuesta desde caché, peticiones ignoradas y actualización explícita.
- Gastos recurrentes y gráficos anuales.
- Avisos configurables.
- Cifrado y descifrado AES-GCM de copias, contraseñas incorrectas y copias dañadas.
- Historial de mantenimiento, etiquetas, ubicaciones e intercambio JSON de compras revisados estáticamente.
- Gráfica anual corregida para no depender de estilos inline bloqueados por la CSP; las alturas usan clases CSS.

## Lo que NO se ha comprobado en esta entrega

No se ha ejecutado un navegador real ni se ha hecho QA visual, táctil o end-to-end. Las pruebas del service worker son de contrato con APIs simuladas, no de su instalación en un navegador. Las transacciones de IndexedDB se han revisado en código, no ejecutado contra una implementación nativa durante esta entrega.

Tampoco se ha publicado en el GitHub del usuario ni probado su URL final. No se ha realizado auditoría criptográfica, antivirus, WCAG formal ni evaluación legal de garantías.

## Checklist recomendado antes de anunciarla como estable

1. Publicar el contenido de la raíz en HTTPS y abrir en Chrome/Edge de PC y Safari de iPhone.
2. Crear una persona, una tarea y un objeto. Recargar y comprobar que se conservan.
3. Completar una tarea mensual con día 31 y comprobar siguiente fecha e historial.
4. Abrir dos pestañas, editar simultáneamente y comprobar el aviso de conflicto.
5. Añadir PDF e imagen reales, vincularlos al objeto, abrirlos y descargarlos.
6. Exportar copia, restaurar en un perfil vacío y comprobar documentos y totales.
7. Probar copia corrupta, CSV defectuoso y falta de espacio sin perder los datos anteriores.
8. Instalar la PWA o seguir la ayuda del botón Instalar.
9. Tras una carga completa, cerrar, desconectar red y abrir de nuevo.
10. Publicar un cambio con nueva versión de caché y actualizar sin perder datos.
11. Probar teclado, foco, texto grande, zoom 200 %, 320 px y orientación horizontal.
12. Compartir compras en móvil, probar importar/exportar JSON con Compra 404 e importar el ICS en un calendario.
13. Crear un gasto recurrente y comprobar febrero, meses cortos y la gráfica anual.
14. Crear un mantenimiento histórico desde una ficha de inventario y comprobar su total.
15. Crear una copia cifrada, cerrar la app, restaurarla con contraseña correcta e incorrecta y comprobar ambos resultados.

La entrega es una primera versión funcional con verificaciones técnicas acotadas, no una garantía de ausencia total de errores.
