import { createRouter, createWebHistory } from 'vue-router'
import Splash from '@/pages/Splash.vue'
import Login from '@/pages/Login.vue'
import Onboarding from '@/pages/Onboarding.vue'
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
{ path: '/login', name: 'login', component: Login },
{ path: '/onboarding', name: 'onboarding', component: Onboarding },
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
{ path: '', redirect: '/app/home' }
]
},
]


export const router = createRouter({ history: createWebHistory(), routes })


router.beforeEach(async (to) => {
const { data } = await supabase.auth.getSession()
const isAuthed = !!data.session
if (to.meta.requiresAuth && !isAuthed) return '/login'
if ((to.path === '/login' || to.path === '/onboarding') && isAuthed) return '/app/home'
})