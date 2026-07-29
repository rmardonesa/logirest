import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly formulario = this.formBuilder.nonNullable.group({
    usuario: ['', Validators.required],
    password: ['', Validators.required],
  });

  private readonly estadoFormulario = toSignal(this.formulario.statusChanges, {
    initialValue: this.formulario.status,
  });

  protected readonly formularioValido = computed(
    () => this.estadoFormulario() === 'VALID',
  );

  protected readonly error = signal('');
  protected readonly enviando = signal(false);

  protected async enviar(): Promise<void> {
    if (this.formulario.invalid || this.enviando()) {
      return;
    }

    this.error.set('');
    this.enviando.set(true);

    const { usuario, password } = this.formulario.getRawValue();

    try {
      await this.authService.iniciarSesion(usuario, password);
      await this.router.navigate(['/resumen']);
    } catch {
      this.error.set('Usuario o contrasena incorrectos');
    } finally {
      this.enviando.set(false);
    }
  }
}
