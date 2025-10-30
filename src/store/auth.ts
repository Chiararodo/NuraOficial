import { defineStore } from 'pinia'
import { supabase } from '@/composables/useSupabase'


export const useAuthStore = defineStore('auth', {
state: () => ({ user: null as any }),
actions: {
async init() {
const { data } = await supabase.auth.getUser()
this.user = data.user
supabase.auth.onAuthStateChange((_e, s) => { this.user = s?.user ?? null })
},
async signInEmail(email: string, password: string) {
const { error } = await supabase.auth.signInWithPassword({ email, password })
if (error) throw error
},
async signUpEmail(email: string, password: string) {
const { error } = await supabase.auth.signUp({ email, password })
if (error) throw error
},
async signInWithProvider(provider: 'google'|'facebook') {
const { error } = await supabase.auth.signInWithOAuth({ provider })
if (error) throw error
},
async signOut() { await supabase.auth.signOut() }
}
})