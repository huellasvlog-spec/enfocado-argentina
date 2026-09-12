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
  "Fotografía",
  "Edición",
  "Video",
  "Fotografía aérea / Drones",
  "Eventos",
  "Retratos",
  "Producto",
] as const;

export type Servicio = (typeof SERVICIOS)[number];

export function whatsappLink(numero: string) {
  const limpio = numero.replace(/[^\d]/g, "");
  return `https://wa.me/${limpio}`;
}
