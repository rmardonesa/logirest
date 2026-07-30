import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ClientesService } from '../../core/services/clientes.service';
import { Cliente, TipoCliente } from '../../core/models/cliente.model';
import { RespuestaPaginada } from '../../core/models/paginacion.model';
import { Paginador } from '../../shared/components/paginador/paginador';
import { rutValido } from '../../core/validators/rut';
import { canonizar, separar, formatear, contarCaracteresCanonicos } from '../../core/utils/rut';

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

  protected readonly mostrandoCrear = signal(false);
  protected readonly guardandoCreacion = signal(false);
  protected readonly errorCreacion = signal('');

  protected readonly formularioEdicion = this.formBuilder.nonNullable.group({
    rut: ['', rutValido()],
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    tipo: ['persona natural' as TipoCliente],
  });

  protected readonly formularioCreacion = this.formBuilder.nonNullable.group({
    rut: ['', rutValido()],
    nombre: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: [''],
    tipo: ['persona natural' as TipoCliente],
  });

  protected readonly rutCreacionTocado = signal(false);
  protected readonly rutEdicionTocado = signal(false);
  private readonly revisionRut = signal(0);

  private readonly estadoCreacion = toSignal(
    this.formularioCreacion.statusChanges,
    { initialValue: this.formularioCreacion.status },
  );

  private readonly estadoEdicion = toSignal(
    this.formularioEdicion.statusChanges,
    { initialValue: this.formularioEdicion.status },
  );

  protected readonly creacionValida = computed(() => {
    this.estadoCreacion();
    this.revisionRut();

    return this.formularioCreacion.valid;
  });

  protected readonly edicionValida = computed(() => {
    this.estadoEdicion();
    this.revisionRut();

    return this.formularioEdicion.valid;
  });

  protected readonly errorRutCreacion = computed(() => {
    this.estadoCreacion();
    this.revisionRut();

    return this.rutCreacionTocado()
      ? this.mensajeRut(this.formularioCreacion.controls.rut)
      : '';
  });

  protected readonly errorRutEdicion = computed(() => {
    this.estadoEdicion();
    this.revisionRut();

    return this.rutEdicionTocado()
      ? this.mensajeRut(this.formularioEdicion.controls.rut)
      : '';
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
    this.rutEdicionTocado.set(false);
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
    this.rutEdicionTocado.set(false);
  }

  protected guardarEdicion(): void {
    if (this.formularioEdicion.invalid) {
      this.marcarRutTocado('edicion');

      return;
    }

    if (this.guardandoEdicion()) {
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

  protected campoInvalido(
    nombre: keyof typeof this.formularioEdicion.controls,
  ): boolean {
    const control = this.formularioEdicion.controls[nombre];

    return control.invalid && (control.dirty || control.touched);
  }

  protected campoCreacionInvalido(
    nombre: keyof typeof this.formularioCreacion.controls,
  ): boolean {
    const control = this.formularioCreacion.controls[nombre];

    return control.invalid && (control.dirty || control.touched);
  }

  protected mostrarCrear(): void {
    this.editandoId.set(null);
    this.mostrandoCrear.set(true);
    this.errorCreacion.set('');
    this.rutCreacionTocado.set(false);
  }

  protected cancelarCrear(): void {
    this.mostrandoCrear.set(false);
    this.rutCreacionTocado.set(false);
    this.formularioCreacion.reset({
      rut: '',
      nombre: '',
      email: '',
      telefono: '',
      tipo: 'persona natural',
    });
    this.errorCreacion.set('');
  }

  protected guardarCreacion(): void {
    if (this.formularioCreacion.invalid) {
      this.marcarRutTocado('creacion');

      return;
    }

    if (this.guardandoCreacion()) {
      return;
    }

    this.errorCreacion.set('');
    this.guardandoCreacion.set(true);

    const datos = this.formularioCreacion.getRawValue();

    this.clientesService
      .crear({
        rut: datos.rut || undefined,
        nombre: datos.nombre,
        email: datos.email,
        telefono: datos.telefono || undefined,
        tipo: datos.tipo,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.guardandoCreacion.set(false);
          this.cancelarCrear();
          this.refrescar();
        },
        error: (err) => {
          this.errorCreacion.set(
            err.error?.message ?? 'No se pudo crear el prospecto.',
          );
          this.guardandoCreacion.set(false);
        },
      });
  }

  protected onRutInput(event: Event, control: 'creacion' | 'edicion'): void {
    const input = event.target as HTMLInputElement;
    const posInicial = input.selectionStart ?? input.value.length;
    const textoAntesCursor = input.value.slice(0, posInicial);
    const canonicosAntes = contarCaracteresCanonicos(textoAntesCursor);

    const canonico = canonizar(input.value);
    const { cuerpo, dv } = separar(canonico);
    const limitado = cuerpo.slice(0, 8) + dv;

    const formateado = formatear(limitado);

    const grupo = control === 'creacion'
      ? this.formularioCreacion
      : this.formularioEdicion;

    grupo.controls.rut.setValue(formateado, { emitEvent: false });
    input.value = formateado;

    let posicion = 0;
    let canonicosVistos = 0;

    while (canonicosVistos < canonicosAntes && posicion < formateado.length) {
      if (/[0-9K]/.test(formateado[posicion].toUpperCase())) {
        canonicosVistos++;
      }
      posicion++;
    }

    input.setSelectionRange(posicion, posicion);

    this.revisionRut.update((valor) => valor + 1);
  }

  protected marcarRutTocado(control: 'creacion' | 'edicion'): void {
    if (control === 'creacion') {
      this.rutCreacionTocado.set(true);
    } else {
      this.rutEdicionTocado.set(true);
    }

    this.revisionRut.update((valor) => valor + 1);
  }

  private mensajeRut(control: AbstractControl): string {
    return control.errors?.['rutIncompleto']
      ? 'RUT incompleto, faltan digitos antes del verificador'
      : '';
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
