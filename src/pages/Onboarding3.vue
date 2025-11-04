<template>
  <main class="onboarding-page">
    <section class="card">
      <!-- Logo arriba -->
      <img src="/logos/OFICIALwhite.png" alt="Nura" class="brand" />

      <!-- Título -->
      <h2>Elegí por donde comenzar</h2>
      <p>Descubrí el área en la que querés enfocarte primero.</p>

      <!-- Opciones -->
      <div class="options">
        <label class="option">
          <input type="checkbox" v-model="seleccion" value="ansiedad" />
          <span>Ansiedad</span>
        </label>

        <label class="option">
          <input type="checkbox" v-model="seleccion" value="comida" />
          <span>Relación con la comida</span>
        </label>

        <label class="option">
          <input type="checkbox" v-model="seleccion" value="habitos" />
          <span>Hábitos saludables</span>
        </label>
      </div>

      <!-- Botón continuar -->
      <button class="btn" @click="finalizarOnboarding">Continuar</button>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/composables/useSupabase'

const router = useRouter()
const seleccion = ref<string[]>([])

async function finalizarOnboarding() {
  try {
    // Marcar el onboarding como completo en el usuario logueado
    const { data } = await supabase.auth.getSession()
    const uid = data.session?.user?.id

    if (uid) {
      await supabase.auth.updateUser({
        data: { onboarding_done: true },
      })
    }

    // Redirigir al home
    router.push('/app/home')
  } catch (error) {
    console.error('Error al finalizar el onboarding:', error)
    alert('Ocurrió un error, intentá nuevamente.')
  }
}
</script>

<style scoped>
/* Fondo igual al splash */
.onboarding-page {
  min-height: 100dvh;
  background: url('/bgs/splash.png') center/cover no-repeat;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px 16px;
}

/* Tarjeta blanca */
.card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 60px;
  padding: 28px 24px 40px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.2);
  text-align: center;
}

/* Logo */
.brand {
  width: 100px;
  height: auto;
  margin: 0 auto 12px;
}

/* Textos */
h2 {
  color: #50bdbd;
  font-weight: 700;
  font-size: 1.4rem;
  margin-bottom: 8px;
}

p {
  font-size: 0.95rem;
  color: #333;
  margin-bottom: 18px;
}

/* Opciones */
.options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 12px 0 24px;
}

.option {
  background: #85b6e0;
  color: #fff;
  border-radius: 16px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
}

.option input {
  accent-color: #fff;
  width: 18px;
  height: 18px;
}

/* Botón principal */
.btn {
  background: #85b6e0;
  color: #fff;
  font-weight: 600;
  border: none;
  border-radius: 16px;
  padding: 0.8rem 1.2rem;
  width: 70%;
  margin: 0 auto;
  display: block;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
  transition: 0.25s ease;
}

.btn:hover {
  background: #50bdbd;
}
</style>
