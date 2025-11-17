// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// Públicas
import Splash from '@/pages/Splash.vue'
import Login from '@/pages/Login.vue'
import Register from '@/pages/Register.vue'
import Onboarding from '@/pages/Onboarding.vue'
import Onboarding2 from '@/pages/Onboarding2.vue'
import Onboarding3 from '@/pages/Onboarding3.vue'

// App (autenticadas)
import Home from '@/pages/Home.vue'
import Cartilla from '@/pages/Cartilla.vue'
import Agendar from '@/pages/Agendar.vue'
import Contenido from '@/pages/Contenido.vue'
import Perfil from '@/pages/Perfil.vue'
import Foro from '@/pages/Foro.vue'
import ForoNuevo from '@/pages/ForoNuevo.vue'
import ForoVer from '@/pages/ForoVer.vue'
import Chatbot from '@/pages/Chatbot.vue'
import Notificaciones from '@/pages/Notificaciones.vue'
import Diary from '@/pages/Diary.vue'

import { supabase } from '@/composables/useSupabase'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'splash', component: Splash },

  // Públicas
  { path: '/login', name: 'login', component: Login },
  { path: '/register', name: 'register', component: Register },

  // Onboarding (requiere sesión)
  { path: '/onboarding',  name: 'onboarding',  component: Onboarding },
  { path: '/onboarding2', name: 'onboarding2', component: Onboarding2 },
  { path: '/onboarding3', name: 'onboarding3', component: Onboarding3 },

  // Área privada
  {
    path: '/app',
    component: () => import('@/layouts/AppShell.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: 'home',           name: 'home',           component: Home },
      { path: 'cartilla',       name: 'cartilla',       component: Cartilla },
      { path: 'agendar',        name: 'agendar',        component: Agendar },
      { path: 'contenido',      name: 'contenido',      component: Contenido },
      { path: 'perfil',         name: 'perfil',         component: Perfil },
      { path: 'perfil/editar', name: 'perfil-editar', component: () => import('@/pages/PerfilEditar.vue') },
      { path: 'foro',           name: 'foro',           component: Foro },
      { path: 'foro/new',       name: 'foro-new',       component: ForoNuevo },
      { path: 'foro/:id',     name: 'foro-view',  component: ForoVer },
      { path: 'chatbot',        name: 'chatbot',        component: Chatbot },
      { path: 'notificaciones', name: 'notificaciones', component: Notificaciones },
      { path: 'diario',         name: 'diario',         component: Diary },
      { path: '', redirect: '/app/home' },
    ],
  },

  // Fallback
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, left: 0 }
  },
})

/* =========== Guard =========== */

const ONBOARDING_PATHS = new Set(['/onboarding', '/onboarding2', '/onboarding3'])
const isOnboardingPath = (p: string) => ONBOARDING_PATHS.has(p)

// cache ligero de onboarding por usuario
const onboardingCache = new Map<string, boolean>()

async function getOnboardingDone(uid?: string, meta?: any): Promise<boolean> {
  if (!uid) return false

  // 1) metadata
  if (meta?.onboarding_done === true) {
    onboardingCache.set(uid, true)
    return true
  }

  // 2) cache
  if (onboardingCache.has(uid)) {
    return !!onboardingCache.get(uid)
  }

  // 3) fallback a tabla 'profiles' (si existe)
  try {
    const { data: prof, error } = await supabase
      .from('profiles')
      .select('onboarding_done')
      .eq('id', uid)
      .maybeSingle()

    const done = !error && !!prof?.onboarding_done
    onboardingCache.set(uid, done)
    return done
  } catch {
    onboardingCache.set(uid, false)
    return false
  }
}

router.beforeEach(async (to) => {
  // ⚠️ Dejar que Splash resuelva su propia lógica (no lo interceptamos)
  if (to.name === 'splash') return

  // Sesión **real** de Supabase en *cada navegación*
  const { data } = await supabase.auth.getSession()
  const session = data.session
  const user = session?.user
  const isAuthed = !!user

  // 1) Rutas privadas
  if (to.meta.requiresAuth && !isAuthed) {
    return '/login'
  }

  // 2) Onboarding requiere sesión
  if (!isAuthed && isOnboardingPath(to.path)) {
    return '/login'
  }

  // 3) Si está logueado e intenta ir a login/register → Home
  if (isAuthed && (to.path === '/login' || to.path === '/register')) {
    return '/app/home'
  }

  // 4) Flujo de onboarding
  if (isAuthed) {
    const done = await getOnboardingDone(user?.id, user?.user_metadata)
    if (!done && !isOnboardingPath(to.path)) {
      return '/onboarding'
    }
    if (done && isOnboardingPath(to.path)) {
      return '/app/home'
    }
  }

  // continuar
})
