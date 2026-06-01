import { TuiRoot } from '@taiga-ui/core';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { RegionsTableComponent } from './regions/regions-table.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TuiRoot, RegionsTableComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
