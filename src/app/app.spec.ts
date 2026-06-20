import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTaiga } from '@taiga-ui/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';

import { App } from './app';
import { routes } from './app.routes';
import { RegionsApiService } from './core/services/regions-api.service';

function mockMatchMedia(): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}

describe('App', () => {
  beforeEach(async () => {
    mockMatchMedia();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        provideTaiga(),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: RegionsApiService,
          useValue: {
            listRussia: () =>
              of({
                items: [],
                total: 0,
                limit: 500,
                offset: 0,
              }),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render regions table heading', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/');
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Субъекты Российской Федерации');
  });
});
