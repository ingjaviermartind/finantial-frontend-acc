import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { UserService } from '../../services/user';
import { User } from '../../models/user';
import { CommonModule } from '@angular/common';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink, 
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