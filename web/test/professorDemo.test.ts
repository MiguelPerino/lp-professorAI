import assert from 'node:assert/strict'
import test from 'node:test'
import { demoAssets, getStandardAnswer, standardAnswerPreview, standardQuestionKey, standardQuestions } from '../src/lib/professorDemo.ts'

test('mantém as quatro combinações de ativo e pergunta prontas', async () => {
  assert.equal(demoAssets.length, 2)
  assert.equal(standardQuestions.length, 2)

  for (const asset of demoAssets) {
    for (const question of standardQuestions) {
      const answer = await getStandardAnswer(asset.ticker, question.key)
      assert.equal(answer.ticker, asset.ticker)
      assert.equal(answer.questionKey, question.key)
      assert.match(answer.answerMarkdown, new RegExp(asset.ticker))
      assert.ok(answer.investigationHint.length > 40)
    }
  }
})

test('reconhece apenas as duas perguntas padrão exatas', () => {
  assert.equal(standardQuestionKey(` ${standardQuestions[0].text} `), 'profit_but_stock_fell')
  assert.equal(standardQuestionKey('Devo comprar?'), null)
  assert.equal(standardAnswerPreview('ITUB4', 'high_pe_expensive').assetName, 'Itaú Unibanco PN')
})
