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
import Chatbot from '@/pages/Chatbot.vue'
import Notificaciones from '@/pages/Notificaciones.vue'

import { supabase } from '@/composables/useSupabase'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'splash', component: Splash },

  // Públicas
  { path: '/login', name: 'login', component: Login },
  { path: '/register', name: 'register', component: Register },

  // Onboarding (solo con sesión)
  { path: '/onboarding', name: 'onboarding', component: Onboarding },
  { path: '/onboarding2', name: 'onboarding2', component: Onboarding2 },
  { path: '/onboarding3', name: 'onboarding3', component: Onboarding3 },

  // Área privada
  {
    path: '/app',
    component: () => import('@/layouts/AppShell.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: 'home', name: 'home', component: Home },
      { path: 'cartilla', name: 'cartilla', component: Cartilla },
      { path: 'agendar', name: 'agendar', component: Agendar },
      { path: 'contenido', name: 'contenido', component: Contenido },
      { path: 'perfil', name: 'perfil', component: Perfil },
      { path: 'foro', name: 'foro', component: Foro },
      { path: 'chatbot', name: 'chatbot', component: Chatbot },
      { path: 'notificaciones', name: 'notificaciones', component: Notificaciones },
      { path: '', redirect: '/app/home' },
    ],
  },

  // Fallback
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

/** Cache en memoria para el flag de onboarding por usuario */
const onboardingCache = new Map<string, boolean>()

/** Lee si el usuario completó el onboarding */
async function getOnboardingDone(): Promise<{ isAuthed: boolean; done: boolean; uid?: string }> {
  const { data } = await supabase.auth.getSession()
  const session = data.session
  const isAuthed = !!session
  const uid = session?.user?.id

  if (!isAuthed || !uid) return { isAuthed: false, done: false }

  // Cache
  if (onboardingCache.has(uid)) {
    return { isAuthed: true, done: !!onboardingCache.get(uid), uid }
  }

  // 1) user_metadata
  const metaDone = (session.user.user_metadata as any)?.onboarding_done === true
  if (metaDone) {
    onboardingCache.set(uid, true)
    return { isAuthed: true, done: true, uid }
  }

  // 2) Fallback a tabla 'profiles' (si existe)
  try {
    const { data: prof, error } = await supabase
      .from('profiles')
      .select('onboarding_done')
      .eq('id', uid)
      .maybeSingle()

    if (!error && prof && prof.onboarding_done === true) {
      onboardingCache.set(uid, true)
      return { isAuthed: true, done: true, uid }
    }
  } catch {
    // ignorar si la tabla/columna no existe
  }

  onboardingCache.set(uid, false)
  return { isAuthed: true, done: false, uid }
}

router.beforeEach(async (to) => {
  const { isAuthed, done } = await getOnboardingDone()

  const isOnboardingRoute =
    to.path === '/onboarding' || to.path === '/onboarding2' || to.path === '/onboarding3'

  // Rutas que requieren sesión
  if (to.meta.requiresAuth && !isAuthed) {
    return '/login'
  }

  // Bloquear onboarding si NO está logueado
  if (!isAuthed && isOnboardingRoute) {
    return '/login'
  }

  // Si está logueado e intenta ir a login/register → a home
  if (isAuthed && (to.path === '/login' || to.path === '/register')) {
    return '/app/home'
  }

  // Forzar onboarding si no lo completó (desde cualquier ruta autenticada o pública)
  if (isAuthed && !done && !isOnboardingRoute) {
    return '/onboarding'
  }

  // Si ya completó y entra a cualquier paso de onboarding → a home
  if (isAuthed && done && isOnboardingRoute) {
    return '/app/home'
  }

  // continuar
})
