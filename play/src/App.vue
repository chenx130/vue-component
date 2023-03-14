<script setup lang="ts">
import { ref, watch } from 'vue'
import Markdown from '~/components/markdown'
import demo from './demo.md?raw'

const theme = ref('light')

watch(
  theme,
  (value) => {
    if (value === 'dark') {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  },
  { immediate: true }
)
</script>

<template>
  <Markdown :content="demo" :theme="theme">
    <template #default="{ loading, html }">
      <div v-if="loading">Loading...</div>
      <div v-else v-html="html" class="markdown github"></div>
    </template>
  </Markdown>

  <button @click="theme = theme === 'dark' ? 'light' : 'dark'">
    {{ theme }}
  </button>
</template>
