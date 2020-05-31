import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private static readonly API_KEY = 'AIzaSyAvUSuPQN1N8kvvGOju3boVyRpMNphn-8s';
  private static readonly ACCOUNTS_ENDPOINT = 'https://identitytoolkit.googleapis.com/v1/accounts';
  private static readonly SIGNUP_ENDPOINT = `${AuthService.ACCOUNTS_ENDPOINT}:signUp?key=${AuthService.API_KEY}`;
  private static readonly LOGIN_ENDPOINT = `${AuthService.ACCOUNTS_ENDPOINT}:signInWithPassword?key=${AuthService.API_KEY}`;

  constructor(private http: HttpClient) {}

  signup(email: string, password: string): Observable<AuthResponseData> {
    return this.http.post<AuthResponseData>(AuthService.SIGNUP_ENDPOINT, {
      email,
      password,
      returnSecureToken: true
    }).pipe(catchError(this.handleError));
  }


  private handleError(errorResult: HttpErrorResponse) {
    let errorMessage = 'An unknown error occured';
    if (errorResult.error && errorResult.error.error) {
      switch (errorResult.error.error.message) {
        case 'EMAIL_EXISTS':
          errorMessage = 'E-Mail already in use';
          break;
        case 'EMAIL_NOT_FOUND':
          errorMessage = 'E-Mail does not exist';
          break;
        case 'INVALID_PASSWORD':
          errorMessage = 'Password invalid';
          break;
      }
    }
    return throwError(errorMessage);
  }

  login(email: string, password: string): Observable<AuthResponseData> {
    return this.http.post<AuthResponseData>(AuthService.LOGIN_ENDPOINT, {
      email, password, returnSecureToken: true
    }).pipe(catchError(this.handleError));
  }
}
