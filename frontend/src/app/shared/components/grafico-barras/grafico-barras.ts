import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ConteoEtiquetado } from '../../../core/models/conteo.model';

interface Barra {
  etiqueta: string;
  cantidad: number;
  ancho: number;
}

@Component({
  selector: 'app-grafico-barras',
  templateUrl: './grafico-barras.html',
  styleUrl: './grafico-barras.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraficoBarras {
  readonly datos = input<ConteoEtiquetado[] | undefined>([]);

  protected readonly barras = computed<Barra[]>(() => {
    const items = this.datos() ?? [];
    const maximo = Math.max(...items.map((dato) => dato.cantidad), 1);

    return items.map((dato) => ({
      etiqueta: dato.etiqueta,
      cantidad: dato.cantidad,
      ancho: (dato.cantidad / maximo) * 100,
    }));
  });
}
