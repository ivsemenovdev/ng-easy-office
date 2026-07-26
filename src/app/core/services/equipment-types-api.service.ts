import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import type {
  EquipmentType,
  EquipmentTypeCreateRequest,
  EquipmentTypeListResponse,
  EquipmentTypeUpdateRequest,
} from '../models/equipment-type.model';

/** HTTP-клиент для `/api/equipment-types`: справочник видов оборудования. */
@Injectable({ providedIn: 'root' })
export class EquipmentTypesApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/equipment-types';

  list(limit = 500, isActive?: boolean): Observable<EquipmentTypeListResponse> {
    let params = new HttpParams().set('limit', limit).set('offset', 0);
    if (isActive !== undefined) {
      params = params.set('is_active', String(isActive));
    }
    return this.http.get<EquipmentTypeListResponse>(this.baseUrl, { params });
  }

  create(body: EquipmentTypeCreateRequest): Observable<EquipmentType> {
    return this.http.post<EquipmentType>(this.baseUrl, body);
  }

  update(id: number, body: EquipmentTypeUpdateRequest): Observable<EquipmentType> {
    return this.http.patch<EquipmentType>(`${this.baseUrl}/${id}`, body);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
