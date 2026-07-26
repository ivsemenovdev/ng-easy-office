import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiLoader } from '@taiga-ui/core';

import type { Department } from '../core/models/department.model';
import { DepartmentsApiService } from '../core/services/departments-api.service';

/** CRUD отделений выбранной больницы. */
@Component({
  selector: 'app-departments',
  imports: [FormsModule, TuiButton, TuiLoader],
  templateUrl: './departments.component.html',
  styleUrl: './hospital-settings.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepartmentsComponent {
  private readonly api = inject(DepartmentsApiService);

  readonly hospitalId = input<number | null>(null);
  readonly departmentSelected = output<number | null>();

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly editingId = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);
  protected readonly departments = signal<Department[]>([]);
  protected readonly selectedDepartmentId = signal<number | null>(null);

  protected newName = '';
  protected newCode = '';
  protected editName = '';
  protected editCode = '';
  protected editIsActive = true;

  constructor() {
    effect(() => {
      const hospitalId = this.hospitalId();
      this.selectedDepartmentId.set(null);
      this.departmentSelected.emit(null);
      this.editingId.set(null);
      this.error.set(null);
      this.success.set(null);
      this.resetAddForm();

      if (hospitalId) {
        this.loadDepartments(hospitalId);
      } else {
        this.departments.set([]);
      }
    });
  }

  protected addDepartment(): void {
    const hospitalId = this.hospitalId();
    const name = this.newName.trim();
    if (!hospitalId) {
      return;
    }
    if (!name) {
      this.error.set('Введите название отделения');
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    this.api
      .create(hospitalId, {
        name,
        code: this.newCode.trim() || null,
      })
      .subscribe({
        next: (item) => {
          this.departments.update((items) =>
            [...items, item].sort((a, b) => a.name.localeCompare(b.name, 'ru')),
          );
          this.success.set(`Отделение «${item.name}» добавлено`);
          this.resetAddForm();
          this.saving.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.error ?? 'Не удалось добавить отделение');
          this.saving.set(false);
        },
      });
  }

  protected selectDepartment(department: Department): void {
    const nextId =
      this.selectedDepartmentId() === department.id ? null : department.id;
    this.selectedDepartmentId.set(nextId);
    this.departmentSelected.emit(nextId);
  }

  protected isSelected(id: number): boolean {
    return this.selectedDepartmentId() === id;
  }

  protected startEdit(item: Department): void {
    this.editingId.set(item.id);
    this.editName = item.name;
    this.editCode = item.code ?? '';
    this.editIsActive = item.is_active;
    this.error.set(null);
    this.success.set(null);
  }

  protected cancelEdit(): void {
    this.editingId.set(null);
  }

  protected saveEdit(item: Department): void {
    const hospitalId = this.hospitalId();
    const name = this.editName.trim();
    if (!hospitalId) {
      return;
    }
    if (!name) {
      this.error.set('Введите название отделения');
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    this.api
      .update(hospitalId, item.id, {
        name,
        code: this.editCode.trim() || null,
        is_active: this.editIsActive,
      })
      .subscribe({
        next: (updated) => {
          this.departments.update((items) =>
            items
              .map((row) => (row.id === updated.id ? updated : row))
              .sort((a, b) => a.name.localeCompare(b.name, 'ru')),
          );
          this.success.set(`Отделение «${updated.name}» сохранено`);
          this.editingId.set(null);
          this.saving.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.error ?? 'Не удалось сохранить отделение');
          this.saving.set(false);
        },
      });
  }

  protected deleteDepartment(item: Department): void {
    const hospitalId = this.hospitalId();
    if (!hospitalId) {
      return;
    }

    const confirmed = confirm(`Удалить отделение «${item.name}»?`);
    if (!confirmed) {
      return;
    }

    this.deletingId.set(item.id);
    this.error.set(null);
    this.success.set(null);

    this.api.remove(hospitalId, item.id).subscribe({
      next: () => {
        this.departments.update((items) => items.filter((row) => row.id !== item.id));
        if (this.selectedDepartmentId() === item.id) {
          this.selectedDepartmentId.set(null);
          this.departmentSelected.emit(null);
        }
        if (this.editingId() === item.id) {
          this.editingId.set(null);
        }
        this.success.set(`Отделение «${item.name}» удалено`);
        this.deletingId.set(null);
      },
      error: (err) => {
        this.error.set(
          err.error?.error ??
            'Не удалось удалить отделение. Возможно, к нему привязано оборудование.',
        );
        this.deletingId.set(null);
      },
    });
  }

  protected isEditing(id: number): boolean {
    return this.editingId() === id;
  }

  protected displayCode(value: string | null): string {
    return value?.trim() ? value : '—';
  }

  protected displayActive(value: boolean): string {
    return value ? 'Да' : 'Нет';
  }

  private loadDepartments(hospitalId: number): void {
    this.loading.set(true);
    this.api.listByHospital(hospitalId).subscribe({
      next: (response) => {
        this.departments.set(response.items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Не удалось загрузить отделения');
        this.loading.set(false);
      },
    });
  }

  private resetAddForm(): void {
    this.newName = '';
    this.newCode = '';
  }
}
