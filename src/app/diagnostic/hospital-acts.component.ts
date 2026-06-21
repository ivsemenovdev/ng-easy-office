import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiLoader, TuiTitle } from '@taiga-ui/core';

import type { DiagnosticActRecord } from '../core/models/diagnostic-act.model';
import type { GeoRegion } from '../core/models/geo.model';
import type { Hospital } from '../core/models/hospital.model';
import { DiagnosticApiService } from '../core/services/diagnostic-api.service';
import { HospitalsApiService } from '../core/services/hospitals-api.service';
import { RegionsApiService } from '../core/services/regions-api.service';

/** Просмотр сохранённых актов диагностики по региону и больнице. */
@Component({
  selector: 'app-hospital-acts',
  imports: [RouterLink, TuiLoader, TuiTitle],
  templateUrl: './hospital-acts.component.html',
  styleUrl: './hospital-acts.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HospitalActsComponent {
  private readonly diagnosticApi = inject(DiagnosticApiService);
  private readonly regionsApi = inject(RegionsApiService);
  private readonly hospitalsApi = inject(HospitalsApiService);

  protected readonly loadingRegions = signal(true);
  protected readonly loadingActs = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly regions = signal<GeoRegion[]>([]);
  protected readonly hospitals = signal<Hospital[]>([]);
  protected readonly acts = signal<DiagnosticActRecord[]>([]);
  protected readonly total = signal(0);

  protected readonly selectedRegionId = signal<number | null>(null);
  protected readonly selectedHospitalId = signal<number | null>(null);
  protected readonly expandedActId = signal<number | null>(null);

  constructor() {
    this.loadRegions();
  }

  protected onRegionChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const regionId = value ? Number.parseInt(value, 10) : null;
    this.selectedRegionId.set(regionId);
    this.selectedHospitalId.set(null);
    this.hospitals.set([]);
    this.acts.set([]);
    this.total.set(0);
    this.expandedActId.set(null);
    this.error.set(null);

    if (regionId) {
      this.loadHospitals(regionId);
    }
  }

  protected onHospitalChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const hospitalId = value ? Number.parseInt(value, 10) : null;
    this.selectedHospitalId.set(hospitalId);
    this.expandedActId.set(null);
    this.error.set(null);

    if (hospitalId) {
      this.loadActs(hospitalId);
    } else {
      this.acts.set([]);
      this.total.set(0);
    }
  }

  protected toggleAct(id: number): void {
    this.expandedActId.update((current) => (current === id ? null : id));
  }

  protected display(value: string | null): string {
    return value?.trim() ? value : '—';
  }

  protected formatDateTime(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(date);
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
    this.hospitalsApi.listByRegion(regionId).subscribe({
      next: (response) => this.hospitals.set(response.items),
      error: () => this.error.set('Не удалось загрузить список больниц'),
    });
  }

  private loadActs(hospitalId: number): void {
    this.loadingActs.set(true);
    this.diagnosticApi.listActs(hospitalId).subscribe({
      next: (response) => {
        this.acts.set(response.items);
        this.total.set(response.total);
        this.loadingActs.set(false);
      },
      error: () => {
        this.error.set('Не удалось загрузить акты');
        this.loadingActs.set(false);
      },
    });
  }
}
