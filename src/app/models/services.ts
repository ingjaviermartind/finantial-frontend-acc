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
  node : string;
  unprofitable : boolean;
  region : string;
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

export interface ActiveClient {
  nit: string;
  razonSocial: string;
  serviceCount: number;
  mrcTotal: number;
  services: ActiveService[];
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

    this.nit = first.NIT;
    this.razonSocial = first['Razón Social'];
    this.subsegmento = first.Subsegmento
  }

  get serviceCount(): number {
    return this.services.length;
  }

  get mrcTotal(): number {
    return this.services.reduce(
      (total, service) => total + service.Tarifa,
      0
    );
  }

  get tarifaTotalCliente(): number {
    return this.services[0]['Tarifa Total Cliente'];
  }
}
