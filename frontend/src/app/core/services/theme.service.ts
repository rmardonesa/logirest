import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

export type Tema = 'light' | 'dark';

const CLAVE_ALMACENAMIENTO = 'logirest-tema';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly tema = signal<Tema>(this.temaInicial());

  constructor() {
    effect(() => {
      const tema = this.tema();

      this.document.documentElement.setAttribute('data-theme', tema);
      localStorage.setItem(CLAVE_ALMACENAMIENTO, tema);
    });
  }

  alternar(): void {
    this.tema.update((actual) => (actual === 'light' ? 'dark' : 'light'));
  }

  private temaInicial(): Tema {
    const almacenado = localStorage.getItem(CLAVE_ALMACENAMIENTO);

    if (almacenado === 'light' || almacenado === 'dark') {
      return almacenado;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
}
