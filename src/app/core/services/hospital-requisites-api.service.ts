import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of, throwError } from 'rxjs';

import type {
  HospitalRequisites,
  HospitalRequisitesUpsertRequest,
} from '../models/hospital-requisites.model';

/** HTTP-клиент для `/api/hospitals/:id/requisites`. */
@Injectable({ providedIn: 'root' })
export class HospitalRequisitesApiService {
  private readonly http = inject(HttpClient);

  get(hospitalId: number): Observable<HospitalRequisites | null> {
    return this.http
      .get<HospitalRequisites>(`/api/hospitals/${hospitalId}/requisites`)
      .pipe(
        catchError((err) => {
          if (err.status === 404) {
            return of(null);
          }
          return throwError(() => err);
        }),
      );
  }

  upsert(
    hospitalId: number,
    body: HospitalRequisitesUpsertRequest,
  ): Observable<HospitalRequisites> {
    return this.http.put<HospitalRequisites>(
      `/api/hospitals/${hospitalId}/requisites`,
      body,
    );
  }
}
