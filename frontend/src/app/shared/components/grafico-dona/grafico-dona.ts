import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ConteoEtiquetado } from '../../../core/models/conteo.model';

const RADIO = 60;

const GROSOR = 22;

const SEPARACION = 2;

const CIRCUNFERENCIA = 2 * Math.PI * RADIO;

interface Segmento {
  etiqueta: string;
  cantidad: number;
  porcentaje: number;
  serie: number;
  largo: number;
  resto: number;
  desplazamiento: number;
}

@Component({
  selector: 'app-grafico-dona',
  templateUrl: './grafico-dona.html',
  styleUrl: './grafico-dona.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraficoDona {
  readonly datos = input<ConteoEtiquetado[] | undefined>([]);

  protected readonly radio = RADIO;
  protected readonly grosor = GROSOR;

  private readonly items = computed(() => this.datos() ?? []);

  protected readonly total = computed(() =>
    this.items().reduce((suma, dato) => suma + dato.cantidad, 0),
  );

  protected readonly segmentos = computed<Segmento[]>(() => {
    const total = this.total();

    if (total === 0) {
      return [];
    }

    let acumulado = 0;

    return this.items().map((dato, indice) => {
      const fraccion = dato.cantidad / total;
      const largoBruto = fraccion * CIRCUNFERENCIA;
      const largo = Math.max(largoBruto - SEPARACION, 0);
      const desplazamiento = acumulado;

      acumulado += largoBruto;

      return {
        etiqueta: dato.etiqueta,
        cantidad: dato.cantidad,
        porcentaje: Math.round(fraccion * 100),
        serie: (indice % 6) + 1,
        largo,
        resto: CIRCUNFERENCIA - largo,
        desplazamiento,
      };
    });
  });
}
