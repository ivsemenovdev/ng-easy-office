import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { TuiButton, TuiLoader, TuiTitle } from '@taiga-ui/core';

import type { GeoRegion } from '../core/models/geo.model';
import { RegionsApiService } from '../core/services/regions-api.service';

@Component({
  selector: 'app-regions-table',
  imports: [TuiButton, TuiLoader, TuiTitle],
  templateUrl: './regions-table.component.html',
  styleUrl: './regions-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegionsTableComponent {
  private readonly api = inject(RegionsApiService);

  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly regions = signal<GeoRegion[]>([]);
  protected readonly total = signal(0);

  constructor() {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);

    this.api.listRussia().subscribe({
      next: (res) => {
        this.regions.set(res.items);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(
          'Не удалось загрузить данные. Запустите backend: cd backend && npm run dev',
        );
        this.loading.set(false);
      },
    });
  }

  protected activeLabel(active: boolean): string {
    return active ? 'Да' : 'Нет';
  }
}
