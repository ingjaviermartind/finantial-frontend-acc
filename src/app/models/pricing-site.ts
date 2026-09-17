export interface PricingSite {
    FUNNEL : string;
    FechaCreacion : string;
    NOMBRE_COMERCIAL_FUNNEL : string;
    ESTADO_FUNNEL: string;
    NIT_CONCATENADO: string;
    'Consecutivo de Sede': string;
    Departamento: string;
    Municipio: string;
    DANE_Mpio: string;
    Producto: string;
    Plan: string;
    Familia_Producto_Sede: string;
    'Ancho de banda': string;
    'Ancho de banda (Nro)': number;
    NUM_PRICINGS: number;
    MRC_PROMEDIO: number;
    NRC_PROMEDIO: number;
}

export interface PricingSitesResponse {
  'funnel count': number;
  'sedes count' : number;
  page: number;
  page_size: number;
  total_pages: number;
  results: PricingSite[];
}

export class PricingFunnelGroup {
  funnel: string;
  fechaCreacion: string;
  cliente: string;
  nit: string;
  estado: string;
  sites: PricingSite[];
  expanded = false;
  constructor(sites: PricingSite[]) {
    this.sites = sites;
    const first = sites[0];
    this.funnel = first.FUNNEL;
    this.fechaCreacion = first.FechaCreacion;
    this.cliente = first.NOMBRE_COMERCIAL_FUNNEL;
    this.nit = first.NIT_CONCATENADO;
    this.estado = first.ESTADO_FUNNEL;
  }
  get siteCount(): number {
    return this.sites.length;
  }
  get mrcTotal(): number {
    return this.sites.reduce(
      (total, site) => total + site.MRC_PROMEDIO,
      0
    );
  }
  get nrcTotal(): number {
    return this.sites.reduce(
      (total, site) => total + site.NRC_PROMEDIO,
      0
    );
  }
}

export interface PricingSitesFilters {
  period_value: number;
  period_unit: 'día(s)' | 'semana(s)' | 'mes(es)' | 'trimestre(s)' | 'año(s)';
  page_size: number;
  page: number;


  capacity_min?: number;
  capacity_max?: number;
  client?: string[];
  funnel_status?: string[];
  department?: string[];
  municipality?: string[];
  dane?: string[];
  product_family?: string[];
  product?: string[];
  plan?: string[];
}

export interface PricingSitesFilterOptions {
  total_sites: number;
  clients: PricingSitesClientOption[];
  funnel_statuses: string[];
  locations: PricingSitesLocationOption[];
  products: PricingSitesProductFamilyOption[];
}

export interface PricingSitesClientOption {
  nit: string;
  business_names: string[];
}

export interface PricingSitesLocationOption {
  department: string;
  municipalities: PricingSitesMunicipalityOption[];
}

export interface PricingSitesMunicipalityOption {
  municipality: string;
  danes: string[];
}

export interface PricingSitesProductFamilyOption {
  family: string;
  products: PricingSitesProductOption[];
}

export interface PricingSitesProductOption {
  product: string;
  plans: string[];
}

// export interface PricingClientOption {
//   nit: string;
//   business_names: string[];
// }

// export interface MunicipalityOption {
//   municipality: string;
//   danes: string[];
// }

// export interface LocationOption {
//   department: string;
//   municipalities: MunicipalityOption[];
// }

// export interface PlanOption {
//   plan: string;
// }

// export interface ProductOption {
//   product: string;
//   plans: string[];
// }

// export interface ProductFamilyOption {
//   family: string;
//   products: ProductOption[];
// }

// export interface PricingFilterOptionsResponse {
//   total_sites: number;
//   clients: PricingClientOption[];
//   funnel_statuses: string[];
//   locations: LocationOption[];
//   products: ProductFamilyOption[];
// }

// export interface PricingSiteFilters {
//   period_value: number;
//   period_unit: string;
//   clients?: string[];
//   funnel_statuses?: string[];
//   departments?: string[];
//   municipalities?: string[];
//   danes?: string[];
//   min_capacity?: number;
//   max_capacity?: number;
//   families?: string[];
//   products?: string[];
//   plans?: string[];
//   page?: number;
//   page_size?: number;
// }


//
// EOF
//