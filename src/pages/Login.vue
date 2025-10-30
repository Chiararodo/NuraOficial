<template>
    <div class="card">
    <h1>Nura</h1>
    <button @click="google">Entrar con Google</button>
    <div class="divider">o</div>
    <form @submit.prevent="emailLogin">
    <input v-model="email" type="email" placeholder="Email" required>
    <input v-model="password" type="password" placeholder="Contraseña" required>
    <button type="submit">Entrar</button>
    </form>
    <p class="hint">¿No tenés cuenta? <a @click.prevent="register">Registrate</a></p>
    </div>
    </template>
    <script setup lang="ts">
    import { ref } from 'vue'
    import { useRouter } from 'vue-router'
    import { useAuthStore } from '@/store/auth'
    
    
    const email = ref('')
    const password = ref('')
    const auth = useAuthStore()
    const router = useRouter()
    
    
    async function emailLogin(){
    await auth.signInEmail(email.value, password.value)
    router.replace('/onboarding')
    }
    async function register(){
    await auth.signUpEmail(email.value, password.value)
    router.replace('/onboarding')
    }
    async function google(){ await auth.signInWithProvider('google') }
    </script>
    <style scoped>
    .card{ max-width:380px; margin: 10dvh auto; background:#fff; padding:24px; border-radius:18px; box-shadow:0 10px 30px rgba(0,0,0,.15) }
    .divider{ text-align:center; opacity:.6; margin:12px 0 }
    input,button{ width:100%; padding:.75rem; margin:.4rem 0; border-radius:10px; border:1px solid #e5e7eb }
    button{ background:#37B3B3; color:#fff; border:none; font-weight:600 }
    </style>