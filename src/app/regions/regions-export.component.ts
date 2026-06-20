import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiLoader, TuiTitle } from '@taiga-ui/core';

import { RegionsApiService } from '../core/services/regions-api.service';

@Component({
  selector: 'app-regions-export',
  imports: [RouterLink, TuiButton, TuiLoader, TuiTitle],
  templateUrl: './regions-export.component.html',
  styleUrl: './regions-export.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegionsExportComponent {
  private readonly api = inject(RegionsApiService);

  protected readonly downloading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected download(): void {
    this.downloading.set(true);
    this.error.set(null);

    this.api.downloadDocx().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `regions-ru-${new Date().toISOString().slice(0, 10)}.docx`;
        anchor.click();
        URL.revokeObjectURL(url);
        this.downloading.set(false);
      },
      error: () => {
        this.error.set(
          'Не удалось сформировать документ. Запустите backend: cd backend && npm run dev',
        );
        this.downloading.set(false);
      },
    });
  }
}
