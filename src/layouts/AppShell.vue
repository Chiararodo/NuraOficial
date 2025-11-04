<template>
    <div class="app-shell">
    <header class="nura-header">
    <img src="/logos/OFICIALwhite.png" alt="Nura" class="logo" />
    <nav class="topnav desktop-only">
    <RouterLink to="/app/home">Inicio</RouterLink>
    <RouterLink to="/app/cartilla">Cartilla</RouterLink>
    <RouterLink to="/app/agendar">Agendar</RouterLink>
    <RouterLink to="/app/contenido">Contenido</RouterLink>
    <RouterLink to="/app/perfil">Perfil</RouterLink>
    </nav>
    <InstallButton class="desktop-only" />
    </header>
    
    
    <main><RouterView /></main>
    
    
    <TabBar class="mobile-only" />
    </div>
    </template>
    
    
    <script setup lang="ts">
    import InstallButton from '@/components/InstallButton.vue'
    import TabBar from '@/components/TabBar.vue'
    </script>
    
    
    <style scoped>
    .desktop-only{ display:none }
    .mobile-only{ display:block }
    @media(min-width:900px){ .desktop-only{ display:flex } .mobile-only{ display:none } }
    .nura-header{ background:#50bdbd; color:#fff; display:flex; align-items:center; gap:16px; padding:10px 16px }
    .logo{ width:32px; height:32px }
    main{ min-height: calc(100dvh - 100px); background: #50bdbd }
    </style>