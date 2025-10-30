<template>
    <section class="ob">
    <h2>¡Bienvenida a Nura!</h2>
    <p>Te voy a acompañar con recordatorios, foros y contenidos.</p>
    <ul>
    <li>Permitir notificaciones (opcional)</li>
    <li>Elegir por dónde empezar: Ansiedad / Hábitos / Relajación</li>
    <li>Configurar recordatorios de bienestar</li>
    </ul>
    <button @click="$router.push('/app/home')">Continuar</button>
    </section>
    </template>
    <style scoped>
    .ob{ max-width:560px; margin:10dvh auto; background:#fff; padding:24px; border-radius:16px }
    button{ background:#37B3B3; color:#fff; border:none; padding:.8rem 1.2rem; border-radius:12px }
    </style>