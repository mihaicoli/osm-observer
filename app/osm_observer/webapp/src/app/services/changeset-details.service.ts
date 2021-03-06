
import {throwError as observableThrowError,  Observable, Observer ,  Subject } from 'rxjs';
import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { map, catchError } from 'rxjs/operators';

import { CookieService } from 'angular2-cookie/services/cookies.service';

import { BaseHttpService } from './base-http.service';
import { ChangesetComment } from '../types/changeset-comment';
import { ChangesetDetails } from '../types/changeset-details';

@Injectable()
export class ChangesetDetailsService extends BaseHttpService {

  private changesetDetailsUrl(id: number): string {
    return this.location.prepareExternalUrl(`/api/changesets/changes/${id}`);
  }

  constructor(router: Router, private http: HttpClient, cookieService: CookieService, private location: Location) {
    super(router, cookieService);
    location.prepareExternalUrl('api/changesets/comments/')
  }

  getChangesetDetails(id: number): Observable<ChangesetDetails> {
    let url = this.changesetDetailsUrl(id);

    return this.http.get<ChangesetDetails>(url, this.httpOptions)
      .pipe(
        (catchError((error:any) => observableThrowError(
           this.handleError(error, 'getChangesetChanges', url, {id: id})
    ))));
  }
}
