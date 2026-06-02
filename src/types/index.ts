export type Rol = 'admin' | 'asesor'
export type EstadoEdificio = 'en-construccion' | 'entrega-inmediata' | 'proximamente' | 'entregado'
export type EstadoUnidad = 'disponible' | 'reservado' | 'vendido'
export type EstadoPropiedad = 'disponible' | 'reservado' | 'vendido' | 'alquilado'
export type TipoOperacion = 'venta' | 'alquiler'
export type EstadoLead = 'nuevo' | 'contactado' | 'cerrado'

export interface Profile {
  id: string
  email: string
  nombre?: string
  rol: Rol
  activo: boolean
  created_at: string
}

export interface Edificio {
  id: string
  nombre: string
  descripcion?: string
  direccion?: string
  estado: EstadoEdificio
  entrega?: string
  imagen_principal?: string
  imagen_axonometrica?: string
  tour_360?: string
  orden: number
  activo: boolean
  created_at: string
  unidades?: Unidad[]
  imagenes?: EdificioImagen[]
}

export interface EdificioImagen {
  id: string
  edificio_id: string
  url: string
  categoria: 'galeria' | 'render' | 'obra' | 'amenities'
  orden: number
}

export interface Unidad {
  id: string
  edificio_id: string
  codigo: string
  tipo: 'mono' | '1amb' | '2amb' | '3amb' | '4amb' | 'ph' | 'local'
  piso?: string
  m2?: number
  m2_cubiertos?: number
  ambientes?: number
  dormitorios?: number
  banos?: number
  orientacion?: string
  precio?: number
  precio_texto?: string
  estado: EstadoUnidad
  imagen_plano?: string
  ax_x?: number
  ax_y?: number
  ax_width?: number
  ax_height?: number
}

export interface Propiedad {
  id: string
  asesor_id: string
  titulo: string
  descripcion?: string
  tipo_operacion: TipoOperacion
  tipo_propiedad: string
  direccion?: string
  barrio?: string
  ciudad?: string
  precio?: number
  precio_texto?: string
  moneda: 'USD' | 'ARS'
  m2?: number
  ambientes?: number
  dormitorios?: number
  banos?: number
  cochera: boolean
  estado: EstadoPropiedad
  tour_360?: string
  destacada: boolean
  activo: boolean
  created_at: string
  imagenes?: PropiedadImagen[]
  asesor?: Profile
}

export interface PropiedadImagen {
  id: string
  propiedad_id: string
  url: string
  orden: number
}

export interface Lead {
  id: string
  nombre?: string
  email?: string
  telefono?: string
  mensaje?: string
  origen?: string
  edificio_id?: string
  propiedad_id?: string
  asesor_id?: string
  estado: EstadoLead
  created_at: string
}

export interface SiteConfig {
  [key: string]: string
}
