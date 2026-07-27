import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { TuiLoader, TuiTitle } from '@taiga-ui/core';

import type { EquipmentModel } from '../core/models/equipment-model.model';
import type { GeoRegion } from '../core/models/geo.model';
import type { Hospital } from '../core/models/hospital.model';
import { EquipmentModelsApiService } from '../core/services/equipment-models-api.service';
import { HospitalsApiService } from '../core/services/hospitals-api.service';
import { RegionsApiService } from '../core/services/regions-api.service';
import { DepartmentsComponent } from './departments.component';
import { EquipmentComponent } from './equipment.component';

/** Настройка больницы: отделения и оборудование выбранной больницы. */
@Component({
  selector: 'app-hospital-settings',
  imports: [
    TuiLoader,
    TuiTitle,
    DepartmentsComponent,
    EquipmentComponent,
  ],
  templateUrl: './hospital-settings.component.html',
  styleUrl: './hospital-settings.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HospitalSettingsComponent {
  private readonly regionsApi = inject(RegionsApiService);
  private readonly hospitalsApi = inject(HospitalsApiService);
  private readonly equipmentModelsApi = inject(EquipmentModelsApiService);

  protected readonly loadingRegions = signal(true);
  protected readonly loadingHospitals = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly regions = signal<GeoRegion[]>([]);
  protected readonly hospitals = signal<Hospital[]>([]);
  protected readonly equipmentModels = signal<EquipmentModel[]>([]);

  protected readonly selectedRegionId = signal<number | null>(null);
  protected readonly selectedHospitalId = signal<number | null>(null);
  protected readonly selectedDepartmentId = signal<number | null>(null);

  constructor() {
    this.loadRegions();
    this.loadEquipmentModels();
  }

  protected onRegionChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const regionId = value ? Number.parseInt(value, 10) : null;
    this.selectedRegionId.set(regionId);
    this.selectedHospitalId.set(null);
    this.selectedDepartmentId.set(null);
    this.hospitals.set([]);
    this.error.set(null);

    if (regionId) {
      this.loadHospitals(regionId);
    }
  }

  protected onHospitalChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const hospitalId = value ? Number.parseInt(value, 10) : null;
    this.selectedHospitalId.set(hospitalId);
    this.selectedDepartmentId.set(null);
    this.error.set(null);
  }

  protected onDepartmentSelected(departmentId: number | null): void {
    this.selectedDepartmentId.set(departmentId);
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

  private loadEquipmentModels(): void {
    this.equipmentModelsApi.list().subscribe({
      next: (response) => {
        this.equipmentModels.set(response.items);
      },
      error: () => {
        this.error.set('Не удалось загрузить модели оборудования');
      },
    });
  }
}
