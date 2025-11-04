<template>
    <section class="login-page">
      <!-- Botón Instalar (solo desktop) -->
      <InstallButton class="install desktop-only" />
  
      <!-- Logo fuera del card -->
      <img
        src="/logos/OFICIALwhite.png"
        alt="Nura"
        class="brand"
        onerror="this.src='/icons/icon-192.png'"
      />
  
      <!-- Card -->
      <div class="card">
        <!-- OAuth -->
        <button class="btn btn-oauth facebook with-icon w-field" @click="facebook">
          <img src="/logos/facebook.png" alt="" />
          Entrar con Facebook
        </button>
  
        <button class="btn btn-oauth google with-icon w-field" @click="google">
          <img src="/logos/google.jpg" alt="" />
          Entrar con Google
        </button>
  
        <div class="divider w-field">o ingresá con</div>
  
        <!-- Email / Password -->
        <form class="form" @submit.prevent="emailLogin">
          <input
            class="w-field"
            v-model="email"
            type="email"
            placeholder="Usuario"
            required
            autocomplete="email"
          />
          <input
            class="w-field"
            v-model="password"
            type="password"
            placeholder="Contraseña"
            required
            autocomplete="current-password"
          />
  
          <a class="forgot" href="" @click.prevent="forgot">
            ¿Olvidaste tu contraseña?
          </a>
  
          <!-- Acciones -->
          <button type="submit" class="btn btn-primary w-actions">Entrar</button>
          <button type="button" class="btn btn-primary w-actions" @click="register">
            Registrarse
          </button>
        </form>
      </div>
    </section>
  </template>
  
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import InstallButton from '@/components/InstallButton.vue'

const email = ref('')
const password = ref('')

const auth = useAuthStore()
const router = useRouter()

async function emailLogin() {
  await auth.signInEmail(email.value, password.value)
  router.replace('/onboarding')
}

async function google() {
  await auth.signInWithProvider('google')
}

async function facebook() {
  if (typeof (auth as any).signInWithProvider === 'function') {
    await auth.signInWithProvider('facebook')
  } else {
    alert('Activamos Facebook cuando conectemos el proveedor en Supabase.')
  }
}

// 🔹 ahora el botón de “Registrarse” solo redirige a la pantalla de registro
function register() {
  router.push('/register')
}

// Recuperar contraseña (lo integramos con Supabase más tarde)
async function forgot() {
  try {
    if (typeof (auth as any).resetPasswordForEmail === 'function') {
      await (auth as any).resetPasswordForEmail(email.value)
      alert('Te enviamos un correo para recuperar tu contraseña.')
    } else if (typeof (auth as any).resetPassword === 'function') {
      await (auth as any).resetPassword(email.value)
      alert('Te enviamos un correo para recuperar tu contraseña.')
    } else {
      alert('Ingresá tu email y luego lo conectamos con Supabase.')
    }
  } catch {
    alert('No pudimos enviar el correo. Revisá el email e intentá nuevamente.')
  }
}
</script>

  
  <style scoped>
  /* ===== Fondo (igual al splash) ===== */
  .login-page {
    min-height: 100dvh;
    background: url('/bgs/splash.png') center/cover no-repeat;
    display: grid;
    grid-template-rows: auto 1fr;
    justify-items: center;
    align-items: start;
    padding: 48px 16px 32px;
  }
  
  /* ===== Logo fuera del card ===== */
  .brand {
    width: 150px;
    height: auto;
    margin-bottom: 18px;
    filter: drop-shadow(0 2px 4px #0002);
  }
  
  /* ===== Card ===== */
  .card {
    width: 100%;
    max-width: 500px;            /* recuadro blanco */
    background: #fff;
    border-radius: 90px;
    padding: 28px 16px 34px;
    box-shadow: 0 16px 44px rgba(0, 0, 0, 0.22);
  }
  
  /* Variables de anchura relativas al card */
  :root, :host {
    --field-w: 50%;   /* Facebook, Google, inputs, divider */
    --actions-w: 40%; /* Entrar / Registrarse */
  }
  
  /* Helpers para centrar con el ancho deseado */
  .w-field,
  .w-actions {
    display: block;
    margin-left: auto;
    margin-right: auto;
  }
  .w-field   { width: var(--field-w); }
  .w-actions { width: var(--actions-w); }
  
  /* ===== Inputs ===== */
  input {
    padding: 0.7rem 0.9rem;
    margin: 0.45rem auto;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    outline: none;
    font-size: 0.92rem;
  }
  input:focus {
    border-color: var(--nura-blue, #85b6e0);
    box-shadow: 0 0 0 3px rgba(133, 182, 224, 0.22);
  }
  
  /* ===== Separador ===== */
  .divider {
    text-align: center;
    opacity: 0.75;
    margin: 12px auto 8px;
    font-size: 0.92rem;
  }
  
  /* ===== “Olvidaste tu contraseña” ===== */
  .forgot {
    display: block;
    text-align: center;
    margin: 6px auto 14px;         /* un poco más de aire */
    color: var(--nura-blue, #85b6e0);
    font-size: 0.9rem;
    text-decoration: none;
  }
  .forgot:hover { text-decoration: underline; }
  
  /* ===== Botones ===== */
  .btn {
    border: none;
    border-radius: 16px;
    padding: 0.62rem 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    box-shadow: 0 6px 18px rgba(0,0,0,.18);
    margin: 0.5rem auto;
  }
  
  /* Primarios (Entrar / Registrarse) */
  .btn-primary {
    background: var(--nura-blue, #85b6e0);
    color: #fff;
  }
  .btn-primary:hover {
    background: var(--nura-green, #50bdbd);
  }
  
  /* ===== OAuth ===== */
  .btn-oauth.with-icon img {
    width: 18px;
    height: 18px;
    object-fit: contain;
  }
  
  /* Facebook: sólido */
  .btn-oauth.facebook {
    background: #1877f2;
    color: #fff;
  }
  .btn-oauth.facebook:hover { filter: brightness(0.95); }
  
  /* Google: borde gris, fondo blanco */
  .btn-oauth.google {
    background: #fff;
    color: #2b2b2b;
    border: 1px solid #d1d5db;
    box-shadow: none;
  }
  .btn-oauth.google:hover { background: #fafafa; }
  
  /* ===== Botón Instalar (desktop only) ===== */
  .install {
    position: fixed;
    top: 14px;
    right: 14px;
    z-index: 5;
  }
  
  /* Mostrar/ocultar por breakpoint */
  .desktop-only { display: none; }
  @media (min-width: 900px) {
    .desktop-only { display: inline-flex; }
  }
  </style>
  