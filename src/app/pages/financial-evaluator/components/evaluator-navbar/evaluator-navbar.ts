import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-evaluator-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './evaluator-navbar.html',
  styleUrl: './evaluator-navbar.scss',
})
export class EvaluatorNavbar {}
