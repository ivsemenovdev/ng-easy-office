import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import type {
  DiagnosticActCreateRequest,
  DiagnosticActData,
  DiagnosticActListResponse,
  DiagnosticActParseResponse,
  DiagnosticActRecord,
  DiagnosticActSaveResponse,
} from '../models/diagnostic-act.model';

/** HTTP-клиент для `/api/diagnostic`: разбор DOCX и сохранение актов. */
@Injectable({ providedIn: 'root' })
export class DiagnosticApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/diagnostic';

  /** Разбирает акт диагностики из загруженного `.docx`. */
  parseDocx(file: File): Observable<DiagnosticActParseResponse> {
    const form = new FormData();
    form.append('file', file);
    return this.http.post<DiagnosticActParseResponse>(`${this.baseUrl}/parse`, form);
  }

  /** Сохраняет разобранный акт, привязанный к больнице. */
  saveAct(
    hospitalId: number,
    data: DiagnosticActData,
  ): Observable<DiagnosticActSaveResponse> {
    const body: DiagnosticActCreateRequest = {
      hospital_id: hospitalId,
      act_number: data.actNumber,
      act_date: data.actDate,
      act_title: data.actTitle,
      equipment_name: data.equipmentName,
      equipment_model: data.equipmentModel,
      serial_number: data.serialNumber,
      customer: data.customer,
      customer_address: data.customerAddress,
      work_type: data.workType,
      basis: data.basis,
      equipment_condition: data.equipmentCondition,
      completed_works: data.completedWorks,
      conclusion: data.conclusion,
    };

    return this.http.post<DiagnosticActSaveResponse>(`${this.baseUrl}/acts`, body);
  }

  /** Список актов выбранной больницы. */
  listActs(hospitalId: number, limit = 500): Observable<DiagnosticActListResponse> {
    const params = new HttpParams()
      .set('hospital_id', hospitalId)
      .set('limit', limit)
      .set('offset', 0);

    return this.http.get<DiagnosticActListResponse>(`${this.baseUrl}/acts`, { params });
  }

  getAct(id: number): Observable<DiagnosticActRecord> {
    return this.http.get<DiagnosticActRecord>(`${this.baseUrl}/acts/${id}`);
  }
}
