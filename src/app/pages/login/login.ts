import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user'
import { finalize } from 'rxjs';

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
    private router: Router,
  ) {}

  isLoading = false;
  showPassword = false;

  login() {
    this.isLoading = true;

    this.auth.login(
      this.username,
      this.password
    )
    .subscribe({
      next: () => {
        this.router.navigate(['/evaluator']);
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        alert('Credenciales inválidas');
        this.isLoading = false;
      }
    });
  }

  ngOnInit() {
      const token = this.auth.getAccessToken();
      if (token) {
        this.router.navigate([
          '/evaluator' //main
        ]);
      }
    }

}
