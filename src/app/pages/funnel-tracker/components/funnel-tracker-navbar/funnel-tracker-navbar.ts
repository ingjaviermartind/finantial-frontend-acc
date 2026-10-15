import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-funnel-tracker-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './funnel-tracker-navbar.html',
  styleUrl: './funnel-tracker-navbar.scss',
})
export class FunnelTrackerNavbar {}