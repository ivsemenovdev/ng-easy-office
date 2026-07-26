import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiLoader } from '@taiga-ui/core';

import type { EquipmentType } from '../core/models/equipment-type.model';
import { EquipmentTypesApiService } from '../core/services/equipment-types-api.service';

/** CRUD справочника видов оборудования. */
@Component({
  selector: 'app-equipment-types',
  imports: [FormsModule, TuiButton, TuiLoader],
  templateUrl: './equipment-types.component.html',
  styleUrl: './hospital-settings.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EquipmentTypesComponent {
  private readonly api = inject(EquipmentTypesApiService);

  readonly typesChanged = output<void>();

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly editingId = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);
  protected readonly types = signal<EquipmentType[]>([]);

  protected newName = '';
  protected editName = '';
  protected editIsActive = true;

  constructor() {
    this.loadTypes();
  }

  protected addType(): void {
    const name = this.newName.trim();
    if (!name) {
      this.error.set('Введите название вида оборудования');
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    this.api.create({ name }).subscribe({
      next: (item) => {
        this.types.update((items) =>
          [...items, item].sort((a, b) => a.name.localeCompare(b.name, 'ru')),
        );
        this.success.set(`Вид «${item.name}» добавлен`);
        this.newName = '';
        this.saving.set(false);
        this.typesChanged.emit();
      },
      error: (err) => {
        this.error.set(err.error?.error ?? 'Не удалось добавить вид оборудования');
        this.saving.set(false);
      },
    });
  }

  protected startEdit(item: EquipmentType): void {
    this.editingId.set(item.id);
    this.editName = item.name;
    this.editIsActive = item.is_active;
    this.error.set(null);
    this.success.set(null);
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
  }

  protected saveEdit(item: EquipmentType): void {
    const name = this.editName.trim();
    if (!name) {
      this.error.set('Введите название вида оборудования');
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    this.api.update(item.id, { name, is_active: this.editIsActive }).subscribe({
      next: (updated) => {
        this.types.update((items) =>
          items
            .map((row) => (row.id === updated.id ? updated : row))
            .sort((a, b) => a.name.localeCompare(b.name, 'ru')),
        );
        this.success.set(`Вид «${updated.name}» сохранён`);
        this.editingId.set(null);
        this.saving.set(false);
        this.typesChanged.emit();
      },
      error: (err) => {
        this.error.set(err.error?.error ?? 'Не удалось сохранить вид оборудования');
        this.saving.set(false);
      },
    });
  }

  protected deleteType(item: EquipmentType): void {
    const confirmed = confirm(`Удалить вид оборудования «${item.name}»?`);
    if (!confirmed) {
      return;
    }

    this.deletingId.set(item.id);
    this.error.set(null);
    this.success.set(null);

    this.api.remove(item.id).subscribe({
      next: () => {
        this.types.update((items) => items.filter((row) => row.id !== item.id));
        if (this.editingId() === item.id) {
          this.editingId.set(null);
        }
        this.success.set(`Вид «${item.name}» удалён`);
        this.deletingId.set(null);
        this.typesChanged.emit();
      },
      error: (err) => {
        this.error.set(
          err.error?.error ??
            'Не удалось удалить вид оборудования. Возможно, он используется в оборудовании.',
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

  protected reload(): void {
    this.loadTypes();
  }

  private loadTypes(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (response) => {
        this.types.set(response.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Не удалось загрузить виды оборудования');
        this.loading.set(false);
      },
    });
  }
}
