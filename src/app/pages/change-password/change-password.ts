import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './change-password.html',
  styleUrl: './change-password.scss'
})
export class ChangePassword {

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  isLoading = false;

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  changePassword(): void {

    if (this.newPassword !== this.confirmPassword) {

      alert('Las contraseñas no coinciden.');

      return;

    }

    this.isLoading = true;

    this.auth.changePassword(
      this.currentPassword,
      this.newPassword
    ).subscribe({

      next: () => {

        this.isLoading = false;

        alert(
          'Contraseña actualizada correctamente.'
        );

        this.router.navigate([
          '/evaluator'
        ]);

      },

      error: (error) => {

        this.isLoading = false;

        console.error(error);

        alert(
          error.error?.detail ??
          'No fue posible actualizar la contraseña.'
        );

      }

    });

  }

}