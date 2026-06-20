import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiLoader, TuiTitle } from '@taiga-ui/core';

import type { GeoRegion } from '../core/models/geo.model';
import type { Hospital } from '../core/models/hospital.model';
import { HospitalsApiService } from '../core/services/hospitals-api.service';
import { RegionsApiService } from '../core/services/regions-api.service';

@Component({
  selector: 'app-hospitals',
  imports: [RouterLink, FormsModule, TuiButton, TuiLoader, TuiTitle],
  templateUrl: './hospitals.component.html',
  styleUrl: './hospitals.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HospitalsComponent {
  private readonly regionsApi = inject(RegionsApiService);
  private readonly hospitalsApi = inject(HospitalsApiService);

  protected readonly loadingRegions = signal(true);
  protected readonly loadingHospitals = signal(false);
  protected readonly saving = signal(false);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);

  protected readonly regions = signal<GeoRegion[]>([]);
  protected readonly hospitals = signal<Hospital[]>([]);
  protected readonly selectedRegionId = signal<number | null>(null);

  protected newName = '';
  protected newAddress = '';

  constructor() {
    this.loadRegions();
  }

  protected onRegionChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const regionId = value ? Number.parseInt(value, 10) : null;
    this.selectedRegionId.set(regionId);
    this.hospitals.set([]);
    this.error.set(null);
    this.success.set(null);
    this.resetForm();

    if (regionId) {
      this.loadHospitals(regionId);
    }
  }

  protected addHospital(): void {
    const regionId = this.selectedRegionId();
    const name = this.newName.trim();

    if (!regionId) {
      this.error.set('Выберите регион');
      return;
    }
    if (!name) {
      this.error.set('Введите название больницы');
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);

    this.hospitalsApi
      .create({
        region_id: regionId,
        name,
        address: this.newAddress.trim() || null,
      })
      .subscribe({
        next: (hospital) => {
          this.hospitals.update((items) =>
            [...items, hospital].sort((a, b) => a.name.localeCompare(b.name, 'ru')),
          );
          this.success.set(`Больница «${hospital.name}» добавлена`);
          this.resetForm();
          this.saving.set(false);
        },
        error: (err) => {
          this.error.set(err.error?.error ?? 'Не удалось добавить больницу');
          this.saving.set(false);
        },
      });
  }

  protected deleteHospital(hospital: Hospital): void {
    const confirmed = confirm(`Удалить больницу «${hospital.name}»?`);
    if (!confirmed) {
      return;
    }

    this.deletingId.set(hospital.id);
    this.error.set(null);
    this.success.set(null);

    this.hospitalsApi.remove(hospital.id).subscribe({
      next: () => {
        this.hospitals.update((items) => items.filter((item) => item.id !== hospital.id));
        this.success.set(`Больница «${hospital.name}» удалена`);
        this.deletingId.set(null);
      },
      error: (err) => {
        this.error.set(
          err.error?.error ??
            'Не удалось удалить больницу. Возможно, к ней привязаны акты.',
        );
        this.deletingId.set(null);
      },
    });
  }

  protected displayAddress(value: string | null): string {
    return value?.trim() ? value : '—';
  }

  private loadRegions(): void {
    this.loadingRegions.set(true);
    this.regionsApi.listRussia().subscribe({
      next: (response) => {
        this.regions.set(response.items);
        this.loadingRegions.set(false);
      },
      error: () => {
        this.error.set('Не удалось загрузить список регионов');
        this.loadingRegions.set(false);
      },
    });
  }

  private loadHospitals(regionId: number): void {
    this.loadingHospitals.set(true);
    this.hospitalsApi.listByRegion(regionId).subscribe({
      next: (response) => {
        this.hospitals.set(response.items);
        this.loadingHospitals.set(false);
      },
      error: () => {
        this.error.set('Не удалось загрузить список больниц');
        this.loadingHospitals.set(false);
      },
    });
  }

  private resetForm(): void {
    this.newName = '';
    this.newAddress = '';
  }
}
