import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SolicitudesService } from '../../../core/services/solicitudes.service';
import { Cliente } from '../../../core/models/cliente.model';
import {
  ESTADOS_SOLICITUD,
  EstadoSolicitud,
  TIPOS_SOLICITUD,
  TipoSolicitud,
} from '../../../core/models/solicitud.model';
import { AutocompleteCliente } from '../../../shared/components/autocomplete-cliente/autocomplete-cliente';

const LARGO_MINIMO_DESCRIPCION = 10;

const LARGO_MAXIMO_DESCRIPCION = 1000;

@Component({
  selector: 'app-formulario-solicitud',
  imports: [ReactiveFormsModule, RouterLink, AutocompleteCliente],
  templateUrl: './formulario-solicitud.html',
  styleUrl: './formulario-solicitud.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormularioSolicitud {
  private readonly formBuilder = inject(FormBuilder);
  private readonly solicitudesService = inject(SolicitudesService);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly tipos = TIPOS_SOLICITUD;
  protected readonly estados = ESTADOS_SOLICITUD;

  protected readonly idSolicitud = signal<number | null>(null);
  protected readonly modoEdicion = computed(() => this.idSolicitud() !== null);
  protected readonly clienteBloqueado = signal<Cliente | null>(null);
  protected readonly cargando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');

  protected readonly formulario = this.formBuilder.nonNullable.group({
    clienteId: [0, [Validators.required, Validators.min(1)]],
    fecha: ['', Validators.required],
    tipoSolicitud: ['' as TipoSolicitud | '', Validators.required],
    descripcion: [
      '',
      [
        Validators.required,
        Validators.minLength(LARGO_MINIMO_DESCRIPCION),
        Validators.maxLength(LARGO_MAXIMO_DESCRIPCION),
      ],
    ],
    estado: ['Pendiente' as EstadoSolicitud, Validators.required],
  });

  private readonly estadoFormulario = toSignal(this.formulario.statusChanges, {
    initialValue: this.formulario.status,
  });

  protected readonly formularioValido = computed(
    () => this.estadoFormulario() === 'VALID',
  );

  constructor() {
    const identificador = this.ruta.snapshot.paramMap.get('id');

    if (identificador) {
      this.idSolicitud.set(Number(identificador));
      this.formulario.controls.clienteId.disable();
      this.cargarSolicitud(Number(identificador));
    } else {
      this.formulario.controls.fecha.setValue(this.fechaDeHoy());
    }
  }

  protected onClienteSeleccionado(cliente: Cliente | null): void {
    if (cliente) {
      this.formulario.controls.clienteId.setValue(cliente.id);
    } else {
      this.formulario.controls.clienteId.setValue(0);
    }
  }

  protected campoInvalido(nombre: keyof typeof this.formulario.controls): boolean {
    const control = this.formulario.controls[nombre];

    return control.invalid && (control.dirty || control.touched);
  }

  protected guardar(): void {
    if (this.formulario.invalid || this.guardando()) {
      return;
    }

    this.error.set('');
    this.guardando.set(true);

    const valores = this.formulario.getRawValue();
    const identificador = this.idSolicitud();

    const operacion = identificador
      ? this.solicitudesService.actualizar(identificador, {
          fecha: valores.fecha,
          tipoSolicitud: valores.tipoSolicitud as TipoSolicitud,
          descripcion: valores.descripcion,
          estado: valores.estado,
        })
      : this.solicitudesService.crear({
          clienteId: valores.clienteId,
          fecha: valores.fecha,
          tipoSolicitud: valores.tipoSolicitud as TipoSolicitud,
          descripcion: valores.descripcion,
        });

    operacion.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        void this.router.navigate(['/solicitudes']);
      },
      error: () => {
        this.error.set(
          'No se pudo guardar la solicitud. Revisa los datos e intenta de nuevo.',
        );
        this.guardando.set(false);
      },
    });
  }

  private cargarSolicitud(id: number): void {
    this.cargando.set(true);

    this.solicitudesService
      .obtenerPorId(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (solicitud) => {
          this.clienteBloqueado.set(solicitud.cliente);
          this.formulario.patchValue({
            clienteId: solicitud.clienteId,
            fecha: solicitud.fecha,
            tipoSolicitud: solicitud.tipoSolicitud,
            descripcion: solicitud.descripcion,
            estado: solicitud.estado,
          });
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No se encontro la solicitud solicitada.');
          this.cargando.set(false);
        },
      });
  }

  private fechaDeHoy(): string {
    return new Date().toISOString().slice(0, 10);
  }
}
