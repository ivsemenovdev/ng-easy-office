import {
    ChangeDetectionStrategy,
    Component,
    inject,
    signal,
} from '@angular/core';
import { TuiLoader } from '@taiga-ui/core';
import { TuiAccordion } from '@taiga-ui/kit';
import { TuiTable } from '@taiga-ui/addon-table';

import type { GeoRegion } from '../core/models/geo.model';
import { RegionsApiService } from '../core/services/regions-api.service';
import { delay } from 'rxjs';
import { RegionsTableComponent } from './regions-table.component';
import { HospitalsComponent } from '../hospitals/hospitals.component';

@Component({
    selector: 'app-regions-settings',
    imports: [TuiLoader, TuiAccordion, TuiTable, RegionsTableComponent, HospitalsComponent],
    templateUrl: './regions-settings.component.html',
    styleUrl: './regions-settings.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegionsSettingsComponent {
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

        this.api.listRussia().pipe(delay(1000)).subscribe({
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
}
