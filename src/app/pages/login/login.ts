import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  username = '';
  password = '';

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  isLoading = false;

  login() {
    this.isLoading = true;
    this.auth.login(
      this.username,
      this.password
    ).subscribe({
      next:(response : any) => {
        this.auth.setAccessToken(response.access);
        this.auth.setRefreshToken(response.refresh);
        this.router.navigate(['/main'])
      },
      error: (error) => {
        console.error(error);
        alert('Credenciales inválidas');
      }
    })
  }

  ngOnInit() {
      const token = this.auth.getAccessToken();
      if (token) {
        this.router.navigate([
          '/main'
        ]);
      }
    }

}
