<template>
    <div class="splash">
    <img src="/icons/icon-192.png" alt="Nura" />
    <div class="loader" />
    </div>
    </template>
    <script setup lang="ts">
    import { onMounted } from 'vue'
    import { useAuthStore } from '@/store/auth'
    import { useRouter } from 'vue-router'
    
    
    const router = useRouter()
    const auth = useAuthStore()
    
    
    onMounted(async () => {
    await auth.init()
    setTimeout(() => {
    router.replace(auth.user ? '/app/home' : '/login')
    }, 800)
    })
    </script>
    <style scoped>
    .splash{ height:100dvh; display:grid; place-items:center; background:#37B3B3 }
    .loader{ width:120px; height:8px; background:#fff5; border-radius:8px; overflow:hidden }
    .loader:after{ content:""; display:block; height:100%; width:40%; background:#fff; animation:slide 1.2s infinite }
    @keyframes slide{ 0%{transform:translateX(-100%)} 100%{transform:translateX(250%)} }
    </style>