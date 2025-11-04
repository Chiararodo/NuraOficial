<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue'  // ✅ agregado watchEffect
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { supabase } from '@/composables/useSupabase'

const router = useRouter()
const auth = useAuthStore()

/* ====== Estado del calendario ====== */
const viewDate = ref(new Date()) // mes que se muestra
const selectedDate = ref(new Date()) // día elegido (default hoy)

const monthName = computed(() =>
  viewDate.value.toLocaleString('es-AR', { month: 'long', year: 'numeric' })
)
const firstOfMonth = computed(() => new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), 1))
const lastOfMonth = computed(() => new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 0))
const weekdayFirst = computed(() => (firstOfMonth.value.getDay() + 6) % 7) // lunes=0
const daysInMonth = computed(() => lastOfMonth.value.getDate())

function prevMonth() {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() - 1, 1)
}
function nextMonth() {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 1)
}
function pickDay(d: number) {
  selectedDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), d)
}

/* ====== Registro ====== */
type Mood = 'triste' | 'normal' | 'bien' | 'muybien'
const mood = ref<Mood>('triste')
const content = ref('')

const selectedISO = computed(() => selectedDate.value.toISOString().slice(0, 10))
const todayISO = new Date().toISOString().slice(0, 10)

async function loadDraft() {
  if (!auth.user) return
  // Cargamos si ya hay entrada del día para poder editar
  const { data, error } = await supabase
    .from('diary_entries')
    .select('mood, content')
    .eq('user_id', auth.user.id)
    .eq('on_date', selectedISO.value)
    .maybeSingle()
  if (!error && data) {
    mood.value = (data.mood as Mood) ?? 'triste'
    content.value = data.content ?? ''
  } else {
    content.value = ''
  }
}

onMounted(loadDraft)
watchEffect(loadDraft)

async function saveEntry() {
  if (!auth.user) {
    alert('Iniciá sesión para guardar tu entrada.')
    return
  }
  try {
    const { error } = await supabase
      .from('diary_entries')
      .upsert(
        {
          user_id: auth.user.id,
          on_date: selectedISO.value,
          mood: mood.value,
          content: content.value,
        },
        { onConflict: 'user_id,on_date' }
      )
    if (error) throw error
    alert('Entrada guardada ✅')
  } catch (e: any) {
    console.error(e)
    alert('No pudimos guardar. Si no tenés la tabla "diary_entries", luego la creamos.')
  }
}

function goRecent() {
  // Usá la ruta que prefieras para tu listado
  router.push('/app/contenido')
}
</script>

<template>
  <main class="diary-page">
    <div class="grid">
      <!-- CALENDARIO -->
      <section class="card">
        <div class="cal-head">
          <h2 class="cal-title">{{ monthName }}</h2>
          <div class="cal-arrows">
            <button class="nav" @click="prevMonth" aria-label="Mes anterior">‹</button>
            <button class="nav" @click="nextMonth" aria-label="Mes siguiente">›</button>
          </div>
        </div>

        <div class="cal-grid">
          <span class="wd">SUN</span><span class="wd">MON</span><span class="wd">TUE</span><span class="wd">WED</span><span class="wd">THU</span><span class="wd">FRI</span><span class="wd">SAT</span>
          <span v-for="i in weekdayFirst" :key="'b'+i" class="blank"></span>
          <button
            v-for="d in daysInMonth"
            :key="'d'+d"
            class="cal-day"
            :class="{
              selected: selectedDate.getDate() === d &&
                        selectedDate.getMonth() === viewDate.getMonth() &&
                        selectedDate.getFullYear() === viewDate.getFullYear(),
              today: (new Date(viewDate.getFullYear(), viewDate.getMonth(), d).toISOString().slice(0,10)) === todayISO
            }"
            @click="pickDay(d)"
          >
            {{ d }}
          </button>
        </div>

        <button class="btn-outline" @click="goRecent">Ver Entradas recientes</button>
      </section>

      <!-- FORM REGISTRO -->
      <section class="card">
        <h3 class="form-title">Escribí tu registro de hoy</h3>

        <div class="chips">
          <button :class="['chip', {active: mood==='triste'}]"  @click="mood='triste'">Triste</button>
          <button :class="['chip', {active: mood==='normal'}]" @click="mood='normal'">Normal</button>
          <button :class="['chip', {active: mood==='bien'}]"    @click="mood='bien'">Bien</button>
          <button :class="['chip', {active: mood==='muybien'}]" @click="mood='muybien'">Muy bien</button>
        </div>

        <textarea
          class="area"
          rows="8"
          placeholder="Escribí aquí..."
          v-model="content"
        />

        <div class="actions">
          <button class="btn" @click="saveEntry">Guardar entrada</button>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
/* ===== Layout general ===== */
.diary-page{
  background:#fff;
  padding: 18px 16px 32px;
}
.grid{
  display:grid; gap:22px;
  max-width:1100px; margin:0 auto;
}
@media(min-width: 980px){
  .grid{ grid-template-columns: 1.05fr .95fr; }
}
.card{
  background:#fff; border-radius:18px;
  box-shadow:0 10px 24px rgba(0,0,0,.07);
  border:1px solid #eef2f7;
  padding:16px 18px;
}

/* ===== Calendario ===== */
.cal-head{
  display:flex; align-items:center; justify-content:space-between;
  margin-bottom:8px;
}
.cal-title{ margin:0; font-size:1.2rem; font-weight:800; color:#223; }
.cal-arrows .nav{
  border:none; background:#f1fafb; color:#2a3b45;
  width:32px; height:32px; border-radius:10px; cursor:pointer;
  margin-left:6px; font-size:1.1rem;
}
.cal-grid{
  display:grid; gap:6px; margin-bottom:14px;
  grid-template-columns: repeat(7, 36px);
}
@media(min-width:1100px){
  .cal-grid{ grid-template-columns: repeat(7, 40px); }
}
.wd{ text-align:center; font-size:.75rem; opacity:.6; }
.blank{ height:36px; }
.cal-day{
  height:36px; border-radius:10px; border:1px solid #e8eef3;
  background:#fff; display:grid; place-items:center; cursor:pointer;
}
.cal-day.today{ box-shadow:0 0 0 2px rgba(80,189,189,.15) inset; border-color:#50bdbd; }
.cal-day.selected{ background:#e6f5ff; border-color:#85b6e0; }

/* Botón bajo el calendario */
.btn-outline{
  margin-top:8px;
  background:#f5f9ff; color:#2b3a44;
  border:1px solid #e3ecf6; border-radius:999px;
  padding:.5rem 1rem; cursor:pointer; font-weight:600;
}

/* ===== Form ===== */
.form-title{ margin:0 0 10px; color:#2b3a44; font-weight:700; }
.chips{ display:flex; flex-wrap:wrap; gap:8px; margin-bottom:10px; }
.chip{
  background:#f5f9ff; border:1px solid #e3ecf6; color:#2b3a44;
  border-radius:999px; padding:.35rem .7rem; font-weight:600; cursor:pointer;
}
.chip.active{ background:#85b6e0; color:#fff; border-color:#85b6e0; }

.area{
  width:100%; border:1px solid #e3ecf6; border-radius:12px;
  min-height:170px; padding:10px 12px; resize:vertical;
  font:inherit; color:#273845; background:#fff;
}
.actions{ display:flex; justify-content:flex-end; margin-top:10px; }
.btn{
  background:#85b6e0; color:#fff; border:none; border-radius:12px;
  padding:.55rem 1rem; font-weight:700; cursor:pointer;
  box-shadow:0 6px 14px rgba(133,182,224,.35);
}
</style>
