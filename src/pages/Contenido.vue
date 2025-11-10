<template>
  <main class="contenido">
    <header class="page-head">
      <h2>Contenido educativo</h2>
      <nav class="tabs">
        <button
          v-for="t in TABS"
          :key="t.key"
          class="tab"
          :class="{ active: tab === t.key }"
          @click="tab = t.key"
        >
          {{ t.label }}
        </button>
      </nav>
    </header>

    <!-- VIDEOS -->
    <section v-if="tab === 'videos'" class="section">
      <div v-if="loading.videos" class="loading">Cargando videos…</div>
      <p v-else-if="!videos.length" class="empty">Aún no hay videos.</p>

      <div class="grid">
        <article
          v-for="v in videos"
          :key="v.id"
          class="card video-card"
          @click="openVideo(v)"
        >
          <div class="thumb">
            <img :src="publicUrl(v.cover_path)" :alt="v.title" />
            <span class="duration" v-if="v.duration_seconds">{{ mmss(v.duration_seconds) }}</span>
          </div>
          <h3 class="title">{{ v.title }}</h3>
        </article>
      </div>
    </section>

    <!-- BIBLIOTECAS -->
    <section v-else-if="tab === 'biblioteca'" class="section">
      <div v-if="loading.books" class="loading">Cargando biblioteca…</div>
      <p v-else-if="!books.length" class="empty">Aún no hay libros recomendados.</p>

      <div class="shelf">
        <figure v-for="b in books" :key="b.id" class="book">
          <img :src="publicUrl(b.cover_path)" :alt="b.title" />
          <figcaption>{{ b.title }}</figcaption>
        </figure>
      </div>

      <h3 class="subhead" v-if="articles.length">Artículos destacados</h3>
      <div class="articles" v-if="articles.length">
        <article v-for="a in articles" :key="a.id" class="article-card">
          <img class="art-cover" :src="publicUrl(a.cover_path)" :alt="a.title" />
          <div class="art-body">
            <h4 class="art-title">{{ a.title }}</h4>
            <p class="art-summary">{{ a.summary }}</p>
            <small v-if="a.read_minutes">Lectura {{ a.read_minutes }}m</small>
          </div>
        </article>
      </div>
    </section>

    <!-- GUÍAS -->
    <section v-else-if="tab === 'guias'" class="section">
      <div v-if="loading.guides" class="loading">Cargando guías…</div>
      <p v-else-if="!guides.length" class="empty">Aún no hay guías.</p>

      <div class="guides">
        <article v-for="g in guides" :key="g.id" class="guide-card">
          <img class="guide-cover" :src="publicUrl(g.cover_path)" :alt="g.title" />
          <div class="guide-body">
            <h3 class="guide-title">{{ g.title }}</h3>
            <p class="guide-summary">{{ g.summary }}</p>

            <div class="guide-actions">
              <button class="btn" @click="openGuide(g)">Continuar</button>
              <div class="progress" v-if="progressMap.get(g.id) !== undefined">
                <div class="bar" :style="{ width: (progressMap.get(g.id) ?? 0) + '%' }"></div>
              </div>
              <small class="pct" v-if="progressMap.get(g.id) !== undefined">
                {{ progressMap.get(g.id) }}%
              </small>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- MODAL VIDEO -->
    <dialog ref="videoDlg" class="modal" @close="currentVideo = null">
      <div v-if="currentVideo" class="modal-card">
        <button class="close" @click="videoDlg?.close()">×</button>
        <div class="player">
          <video
            v-if="videoSrc"
            :src="videoSrc"
            controls
            playsinline
          ></video>
        </div>
        <h3 class="modal-title">{{ currentVideo?.title }}</h3>
        <p class="modal-desc" v-if="currentVideo?.description">{{ currentVideo?.description }}</p>
      </div>
    </dialog>

    <!-- MODAL GUÍA (PDF) -->
    <dialog ref="guideDlg" class="modal" @close="currentGuide = null">
      <div v-if="currentGuide" class="modal-card">
        <button class="close" @click="guideDlg?.close()">×</button>
        <h3 class="modal-title">{{ currentGuide?.title }}</h3>
        <p class="modal-desc" v-if="currentGuide?.summary">{{ currentGuide?.summary }}</p>
        <div class="pdf">
          <iframe
            v-if="guideSrc"
            :src="guideSrc"
            title="Guía"
          ></iframe>
        </div>
      </div>
    </dialog>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from '@/composables/useSupabase'
