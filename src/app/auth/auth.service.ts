import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {BehaviorSubject, Observable, Subject, throwError} from 'rxjs';
import {catchError, tap} from 'rxjs/operators';
import {User} from './user.model';
import {Router} from '@angular/router';

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

  user = new BehaviorSubject<User>(null);

  constructor(private http: HttpClient, private router: Router) {}

  signup(email: string, password: string): Observable<AuthResponseData> {
    return this.http.post<AuthResponseData>(AuthService.SIGNUP_ENDPOINT, {
      email,
      password,
      returnSecureToken: true
    }).pipe(catchError(this.handleError), tap(this.handleAuthentication));
  }

  private handleAuthentication = (response: AuthResponseData) => {
    const expirationDate = new Date(new Date().getTime() + +response.expiresIn * 1000);
    const user = new User(response.email, response.localId, response.idToken, expirationDate);
    this.user.next(user);

    localStorage.setItem('userData', JSON.stringify(user));
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
  autoLogin() {
    const userData: {
      email: string;
      id: string;
      _token: string;
      _tokenExpirationDate: string; // not converted yet
    } = JSON.parse(localStorage.getItem('userData'));
    if (userData) {
      const loadedUser = new User(
        userData.email,
        userData.id,
        userData._token,
        new Date(userData._tokenExpirationDate));

      if (loadedUser.token) {
        this.user.next(loadedUser);
      }
    }
  }
  login(email: string, password: string): Observable<AuthResponseData> {
    return this.http.post<AuthResponseData>(AuthService.LOGIN_ENDPOINT, {
      email, password, returnSecureToken: true
    }).pipe(catchError(this.handleError), tap(this.handleAuthentication));
  }

  logout() {
    this.router.navigate(['auth']);
    this.user.next(null);
  }
}
