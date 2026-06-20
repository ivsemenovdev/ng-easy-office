import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import type { GeoRegionListResponse } from '../models/geo.model';

@Injectable({ providedIn: 'root' })
export class RegionsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/regions';

  downloadDocx(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/export`, {
      responseType: 'blob',
    });
  }

  listRussia(limit = 500): Observable<GeoRegionListResponse> {
    const params = new HttpParams()
      .set('country_iso', 'RU')
      .set('limit', limit)
      .set('offset', 0);

    return this.http.get<GeoRegionListResponse>(this.baseUrl, { params });
  }
}
