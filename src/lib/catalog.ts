export const PROVINCIAS = [
  "CABA",
  "Buenos Aires (GBA)",
  "Buenos Aires (Interior)",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán",
] as const;

export const SERVICIOS = [
  "Sociales y Eventos",
  "Fotografía de Producto y E-commerce",
  "Retratos y Moda",
  "Contenido para Redes y Reels",
  "Fotografía Aérea / Drones",
  "Publicidad y Marcas",
  "Edición y Postproducción",
  "Cobertura de Shows y Espectáculos",
] as const;

export type Servicio = (typeof SERVICIOS)[number];

export function whatsappLink(numero: string) {
  const limpio = numero.replace(/[^\d]/g, "");
  return `https://wa.me/${limpio}`;
}
