# Enfocado: publicidad, multimedia y contacto

## Objetivo
Actualizar la marca a **Enfocado** y ampliar el directorio con espacios publicitarios, portfolio multimedia, redes sociales y un canal de comentarios almacenado de forma segura.

## Cambios visibles
- Renombrar la plataforma en encabezado, portada, pie, títulos y descripciones de las páginas.
- Incorporar un espacio publicitario lateral en el inicio y otro bloque horizontal cada cuatro perfiles, claramente etiquetados para Google AdSense.
- Mantener la foto o logo del prestador en su panel, tarjeta y cabecera pública, mejorando la carga y sus validaciones.
- Añadir en el panel enlaces de YouTube/Vimeo, carga y reemplazo de un PDF de hasta 10 MB, y enlaces opcionales a Instagram, sitio web y Vimeo/Behance.
- Mostrar videos incrustados, el botón **Descargar Portfolio / PDF** y los accesos sociales en el perfil público.
- Agregar en el pie el acceso a un formulario con Nombre, Email y Mensaje, confirmación de envío y manejo de errores.

## Datos y seguridad
- Ampliar el perfil con campos para video, PDF y enlaces externos.
- Crear una tabla de comentarios con permisos de inserción pública y sin lectura pública; la revisión quedará disponible únicamente desde el backend.
- Agregar permisos de almacenamiento para PDFs dentro del espacio privado existente.
- Validar URLs permitidas, email, longitudes, formatos de imagen/PDF y límite de 10 MB antes de guardar o subir.

## Detalles técnicos
- Los reproductores solo aceptarán URLs válidas de YouTube o Vimeo y se convertirán a formatos embed seguros.
- Los enlaces externos se normalizarán y abrirán en una pestaña nueva con protecciones de navegación.
- El PDF se servirá mediante un enlace temporal de descarga, igual que las imágenes privadas.
- Se actualizarán los tipos generados del backend y los metadatos únicos de todas las páginas públicas.

## Verificación
- Comprobar escritorio y móvil en inicio, panel, perfil público y formulario del pie.
- Probar validaciones de enlaces y archivos, envío de comentarios, reproductores, descarga PDF y bloques publicitarios intercalados.
- Confirmar que no haya errores en navegador ni problemas de tipos.