import { useAuthStore } from '@/store/auth'

/** ----- UI Tabs ------ */
const TABS = [
  { key: 'videos', label: 'Videos' },
  { key: 'biblioteca', label: 'Bibliotecas' },
  { key: 'guias', label: 'Guías' },
] as const
type TabKey = typeof TABS[number]['key']
const tab = ref<TabKey>('videos')

/** ----- Tipos ------ */
type VideoRow = {
  id: string
  title: string
  description: string | null
  cover_path: string | null
  file_path: string
  duration_seconds: number | null
}
type BookRow = { id: string; title: string; cover_path: string | null }
type ArticleRow = {
  id: string; title: string; summary: string | null; cover_path: string | null; read_minutes: number | null
}
type GuideRow = { id: string; title: string; summary: string | null; cover_path: string | null; pdf_path: string }

/** ----- Estado ------ */
const videos = ref<VideoRow[]>([])
const books = ref<BookRow[]>([])
const articles = ref<ArticleRow[]>([])
const guides = ref<GuideRow[]>([])
const loading = ref({ videos: false, books: false, guides: false })

/** ----- Progress de guías por usuario ------ */
const auth = useAuthStore()
const progressMap = ref<Map<string, number>>(new Map())

/** ----- Helpers Storage ------ */
const BUCKET = 'nura-content' // el nombre que vas a crear en Storage
function publicUrl(path: string | null | undefined) {
  if (!path) return ''
  // Si el bucket es público:
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
  // Si prefirieras privado, cambiamos a signedUrl (ver notas abajo).
}
async function signedUrl(path: string, expSeconds = 60 * 60 * 12) {
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, expSeconds)
  return data?.signedUrl ?? ''
}

/** ----- Carga de datos ------ */
async function loadVideos() {
  loading.value.videos = true
  const { data, error } = await supabase
    .from('videos')
    .select('id,title,description,cover_path,file_path,duration_seconds')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  if (!error && data) videos.value = data as VideoRow[]
  loading.value.videos = false
}
async function loadBooksAndArticles() {
  loading.value.books = true
  const { data: b } = await supabase
    .from('library_items')
    .select('id,title,cover_path')
    .order('created_at', { ascending: false })
  books.value = (b as BookRow[]) || []

  const { data: a } = await supabase
    .from('articles')
    .select('id,title,summary,cover_path,read_minutes')
    .order('created_at', { ascending: false })
  articles.value = (a as ArticleRow[]) || []
  loading.value.books = false
}
async function loadGuides() {
  loading.value.guides = true
  const { data: g } = await supabase
    .from('guides')
    .select('id,title,summary,cover_path,pdf_path')
    .order('created_at', { ascending: false })
  guides.value = (g as GuideRow[]) || []

  // progreso del usuario (opcional)
  if (auth.user) {
    const { data: p } = await supabase
      .from('guide_progress')
      .select('guide_id, percent')
      .eq('user_id', auth.user.id)
    progressMap.value = new Map((p as any[] | null)?.map(r => [r.guide_id, r.percent]) ?? [])
  }
  loading.value.guides = false
}

/** ----- Modal de video ------ */
const videoDlg = ref<HTMLDialogElement | null>(null)
const currentVideo = ref<VideoRow | null>(null)
const videoSrc = ref('')

async function openVideo(v: VideoRow) {
  currentVideo.value = v
  // Si el bucket es público:
  videoSrc.value = publicUrl(v.file_path)
  // Si el bucket es privado, usá: videoSrc.value = await signedUrl(v.file_path)
  videoDlg.value?.showModal()
}

/** ----- Modal de guía (PDF/Iframe) ------ */
const guideDlg = ref<HTMLDialogElement | null>(null)
const currentGuide = ref<GuideRow | null>(null)
const guideSrc = ref('')

