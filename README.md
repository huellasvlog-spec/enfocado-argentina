# Foto Argentina Hub

Rol: Actuá como un desarrollador web experto y diseñá un marketplace/directorio para contratar servicios de fotografía en Argentina.

Requisitos funcionales y correcciones principales:

Página de inicio pública (Buscador y Filtros):

Encabezado limpio con buscador y menú desplegable de filtros para filtrar fotógrafos por:

Región/Provincia de Argentina: Desplegable con las provincias (ej. CABA, Buenos Aires GBA, Córdoba, Santa Fe, Mendoza, San Juan, etc.).

Servicios ofrecidos: Filtro por tipo de servicio (Fotografía, Edición de foto/video, Video, Fotografía aérea / Drones, etc.).

Tarjetas de presentación de cada fotógrafo con foto de perfil, nombre, provincia/zona, badges de sus servicios y precio estimado.

Sistema de registro e inicio de sesión (Autenticación con Supabase):

Formularios de Registro e Iniciar sesión para los prestadores de servicio (email y contraseña).

En la pantalla de Iniciar sesión, incluir la casilla de verificación "Recordar usuario" y el enlace funcional "Olvidé mi contraseña".

Panel privado del fotógrafo (Dashboard de edición):

Permite modificar datos personales: Nombre, Biografía y WhatsApp de contacto.

Servicios (Selección múltiple / Checkboxes): El usuario puede tildar múltiples opciones entre: Fotografía, Edición, Video, Fotografía aérea / Drones, Eventos, Retratos, Producto.

Ubicación: Desplegable exclusivo de provincias/regiones de Argentina.

Tarifa/Precio: Permitir ingresar un campo de texto libre con el valor o rango (ej. "$50.000 - $80.000" o "A consultar"), solucionando el problema donde no se podía borrar el número 0.

Portfolio: Módulo para cargar y eliminar imágenes del portafolio.

Página de perfil público y modal de contacto por WhatsApp:

Muestra la galería de imágenes, biografía, región y servicios tildados.

Al hacer clic en el botón "Contactar por WhatsApp", abrir un cuadro emergente (modal) que:

Muestre en texto claro el número de WhatsApp del prestador para copiarlo manualmente.

Tenga un botón azul visible "Abrir chat de WhatsApp".

Incluya justo debajo del botón la siguiente leyenda legal de descargo: "Aviso: La contratación, pagos y señas se acuerdan directamente entre el cliente y el fotógrafo. La plataforma opera como directorio y no intermedia en los pagos ni responde por el cumplimiento de los servicios."

Pie de página (Footer) con Términos y Condiciones:

En la parte inferior de toda la web, incluir el pie de página con derechos reservados y una sección o modal emergente de "Términos y Condiciones" que contenga el texto descriptivo de deslinde de responsabilidad legal de la plataforma como intermediario.

Instrucción de eficiencia: Diseñá una interfaz moderna, funcional e intuitiva. Priorizá que la lógica de registro, los filtros y la navegación funcionen perfectamente sin gastar recursos en generar tipografías ni imágenes de prueba innecesarias.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ea9ab4be-1f6e-439c-a8ae-916b68826740).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
