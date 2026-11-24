import { Component } from '@angular/core';
import { EvaluatorNavbar } from '../components/evaluator-navbar/evaluator-navbar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-financial-evaluator',
  imports: [EvaluatorNavbar, RouterOutlet],
  templateUrl: './main-financial-evaluator.html',
  styleUrl: './main-financial-evaluator.scss',
})
export class MainFinancialEvaluator {}
