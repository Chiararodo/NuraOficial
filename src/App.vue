<template>
  <div id="app" class="min-h-screen bg-nura-bg text-nura-text">
    <RouterView />
  </div>
</template>

<script setup lang="ts">

</script>

<style>
:root {
  /* Paleta Nura */
  --nura-green: #50bdbd;
  --nura-blue: #85b6e0;
  --nura-purple: #633266;
  --nura-bg: #f5f5f5;
  --nura-text: #000000;
}

/* Fuente y estilo global */
body {
  font-family: 'Poppins', 'Segoe UI', sans-serif;
  margin: 0;
  background-color: var(--nura-bg);
  color: var(--nura-text);
}

/* Estilos utilitarios */
h1, h2, h3, h4, h5 {
  color: var(--nura-green);
}

button {
  background-color: var(--nura-purple);
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
  transition: 0.2s;
}

button:hover {
  background-color: var(--nura-blue);
}
</style>
