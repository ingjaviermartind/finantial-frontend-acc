export interface ServicesResponse {
  success: boolean;
  data: ActiveService[];
  code?: string;
  message?: string;
}

export interface ActiveService {
  SER: string;
  Ciclo: string;
  Departamento: string;
  Municipio: string;
  'Codigo DANE': string;
  NIT: string;
  'Razón Social': string;
  'Tarifa Total Cliente': number;
  Capacidad: string;
  CAPACIDADBPS: number;
  Tarifa: number;
  'Vlr x Mbps': number;
  'Fecha Fin Permanencia': string;
  FAMILIA_PRODUCTOS: string;
  Producto: string;
  Plan: string;
  TIPO_TECNOLOGIA: string;
  Subsegmento: string;
  'Rango Capacidad': string;
}

export interface ServicesFilters {
  municipality?: string[];
  client?: string[];
  capacity_min?: number;
  capacity_max?: number;
  product_family?: string[];
  product?: string[];
  plan?: string[];
  subsegment?: string[];
}