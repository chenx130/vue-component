<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { render } from './utils'

export default defineComponent({
  props: {
    content: {
      type: String,
      default: '',
    },
  },

  setup(props, ctx) {
    const html = ref<string>()
    const loading = ref(false)

    watch(
      () => props.content,
      async () => {
        html.value = ''
        if (!props.content) return
        loading.value = true
        try {
          html.value = `<div class="md">${await render(props.content)}</div>`
        } finally {
          loading.value = false
        }
      },
      { immediate: true }
    )

    return () => {
      return ctx.slots.default!({
        loading: loading.value,
        html: html.value,
      })
    }
  },
})
</script>

<style>
@import url('./themes/github.css');
.md pre {
  overflow: auto;
  overflow-wrap: break-word;
  padding: 2rem;
  margin-top: 1rem;
  margin-bottom: 3rem;
  white-space: pre-wrap;
}

.md pre code {
  white-space: pre-wrap;
  font-size: 14px;
}
.md h1,
.md h2 {
  font-weight: normal;
  font-size: 1.5rem;
}
.md img {
  max-width: 100%;
  margin-top: 1rem;
  margin-bottom: 3rem;
}
</style>
