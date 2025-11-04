<template>
    <section class="home">
      <!-- GRID PRINCIPAL -->
      <div class="grid">
        <!-- ===== Columna Izquierda ===== -->
        <div class="col">
          <!-- Saludo + Nuri Picker -->
          <div class="card">
            <h3>¡Hola, {{ displayName }}!</h3>
            <p class="subtle">¿Cómo te sentís hoy?</p>
  
            <div class="mood-row">
              <button
                v-for="m in moods"
                :key="m.key"
                class="mood"
                :aria-pressed="selectedMood === m.key"
                @click="selectMood(m.key)"
              >
                <img :src="m.src" :alt="m.label" />
                <span>{{ m.label }}</span>
              </button>
            </div>
  
            <p v-if="savedMoodMsg" class="saved">{{ savedMoodMsg }}</p>
          </div>
  
          <!-- Frase del día -->
          <div class="card">
            <h4 class="section-title">Frase del día</h4>
            <div class="quote">“{{ phraseOfTheDay }}”</div>
          </div>
  
          <!-- Foro activo -->
          <div class="card">
            <div class="foro-header">
              <h4 class="section-title">Foro activo</h4>
              <span class="down">▾</span>
            </div>
  
            <ul class="foro-list">
              <li v-for="(post, i) in forumPreview" :key="i">
                • {{ post.title }} <small>({{ post.replies }})</small>
              </li>
            </ul>
  
            <RouterLink to="/app/foro" class="btn-secondary">
              Ver más del foro
            </RouterLink>
          </div>
        </div>
  
        <!-- ===== Columna Derecha ===== -->
        <div class="col">
          <!-- Actividades de hoy -->
          <div class="card">
            <h4 class="section-title">Actividades de hoy</h4>
  
            <div class="calendar">
              <div class="calendar-head">
                <div class="month">{{ monthName.toUpperCase() }}</div>
                <div class="day-big">{{ dayNumber }}</div>
              </div>
  
              <div class="activities">
                <template v-if="todayActivities.length">
                  <div
                    class="activity"
                    v-for="(a, i) in todayActivities"
                    :key="i"
                  >
                    <strong>{{ a.title }}</strong>
                    <div class="time">{{ a.time }}</div>
                  </div>
                </template>
                <p v-else class="empty">No tenés actividades para hoy.</p>
              </div>
            </div>
          </div>
  
          <!-- Chatbot Banner -->
          <RouterLink to="/app/chatbot" class="chatbot-banner card">
            <div class="cb-text">
              <h5>Chatbot</h5>
              <p>Tu guía de bienestar, ahora en un chat</p>
            </div>
            <img
              class="cb-nuri"
              src="/icons/NuriBienvenida.png"
              alt="Nuri"
              loading="lazy"
            />
          </RouterLink>
        </div>
      </div>
  
      <!-- Footer -->
      <footer class="footer">© Copyright Nura</footer>
    </section>
  </template>
  
  <script setup lang="ts">
  import { computed, onMounted, ref } from 'vue'
  import { RouterLink } from 'vue-router'
  import { useAuthStore } from '@/store/auth'
  import { supabase } from '@/composables/useSupabase'
  
  /* ================== USER ================== */
  const auth = useAuthStore()
  const displayName = computed(() => {
    const u = auth.user as any
    return u?.user_metadata?.name || u?.email?.split('@')[0] || 'usuario'
  })
  
  /* ================== MOOD (Nuri) ================== */
  type MoodKey = 'triste' | 'normal' | 'bien' | 'muybien'
  
  const moods = [
    { key: 'triste' as MoodKey, label: 'Triste', src: '/icons/nuri-triste.png' },
    { key: 'normal' as MoodKey, label: 'Normal', src: '/icons/nuri-normal.png' },
    { key: 'bien' as MoodKey, label: 'Bien', src: '/icons/nuri-bien.png' },
    {
      key: 'muybien' as MoodKey,
      label: 'Muy bien',
      src: '/icons/nuri-muybien.png'
    }
  ]
  
  const selectedMood = ref<MoodKey | null>(null)
  const savedMoodMsg = ref('')
  
  function todayKey() {
    const d = new Date()
    return d.toISOString().slice(0, 10) // YYYY-MM-DD
  }
  
  function loadSavedMood() {
    const key = `nura:mood:${todayKey()}`
    const v = localStorage.getItem(key)
    if (v) selectedMood.value = v as MoodKey
  }
  
  async function selectMood(mood: MoodKey) {
    selectedMood.value = mood
    // Guardar local
    localStorage.setItem(`nura:mood:${todayKey()}`, mood)
    savedMoodMsg.value = '¡Registro guardado!'
  
    // Intento guardar en Supabase (silencioso si falla)
    try {
      const uid = (auth.user as any)?.id
      if (uid) {
        await supabase.from('moods').insert({
          user_id: uid,
          date: todayKey(),
          mood
        })
      }
    } catch {
      /* ignore – tabla opcional */
    }
    setTimeout(() => (savedMoodMsg.value = ''), 2200)
  }
  
  onMounted(loadSavedMood)
  
  /* ================== FRASE DEL DÍA ================== */
  const phrases = [
    'Escucharte también es cuidarte',
    'Un paso a la vez',
    'Respirá profundo, contá hasta cuatro',
    'Tu progreso importa, aunque sea pequeño',
    'Sé amable con vos',
    'Hoy es una buena oportunidad',
    'Los límites también son amor propio',
    'Lo estás haciendo bien',
    'Tu bienestar es prioridad',
    'Elegí volver a intentar'
    // (si querés, agregamos tus ~100 frases acá)
  ]
  
  const phraseOfTheDay = computed(() => {
    const d = new Date()
    // índice estable por día
    const seed = Number(d.toISOString().slice(0, 10).replace(/-/g, ''))
    return phrases[seed % phrases.length]
  })
  
  /* ================== ACTIVIDADES ================== */
  type Activity = { title: string; time: string }
  const todayActivities = ref<Activity[]>([])
  
  const monthName = computed(() =>
    new Date().toLocaleString('es-AR', { month: 'long' })
  )
  const dayNumber = computed(() => new Date().getDate())
  
  async function loadTodayActivities() {
    // Intento leer de Supabase (tabla sugerida: appointments con columnas: user_id, date, title, time)
    const uid = (auth.user as any)?.id
    if (!uid) return
  
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('title,time,date')
        .eq('user_id', uid)
        .eq('date', todayKey())
  
      if (!error && Array.isArray(data) && data.length) {
        todayActivities.value = data.map((r: any) => ({
          title: r.title,
          time: r.time || ''
        }))
        return
      }
    } catch {
      // si no existe la tabla o hay error, seguimos a fallback
    }
  
    // Fallback opcional (dejar vacío para mostrar el mensaje)
    todayActivities.value = []
  }
  
  onMounted(loadTodayActivities)
  
  /* ================== FORO (preview) ================== */
  const forumPreview = ref([
    { title: 'Tips para manejar la ansiedad', replies: 15 },
    { title: 'Cómo transitar eventos sociales', replies: 40 },
    { title: 'Controlar la respiración', replies: 30 },
    { title: 'Organizar las comidas', replies: 25 }
  ])
  </script>
  
  <style scoped>
  :root,
  :host {
    --nura-emerald: #50bdbd;
    --nura-blue: #85b6e0;
    --text: #1f2937;
    --muted: #6b7280;
    --card: #ffffff;
    --bg: #f7fbfb;
  }
  
  .home {
    padding: 20px 16px 60px;
    background: var(--bg);
  }
  
  .grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
  }
  @media (min-width: 980px) {
    .grid {
      grid-template-columns: 1fr 1fr;
      gap: 22px;
    }
  }
  
  .col {
    display: grid;
    gap: 18px;
  }
  
  .card {
    background: var(--card);
    border-radius: 18px;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
    padding: 16px 18px;
  }
  
  h3 {
    margin: 2px 0 4px;
    color: var(--text);
    font-size: 1.4rem;
  }
  .subtle {
    color: var(--muted);
    margin-bottom: 8px;
  }
  
  /* ========= Moods ========= */
  .mood-row {
    display: grid;
    grid-template-columns: repeat(4, minmax(70px, 1fr));
    gap: 14px;
    margin-top: 10px;
  }
  
  .mood {
    background: #f5fbfb;
    border: 2px solid transparent;
    border-radius: 16px;
    padding: 10px 8px;
    display: grid;
    place-items: center;
    gap: 6px;
    transition: 0.18s ease;
  }
  .mood[aria-pressed='true'] {
    border-color: var(--nura-blue);
    box-shadow: 0 6px 16px rgba(133, 182, 224, 0.25);
  }
  .mood img {
    width: 56px;
    height: 56px;
    object-fit: contain;
  }
  .mood span {
    font-size: 0.85rem;
    color: var(--text);
  }
  
  .saved {
    margin-top: 8px;
    color: var(--nura-emerald);
    font-weight: 600;
  }
  
  /* ========= Secciones ========= */
  .section-title {
    color: var(--nura-emerald);
    margin: 0 0 8px;
  }
  
  .quote {
    background: #eef7f8;
    border-radius: 12px;
    padding: 12px 14px;
    font-weight: 600;
    color: #2c4a4a;
  }
  
  /* ========= Foro ========= */
  .foro-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .down {
    color: #9ca3af;
  }
  
  .foro-list {
    margin: 6px 0 12px 2px;
    display: grid;
    gap: 6px;
    color: var(--text);
  }
  .foro-list small {
    color: var(--muted);
  }
  
  .btn-secondary {
    display: inline-block;
    padding: 9px 14px;
    border-radius: 14px;
    background: var(--nura-blue);
    color: #fff;
    text-align: center;
    font-weight: 600;
    box-shadow: 0 8px 20px rgba(133, 182, 224, 0.35);
  }
  
  /* ========= Calendario + actividades ========= */
  .calendar {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .calendar-head {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: end;
    padding-bottom: 8px;
    border-bottom: 1px solid #e5e7eb;
  }
  .month {
    color: #64748b;
    font-weight: 700;
    letter-spacing: 1px;
  }
  .day-big {
    font-size: 2rem;
    font-weight: 700;
    color: var(--nura-emerald);
  }
  
  .activities {
    display: grid;
    gap: 10px;
  }
  .activity {
    background: #f6fbfb;
    border-radius: 12px;
    padding: 10px 12px;
    border: 1px solid #e6f1f1;
  }
  .activity .time {
    color: var(--muted);
    font-size: 0.9rem;
  }
  .empty {
    color: var(--muted);
  }
  
  /* ========= Chatbot banner ========= */
  .chatbot-banner {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 12px;
    text-decoration: none;
  }
  .cb-text h5 {
    margin: 0 0 6px;
    color: var(--nura-emerald);
    font-size: 1.1rem;
  }
  .cb-text p {
    margin: 0;
    color: var(--text);
  }
  .cb-nuri {
    width: 100px;
    height: auto;
    object-fit: contain;
  }
  
  /* ========= Footer ========= */
  .footer {
    text-align: center;
    color: #94a3b8;
    margin-top: 26px;
  }
  </style>
  