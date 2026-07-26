import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import type {
  Department,
  DepartmentCreateRequest,
  DepartmentListResponse,
  DepartmentUpdateRequest,
} from '../models/department.model';

/** HTTP-клиент для `/api/hospitals/:hospitalId/departments`. */
@Injectable({ providedIn: 'root' })
export class DepartmentsApiService {
  private readonly http = inject(HttpClient);
  private readonly hospitalsUrl = '/api/hospitals';

  listByHospital(hospitalId: number, limit = 500): Observable<DepartmentListResponse> {
    const params = new HttpParams()
      .set('limit', limit)
      .set('offset', 0);

    return this.http.get<DepartmentListResponse>(
      `${this.hospitalsUrl}/${hospitalId}/departments`,
      { params },
    );
  }

  create(hospitalId: number, body: DepartmentCreateRequest): Observable<Department> {
    return this.http.post<Department>(
      `${this.hospitalsUrl}/${hospitalId}/departments`,
      body,
    );
  }

  update(
    hospitalId: number,
    departmentId: number,
    body: DepartmentUpdateRequest,
  ): Observable<Department> {
    return this.http.patch<Department>(
      `${this.hospitalsUrl}/${hospitalId}/departments/${departmentId}`,
      body,
    );
  }

  remove(hospitalId: number, departmentId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.hospitalsUrl}/${hospitalId}/departments/${departmentId}`,
    );
  }
}
