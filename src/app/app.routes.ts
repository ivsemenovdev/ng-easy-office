import { Routes } from '@angular/router';

import { DiagnosticImportComponent } from './diagnostic/diagnostic-import.component';
import { HospitalActsComponent } from './diagnostic/hospital-acts.component';
import { HospitalSettingsComponent } from './hospital-settings/hospital-settings.component';
import { RegionsSettingsComponent } from './regions/regions-settings.component';

/** Маршруты SPA: регионы (главная), импорт и просмотр актов диагностики. */
export const routes: Routes = [
  { path: '', component: RegionsSettingsComponent },
  { path: 'diagnostic-import', component: DiagnosticImportComponent },
  { path: 'hospital-acts', component: HospitalActsComponent },
  { path: 'hospital-settings', component: HospitalSettingsComponent },
];
