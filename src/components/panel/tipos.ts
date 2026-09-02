export type TipoCampo = 'texto' | 'textarea' | 'numero' | 'select' | 'booleano' | 'password' | 'markdown';

export interface OpcionCampo {
  valor: string;
  etiqueta: string;
}

export interface CampoConfig {
  nombre: string;
  etiqueta: string;
  tipo: TipoCampo;
  opciones?: readonly OpcionCampo[];
  /** Tabla de la que se toman las opciones dinamicas (relacion). */
  relacion?: string;
  requerido?: boolean;
  ancho?: 'completo' | 'mitad';
  enTabla?: boolean;
  ayuda?: string;
  placeholder?: string;
}

export interface Registro {
  id: string;
  [clave: string]: unknown;
}
