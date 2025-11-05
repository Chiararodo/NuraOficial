<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { supabase } from '@/composables/useSupabase'

const router = useRouter()
const auth = useAuthStore()

/** Nombre visible del usuario */
const displayName = computed(() => {
  const metaName = (auth.user?.user_metadata as any)?.name
  if (metaName) return metaName
  const email = auth.user?.email ?? 'Usuario'
  return email.split('@')[0]
})

/** Email del usuario */
const userEmail = computed(() => auth.user?.email ?? 'Sin email registrado')

/** “Usuario desde …” */
const memberSince = computed(() => {
  const iso = auth.user?.created_at
  if (!iso) return `Usuario desde ${new Date().getFullYear()}`
  const y = new Date(iso).getFullYear()
  return `Usuario desde ${y}`
})

/** Navegación y acciones */
function goNotificaciones() { router.push('/app/notificaciones') }
function goChatbot()        { router.push('/app/chatbot') }
function goAgendar()        { router.push('/app/agendar') }
function goContenido()      { router.push('/app/contenido') }
function editarMedicacion() { alert('Abriremos el editor de medicaciones.') }
function verEstados()       { alert('Próximamente: gráfico de estados de los últimos 7 días.') }
function verTurnos()        { goAgendar() }

// Diario
function goDiaryList() {
  router.push({ name: 'diario', query: { view: 'recent' } })
}
function escribirDiario() {
  router.push({ name: 'diario', query: { edit: 'today' } })
}

function editarPrivacidad() { alert('Mostraremos la política y opciones de privacidad.') }
function editarIdioma()     { alert('Próximamente: selector de idioma.') }

/** ✅ Cerrar sesión */
async function signOut() {
  const ok = confirm('¿Cerrar sesión en Nura?')
  if (!ok) return

  const { error } = await supabase.auth.signOut()
  if (error) {
    alert('No se pudo cerrar sesión. Intentá de nuevo.')
    console.error(error)
    return
  }

  try { auth.$reset?.() } catch {}

  router.replace('/login')
}
</script>

<template>
  <main class="perfil-page">
    <div class="grid">
      <!-- COLUMNA IZQUIERDA -->
      <section class="col">
        <!-- Encabezado -->
        <div class="card profile-head">
          <div class="avatar"></div>
          <div class="who">
            <h1 class="name">{{ displayName }}</h1>
            <p class="email">{{ userEmail }}</p>
            <p class="since">{{ memberSince }}</p>
          </div>
        </div>

        <!-- Mis estados -->
        <div class="card">
          <h3 class="card-title">Mis estados</h3>
          <p class="card-sub">estos últimos 7 días</p>
          <div class="row">
            <button class="btn-ghost" @click="verEstados">
              Ver detalle <span class="chev">▾</span>
            </button>
          </div>
        </div>

        <!-- Turnos -->
        <div class="card">
          <h3 class="card-title">Mis turnos</h3>
          <div class="row between">
            <p class="muted">Dra. Pérez – Miér 13:30 hs</p>
            <button class="btn" @click="verTurnos">Ver detalles</button>
          </div>
        </div>

        <!-- Medicaciones -->
        <div class="card">
          <h3 class="card-title">Medicaciones</h3>
          <div class="row between stack">
            <p class="muted">Sertralina 50 mg — 8:30 y 20:00</p>
            <button class="btn" @click="editarMedicacion">Editar</button>
          </div>
        </div>

        <!-- Diario -->
        <div class="card">
          <h3 class="card-title">Mi Diario</h3>
          <div class="row between">
            <button class="btn-ghost" @click="goDiaryList">Ver mis entradas</button>
            <button class="btn" @click="escribirDiario">Escribir</button>
          </div>
        </div>
      </section>

      <!-- COLUMNA DERECHA -->
      <section class="col">
        <div class="card">
          <h3 class="aside-title">Ajustes</h3>
        </div>

        <div class="card">
          <h4 class="card-title">Notificaciones</h4>
          <p class="muted">Puedes decidir qué tipo de notificaciones deseas recibir.</p>
          <div class="row end">
            <button class="btn" @click="goNotificaciones">Editar</button>
          </div>
        </div>

        <div class="card">
          <h4 class="card-title">Privacidad y Términos</h4>
          <p class="muted">Explica cómo Nura protege la información personal.</p>
          <div class="row end">
            <button class="btn" @click="editarPrivacidad">Editar</button>
          </div>
        </div>

        <div class="card">
          <h4 class="card-title">Idioma</h4>
          <p class="muted">Puedes seleccionar el idioma en el que deseas utilizar la app.</p>
          <div class="row end">
            <button class="btn" @click="editarIdioma">Editar</button>
          </div>
        </div>

        <div class="card">
          <h4 class="card-title">Asistencia</h4>
          <p class="muted">¿Necesitás ayuda? Podés hablar con Nuri cuando quieras.</p>
          <div class="row end">
            <button class="btn" @click="goChatbot">Abrir chatbot</button>
          </div>
        </div>

        <!-- ✅ Cuenta -->
        <div class="card">
          <h4 class="card-title">Cuenta</h4>
          <p class="muted">Gestioná tu sesión en este dispositivo.</p>
          <div class="row end">
            <button class="btn btn-danger" @click="signOut">Cerrar sesión</button>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.perfil-page{
  background:#fff;
  padding:18px 16px 32px;
}
.grid{
  display:grid; gap:22px;
  max-width:1100px; margin:0 auto;
}
@media(min-width:980px){
  .grid{ grid-template-columns:1.15fr .85fr; }
}
.col{ display:grid; gap:18px; }
.card{
  background:#fff; border-radius:18px;
  box-shadow:0 10px 24px rgba(0,0,0,.07);
  border:1px solid #eef2f7;
  padding:16px 18px;
}

/* Header de perfil */
.profile-head{ display:flex; align-items:center; gap:14px; }
.avatar{
  width:64px; height:64px; border-radius:999px;
  background:linear-gradient(145deg,#e6e9f1,#f9fbff);
  border:2px solid #e8eef4;
}
.who .name{ margin:0; font-size:1.1rem; color:#223; font-weight:700; }
.who .email{ margin:2px 0 0; color:#4b5563; font-size:.9rem; }
.who .since{ margin:2px 0 0; color:#6b7280; font-size:.85rem; }

/* Filas */
.row{ display:flex; gap:10px; align-items:center; margin-top:8px; }
.row.between{ justify-content:space-between; }
.row.end{ justify-content:flex-end; }
.stack{ flex-wrap:wrap; }

/* Tipografía */
.card-title{ margin:0 0 6px; color:#273845; font-weight:700; }
.aside-title{ margin:0; color:#3aa; font-weight:800; }
.card-sub{ margin:-4px 0 10px; color:#6b7280; }
.muted{ color:#6b7280; }

/* Botones */
.btn{
  background:#85b6e0; color:#fff;
  border:none; border-radius:12px;
  padding:.45rem .9rem; font-weight:600; cursor:pointer;
  box-shadow:0 6px 14px rgba(133,182,224,.35);
  transition:transform .05s ease, filter .15s ease;
}
.btn:hover{ filter:brightness(.98); }
.btn:active{ transform:translateY(1px); }

.btn-ghost{
  background:#f5f9ff; color:#2b3a44;
  border:1px solid #e3ecf6; border-radius:12px;
  padding:.45rem .8rem; font-weight:600; cursor:pointer;
}
.btn-ghost .chev{ margin-left:8px; opacity:.6; }

/* Botón de cierre de sesión */
.btn-danger{
  background:#ef5350;
  box-shadow:0 6px 14px rgba(239,83,80,.25);
}
</style>
