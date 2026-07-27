import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import type {
  EquipmentModel,
  EquipmentModelCreateRequest,
  EquipmentModelListResponse,
  EquipmentModelUpdateRequest,
} from '../models/equipment-model.model';

/** HTTP-клиент для `/api/equipment-models`: справочник моделей медтехники. */
@Injectable({ providedIn: 'root' })
export class EquipmentModelsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/equipment-models';

  list(
    limit = 500,
    options?: { isActive?: boolean; equipmentTypeId?: number },
  ): Observable<EquipmentModelListResponse> {
    let params = new HttpParams().set('limit', limit).set('offset', 0);
    if (options?.isActive !== undefined) {
      params = params.set('is_active', String(options.isActive));
    }
    if (options?.equipmentTypeId !== undefined) {
      params = params.set('equipment_type_id', options.equipmentTypeId);
    }
    return this.http.get<EquipmentModelListResponse>(this.baseUrl, { params });
  }

  create(body: EquipmentModelCreateRequest): Observable<EquipmentModel> {
    return this.http.post<EquipmentModel>(this.baseUrl, body);
  }

  update(id: number, body: EquipmentModelUpdateRequest): Observable<EquipmentModel> {
    return this.http.patch<EquipmentModel>(`${this.baseUrl}/${id}`, body);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
