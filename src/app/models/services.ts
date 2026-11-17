export interface ServicesResponse {
  success: boolean;
  data: ActiveService[];
  code?: string;
  message?: string;
}

export interface ActiveService {
  ser: string;
  ciclo_final: string;
  departamento: string;
  municipio: string;
  codigo_dane : string;
  nit: string;
  'razon_social': string;
  'tarifa_total_cliente': number;
  capacidad: string;
  capacidadbps: number;
  tarifa: number;
  vlr_mbps: number;
  fecha_fin_permanencia: string;
  familia_productos: string;
  producto: string;
  plan: string;
  tipo_tecnologia: string;
  subsegmento: string;
  'Rango Capacidad': string;
  node : string;
  unprofitable : boolean;
  region : string;
}

export interface ServicesFilters {
  municipality?: string[];
  department?: string[];
  client?: string[];
  capacity_min?: number;
  capacity_max?: number;
  product_family?: string[];
  product?: string[];
  plan?: string[];
  subsegment?: string[];
}

export interface SelectedDaneLocation {
  'Codigo DANE': string;
  Municipio: string;
  Departamento: string;
  region: string | null;
  node: string | null;
  unprofitable: boolean;
}

export interface ActiveClient {
  nit: string;
  razonSocial: string;
  serviceCount: number;
  mrcTotal: number;
  services: ActiveService[];
}

export interface ClientOption {
  NIT: string;
  business_names: string[];
}

export class ActiveClientGroup {
  nit: string;
  razonSocial: string;
  subsegmento: string;
  services: ActiveService[];
  expanded = false;

  constructor(services: ActiveService[]) {
    this.services = services;

    const first = services[0];

    this.nit = first.nit;
    this.razonSocial = first.razon_social;
    this.subsegmento = first.subsegmento
  }

  get serviceCount(): number {
    return this.services.length;
  }

  get mrcTotal(): number {
    return this.services.reduce(
      (total, service) => total + service.tarifa,
      0
    );
  }

  get tarifaTotalCliente(): number {
    return this.services[0].tarifa_total_cliente;
  }
}


export interface ServiceOption {
  ser: string;
  razon_social: string | null;
  producto: string | null;
  nvosubsegmento: string | null;
  capacidadbps: number | string | null;
  anchodebanda: string | null;
  departamento: string | null;
  codigo_dane: string | null;
}
