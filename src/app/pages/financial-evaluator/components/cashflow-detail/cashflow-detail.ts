
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';

import { FinancialCashFlow, CashFlowPeriod } from '../../../../models/pricing';

interface CashFlowRow {
  key: string;
  label: string;
  section: string;
  source: 'direct' | 'opex' | 'capex';
}

@Component({
  selector: 'app-cash-flow-detail',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './cashflow-detail.html',
  styleUrl: './cashflow-detail.scss'
})
export class CashFlowDetail {

  @Input({ required: true }) cashFlow!: FinancialCashFlow;
  @Output() back = new EventEmitter<void>();

  readonly rows: CashFlowRow[] = [
    // Ingresos
    { key: 'income', label: 'Ingresos', section: 'Ingresos', source: 'direct' },

    // Desglose OPEX
    { key: 'eth_output', label: 'ETH Output', section: 'Desglose OPEX', source: 'opex' },
    { key: 'oym', label: 'Operación y mantenimiento', section: 'Desglose OPEX', source: 'opex' },
    { key: 'poles', label: 'Postes', section: 'Desglose OPEX', source: 'opex' },
    { key: 'ducts', label: 'Ductos', section: 'Desglose OPEX', source: 'opex' },
    { key: 'call_center', label: 'Call Center', section: 'Desglose OPEX', source: 'opex' },
    { key: 'distribution', label: 'Distribución', section: 'Desglose OPEX', source: 'opex' },
    { key: 'collection', label: 'Recaudo', section: 'Desglose OPEX', source: 'opex' },
    { key: 'opex', label: 'OPEX total', section: 'Desglose OPEX', source: 'direct' },

    // Cargos
    { key: 'gmf', label: 'GMF', section: 'Cargos', source: 'direct' },
    { key: 'fontic', label: 'FONTIC', section: 'Cargos', source: 'direct' },
    { key: 'ica', label: 'ICA', section: 'Cargos', source: 'direct' },
    { key: 'cartera', label: 'Cartera', section: 'Cargos', source: 'direct' },

    // Resultados
    { key: 'ebitda', label: 'EBITDA', section: 'Resultados', source: 'direct' },
    { key: 'ebitda_ajustado', label: 'EBITDA ajustado', section: 'Resultados', source: 'direct' },

    // CAPEX
    { key: 'web_capex', label: 'CAPEX de red', section: 'Desglose CAPEX', source: 'capex' },
    { key: 'initial_capex', label: 'CAPEX inicial', section: 'Desglose CAPEX', source: 'capex' },

    // Flujo de caja
    { key: 'fcl', label: 'Flujo de caja libre', section: 'Flujo de caja', source: 'direct' },
    { key: 'accumulated_fcl', label: 'FCL acumulado', section: 'Flujo de caja', source: 'direct' },
    { key: 'discount_factor', label: 'Factor de descuento', section: 'Flujo de caja', source: 'direct' },
    { key: 'discounted_fcl', label: 'FCL descontado', section: 'Flujo de caja', source: 'direct' },
    { key: 'vpn', label: 'VPN', section: 'Flujo de caja', source: 'direct' },
    { key: 'income_vpn', label: 'VPN del ingreso', section: 'Flujo de caja', source: 'direct' }
  ];

  get periods(): CashFlowPeriod[] {
    return this.cashFlow?.periods ?? [];
  }

  get sections(): string[] {
    return [...new Set(this.rows.map(row => row.section))];
  }

  getRows(section: string): CashFlowRow[] {
    return this.rows.filter(row => row.section === section);
  }

  getValue(period: CashFlowPeriod, key: string, source: CashFlowRow['source']): number {
    let value: number | string | null | undefined;

    switch (source) {
      case 'opex':
        value = period.opex_breakdown?.[key];
        break;

      case 'capex':
        value = period.capex_breakdown?.[key];
        break;

      default:
        value = period[key as keyof CashFlowPeriod] as number | string | null | undefined;
    }

    const numericValue = Number(value ?? 0);

    return Number.isFinite(numericValue) ? numericValue : 0;
  }

  goBack(): void {
    this.back.emit();
  }
}
