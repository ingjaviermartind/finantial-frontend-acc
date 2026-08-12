import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-feasibility-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './feasibility-sidebar.html',
  styleUrl: './feasibility-sidebar.scss',
})
export class FeasibilitySidebar {}