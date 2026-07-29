import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ClientesService } from '../../../core/services/clientes.service';
import { Cliente } from '../../../core/models/cliente.model';

const MILISEGUNDOS_DEBOUNCE = 250;

@Component({
  selector: 'app-autocomplete-cliente',
  templateUrl: './autocomplete-cliente.html',
  styleUrl: './autocomplete-cliente.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AutocompleteCliente {
  private readonly clientesService = inject(ClientesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly terminoTecleado = new Subject<string>();

  protected readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');

  protected readonly abierto = signal(false);
  protected readonly cargando = signal(false);
  protected readonly resultados = signal<Cliente[]>([]);
  protected readonly seleccionado = signal<Cliente | null>(null);

  readonly clienteSeleccionado = output<Cliente | null>();

  constructor() {
    this.terminoTecleado
      .pipe(
        debounceTime(MILISEGUNDOS_DEBOUNCE),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((termino) => {
        if (termino.length < 2) {
          this.resultados.set([]);
          this.abierto.set(false);
          return;
        }

        this.cargando.set(true);

        this.clientesService.listarTodos(termino)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (respuesta) => {
              this.resultados.set(respuesta.data);
              this.abierto.set(respuesta.data.length > 0);
              this.cargando.set(false);
            },
            error: () => {
              this.cargando.set(false);
            },
          });
      });
  }

  protected buscar(valor: string): void {
    if (this.seleccionado()) {
      this.seleccionado.set(null);
      this.clienteSeleccionado.emit(null);
    }

    this.terminoTecleado.next(valor);
  }

  protected seleccionar(cliente: Cliente): void {
    this.seleccionado.set(cliente);
    this.abierto.set(false);
    this.clienteSeleccionado.emit(cliente);
  }

  protected cerrarLista(): void {
    setTimeout(() => this.abierto.set(false), 200);
  }

  protected limpiar(): void {
    this.seleccionado.set(null);
    this.abierto.set(false);
    this.resultados.set([]);
    this.input().nativeElement.value = '';
    this.input().nativeElement.focus();
    this.clienteSeleccionado.emit(null);
  }
}
