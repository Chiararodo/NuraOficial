<template>
    <footer class="tabbar">
    <RouterLink to="/app/home">🏠</RouterLink>
    <RouterLink to="/app/cartilla">📒</RouterLink>
    <RouterLink to="/app/agendar" class="plus">＋</RouterLink>
    <RouterLink to="/app/contenido">🎬</RouterLink>
    <RouterLink to="/app/perfil">👤</RouterLink>
    </footer>
    </template>
    <style scoped>
    .tabbar{ position:fixed; left:0; right:0; bottom:0; display:flex; justify-content:space-around; padding:.6rem 0; background:#37B3B3; color:#fff }
    .plus{ font-size:1.6rem; background:#7b31ff; padding:.1rem .6rem; border-radius:14px }
    </style>