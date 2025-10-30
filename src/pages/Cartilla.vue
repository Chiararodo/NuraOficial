<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { supabase } from '@/composables/useSupabase'

const profesionales = ref([])

onMounted(async () => {
  const { data, error } = await supabase
    .from('professionals')
    .select('*')
    .order('name')
  if (error) console.error(error)
  else profesionales.value = data
})
</script>

<template>
  <section class="p-4">
    <h2 class="text-xl font-semibold mb-3">Cartilla de profesionales</h2>
    <ul>
      <li v-for="p in profesionales" :key="p.id" class="p-3 bg-white shadow mb-2 rounded-xl">
        <strong>{{ p.name }}</strong><br>
        <small>{{ p.specialty }}</small>
      </li>
    </ul>
  </section>
</template>
