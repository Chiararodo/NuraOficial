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

    <!-- BIBLIOTECA -->
    <section v-else-if="tab === 'biblioteca'" class="section">
      <div v-if="loading.books" class="loading">Cargando biblioteca…</div>
      <p v-else-if="!books.length" class="empty">Aún no hay libros recomendados.</p>

      <div class="grid">
        <article
          v-for="b in books"
          :key="b.id"
          class="card book-card"
          @click="openBook(b)"
        >
          <div class="book-thumb">
            <img :src="publicUrl(b.cover_path)" :alt="b.title" />
          </div>
          <h3 class="title">{{ b.title }}</h3>
        </article>
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

      <div class="grid">
        <article
          v-for="g in guides"
          :key="g.id"
          class="card guide-card"
          @click="openGuide(g)"
        >
          <div class="guide-thumb">
            <img :src="publicUrl(g.cover_path)" :alt="g.title" />
          </div>
          <div class="guide-body">
            <h3 class="guide-title">{{ g.title }}</h3>
            <p class="guide-summary">{{ g.description }}</p>

            <div class="guide-actions">
              <button class="btn" @click.stop="openGuide(g)">Continuar</button>
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
          <video v-if="videoSrc" :src="videoSrc" controls playsinline></video>
        </div>
        <h3 class="modal-title">{{ currentVideo?.title }}</h3>
        <p class="modal-desc" v-if="currentVideo?.description">{{ currentVideo?.description }}</p>
      </div>
    </dialog>

    <!-- MODAL PDF (Libros / Guías) -->
    <dialog ref="pdfDlg" class="modal" @close="currentPdf = null">
      <div v-if="currentPdf" class="modal-card">
        <button class="close" @click="pdfDlg?.close()">×</button>
        <h3 class="modal-title">{{ currentPdf?.title }}</h3>
        <p class="modal-desc" v-if="currentPdf?.description">{{ currentPdf?.description }}</p>
        <div class="pdf">
          <iframe v-if="pdfSrc" :src="pdfSrc" title="Documento"></iframe>
        </div>
      </div>
    </dialog>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from '@/composables/useSupabase'
import { useAuthStore } from '@/store/auth'

const TABS = [
  { key: 'videos', label: 'Videos' },
  { key: 'biblioteca', label: 'Bibliotecas' },
  { key: 'guias', label: 'Guías' },
] as const
type TabKey = typeof TABS[number]['key']
const tab = ref<TabKey>('videos')

type VideoRow = {
  id: string
  title: string
  description: string | null
  cover_path: string | null
  file_path: string
  duration_seconds: number | null
}
type BookRow = {
  id: string
  title: string
  cover_path: string | null
  file_path: string
}
type ArticleRow = {
  id: string
  title: string
  summary: string | null
  cover_path: string | null
  read_minutes: number | null
}
type GuideRow = {
  id: string
  title: string
  description: string | null
  cover_path: string | null
  file_path: string
}

const videos = ref<VideoRow[]>([])
const books = ref<BookRow[]>([])
const articles = ref<ArticleRow[]>([])
const guides = ref<GuideRow[]>([])
const loading = ref({ videos: false, books: false, guides: false })

const auth = useAuthStore()
const progressMap = ref<Map<string, number>>(new Map())

const BUCKET = 'nura-content'
function publicUrl(path?: string | null) {
  if (!path) return ''
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}
async function signedUrl(path: string, expSeconds = 60 * 60 * 12) {
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, expSeconds)
  return data?.signedUrl ?? ''
}

async function loadVideos() {
  loading.value.videos = true
  const { data, error } = await supabase
    .from('videos')
    .select('id,title,description,cover_path,file_path,duration_seconds')
    .order('created_at', { ascending: false })
  if (!error && data) videos.value = data as VideoRow[]
  loading.value.videos = false
}

async function loadBooksAndArticles() {
  loading.value.books = true
  const { data: b } = await supabase
    .from('books') // si tu tabla se llama library_items, cambiá este nombre
    .select('id,title,cover_path,file_path')
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
  const { data: g, error } = await supabase
    .from('guides')
    .select('id,title,description,cover_path,file_path')
    .order('created_at', { ascending: false })
  if (error) console.error('Error loading guides:', error)
  guides.value = (g as GuideRow[]) || []

  if (auth.user) {
    const { data: p } = await supabase
      .from('guide_progress')
      .select('guide_id, percent')
      .eq('user_id', auth.user.id)
    progressMap.value = new Map((p as any[] | null)?.map(r => [r.guide_id, r.percent]) ?? [])
  }
  loading.value.guides = false
}

