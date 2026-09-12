# Mejoras del panel y portfolio

## Objetivo
Mejorar la carga de la foto de perfil, la exploración del portfolio y el ingreso de enlaces, manteniendo los videos reproducibles dentro de Enfocado.

## Cambios visibles
- Reemplazar el selector de avatar por un botón destacado con icono.
- Abrir un editor circular al elegir la imagen, con arrastre, zoom, previsualización y confirmación antes de subir.
- Mantener todas las miniaturas del portfolio recortadas proporcionalmente con `object-cover`.
- Añadir un visor de fotos a pantalla completa en el panel y el perfil público, con navegación anterior/siguiente, cierre, contador y soporte de teclado.
- Unificar la edición de videos bajo el campo “Insertar videos de YouTube o Vimeo”.
- Mantener los videos como reproductores incrustados dentro del perfil público, sin enlaces pasivos externos.
- Normalizar automáticamente Instagram, sitio web y Vimeo/Behance al salir del campo y al guardar; Instagram aceptará un usuario simple como `tuusuario`.

## Detalles técnicos
- El recorte se realizará en el navegador y generará una imagen cuadrada optimizada; la máscara circular mostrará exactamente el encuadre final del avatar.
- El visor reutilizable conservará la imagen completa con `object-contain`, sin deformación, y bloqueará la navegación de fondo mientras esté abierto.
- Las URLs se validarán después de normalizarlas, aceptando solo HTTP/HTTPS y los dominios requeridos para Instagram y Vimeo/Behance.
- No se modificarán tablas ni permisos del backend.

## Verificación
- Probar recorte, zoom, arrastre, cancelación y subida de avatar.
- Probar visor desde ambas galerías, flechas, teclado, cierre y cambio de imagen.
- Probar enlaces con usuario simple, dominio sin protocolo y URL completa.
- Revisar panel y perfil público en escritorio y móvil, sin errores de navegador.