async function openGuide(g: GuideRow) {
  currentGuide.value = g
  // Si el bucket es público:
  guideSrc.value = publicUrl(g.pdf_path)
  // Si fuera privado: guideSrc.value = await signedUrl(g.pdf_path)
  guideDlg.value?.showModal()
}

onMounted(async () => {
  await loadVideos()
  await loadBooksAndArticles()
  await loadGuides()
})

/** ----- Utils ------ */
function mmss(total: number) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.contenido {
  background: #fff;
  padding: 24px 18px 48px;
  max-width: 1100px;
  margin: 0 auto;
}

/* Head + Tabs */
.page-head { display: grid; gap: 10px; margin-bottom: 12px; }
h2 { margin: 0; color: #2b6b6b; }
.tabs { display: flex; gap: 14px; flex-wrap: wrap; }
.tab {
  padding: 10px 18px; border-radius: 999px;
  background: #e6f4f4; border: none; cursor: pointer;
}
.tab.active { background: #50bdbd; color: #fff; }

/* Grid videos */
.grid { display: grid; gap: 18px; }
@media (min-width: 900px){
  .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
.card {
  background: #e4f3f3;
  border-radius: 18px;
  box-shadow: 0 10px 26px rgba(0,0,0,.08);
  padding: 12px;
  cursor: pointer;
}
.video-card .thumb {
  position: relative; border-radius: 14px; overflow: hidden; background: #f6fbff;
  aspect-ratio: 16 / 9;
}
.video-card .thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.duration {
  position: absolute; right: 8px; bottom: 8px;
  font-size: .8rem; padding: 4px 6px; border-radius: 6px; background: rgba(0,0,0,.65); color: #fff;
}
.title { margin: 10px 6px 6px; font-size: 1rem; }

/* Biblioteca */
.section { display: grid; gap: 14px; }
.shelf { display: grid; grid-auto-flow: column; gap: 18px; overflow-x: auto; padding-bottom: 6px; }
.book { width: 140px; text-align: center; }
.book img { width: 100%; height: 200px; object-fit: cover; border-radius: 12px; box-shadow: 0 6px 16px rgba(0,0,0,.1); }
.book figcaption { margin-top: 6px; font-size: .9rem; }

/* Artículos */
.articles { display: grid; gap: 12px; }
.article-card {
  display: grid; grid-template-columns: 96px 1fr; gap: 12px;
  padding: 12px; border-radius: 14px; background: #eaf6ff; border: 1px solid #e0edf5;
}
.art-cover { width: 96px; height: 96px; object-fit: cover; border-radius: 10px; }
.art-title { margin: 0 0 4px; }
.art-summary { margin: 0 0 4px; opacity: .85; }

/* Guías */
.guides { display: grid; gap: 16px; }
.guide-card {
  display: grid; grid-template-columns: 110px 1fr; gap: 14px;
  padding: 14px; border-radius: 16px; background: #eaf6ff; border: 1px solid #e0edf5;
}
.guide-cover { width: 110px; height: 140px; object-fit: cover; border-radius: 12px; }
.guide-title { margin: 0 0 4px; }
.guide-summary { margin: 0 0 8px; opacity: .9; }
.guide-actions { display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 10px; }
.btn { padding: 8px 12px; border-radius: 999px; background: #50bdbd; color: #fff; border: none; }
.progress { height: 10px; background: #e8eef3; border-radius: 999px; overflow: hidden; }
.progress .bar { height: 100%; background: #85b6e0; }
.pct { opacity: .8; }

/* Varios */
.loading, .empty { opacity: .75; }

/* Modal base */
.modal::backdrop { background: rgba(0,0,0,.35); }
.modal { border: none; padding: 0; border-radius: 18px; width: min(900px, 96vw); }
.modal-card { position: relative; background: #fff; border-radius: 18px; overflow: hidden; }
.close { position: absolute; right: 8px; top: 6px; font-size: 24px; background: transparent; border: none; cursor: pointer; }
.player { background: #000; }
.player video { width: 100%; height: auto; display: block; }
.modal-title { margin: 12px 14px 4px; }
.modal-desc  { margin: 0 14px 14px; opacity: .9; }
.pdf { height: 70vh; }
.pdf iframe { width: 100%; height: 100%; border: 0; }
</style>
