import { DatePipe } from '@angular/common';
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
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { SolicitudesService } from '../../../core/services/solicitudes.service';
import {
  ESTADOS_SOLICITUD,
  EstadoSolicitud,
  OrdenFecha,
  Solicitud,
} from '../../../core/models/solicitud.model';
import { RespuestaPaginada } from '../../../core/models/paginacion.model';
import { EstadoBadge } from '../../../shared/components/estado-badge/estado-badge';
import { Paginador } from '../../../shared/components/paginador/paginador';

const MILISEGUNDOS_DEBOUNCE = 300;

@Component({
  selector: 'app-listado-solicitudes',
  imports: [DatePipe, EstadoBadge, Paginador],
  templateUrl: './listado-solicitudes.html',
  styleUrl: './listado-solicitudes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListadoSolicitudes {
  private readonly solicitudesService = inject(SolicitudesService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly terminoTecleado = new Subject<string>();

  protected readonly estados = ESTADOS_SOLICITUD;

  protected readonly search = signal('');
  protected readonly estado = signal<EstadoSolicitud | ''>('');
  protected readonly order = signal<OrdenFecha>('DESC');
  protected readonly page = signal(1);
  protected readonly limit = signal(10);

  protected readonly resultado = signal<RespuestaPaginada<Solicitud> | null>(
    null,
  );
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly solicitudes = computed(
    () => this.resultado()?.data ?? [],
  );
  protected readonly meta = computed(() => this.resultado()?.meta ?? null);
  protected readonly sinResultados = computed(
    () => !this.cargando() && !this.error() && this.solicitudes().length === 0,
  );

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
      this.cargar({
        search: this.search(),
        estado: this.estado(),
        order: this.order(),
        page: this.page(),
        limit: this.limit(),
      });
    });
  }

  protected buscar(valor: string): void {
    this.terminoTecleado.next(valor);
  }

  protected filtrarPorEstado(valor: string): void {
    this.estado.set(valor as EstadoSolicitud | '');
    this.page.set(1);
  }

  protected cambiarOrden(valor: string): void {
    this.order.set(valor as OrdenFecha);
    this.page.set(1);
  }

  protected cambiarPagina(pagina: number): void {
    this.page.set(pagina);
  }

  private cargar(filtros: {
    search: string;
    estado: EstadoSolicitud | '';
    order: OrdenFecha;
    page: number;
    limit: number;
  }): void {
    this.cargando.set(true);
    this.error.set(null);

    this.solicitudesService
      .listar(filtros)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (respuesta) => {
          this.resultado.set(respuesta);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set(
            'No se pudieron cargar las solicitudes. Verifica que el backend este disponible.',
          );
          this.cargando.set(false);
        },
      });
  }
}
