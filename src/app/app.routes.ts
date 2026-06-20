import { Routes } from '@angular/router';

import { DiagnosticImportComponent } from './diagnostic/diagnostic-import.component';
import { HospitalActsComponent } from './diagnostic/hospital-acts.component';
import { HospitalsComponent } from './hospitals/hospitals.component';
import { RegionsExportComponent } from './regions/regions-export.component';
import { RegionsTableComponent } from './regions/regions-table.component';

export const routes: Routes = [
  { path: '', component: RegionsTableComponent },
  { path: 'regions-export', component: RegionsExportComponent },
  { path: 'hospitals', component: HospitalsComponent },
  { path: 'diagnostic-import', component: DiagnosticImportComponent },
  { path: 'hospital-acts', component: HospitalActsComponent },
];
