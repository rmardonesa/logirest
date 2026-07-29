import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FiltrosSolicitudes, Solicitud } from '../models/solicitud.model';
import { RespuestaPaginada } from '../models/paginacion.model';

@Injectable({ providedIn: 'root' })
export class SolicitudesService {
  private readonly http = inject(HttpClient);
  private readonly recurso = `${environment.apiUrl}/solicitudes`;

  listar(filtros: FiltrosSolicitudes): Observable<RespuestaPaginada<Solicitud>> {
    let params = new HttpParams()
      .set('order', filtros.order)
      .set('page', filtros.page)
      .set('limit', filtros.limit);

    if (filtros.search.trim()) {
      params = params.set('search', filtros.search.trim());
    }

    if (filtros.estado) {
      params = params.set('estado', filtros.estado);
    }

    return this.http.get<RespuestaPaginada<Solicitud>>(this.recurso, { params });
  }

  obtenerPorId(id: number): Observable<Solicitud> {
    return this.http.get<Solicitud>(`${this.recurso}/${id}`);
  }
}
