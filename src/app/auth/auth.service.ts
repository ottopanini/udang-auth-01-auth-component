import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private static readonly API_KEY = 'AIzaSyAvUSuPQN1N8kvvGOju3boVyRpMNphn-8s';
  private static readonly ACCOUNTS_ENDPOINT = 'https://identitytoolkit.googleapis.com/v1/accounts';
  private static readonly SIGNUP_ENDPOINT = `${AuthService.ACCOUNTS_ENDPOINT}:signUp?key=${AuthService.API_KEY}`;


  constructor(private http: HttpClient) {}

  signup(email: string, password: string): Observable<AuthResponseData> {
    return this.http.post<AuthResponseData>(AuthService.SIGNUP_ENDPOINT, {
      email,
      password,
      returnSecureToken: true
    });
  }
}
