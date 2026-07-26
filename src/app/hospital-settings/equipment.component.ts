import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiLoader } from '@taiga-ui/core';

import type { EquipmentType } from '../core/models/equipment-type.model';
import type { Equipment } from '../core/models/equipment.model';
import { EquipmentApiService } from '../core/services/equipment-api.service';

/** CRUD оборудования выбранного отделения. */
@Component({
  selector: 'app-equipment',
  imports: [FormsModule, TuiButton, TuiLoader],
  templateUrl: './equipment.component.html',
  styleUrl: './hospital-settings.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EquipmentComponent {
  private readonly api = inject(EquipmentApiService);

  readonly departmentId = input<number | null>(null);
  readonly equipmentTypes = input<EquipmentType[]>([]);

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly editingId = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);
  protected readonly items = signal<Equipment[]>([]);

  protected newEquipmentTypeId: number | null = null;
  protected newName = '';
  protected newManufacturer = '';
  protected newModel = '';
  protected newSerialNumber = '';
  protected newInventoryNumber = '';
  protected newManufactureYear: number | null = null;

  protected editEquipmentTypeId: number | null = null;
  protected editName = '';
  protected editManufacturer = '';
  protected editModel = '';
  protected editSerialNumber = '';
  protected editInventoryNumber = '';
  protected editManufactureYear: number | null = null;
  protected editIsActive = true;

  constructor() {
    effect(() => {
      const departmentId = this.departmentId();
      this.editingId.set(null);
      this.error.set(null);
      this.success.set(null);
      this.resetAddForm();

      if (departmentId) {
        this.loadEquipment(departmentId);
      } else {
        this.items.set([]);
      }
    });
  }

  protected addEquipment(): void {
    const departmentId = this.departmentId();
    const name = this.newName.trim();
    if (!departmentId) {
      return;
    }
    if (!this.newEquipmentTypeId) {
      this.error.set('Выберите вид оборудования');
      return;
    }
    if (!name) {
      this.error.set('Введите наименование');
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    this.api
      .create(departmentId, {
        equipment_type_id: this.newEquipmentTypeId,
        name,
        manufacturer: this.normalizeField(this.newManufacturer),
        model: this.normalizeField(this.newModel),
        serial_number: this.normalizeField(this.newSerialNumber),
        inventory_number: this.normalizeField(this.newInventoryNumber),
        manufacture_year: this.newManufactureYear,
      })
      .subscribe({
        next: (item) => {
          this.items.update((rows) =>
            [...rows, item].sort((a, b) => a.name.localeCompare(b.name, 'ru')),
          );
          this.success.set(`Оборудование «${item.name}» добавлено`);
          this.resetAddForm();
          this.saving.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.error ?? 'Не удалось добавить оборудование');
          this.saving.set(false);
        },
      });
  }

  protected startEdit(item: Equipment): void {
    this.editingId.set(item.id);
    this.editEquipmentTypeId = item.equipment_type_id;
    this.editName = item.name;
    this.editManufacturer = item.manufacturer ?? '';
    this.editModel = item.model ?? '';
    this.editSerialNumber = item.serial_number ?? '';
    this.editInventoryNumber = item.inventory_number ?? '';
    this.editManufactureYear = item.manufacture_year;
    this.editIsActive = item.is_active;
    this.error.set(null);
    this.success.set(null);
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
  }

  protected saveEdit(item: Equipment): void {
    const departmentId = this.departmentId();
    const name = this.editName.trim();
    if (!departmentId) {
      return;
    }
    if (!this.editEquipmentTypeId) {
      this.error.set('Выберите вид оборудования');
      return;
    }
    if (!name) {
      this.error.set('Введите наименование');
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    this.api
      .update(departmentId, item.id, {
        equipment_type_id: this.editEquipmentTypeId,
        name,
        manufacturer: this.normalizeField(this.editManufacturer),
        model: this.normalizeField(this.editModel),
        serial_number: this.normalizeField(this.editSerialNumber),
        inventory_number: this.normalizeField(this.editInventoryNumber),
        manufacture_year: this.editManufactureYear,
        is_active: this.editIsActive,
      })
      .subscribe({
        next: (updated) => {
          this.items.update((rows) =>
            rows
              .map((row) => (row.id === updated.id ? updated : row))
              .sort((a, b) => a.name.localeCompare(b.name, 'ru')),
          );
          this.success.set(`Оборудование «${updated.name}» сохранено`);
          this.editingId.set(null);
          this.saving.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.error ?? 'Не удалось сохранить оборудование');
          this.saving.set(false);
        },
      });
  }

  protected deleteEquipment(item: Equipment): void {
    const departmentId = this.departmentId();
    if (!departmentId) {
      return;
    }

    const confirmed = confirm(`Удалить оборудование «${item.name}»?`);
    if (!confirmed) {
      return;
    }

    this.deletingId.set(item.id);
    this.error.set(null);
    this.success.set(null);

    this.api.remove(departmentId, item.id).subscribe({
      next: () => {
        this.items.update((rows) => rows.filter((row) => row.id !== item.id));
        if (this.editingId() === item.id) {
          this.editingId.set(null);
        }
        this.success.set(`Оборудование «${item.name}» удалено`);
        this.deletingId.set(null);
      },
      error: (err) => {
        this.error.set(err.error?.error ?? 'Не удалось удалить оборудование');
        this.deletingId.set(null);
      },
    });
  }

  protected isEditing(id: number): boolean {
    return this.editingId() === id;
  }

  protected typeName(typeId: number): string {
    return this.equipmentTypes().find((type) => type.id === typeId)?.name ?? '—';
  }

  protected display(value: string | null): string {
    return value?.trim() ? value : '—';
  }

  protected displayYear(value: number | null): string {
    return value === null ? '—' : String(value);
  }

  protected displayActive(value: boolean): string {
    return value ? 'Да' : 'Нет';
  }

  private loadEquipment(departmentId: number): void {
    this.loading.set(true);
    this.api.listByDepartment(departmentId).subscribe({
      next: (response) => {
        this.items.set(response.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Не удалось загрузить оборудование');
        this.loading.set(false);
      },
    });
  }

  private resetAddForm(): void {
    this.newEquipmentTypeId = null;
    this.newName = '';
    this.newManufacturer = '';
    this.newModel = '';
    this.newSerialNumber = '';
    this.newInventoryNumber = '';
    this.newManufactureYear = null;
  }

  private normalizeField(value: string): string | null {
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }
}
