
export interface PricingRequest { 
    municipality_id: string;
    capacity_mbps: number;
    contract_time: number;
    initial_income: number;
}

export interface EvaluationResult { 
    approved: boolean;
    price_monthly: number;
    price_per_mbps: number;
    vpn: number;
    tir: number;
    payback: number;
    margin: number;
    sensitivity: number;
}

export interface PricingResponse { 
    suggested: EvaluationResult;
    predicted: EvaluationResult;
    floor: EvaluationResult;
    mean_price_mbps: number;
    median_price_mbps: number;
    market_std: number;
    market_source: string;
    market_sample: number;
    reference_price_mbps: number;
 }
