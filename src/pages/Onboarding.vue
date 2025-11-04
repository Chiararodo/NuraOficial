<template>
  <main class="onboarding">
    <section class="ob">
      <h2>¡Bienvenida/o a Nura!</h2>

      <p class="intro">
        Yo soy Nuri y estoy acá para acompañarte y ayudarte, un día a la vez, con vos a cada paso.
      </p>

      <!-- Imagen de Nuri -->
      <img src="/icons/NuriBienvenida.png" alt="Nuri" class="nuri" />

      <p class="text">
        Registrá cómo te sentís y accedé a recursos confiables.
      </p>

      <!-- Botón continuar -->
    <button class="btn" @click="goNext">Continuar</button>
    </section>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
function goNext() {
  router.push('/onboarding2')
}
</script>

<style scoped>
/* ===== Fondo general ===== */
.onboarding {
  min-height: 100dvh;
  background: url('/bgs/onboarding.png') center/cover no-repeat;
  display: flex;
  justify-content: center;
  padding: 24px;
}

/* ===== Contenedor del contenido ===== */
.ob {
  max-width: 500px;
  background: #fff;
  padding: 15px 28px;
  text-align: center;
  max-height: 500px;
}

/* ===== Textos ===== */
h2 {
  color: #50bdbd;
  font-size: 1.6rem;
  margin-bottom: 12px;
}

.intro {
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 22px;
  color: #333;
}

.text {
  margin: 12px 0 20px;
  font-size: 0.95rem;
  color: #333;
}

/* ===== Imagen de Nuri ===== */
.nuri {
  width: 250px;
  height: auto;
  margin: 0 auto 50px;
  display: block;
}

/* ===== Botón ===== */
button {
  background: #85b6e0;
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.25s ease;
}

button:hover {
  background: #50bdbd;
  transform: translateY(-2px);
}
</style>
