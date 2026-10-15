import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FunnelTrackerNavbar } from '../components/funnel-tracker-navbar/funnel-tracker-navbar';

@Component({
  selector: 'app-main-funnel-tracker',
  imports: [
    RouterOutlet,
    FunnelTrackerNavbar
  ],
  standalone: true,
  templateUrl: './main-funnel-tracker.html',
  styleUrl: './main-funnel-tracker.scss',
})
export class MainFunnelTracker {}