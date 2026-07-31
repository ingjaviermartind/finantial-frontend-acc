import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { finalize } from 'rxjs';

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
  showNewPassword = false;
  showConfirmPassword = false;
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
    )
    .subscribe({
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
        const passwordErrors = error.error?.new_password;
        if(passwordErrors){
          alert(passwordErrors.join('\n'));
        }
        else{
          alert(
            error.error?.detail ??
            'No fue posible actualizar la contraseña.'
          );
        }
        
      }
    });
  }

  toggleNewPassword(): void {
    this.showNewPassword = !this.showNewPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}