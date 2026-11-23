
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
    capex: number;
    opex_m: number;
    approved: boolean;
    price_monthly: number;
    price_per_mbps: number;
    vpn: number;
    tir: number;
    payback: number;
    payback_percent : number;
    margin: number;
    sensitivity: number | null;
    financial_cashflow: FinancialCashFlow;
}

export interface PriceComparison {
    breakeven: number | null;
    evaluated_price: number | null;
    market_average: number | null;
    market_median: number | null;
    stdev : number | null;
    ml_price: number | null;
    sample_size: number | null;
    source : string | null;
    suggested_price: number | null;
    tariff_base: number | null;
    tariff_discount: number | null;
    tariff_special: number | null;
}

export interface PricingResponse { 
    suggested: EvaluationResult;
    predicted: EvaluationResult;
    floor: EvaluationResult;
    price_comparison: PriceComparison;
 }

 export interface CashFlowPeriod {
    period: number;

    // Ingresos
    income: number;

    // Desglose OPEX
    eth_output: number;
    oym: number;
    poles: number;
    ducts: number;
    call_center: number;
    distribution: number;
    collection: number;
    opex: number;

    // Cargos
    gmf: number;
    fontic: number;
    ica: number;
    cartera: number;

    // Resultados
    ebitda: number;
    ebitda_ajustado: number;

    // Desglose CAPEX
    web_capex: number;
    initial_capex: number;

    // Flujo de caja
    fcl: number;
    discount_factor: number;
    discounted_fcl: number;
    accumulated_fcl: number;
    vpn : number;
}

export interface FinancialCashFlow {
    project_snapshot: Record<string, unknown>;
    variables_snapshot: Record<string, unknown>;
    periods: CashFlowPeriod[];
}