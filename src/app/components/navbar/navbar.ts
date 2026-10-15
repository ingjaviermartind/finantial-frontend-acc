import { Component, HostListener } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Auth } from '../../services/auth';
import { UserService } from '../../services/user';
import { User } from '../../models/user';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    CommonModule
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {

  showUserMenu = false;
  user: User | null;

  constructor(
    private auth: Auth,
    public userService: UserService
  ) {
    this.user = this.userService.getUser();
  }

  toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.auth.logout();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showUserMenu = false;
  }
}
