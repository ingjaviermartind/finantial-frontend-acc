
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CurrencyPipe, DecimalPipe } from '@angular/common';

import { FinancialCashFlow, CashFlowPeriod } from '../../../../models/pricing';

interface CashFlowRow {
  key: keyof CashFlowPeriod;
  label: string;
  section: string;
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
    { key: 'income', label: 'Ingresos', section: 'Ingresos' },

    // Desglose OPEX
    { key: 'eth_output', label: 'ETH Output', section: 'Desglose OPEX' },
    { key: 'oym', label: 'Operación y mantenimiento', section: 'Desglose OPEX' },
    { key: 'poles', label: 'Postes', section: 'Desglose OPEX' },
    { key: 'ducts', label: 'Ductos', section: 'Desglose OPEX' },
    { key: 'call_center', label: 'Call Center', section: 'Desglose OPEX' },
    { key: 'distribution', label: 'Distribución', section: 'Desglose OPEX' },
    { key: 'collection', label: 'Recaudo', section: 'Desglose OPEX' },
    { key: 'opex', label: 'OPEX total', section: 'Desglose OPEX' },

    // Cargos
    { key: 'gmf', label: 'GMF', section: 'Cargos' },
    { key: 'fontic', label: 'FONTIC', section: 'Cargos' },
    { key: 'ica', label: 'ICA', section: 'Cargos' },
    { key: 'cartera', label: 'Cartera', section: 'Cargos' },

    // Resultados
    { key: 'ebitda', label: 'EBITDA', section: 'Resultados' },
    { key: 'ebitda_ajustado', label: 'EBITDA ajustado', section: 'Resultados' },

    // CAPEX

    { key: 'initial_capex', label: 'CAPEX de red', section: 'Desglose CAPEX' },

    // Flujo de caja
    
    { key: 'fcl', label: 'Flujo de caja libre', section: 'Flujo de caja' },
    { key: 'accumulated_fcl', label: 'FCL acumulado', section: 'Flujo de caja' },
    { key: 'discount_factor', label: 'Factor de descuento', section: 'Flujo de caja' },
    { key: 'discounted_fcl', label: 'FCL descontado', section: 'Flujo de caja' },
    { key: 'vpn', label: 'VPN', section: 'Flujo de caja' }
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

  getValue(period: CashFlowPeriod, key: keyof CashFlowPeriod): number {
    return period[key] as number;
  }
  goBack(): void {
    this.back.emit();
  }
}
