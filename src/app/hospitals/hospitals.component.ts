import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiLoader, TuiTitle } from '@taiga-ui/core';

import type { GeoRegion } from '../core/models/geo.model';
import {
  EMPTY_HOSPITAL_REQUISITES,
  type HospitalRequisitesUpsertRequest,
} from '../core/models/hospital-requisites.model';
import type { Hospital } from '../core/models/hospital.model';
import { HospitalRequisitesApiService } from '../core/services/hospital-requisites-api.service';
import { HospitalsApiService } from '../core/services/hospitals-api.service';
import { RegionsApiService } from '../core/services/regions-api.service';

/** CRUD больниц по выбранному региону и редактирование реквизитов. */
@Component({
  selector: 'app-hospitals',
  imports: [FormsModule, TuiButton, TuiLoader, TuiTitle],
  templateUrl: './hospitals.component.html',
  styleUrl: './hospitals.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HospitalsComponent {
  private readonly regionsApi = inject(RegionsApiService);
  private readonly hospitalsApi = inject(HospitalsApiService);
  private readonly requisitesApi = inject(HospitalRequisitesApiService);

  protected readonly loadingRegions = signal(true);
  protected readonly loadingHospitals = signal(false);
  protected readonly saving = signal(false);
  protected readonly deletingId = signal<number | null>(null);
  protected readonly expandedHospitalId = signal<number | null>(null);
  protected readonly loadingRequisitesId = signal<number | null>(null);
  protected readonly savingRequisitesId = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);

  protected readonly regions = signal<GeoRegion[]>([]);
  protected readonly hospitals = signal<Hospital[]>([]);
  protected readonly selectedRegionId = signal<number | null>(null);

  protected newName = '';
  protected newAddress = '';
  protected requisitesForm: HospitalRequisitesUpsertRequest = {
    ...EMPTY_HOSPITAL_REQUISITES,
  };

  constructor() {
    this.loadRegions();
  }

  protected onRegionChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const regionId = value ? Number.parseInt(value, 10) : null;
    this.selectedRegionId.set(regionId);
    this.hospitals.set([]);
    this.expandedHospitalId.set(null);
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
        if (this.expandedHospitalId() === hospital.id) {
          this.expandedHospitalId.set(null);
        }
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

  protected toggleRequisites(hospital: Hospital): void {
    if (this.expandedHospitalId() === hospital.id) {
      this.expandedHospitalId.set(null);
      return;
    }

    this.expandedHospitalId.set(hospital.id);
    this.loadingRequisitesId.set(hospital.id);
    this.error.set(null);
    this.requisitesForm = { ...EMPTY_HOSPITAL_REQUISITES };

    this.requisitesApi.get(hospital.id).subscribe({
      next: (requisites) => {
        if (requisites) {
          this.requisitesForm = {
            legal_address: requisites.legal_address,
            postal_address: requisites.postal_address,
            phone: requisites.phone,
            inn: requisites.inn,
            kpp: requisites.kpp,
            ogrn: requisites.ogrn,
            bank_account: requisites.bank_account,
            bik: requisites.bik,
            bank_name: requisites.bank_name,
            ktm: requisites.ktm,
            okpo: requisites.okpo,
            email: requisites.email,
          };
        }
        this.loadingRequisitesId.set(null);
      },
      error: (err) => {
        this.error.set(err.error?.error ?? 'Не удалось загрузить реквизиты');
        this.loadingRequisitesId.set(null);
        this.expandedHospitalId.set(null);
      },
    });
  }

  protected cancelRequisites(): void {
    this.expandedHospitalId.set(null);
  }

  protected saveRequisites(hospital: Hospital): void {
    this.savingRequisitesId.set(hospital.id);
    this.error.set(null);
    this.success.set(null);

    const body: HospitalRequisitesUpsertRequest = {
      legal_address: this.normalizeField(this.requisitesForm.legal_address),
      postal_address: this.normalizeField(this.requisitesForm.postal_address),
      phone: this.normalizeField(this.requisitesForm.phone),
      inn: this.normalizeField(this.requisitesForm.inn),
      kpp: this.normalizeField(this.requisitesForm.kpp),
      ogrn: this.normalizeField(this.requisitesForm.ogrn),
      bank_account: this.normalizeField(this.requisitesForm.bank_account),
      bik: this.normalizeField(this.requisitesForm.bik),
      bank_name: this.normalizeField(this.requisitesForm.bank_name),
      ktm: this.normalizeField(this.requisitesForm.ktm),
      okpo: this.normalizeField(this.requisitesForm.okpo),
      email: this.normalizeField(this.requisitesForm.email),
    };

    this.requisitesApi.upsert(hospital.id, body).subscribe({
      next: () => {
        this.success.set(`Реквизиты «${hospital.name}» сохранены`);
        this.savingRequisitesId.set(null);
      },
      error: (err) => {
        this.error.set(err.error?.error ?? 'Не удалось сохранить реквизиты');
        this.savingRequisitesId.set(null);
      },
    });
  }

  protected isExpanded(hospitalId: number): boolean {
    return this.expandedHospitalId() === hospitalId;
  }

  protected displayAddress(value: string | null): string {
    return value?.trim() ? value : '—';
  }

  private normalizeField(value: string | null): string | null {
    const trimmed = value?.trim() ?? '';
    return trimmed === '' ? null : trimmed;
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
