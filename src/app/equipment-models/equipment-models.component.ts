import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiLoader, TuiTitle } from '@taiga-ui/core';

import type { EquipmentModel } from '../core/models/equipment-model.model';
import type { EquipmentType } from '../core/models/equipment-type.model';
import { EquipmentModelsApiService } from '../core/services/equipment-models-api.service';
import { EquipmentTypesApiService } from '../core/services/equipment-types-api.service';

/** CRUD глобального справочника моделей медтехники. */
@Component({
  selector: 'app-equipment-models',
  imports: [FormsModule, TuiButton, TuiLoader, TuiTitle],
  templateUrl: './equipment-models.component.html',
  styleUrl: '../hospital-settings/hospital-settings.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EquipmentModelsComponent {
  private readonly api = inject(EquipmentModelsApiService);
  private readonly typesApi = inject(EquipmentTypesApiService);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly editingId = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);
  protected readonly items = signal<EquipmentModel[]>([]);
  protected readonly types = signal<EquipmentType[]>([]);

  protected newEquipmentTypeId: number | null = null;
  protected newManufacturer = '';
  protected newModel = '';

  protected editEquipmentTypeId: number | null = null;
  protected editManufacturer = '';
  protected editModel = '';
  protected editIsActive = true;

  constructor() {
    this.loadTypes();
    this.loadModels();
  }

  protected addModel(): void {
    const manufacturer = this.newManufacturer.trim();
    const model = this.newModel.trim();
    if (!this.newEquipmentTypeId) {
      this.error.set('Выберите вид оборудования');
      return;
    }
    if (!manufacturer) {
      this.error.set('Введите производителя');
      return;
    }
    if (!model) {
      this.error.set('Введите модель');
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    this.api
      .create({
        equipment_type_id: this.newEquipmentTypeId,
        manufacturer,
        model,
      })
      .subscribe({
        next: (item) => {
          this.items.update((rows) => [...rows, item].sort(this.compareModels));
          this.success.set(`Модель «${this.modelLabel(item)}» добавлена`);
          this.resetAddForm();
          this.saving.set(false);
        },
        error: (err) => {
          this.error.set(this.apiErrorMessage(err, 'Не удалось добавить модель'));
          this.saving.set(false);
        },
      });
  }

  protected startEdit(item: EquipmentModel): void {
    this.editingId.set(item.id);
    this.editEquipmentTypeId = item.equipment_type_id;
    this.editManufacturer = item.manufacturer;
    this.editModel = item.model;
    this.editIsActive = item.is_active;
    this.error.set(null);
    this.success.set(null);
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
  }

  protected saveEdit(item: EquipmentModel): void {
    const manufacturer = this.editManufacturer.trim();
    const model = this.editModel.trim();
    if (!this.editEquipmentTypeId) {
      this.error.set('Выберите вид оборудования');
      return;
    }
    if (!manufacturer) {
      this.error.set('Введите производителя');
      return;
    }
    if (!model) {
      this.error.set('Введите модель');
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    this.api
      .update(item.id, {
        equipment_type_id: this.editEquipmentTypeId,
        manufacturer,
        model,
        is_active: this.editIsActive,
      })
      .subscribe({
        next: (updated) => {
          this.items.update((rows) =>
            rows.map((row) => (row.id === updated.id ? updated : row)).sort(this.compareModels),
          );
          this.success.set(`Модель «${this.modelLabel(updated)}» сохранена`);
          this.editingId.set(null);
          this.saving.set(false);
        },
        error: (err) => {
          this.error.set(this.apiErrorMessage(err, 'Не удалось сохранить модель'));
          this.saving.set(false);
        },
      });
  }

  protected deleteModel(item: EquipmentModel): void {
    const confirmed = confirm(`Удалить модель «${this.modelLabel(item)}»?`);
    if (!confirmed) {
      return;
    }

    this.deletingId.set(item.id);
    this.error.set(null);
    this.success.set(null);

    this.api.remove(item.id).subscribe({
      next: () => {
        this.items.update((rows) => rows.filter((row) => row.id !== item.id));
        if (this.editingId() === item.id) {
          this.editingId.set(null);
        }
        this.success.set(`Модель «${this.modelLabel(item)}» удалена`);
        this.deletingId.set(null);
      },
      error: (err) => {
        this.error.set(
          this.apiErrorMessage(
            err,
            'Не удалось удалить модель. Возможно, она используется в оборудовании больниц.',
          ),
        );
        this.deletingId.set(null);
      },
    });
  }

  protected isEditing(id: number): boolean {
    return this.editingId() === id;
  }

  protected displayActive(value: boolean): string {
    return value ? 'Да' : 'Нет';
  }

  protected modelLabel(item: EquipmentModel): string {
    return `${item.manufacturer} ${item.model}`;
  }

  private loadTypes(): void {
    this.typesApi.list().subscribe({
      next: (response) => {
        this.types.set(response.items);
      },
      error: () => {
        this.error.set('Не удалось загрузить виды оборудования');
      },
    });
  }

  private loadModels(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (response) => {
        this.items.set(response.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Не удалось загрузить модели оборудования');
        this.loading.set(false);
      },
    });
  }

  private resetAddForm(): void {
    this.newEquipmentTypeId = null;
    this.newManufacturer = '';
    this.newModel = '';
  }

  private compareModels(a: EquipmentModel, b: EquipmentModel): number {
    const typeCompare = a.equipment_type_name.localeCompare(b.equipment_type_name, 'ru');
    if (typeCompare !== 0) {
      return typeCompare;
    }
    const manufacturerCompare = a.manufacturer.localeCompare(b.manufacturer, 'ru');
    if (manufacturerCompare !== 0) {
      return manufacturerCompare;
    }
    return a.model.localeCompare(b.model, 'ru');
  }

  private apiErrorMessage(err: { error?: { error?: string; code?: string } }, fallback: string): string {
    const body = err.error;
    if (!body?.error) {
      return fallback;
    }
    if (body.code === 'CONFLICT') {
      return body.error;
    }
    if (body.code === 'FK_VIOLATION') {
      return 'Выбранный вид оборудования не найден. Обновите страницу и попробуйте снова.';
    }
    return body.error;
  }
}
