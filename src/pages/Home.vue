<template>
    <div class="home">
    <div class="row">
    <RouterLink to="/app/chatbot" class="card">Chatbot 🤖</RouterLink>
    <RouterLink to="/app/notificaciones" class="card">Notificaciones 🔔</RouterLink>
    <RouterLink to="/app/foro" class="card">Foro 🗣️</RouterLink>
    </div>
    <h3>Actividades de hoy</h3>
    <ul class="list">
    <li>Respiración 4-7-8</li>
    <li>Registrar cómo te sentís antes de comer</li>
    </ul>
    </div>
    </template>
    <style scoped>
    .row{ display:grid; grid-template-columns:repeat(3,1fr); gap:12px }
    .card{ background:#fff; padding:18px; border-radius:14px; box-shadow:0 6px 16px rgba(0,0,0,.08); display:grid; place-items:center; font-weight:600 }
    .list{ margin-top:14px }
    </style>