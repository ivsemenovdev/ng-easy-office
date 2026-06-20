import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiLoader, TuiTitle } from '@taiga-ui/core';

import type {
  DiagnosticActData,
  DiagnosticFieldRow,
  DiagnosticSectionRow,
} from '../core/models/diagnostic-act.model';
import type { GeoRegion } from '../core/models/geo.model';
import type { Hospital } from '../core/models/hospital.model';
import { DiagnosticApiService } from '../core/services/diagnostic-api.service';
import { HospitalsApiService } from '../core/services/hospitals-api.service';
import { RegionsApiService } from '../core/services/regions-api.service';

@Component({
  selector: 'app-diagnostic-import',
  imports: [RouterLink, TuiButton, TuiLoader, TuiTitle],
  templateUrl: './diagnostic-import.component.html',
  styleUrl: './diagnostic-import.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagnosticImportComponent {
  private readonly api = inject(DiagnosticApiService);
  private readonly regionsApi = inject(RegionsApiService);
  private readonly hospitalsApi = inject(HospitalsApiService);

  protected readonly uploading = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly saveError = signal<string | null>(null);
  protected readonly saveSuccess = signal<string | null>(null);
  protected readonly result = signal<DiagnosticActData | null>(null);
  protected selectedFile: File | null = null;

  protected readonly actFields = signal<DiagnosticFieldRow[]>([]);
  protected readonly actSections = signal<DiagnosticSectionRow[]>([]);

  protected readonly regions = signal<GeoRegion[]>([]);
  protected readonly hospitals = signal<Hospital[]>([]);
  protected readonly selectedRegionId = signal<number | null>(null);
  protected readonly selectedHospitalId = signal<number | null>(null);

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.error.set(null);
    this.saveError.set(null);
    this.saveSuccess.set(null);
    this.result.set(null);
  }

  protected upload(): void {
    if (!this.selectedFile) {
      this.error.set('Выберите файл .docx');
      return;
    }

    this.uploading.set(true);
    this.error.set(null);
    this.saveError.set(null);
    this.saveSuccess.set(null);
    this.result.set(null);

    this.api.parseDocx(this.selectedFile).subscribe({
      next: (response) => {
        this.result.set(response.data);
        this.actFields.set(this.buildFieldRows(response.data));
        this.actSections.set(this.buildSectionRows(response.data));
        this.uploading.set(false);
        this.loadRegions();
      },
      error: (err) => {
        const message =
          err.error?.error ??
          'Не удалось разобрать документ. Запустите backend: cd backend && npm run dev';
        this.error.set(message);
        this.uploading.set(false);
      },
    });
  }

  protected onRegionChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const regionId = value ? Number.parseInt(value, 10) : null;
    this.selectedRegionId.set(regionId);
    this.selectedHospitalId.set(null);
    this.saveError.set(null);
    this.saveSuccess.set(null);
    this.hospitals.set([]);

    if (regionId) {
      this.loadHospitals(regionId);
    }
  }

  protected onHospitalChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedHospitalId.set(value ? Number.parseInt(value, 10) : null);
    this.saveError.set(null);
    this.saveSuccess.set(null);
  }

  protected saveToDb(): void {
    const data = this.result();
    const hospitalId = this.selectedHospitalId();

    if (!data) {
      return;
    }
    if (!hospitalId) {
      this.saveError.set('Выберите больницу');
      return;
    }

    this.saving.set(true);
    this.saveError.set(null);
    this.saveSuccess.set(null);

    this.api.saveAct(hospitalId, data).subscribe({
      next: (response) => {
        const warningText =
          response.warnings.length > 0
            ? ` (${response.warnings.join('; ')})`
            : '';
        this.saveSuccess.set(`Акт сохранён (id: ${response.act.id})${warningText}`);
        this.saving.set(false);
      },
      error: (err) => {
        this.saveError.set(
          err.error?.error ??
            'Не удалось сохранить акт. Проверьте backend и миграции БД.',
        );
        this.saving.set(false);
      },
    });
  }

  protected display(value: string | null): string {
    return value?.trim() ? value : '—';
  }

  private loadRegions(): void {
    this.regionsApi.listRussia().subscribe({
      next: (response) => this.regions.set(response.items),
      error: () => this.saveError.set('Не удалось загрузить список регионов'),
    });
  }

  private loadHospitals(regionId: number): void {
    this.hospitalsApi.listByRegion(regionId).subscribe({
      next: (response) => this.hospitals.set(response.items),
      error: () => this.saveError.set('Не удалось загрузить список больниц'),
    });
  }

  private buildFieldRows(data: DiagnosticActData): DiagnosticFieldRow[] {
    return [
      { label: 'Номер акта', value: this.display(data.actNumber) },
      { label: 'Дата', value: this.display(data.actDate) },
      { label: 'Тип акта', value: this.display(data.actTitle) },
      {
        label: 'Наименование оборудования',
        value: this.display(data.equipmentName),
      },
      { label: 'Модель оборудования', value: this.display(data.equipmentModel) },
      { label: 'Заводской номер', value: this.display(data.serialNumber) },
      { label: 'Заказчик', value: this.display(data.customer) },
      { label: 'Адрес заказчика', value: this.display(data.customerAddress) },
      { label: 'Тип работ', value: this.display(data.workType) },
      { label: 'Основание', value: this.display(data.basis) },
    ];
  }

  private buildSectionRows(data: DiagnosticActData): DiagnosticSectionRow[] {
    return [
      {
        label: 'Состояние оборудования, выявленные дефекты',
        items: data.equipmentCondition,
      },
      { label: 'Перечень выполненных работ', items: data.completedWorks },
      { label: 'Заключение', items: data.conclusion },
    ];
  }
}
