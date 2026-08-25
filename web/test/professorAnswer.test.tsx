import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ProfessorAnswer } from '../src/components/ProfessorAnswer.tsx'

test('renderiza a resposta Markdown sem expor a sintaxe ao usuário', () => {
  const html = renderToStaticMarkup(
    <ProfessorAnswer>{'## Conceito\n\nUse **diversificação**:\n\n- ações\n- renda fixa'}</ProfessorAnswer>,
  )

  assert.match(html, /<h2>Conceito<\/h2>/)
  assert.match(html, /<strong>diversificação<\/strong>/)
  assert.match(html, /<li>ações<\/li>/)
  assert.doesNotMatch(html, /\*\*/)
})

test('não interpreta HTML bruto devolvido pelo modelo', () => {
  const html = renderToStaticMarkup(<ProfessorAnswer>{'<script>alert(1)</script>'}</ProfessorAnswer>)

  assert.doesNotMatch(html, /<script>/)
  assert.match(html, /&lt;script&gt;/)
})
