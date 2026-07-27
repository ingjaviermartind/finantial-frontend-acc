import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { UserService } from '../../services/user';
import { User } from '../../models/user';
import { CommonModule } from '@angular/common';

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

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.auth.logout();
  }

}