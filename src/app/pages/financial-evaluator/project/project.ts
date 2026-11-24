import { Component } from '@angular/core';
import { EvaluatorSidebar } from '../../../components/evaluator-sidebar/evaluator-sidebar';
import { municipality } from '../../../models/location';
import { PricingRequest } from '../../../models/pricing';
import { PageWithSidebar } from '../../../layouts/page-with-sidebar/page-with-sidebar';
@Component({
  selector: 'app-project',
  imports: [EvaluatorSidebar, PageWithSidebar],
  templateUrl: './project.html',
  styleUrl: './project.scss',
})
export class Project {
  isFiltersExpanded = true;
  selectedMunicipality: municipality | null = null;

  toggleFilters(): void {
    this.isFiltersExpanded = !this.isFiltersExpanded;
  }

  onSelectedDaneChange(location: municipality | null): void {
    
  }

  addService(request : PricingRequest): void {
    
  }
}