const videoDlg = ref<HTMLDialogElement | null>(null)
const currentVideo = ref<VideoRow | null>(null)
const videoSrc = ref('')

async function openVideo(v: VideoRow) {
  currentVideo.value = v
  videoSrc.value = publicUrl(v.file_path) || await signedUrl(v.file_path)
  videoDlg.value?.showModal()
}

const pdfDlg = ref<HTMLDialogElement | null>(null)
const currentPdf = ref<{ title: string; description?: string | null } | null>(null)
const pdfSrc = ref('')

async function openBook(b: BookRow) {
  currentPdf.value = { title: b.title }
  pdfSrc.value = publicUrl(b.file_path) || await signedUrl(b.file_path)
  pdfDlg.value?.showModal()
}

async function openGuide(g: GuideRow) {
  currentPdf.value = { title: g.title, description: g.description }
  pdfSrc.value = publicUrl(g.file_path) || await signedUrl(g.file_path)
  pdfDlg.value?.showModal()
}

onMounted(async () => {
  await loadVideos()
  await loadBooksAndArticles()
  await loadGuides()
})

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
.page-head { display: grid; gap: 15px; margin-bottom: 12px; }
h2 { margin: 0; padding: 10px; }

.tabs {
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}
.tab {
  padding: 10px 18px;
  border-radius: 999px;
  background: #85B6E0;
  border: none;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}
.tab:hover {
  background: #50bdbd;
  color: #fff;
  transform: translateY(-1px);
}
.tab.active {
  background: #50bdbd;
  color: #fff;
  box-shadow: 0 0 0 2px rgba(80, 189, 189, 0.15) inset;
}

/* Grid */
.grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

/* Card hover */
.card {
  background: #e4f3f3;
  border-radius: 18px;
  box-shadow: 0 10px 26px rgba(0,0,0,.08);
  padding: 12px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease, background 0.2s ease;
}
.card:hover {
  background: #f1fbfb;
  transform: translateY(-3px);
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.12);
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
.book-card .book-thumb {
  border-radius: 14px; overflow: hidden; background: #fff;
  aspect-ratio: 7 / 10;
  display: grid; place-items: center;
}
.book-card img {
  width: 100%; height: 100%; object-fit: cover; display: block;
}

/* Guías */
.guide-card { display: grid; grid-template-rows: auto 1fr; gap: 12px; }
.guide-thumb { border-radius: 14px; overflow: hidden; aspect-ratio: 7 / 10; background: #fff; }
.guide-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.guide-title { margin: 0 6px 4px; }
.guide-summary { margin: 0 6px 8px; opacity: .9; }

.guide-actions {
  display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: 10px;
  padding: 0 6px 6px;
}
.btn { padding: 8px 12px; border-radius: 999px; background: #50bdbd; color: #fff; border: none; }
.progress { height: 10px; background: #e8eef3; border-radius: 999px; overflow: hidden; }
.progress .bar { height: 100%; background: #85b6e0; }
.pct { opacity: .8; }

.section { display: grid; gap: 14px; }

.articles { display: grid; gap: 12px; }
.article-card {
  display: grid; grid-template-columns: 96px 1fr; gap: 12px;
  padding: 12px; border-radius: 14px; background: #eaf6ff; border: 1px solid #e0edf5;
}
.art-cover { width: 96px; height: 96px; object-fit: cover; border-radius: 10px; }
.art-title { margin: 0 0 4px; }
.art-summary { margin: 0 0 4px; opacity: .85; }

.loading, .empty { opacity: .75; }

.modal::backdrop { background: rgba(0,0,0,.35); }
.modal { border: none; padding: 0; border-radius: 18px; width: min(900px, 96vw); }
.modal-card { position: relative; background: #fff; border-radius: 18px; overflow: hidden; }
.close { position: absolute; right: 8px; top: 6px; font-size: 24px; background: red; border: none; cursor: pointer; }
.player { background: #000; }
.player video { width: 100%; height: auto; display: block; }
.modal-title { margin: 12px 14px 4px; }
.modal-desc  { margin: 0 14px 14px; opacity: .9; }
.pdf { height: 70vh; }
.pdf iframe { width: 100%; height: 100%; border: 0; }
</style>
