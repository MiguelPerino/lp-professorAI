import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export function ProfessorAnswer({ children }: { children: string }) {
  const normalizedAnswer = children.replace(/\\n/g, '\n')

  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{normalizedAnswer}</ReactMarkdown>
}

export default ProfessorAnswer
