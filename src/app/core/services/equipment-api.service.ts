import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import type {
  Equipment,
  EquipmentCreateRequest,
  EquipmentListResponse,
  EquipmentUpdateRequest,
} from '../models/equipment.model';

/** HTTP-клиент для `/api/departments/:departmentId/equipment`. */
@Injectable({ providedIn: 'root' })
export class EquipmentApiService {
  private readonly http = inject(HttpClient);
  private readonly departmentsUrl = '/api/departments';

  listByDepartment(departmentId: number, limit = 500): Observable<EquipmentListResponse> {
    const params = new HttpParams()
      .set('limit', limit)
      .set('offset', 0);

    return this.http.get<EquipmentListResponse>(
      `${this.departmentsUrl}/${departmentId}/equipment`,
      { params },
    );
  }

  create(departmentId: number, body: EquipmentCreateRequest): Observable<Equipment> {
    return this.http.post<Equipment>(
      `${this.departmentsUrl}/${departmentId}/equipment`,
      body,
    );
  }

  update(
    departmentId: number,
    equipmentId: number,
    body: EquipmentUpdateRequest,
  ): Observable<Equipment> {
    return this.http.patch<Equipment>(
      `${this.departmentsUrl}/${departmentId}/equipment/${equipmentId}`,
      body,
    );
  }

  remove(departmentId: number, equipmentId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.departmentsUrl}/${departmentId}/equipment/${equipmentId}`,
    );
  }
}
