import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FeasibilitySidebar } from '../../components/feasibility-sidebar/feasibility-sidebar';

@Component({
  selector: 'app-feasibility-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    FeasibilitySidebar
  ],
  templateUrl: './feasibility-layout.html',
  styleUrl: './feasibility-layout.scss',
})
export class FeasibilityLayout {}