import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiLoader, TuiTitle } from '@taiga-ui/core';
import { firstValueFrom } from 'rxjs';

import type {
  DiagnosticActData,
  DiagnosticBatchItem,
  DiagnosticFieldRow,
  DiagnosticSectionRow,
} from '../core/models/diagnostic-act.model';
import type { GeoRegion } from '../core/models/geo.model';
import type { Hospital } from '../core/models/hospital.model';
import { DiagnosticApiService } from '../core/services/diagnostic-api.service';
import { HospitalsApiService } from '../core/services/hospitals-api.service';
import { RegionsApiService } from '../core/services/regions-api.service';

/** Загрузка DOCX акта, предпросмотр полей и сохранение в БД. */
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

  protected readonly batchFiles = signal<File[]>([]);
  protected readonly batchFolderLabel = signal<string | null>(null);
  protected readonly batchItems = signal<DiagnosticBatchItem[]>([]);
  protected readonly batchParsing = signal(false);
  protected readonly batchSaving = signal(false);
  protected readonly batchError = signal<string | null>(null);
  protected readonly batchSaveMessage = signal<string | null>(null);
  protected readonly batchProgress = signal({ done: 0, total: 0 });

  protected readonly batchRegions = signal<GeoRegion[]>([]);
  protected readonly batchHospitals = signal<Hospital[]>([]);
  protected readonly batchSelectedRegionId = signal<number | null>(null);
  protected readonly batchSelectedHospitalId = signal<number | null>(null);

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
    this.error.set(null);
    this.saveError.set(null);
    this.saveSuccess.set(null);
    this.result.set(null);
  }

  protected onFolderSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? [])
      .filter((file) => file.name.toLowerCase().endsWith('.docx'))
      .sort((a, b) =>
        this.fileRelativePath(a).localeCompare(this.fileRelativePath(b), 'ru'),
      );

    this.batchFiles.set(files);
    this.batchItems.set([]);
    this.batchError.set(null);
    this.batchSaveMessage.set(null);
    this.batchProgress.set({ done: 0, total: 0 });

    if (files.length === 0) {
      this.batchFolderLabel.set(null);
      this.batchError.set('В выбранной папке нет файлов .docx');
      return;
    }

    const folderName = this.fileRelativePath(files[0]).split('/')[0] ?? 'папка';
    this.batchFolderLabel.set(folderName);
    this.loadBatchRegions();
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

  protected async parseBatch(): Promise<void> {
    const files = this.batchFiles();
    if (files.length === 0) {
      this.batchError.set('Выберите папку с файлами .docx');
      return;
    }

    this.batchParsing.set(true);
    this.batchError.set(null);
    this.batchSaveMessage.set(null);
    this.batchProgress.set({ done: 0, total: files.length });

    const items: DiagnosticBatchItem[] = files.map((file) => ({
      fileName: file.name,
      relativePath: this.fileRelativePath(file),
      status: 'pending',
    }));
    this.batchItems.set(items);
    this.loadBatchRegions();

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      try {
        const response = await firstValueFrom(this.api.parseDocx(file));
        items[index] = {
          ...items[index],
          status: 'parsed',
          data: response.data,
        };
      } catch (err: unknown) {
        const httpErr = err as { error?: { error?: string } };
        items[index] = {
          ...items[index],
          status: 'error',
          error:
            httpErr.error?.error ??
            'Не удалось разобрать документ. Проверьте шаблон и backend.',
        };
      }

      this.batchItems.set([...items]);
      this.batchProgress.set({ done: index + 1, total: files.length });
    }

    this.batchParsing.set(false);

    const parsedCount = items.filter((item) => item.status === 'parsed').length;
    if (parsedCount === 0) {
      this.batchError.set('Ни один файл не удалось разобрать');
    }
  }

  protected async saveBatchToDb(): Promise<void> {
    const hospitalId = this.batchSelectedHospitalId();
    const items = this.batchItems();

    if (!hospitalId) {
      this.batchError.set('Выберите больницу');
      return;
    }

    const toSave = items.filter((item) => item.status === 'parsed' && item.data);
    if (toSave.length === 0) {
      this.batchError.set('Нет разобранных актов для сохранения');
      return;
    }

    this.batchSaving.set(true);
    this.batchError.set(null);
    this.batchSaveMessage.set(null);

    let savedCount = 0;
    let failedCount = 0;

    for (const item of items) {
      if (item.status !== 'parsed' || !item.data) {
        continue;
      }

      try {
        const response = await firstValueFrom(
          this.api.saveAct(hospitalId, item.data),
        );
        item.status = 'saved';
        item.actId = response.act.id;
        item.warnings = response.warnings;
        savedCount++;
      } catch (err: unknown) {
        const httpErr = err as { error?: { error?: string } };
        item.status = 'error';
        item.error =
          httpErr.error?.error ??
          'Не удалось сохранить акт. Проверьте backend и миграции БД.';
        failedCount++;
      }
    }

    this.batchItems.set([...items]);
    this.batchSaving.set(false);

    if (savedCount > 0 && failedCount === 0) {
      this.batchSaveMessage.set(`Сохранено актов: ${savedCount}`);
    } else if (savedCount > 0) {
      this.batchSaveMessage.set(
        `Сохранено: ${savedCount}, ошибок: ${failedCount}`,
      );
    } else {
      this.batchError.set('Не удалось сохранить ни один акт');
    }
  }

  protected batchParsedCount(): number {
    return this.batchItems().filter((item) => item.status === 'parsed').length;
  }

  protected batchSavedCount(): number {
    return this.batchItems().filter((item) => item.status === 'saved').length;
  }

  protected batchStatusLabel(item: DiagnosticBatchItem): string {
    switch (item.status) {
      case 'pending':
        return 'Ожидает';
      case 'parsed':
        return 'Разобран';
      case 'saved':
        return item.actId ? `Сохранён (#${item.actId})` : 'Сохранён';
      case 'error':
        return 'Ошибка';
    }
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

  protected onBatchRegionChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const regionId = value ? Number.parseInt(value, 10) : null;
    this.batchSelectedRegionId.set(regionId);
    this.batchSelectedHospitalId.set(null);
    this.batchError.set(null);
    this.batchSaveMessage.set(null);
    this.batchHospitals.set([]);

    if (regionId) {
      this.loadBatchHospitals(regionId);
    }
  }

  protected onBatchHospitalChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.batchSelectedHospitalId.set(value ? Number.parseInt(value, 10) : null);
    this.batchError.set(null);
    this.batchSaveMessage.set(null);
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

  private fileRelativePath(file: File): string {
    const relativePath = (file as File & { webkitRelativePath?: string })
      .webkitRelativePath;
    return relativePath?.trim() ? relativePath : file.name;
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

  private loadBatchRegions(): void {
    if (this.batchRegions().length > 0) {
      return;
    }

    this.regionsApi.listRussia().subscribe({
      next: (response) => this.batchRegions.set(response.items),
      error: () => this.batchError.set('Не удалось загрузить список регионов'),
    });
  }

  private loadBatchHospitals(regionId: number): void {
    this.hospitalsApi.listByRegion(regionId).subscribe({
      next: (response) => this.batchHospitals.set(response.items),
      error: () => this.batchError.set('Не удалось загрузить список больниц'),
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
