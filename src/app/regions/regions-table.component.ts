import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input
} from '@angular/core';
import { TuiButton } from '@taiga-ui/core';
import { TuiAccordion } from '@taiga-ui/kit';
import { TuiTable } from '@taiga-ui/addon-table';

import type { GeoRegion } from '../core/models/geo.model';
import { RegionsApiService } from '../core/services/regions-api.service';
import { RegionsExportComponent } from './regions-export.component';
import { delay } from 'rxjs';

@Component({
  selector: 'app-regions-table',
  imports: [RegionsExportComponent, TuiButton, TuiAccordion, TuiTable],
  templateUrl: './regions-table.component.html',
  styleUrl: './regions-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegionsTableComponent {
  private readonly api = inject(RegionsApiService);

  readonly regions = input<GeoRegion[]>([]);
  readonly total = input<number>(0);

  constructor() {
  }

  protected activeLabel(active: boolean): string {
    return active ? 'Да' : 'Нет';
  }
}
