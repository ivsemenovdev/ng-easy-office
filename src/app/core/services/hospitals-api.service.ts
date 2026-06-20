import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import type {
  Hospital,
  HospitalCreateRequest,
  HospitalListResponse,
} from '../models/hospital.model';

@Injectable({ providedIn: 'root' })
export class HospitalsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/hospitals';

  listByRegion(regionId: number, limit = 500): Observable<HospitalListResponse> {
    const params = new HttpParams()
      .set('region_id', regionId)
      .set('is_active', 'true')
      .set('limit', limit)
      .set('offset', 0);

    return this.http.get<HospitalListResponse>(this.baseUrl, { params });
  }

  getById(id: number): Observable<Hospital> {
    return this.http.get<Hospital>(`${this.baseUrl}/${id}`);
  }

  create(body: HospitalCreateRequest): Observable<Hospital> {
    return this.http.post<Hospital>(this.baseUrl, body);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
