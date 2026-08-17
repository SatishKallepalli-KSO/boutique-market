import { Link, useLocation } from 'react-router-dom'
import { DOC_SECTIONS } from './docsContent'

function inline(text: string) {
  const parts: (string | { type: 'code' | 'strong' | 'link'; text: string; href?: string })[] = []
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g
  let last = 0
  let match: RegExpExecArray | null
  while ((match = re.exec(text))) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    const token = match[0]
    if (token.startsWith('**')) parts.push({ type: 'strong', text: token.slice(2, -2) })
    else if (token.startsWith('`')) parts.push({ type: 'code', text: token.slice(1, -1) })
    else {
      const link = token.match(/\[([^\]]+)\]\(([^)]+)\)/)
      if (link?.[1] && link[2]) parts.push({ type: 'link', text: link[1], href: link[2] })
    }
    last = match.index + token.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.map((part, index) => {
    if (typeof part === 'string') return <span key={index}>{part}</span>
    if (part.type === 'code') return <code key={index}>{part.text}</code>
    if (part.type === 'strong') return <strong key={index}>{part.text}</strong>
    if (part.href?.startsWith('/'))
      return (
        <Link key={index} to={part.href}>
          {part.text}
        </Link>
      )
    return (
      <a key={index} href={part.href} target={part.href?.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
        {part.text}
      </a>
    )
  })
}

function Block({ text }: { text: string }) {
  if (text.startsWith('|')) {
    const rows = text
      .trim()
      .split('\n')
      .filter((row) => !/^\|?\s*-+/.test(row))
      .map((row) =>
        row
          .split('|')
          .slice(1, -1)
          .map((cell) => cell.trim()),
      )
    const [head, ...body] = rows
    if (!head) return <p>{inline(text)}</p>
    return (
      <div className="docs-table-wrap">
        <table className="docs-table">
          <thead>
            <tr>
              {head.map((cell, i) => (
                <th key={i}>{inline(cell)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{inline(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  return <p>{inline(text)}</p>
}

function Markdown({ body }: { body: string }) {
  const chunks: { kind: 'code' | 'text'; value: string }[] = []
  const fence = /```(\w+)?\n([\s\S]*?)```/g
  let last = 0
  let match: RegExpExecArray | null
  while ((match = fence.exec(body))) {
    if (match.index > last) chunks.push({ kind: 'text', value: body.slice(last, match.index) })
    chunks.push({ kind: 'code', value: (match[2] ?? '').trim() })
    last = match.index + match[0].length
  }
  if (last < body.length) chunks.push({ kind: 'text', value: body.slice(last) })

  return (
    <>
      {chunks.map((chunk, index) => {
        if (chunk.kind === 'code') {
          return (
            <pre key={index}>
              <code>{chunk.value}</code>
            </pre>
          )
        }
        return chunk.value
          .trim()
          .split(/\n{2,}/)
          .map((block, i) => {
            const heading = block.match(/^(#{2,3})\s+(.*)$/)
            if (heading) {
              const Tag = heading[1] === '##' ? 'h3' : 'h4'
              return <Tag key={`${index}-${i}`}>{heading[2]}</Tag>
            }
            return <Block key={`${index}-${i}`} text={block} />
          })
      })}
    </>
  )
}

export function DocsPage() {
  const location = useLocation()
  const active = location.hash.replace('#', '') || 'start'

  return (
    <main className="docs">
      <aside className="docs-nav">
        <p className="eyebrow">Study guide</p>
        <h1>Docs</h1>
        <nav>
          {DOC_SECTIONS.map((section) => (
            <a key={section.id} className={active === section.id ? 'on' : ''} href={`#${section.id}`}>
              {section.title}
            </a>
          ))}
        </nav>
        <p>
          <a className="btn ghost" href="/openapi.yaml">
            OpenAPI YAML
          </a>
        </p>
      </aside>
      <article className="docs-prose">
        {DOC_SECTIONS.map((section) => (
          <section key={section.id} id={section.id}>
            <h2>{section.title}</h2>
            <Markdown body={section.body} />
          </section>
        ))}
      </article>
    </main>
  )
}
