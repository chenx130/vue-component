import MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token'
import { getHighlighter, setCDN, BUNDLED_LANGUAGES } from 'shiki'

import type {
  Lang,
  IShikiTheme,
  Highlighter,
  ILanguageRegistration,
} from 'shiki'

export const TYPE = 'shiki_block'

export type ShikiBlockToken = Omit<Token, 'type'> & {
  type: typeof TYPE
  getHighlighter(): Highlighter
}

let md: MarkdownIt | null = null

const walk = (tokens: Token[], cb: (t: Token) => Token | void) => {
  tokens.forEach((t, idx, arr) => {
    if (t.type === 'fence') {
      const token = cb(t)
      if (token) {
        arr[idx] = token
      }
    }

    if (t.children?.length) {
      walk(t.children, cb)
    }
  })
}

function resolveLang(lang: ILanguageRegistration | Lang) {
  return typeof lang === 'string'
    ? BUNDLED_LANGUAGES.find((l) => l.id === lang || l.aliases?.includes(lang))
    : lang
}

export const render = async (content: string): Promise<string> => {
  if (!md) {
    md = new MarkdownIt()
    md.renderer.rules[TYPE] = (tokens, idx) => {
      const token = tokens[idx] as ShikiBlockToken
      const highlighter = token.getHighlighter()
      return highlighter.codeToHtml(token.content, {
        lang: token.info as Lang,
      })
    }
    setCDN('https://unpkg.com/shiki/')
  }

  const tokens = md.parse(content, {})

  const langs = new Set<Lang>()

  let highlighter: Highlighter | undefined

  walk(tokens, (t) => {
    if (t.info && resolveLang(t.info as Lang)) {
      langs.add(t.info as Lang)
      return {
        ...t,
        type: TYPE,
        getHighlighter: () => highlighter!,
      } as ShikiBlockToken
    }
  })

  highlighter = await getHighlighter({
    theme: (
      await import('./themes/github.json')
    ).default as unknown as IShikiTheme,
    langs: Array.from(langs),
  })

  highlighter.setColorReplacements(
    (await import('./themes/github.color-map')).default
  )

  return md.renderer.render(tokens, md.options, {})
}
