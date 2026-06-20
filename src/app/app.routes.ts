import { Routes } from '@angular/router';

import { DiagnosticImportComponent } from './diagnostic/diagnostic-import.component';
import { HospitalActsComponent } from './diagnostic/hospital-acts.component';
import { RegionsTableComponent } from './regions/regions-table.component';

export const routes: Routes = [
  { path: '', component: RegionsTableComponent },
  { path: 'diagnostic-import', component: DiagnosticImportComponent },
  { path: 'hospital-acts', component: HospitalActsComponent },
];
