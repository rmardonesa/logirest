import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type VarianteTarjeta =
  | 'neutra'
  | 'pendiente'
  | 'en-proceso'
  | 'finalizada'
  | 'rechazada';

@Component({
  selector: 'app-tarjeta-estadistica',
  templateUrl: './tarjeta-estadistica.html',
  styleUrl: './tarjeta-estadistica.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarjetaEstadistica {
  readonly etiqueta = input.required<string>();

  readonly valor = input.required<number>();

  readonly variante = input<VarianteTarjeta>('neutra');
}
