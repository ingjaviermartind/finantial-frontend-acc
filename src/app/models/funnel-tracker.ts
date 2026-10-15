export type MetricValue = number | string | null;

export interface LocationTrackerMetrics {
  Total_Sedes: MetricValue;
  Sedes_Viables: MetricValue;
  Sedes_No_Viables: MetricValue;
  Razon_Viabilidad_Pct: MetricValue;
  Sedes_Viables_Con_Coordenadas: MetricValue;
  Razon_Viables_Con_Coordenadas_Pct: MetricValue;
}

export interface ServiceTrackerMetrics {
  Total_Servicios: MetricValue;
  Servicios_Con_Coordenadas: MetricValue;
  Razon_Servicios_Con_Coordenadas_Pct: MetricValue;
}

export interface ProximityMetrics {
  radius_m: MetricValue;
  sites_checked: MetricValue;
  services_checked: MetricValue;
  sites_with_matches: MetricValue;
  sites_without_matches: MetricValue;
  services_matched: MetricValue;
  matched_pairs: MetricValue;
}

export interface NearbyFunnelSite {
  funnel: string | null;
  creation_date: string | null;
  site_id: string | null;
  site_nit: string | null;
  site_status: string | null;
  client: string | null;
  salesman: string | null;
  site_product: string | null;
  site_plan: string | null;
  site_capacity_mbps: MetricValue;
  site_department: string | null;
  site_municipality: string | null;
  site_dane: string | null;
  site_address: string | null;
  site_latitude: MetricValue;
  site_longitude: MetricValue;
  distance_m: MetricValue;
}

export interface CrossedActiveService {
  active_service_ser: string;
  service_nit: string | null;
  service_client: string | null;
  client_subsegment: string | null;
  service_family: string | null;
  service_product: string | null;
  service_plan: string | null;
  service_tariff: MetricValue;
  service_capacity: MetricValue;
  service_price_per_mbps: MetricValue;
  service_department: string | null;
  service_municipality: string | null;
  service_dane: string | null;
  service_address: string | null;
  service_latitude: MetricValue;
  service_longitude: MetricValue;
  nearby_sites: NearbyFunnelSite[];
}


export interface FunnelTrackerResponse {
  metrics: {
    locations: LocationTrackerMetrics;
    services: ServiceTrackerMetrics;
    proximity: ProximityMetrics;
  };
  services_with_nearby_sites: CrossedActiveService[];
}