<template>
    <section class="splash">
      <img src="/logos/OFICIALwhite.png" alt="Nura logo" class="logo" />
      <div class="loader"></div>
    </section>
  </template>
  
  <script setup lang="ts">
  import { onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { useAuthStore } from '@/store/auth'
  
  const router = useRouter()
  const auth = useAuthStore()
  
  onMounted(async () => {
    await auth.init()
    // Espera 1.5s y luego redirige
    setTimeout(() => {
      router.replace(auth.user ? '/app/home' : '/login')
    }, 2000)
  })
  </script>
  
  <style scoped>
  .splash {
    height: 100dvh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: url('/bgs/splash.png') center center / cover no-repeat;
    animation: fadeIn 0.5s ease-in forwards;
  }
  
  .logo {
    width: 110px;
    height: auto;
    margin-bottom: 1.5rem;
    filter: drop-shadow(0 2px 4px #0002);
    animation: float 2.2s ease-in-out infinite;
  }
  
  .loader {
    width: 120px;
    height: 8px;
    background: #ffffff55;
    border-radius: 8px;
    overflow: hidden;
    position: relative;
  }
  
  .loader::after {
    content: "";
    display: block;
    height: 100%;
    width: 40%;
    background: var(--nura-green, #50bdbd);
    animation: slide 1.2s infinite ease-in-out;
  }
  
  /* Animaciones */
  @keyframes slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(250%); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
  </style>
  