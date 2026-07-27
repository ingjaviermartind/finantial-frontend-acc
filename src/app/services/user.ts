import { Injectable } from '@angular/core';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly USER_KEY = 'current_user';

  setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): User | null {
    const value = localStorage.getItem(this.USER_KEY);

    return value ? JSON.parse(value) : null;
  }

  clearUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  get fullName(): string {
    const user = this.getUser();

    if (!user) return '';

    return `${user.first_name} ${user.last_name}`;
  }

  hasGroup(group: string): boolean {
    const user = this.getUser();

    return user?.groups.includes(group) ?? false;
  }

  hasArea(area: string): boolean {
    const user = this.getUser();

    return user?.area === area;
  }

  isAdmin():boolean{
    const user=this.getUser();
    return user?.groups.includes('admin') ?? false;
  }

}