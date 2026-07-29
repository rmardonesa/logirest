import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ClientesService } from '../../core/services/clientes.service';
import { Cliente, TipoCliente } from '../../core/models/cliente.model';
import { RespuestaPaginada } from '../../core/models/paginacion.model';
import { Paginador } from '../../shared/components/paginador/paginador';

const MILISEGUNDOS_DEBOUNCE = 300;

@Component({
  selector: 'app-prospectos',
  imports: [ReactiveFormsModule, Paginador],
  templateUrl: './prospectos.html',
  styleUrl: './prospectos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Prospectos {
  private readonly clientesService = inject(ClientesService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly terminoTecleado = new Subject<string>();
  protected readonly search = signal('');
  protected readonly tipo = signal<TipoCliente | ''>('');
  protected readonly page = signal(1);
  protected readonly limit = signal(10);
  protected readonly recarga = signal(0);

  protected readonly resultado = signal<RespuestaPaginada<Cliente> | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly clientes = computed(() => this.resultado()?.data ?? []);
  protected readonly meta = computed(() => this.resultado()?.meta ?? null);
  protected readonly sinResultados = computed(
    () => !this.cargando() && !this.error() && this.clientes().length === 0,
  );

  protected readonly editandoId = signal<number | null>(null);
  protected readonly guardandoEdicion = signal(false);
  protected readonly errorEdicion = signal('');

  protected readonly formularioEdicion = this.formBuilder.nonNullable.group({
    rut: [''],
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    tipo: ['persona natural' as TipoCliente],
  });

  constructor() {
    this.terminoTecleado
      .pipe(
        debounceTime(MILISEGUNDOS_DEBOUNCE),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((termino) => {
        this.search.set(termino);
        this.page.set(1);
      });

    effect(() => {
      this.search();
      this.tipo();
      this.page();
      this.limit();
      this.recarga();

      this.cargarListado();
    });
  }

  protected buscar(valor: string): void {
    this.terminoTecleado.next(valor);
  }

  protected filtrarPorTipo(valor: string): void {
    this.tipo.set(valor as TipoCliente | '');
    this.page.set(1);
  }

  protected cambiarPagina(pagina: number): void {
    this.page.set(pagina);
  }

  protected editar(cliente: Cliente): void {
    this.editandoId.set(cliente.id);
    this.errorEdicion.set('');
    this.formularioEdicion.setValue({
      rut: cliente.rut ?? '',
      nombre: cliente.nombre,
      email: cliente.email,
      telefono: cliente.telefono ?? '',
      tipo: cliente.tipo,
    });
  }

  protected cancelarEdicion(): void {
    this.editandoId.set(null);
    this.errorEdicion.set('');
  }

  protected guardarEdicion(): void {
    if (this.formularioEdicion.invalid || this.guardandoEdicion()) {
      return;
    }

    const id = this.editandoId();

    if (id === null) {
      return;
    }

    this.errorEdicion.set('');
    this.guardandoEdicion.set(true);

    const datos = this.formularioEdicion.getRawValue();

    this.clientesService.actualizar(id, {
      rut: datos.rut || undefined,
      nombre: datos.nombre,
      email: datos.email,
      telefono: datos.telefono || undefined,
      tipo: datos.tipo,
    }).pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.guardandoEdicion.set(false);
          this.editandoId.set(null);
          this.refrescar();
        },
        error: (err) => {
          this.errorEdicion.set(
            err.error?.message ?? 'No se pudo actualizar el cliente.',
          );
          this.guardandoEdicion.set(false);
        },
      });
  }

  protected campoInvalido(nombre: keyof typeof this.formularioEdicion.controls): boolean {
    const control = this.formularioEdicion.controls[nombre];

    return control.invalid && (control.dirty || control.touched);
  }

  private refrescar(): void {
    this.recarga.update((valor) => valor + 1);
  }

  private cargarListado(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.clientesService
      .listar({
        search: this.search(),
        tipo: this.tipo(),
        page: this.page(),
        limit: this.limit(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (respuesta) => {
          this.resultado.set(respuesta);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los prospectos.');
          this.cargando.set(false);
        },
      });
  }
}
