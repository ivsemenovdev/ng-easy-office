import { Routes } from '@angular/router';

import { DiagnosticImportComponent } from './diagnostic/diagnostic-import.component';
import { HospitalActsComponent } from './diagnostic/hospital-acts.component';
import { RegionsSettingsComponent } from './regions/regions-settings.component';

export const routes: Routes = [
  { path: '', component: RegionsSettingsComponent },
  { path: 'diagnostic-import', component: DiagnosticImportComponent },
  { path: 'hospital-acts', component: HospitalActsComponent },
];
