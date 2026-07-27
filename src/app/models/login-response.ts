
import { User } from './user';

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}