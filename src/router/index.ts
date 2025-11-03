import { createRouter, createWebHistory } from 'vue-router'

// Públicas
import Splash from '@/pages/Splash.vue'
import Login from '@/pages/Login.vue'
import Register from '@/pages/Register.vue'
import Onboarding from '@/pages/Onboarding.vue'

// App (autenticadas)
import Home from '@/pages/Home.vue'
import Cartilla from '@/pages/Cartilla.vue'
import Agendar from '@/pages/Agendar.vue'
import Contenido from '@/pages/Contenido.vue'
import Perfil from '@/pages/Perfil.vue'
import Foro from '@/pages/Foro.vue'
import Chatbot from '@/pages/Chatbot.vue'
import Notificaciones from '@/pages/Notificaciones.vue'

import { supabase } from '@/composables/useSupabase'

const routes = [
  { path: '/', name: 'splash', component: Splash },

  // públicas
  { path: '/login', name: 'login', component: Login },
  { path: '/register', name: 'register', component: Register },
  { path: '/onboarding', name: 'onboarding', component: Onboarding },

  // área privada
  {
    path: '/app',
    component: () => import('@/layouts/AppShell.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: 'home', component: Home },
      { path: 'cartilla', component: Cartilla },
      { path: 'agendar', component: Agendar },
      { path: 'contenido', component: Contenido },
      { path: 'perfil', component: Perfil },
      { path: 'foro', component: Foro },
      { path: 'chatbot', component: Chatbot },
      { path: 'notificaciones', component: Notificaciones },
      { path: '', redirect: '/app/home' },
    ],
  },

  // fallback
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

/**
 * Cache simple en memoria para evitar pedir el flag en cada navegación.
 * Clave: user.id  Valor: boolean
 */
const onboardingCache = new Map<string, boolean>()

/**
 * Lee si el usuario completó el onboarding.
 * 1) Intenta desde user_metadata (supabase.auth).
 * 2) (Opcional) Fallback a tabla 'profiles' si existe la columna.
 */
async function getOnboardingDone(): Promise<{ isAuthed: boolean; done: boolean }> {
  const { data } = await supabase.auth.getSession()
  const session = data.session
  const isAuthed = !!session
  if (!isAuthed || !session?.user) return { isAuthed: false, done: false }

  const uid = session.user.id

  // cache
  if (onboardingCache.has(uid)) {
    return { isAuthed: true, done: !!onboardingCache.get(uid) }
  }

  // 1) user_metadata
  const metaDone =
    (session.user.user_metadata as any)?.onboarding_done === true
  if (metaDone) {
    onboardingCache.set(uid, true)
    return { isAuthed: true, done: true }
  }

  // 2) Fallback a tabla 'profiles' si la tenés
  try {
    const { data: prof, error } = await supabase
      .from('profiles')
      .select('onboarding_done')
      .eq('id', uid)
      .maybeSingle()

    if (!error && prof && prof.onboarding_done === true) {
      onboardingCache.set(uid, true)
      return { isAuthed: true, done: true }
    }
  } catch {
    // si la tabla no existe o no tiene la columna, ignoramos
  }

  onboardingCache.set(uid, false)
  return { isAuthed: true, done: false }
}

router.beforeEach(async (to) => {
  const { isAuthed, done } = await getOnboardingDone()

  // rutas que requieren sesión
  if (to.meta.requiresAuth && !isAuthed) {
    return '/login'
  }

  // si está logueado y quiere ir a login/register → a home
  if (isAuthed && (to.path === '/login' || to.path === '/register')) {
    return '/app/home'
  }

  // Forzar onboarding si NO lo completó (salvo que ya esté en /onboarding)
  if (isAuthed && !done && to.path !== '/onboarding') {
    return '/onboarding'
  }

  // Si ya completó onboarding y entra a /onboarding → a home
  if (isAuthed && done && to.path === '/onboarding') {
    return '/app/home'
  }
})
