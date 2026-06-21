import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TuiAccordion } from '@taiga-ui/kit';
import { TuiTable } from '@taiga-ui/addon-table';

import type { GeoRegion } from '../core/models/geo.model';
import { RegionsExportComponent } from './regions-export.component';

/** Таблица субъектов РФ с экспортом в Word (данные приходят от родителя). */
@Component({
  selector: 'app-regions-table',
  imports: [RegionsExportComponent, TuiAccordion, TuiTable],
  templateUrl: './regions-table.component.html',
  styleUrl: './regions-table.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegionsTableComponent {
  readonly regions = input<GeoRegion[]>([]);
  readonly total = input<number>(0);

  protected activeLabel(active: boolean): string {
    return active ? 'Да' : 'Нет';
  }
}
