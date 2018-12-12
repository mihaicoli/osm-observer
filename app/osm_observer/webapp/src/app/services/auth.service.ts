import {throwError as observableThrowError,  Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { map, catchError, } from 'rxjs/operators';

import { CookieService } from 'angular2-cookie/services/cookies.service';

import { BaseHttpService } from './base-http.service';
import { User } from '../types/user';
import { AuthResponse } from '../types/auth-response';

@Injectable()
export class AuthService extends BaseHttpService {
  private loginUrl(): string {
    return this.location.prepareExternalUrl('api/login');
  }
  private isAdminUrl(): string {
    return this.location.prepareExternalUrl('api/is_admin');
  }
  private logoutUrl(): string {
    return this.location.prepareExternalUrl('api/logout');
  }

  isLoggedIn: boolean;
  redirectUrl: string;

  constructor(router: Router, private http: Http, cookieService: CookieService, private location: Location) {
    super(router, cookieService);
    this.isLoggedIn = this._isLoggedIn();
  }

  login(user: User): Observable<AuthResponse> {
    return this.http.post(this.loginUrl(), user, this.getRequestOptions())
                    .pipe(map((response:Response) => {
                      this.isLoggedIn = this._isLoggedIn();
                      return response.json() as AuthResponse
                     }), catchError((error:any) => observableThrowError(
                      this.handleError(error, 'login', this.loginUrl(), user)
                    )));
  }

  private _isLoggedIn(): boolean {
    let loggedIn = this.cookieService.get('loggedIn');
    return loggedIn === '1';
  }

  logout(): Observable<AuthResponse> {
    return this.http.get(this.logoutUrl(), this.getRequestOptions())
                    .pipe(map((response:Response) => {
                      this.isLoggedIn = this._isLoggedIn();
                      return response.json() as AuthResponse
                    }), catchError((error:any) => observableThrowError(
                      this.handleError(error, 'logout', this.logoutUrl())
                    )));
  }
}
