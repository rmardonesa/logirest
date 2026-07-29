import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { MetaPaginacion } from '../../../core/models/paginacion.model';

@Component({
  selector: 'app-paginador',
  templateUrl: './paginador.html',
  styleUrl: './paginador.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Paginador {
  readonly meta = input.required<MetaPaginacion>();

  readonly paginaSeleccionada = output<number>();

  protected readonly hayAnterior = computed(() => this.meta().page > 1);

  protected readonly haySiguiente = computed(
    () => this.meta().page < this.meta().totalPages,
  );

  protected readonly desde = computed(() => {
    const { total, page, limit } = this.meta();

    return total === 0 ? 0 : (page - 1) * limit + 1;
  });

  protected readonly hasta = computed(() => {
    const { total, page, limit } = this.meta();

    return Math.min(page * limit, total);
  });

  protected irA(pagina: number): void {
    this.paginaSeleccionada.emit(pagina);
  }
}
