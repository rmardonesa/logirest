import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cliente, TipoCliente } from '../models/cliente.model';
import { RespuestaPaginada } from '../models/paginacion.model';

const LIMITE_PAGINA = 20;

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private readonly http = inject(HttpClient);
  private readonly recurso = `${environment.apiUrl}/clientes`;

  listar(filtros: {
    search?: string;
    tipo?: TipoCliente | '';
    page: number;
    limit: number;
  }): Observable<RespuestaPaginada<Cliente>> {
    let params = new HttpParams()
      .set('page', filtros.page)
      .set('limit', filtros.limit);

    if (filtros.search?.trim()) {
      params = params.set('search', filtros.search.trim());
    }

    if (filtros.tipo) {
      params = params.set('tipo', filtros.tipo);
    }

    return this.http.get<RespuestaPaginada<Cliente>>(this.recurso, { params });
  }

  listarTodos(search = ''): Observable<RespuestaPaginada<Cliente>> {
    return this.listar({ search, page: 1, limit: 100 });
  }

  obtenerPorId(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.recurso}/${id}`);
  }

  crear(datos: {
    rut?: string;
    nombre: string;
    email: string;
    telefono?: string;
    tipo?: TipoCliente;
  }): Observable<Cliente> {
    return this.http.post<Cliente>(this.recurso, datos);
  }

  actualizar(
    id: number,
    datos: {
      rut?: string;
      nombre: string;
      email: string;
      telefono?: string;
      tipo?: TipoCliente;
    },
  ): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.recurso}/${id}`, datos);
  }
}
