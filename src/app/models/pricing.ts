
import { municipality, department } from './location';
import { ProductCatalog } from './product-catalog';
import { Subsegment } from './subsegment';

export interface PricingRequest { 
    municipality_id: string;
    product_id: string;
    subsegment_id: string;
    capacity_mbps: number;
    contract_time: number;
    initial_income: number;
    initial_capex?:number;
    price_per_mbps?: number;
}

export interface EvaluationResult { 
    approved: boolean;
    capex: number;
    financial_cashflow: FinancialCashFlow;
    margin: number;
    monthly_income : number;
    opex_m: number;
    payback: number;
    payback_percent : number;
    price_monthly: number;
    price_per_mbps: number;
    tir: number;
    vpn: number;    
}

export interface PriceComparison {
  breakeven: number | string | null;
  market_average: number | string | null;
  market_median: number | string | null;
  ml_price: number | string | null;
  sample_size: number | null;
  source: string | null;
  suggested_price?: number | string | null;
  tariff_base: number | string | null;
  tariff_discount: number | string | null;
  tariff_special: number | string | null;
}

export interface PricingResponse { 
    suggested: EvaluationResult;
    predicted: EvaluationResult;
    floor: EvaluationResult;
    price_comparison: PriceComparison;
 }

type DecimalValue = number | string;

export interface CashFlowPeriod {
  period: number;
  // Ingresos
  income: DecimalValue;
  // Desglose OPEX
  opex_breakdown: Record<string, DecimalValue>;
  opex: DecimalValue;
  // Cargos
  gmf: DecimalValue;
  fontic: DecimalValue;
  ica: DecimalValue;
  cartera: DecimalValue;
  // Resultados
  ebitda: DecimalValue;
  ebitda_ajustado: DecimalValue;
  // Desglose CAPEX
  capex_breakdown: Record<string, DecimalValue>;
  capex: DecimalValue;
  // Flujo de caja
  fcl: DecimalValue;
  discount_factor: DecimalValue;
  discounted_fcl: DecimalValue;
  accumulated_fcl: DecimalValue;
  vpn: DecimalValue;
  income_vpn: DecimalValue;
}

export interface FinancialCashFlow {
    project_snapshot: Record<string, unknown>;
    variables_snapshot: Record<string, unknown>;
    periods: CashFlowPeriod[];
}

export interface ProjectServiceDetails {
  department: department;
  municipality: municipality;
  product: ProductCatalog;
  subsegment: Subsegment;
}

export interface DetailedPricingRequest {
    request: PricingRequest;
    department: department;
    municipality: municipality;
    product: ProductCatalog;
    subsegment: Subsegment;
}


export interface ProjectServiceRow {
  id: number;
  request: PricingRequest;
  selected: boolean;

  loading: boolean;
  result?: PricingResponse;
  error?: string;

  pricePerMbps: number | null;
  loadingPrice: boolean;
  priceResult?: EvaluationResult;

  location?: municipality;
  details: ProjectServiceDetails;
}

export interface MultiProjectPricingRequest {
  contract_time: number;
  initial_capex: number;
  initial_income: number;

  products: {
    capacity_mbps: number;
    product_type: string;
    product: string;
    subsegment: string;
    sensitivity: number;
    price_per_mbps: number | null;
  }[];
}

export interface GroupEvaluationResult extends EvaluationResult {
  evaluation_type: 'group';
  products: EvaluationResult[];
}