import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResultadoLookup } from '../models/cliente-lookup.model';

@Injectable({ providedIn: 'root' })
export class ClienteLookupService {
  private readonly http = inject(HttpClient);

  consultar(query: string): Observable<ResultadoLookup> {
    return this.http.get<ResultadoLookup>(
      `${environment.apiUrl}/cliente-lookup`,
      { params: new HttpParams().set('query', query.trim()) },
    );
  }
}
