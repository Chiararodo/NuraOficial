<script setup lang="ts">
const title = 'Notificaciones';
</script>

<template>
  <section class="p-4">
    <h1 class="text-2xl font-semibold mb-2">{{ title }}</h1>
    <p class="text-gray-600">Acá vas a ver tus avisos del sistema y del profesional.</p>

    <!-- placeholder de lista -->
    <ul class="mt-4 space-y-2">
      <li class="p-3 bg-white rounded-xl shadow">🔔 Recordatorio de bienestar</li>
      <li class="p-3 bg-white rounded-xl shadow">📚 Nuevo material enviado por tu profesional</li>
    </ul>
  </section>
</template>

<style scoped>
/* opcional */
</style>
