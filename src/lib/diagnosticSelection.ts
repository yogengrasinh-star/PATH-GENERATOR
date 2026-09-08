import { diagnosticQuestions } from '../data/diagnosticQuestions'
import { questionBank } from '../data/questions'
import type { Difficulty, Goal, Question, QuestionType } from '../types'

const passProfile: Difficulty[] = [...Array(21).fill('easy'), ...Array(7).fill('medium'), ...Array(2).fill('hard')] as Difficulty[]
const scoreProfile: Difficulty[] = [...Array(6).fill('easy'), ...Array(17).fill('medium'), ...Array(7).fill('hard')] as Difficulty[]
const typeOrder: QuestionType[] = ['standard-mcq', 'concept-identification', 'scenario', 'code-output', 'error-identification', 'example-selection', 'fill-in-the-blank', 'sequence-order', 'true-false', 'match-concept']

const inferType = (question: Question, index: number): QuestionType => {
  if (question.questionType) return question.questionType
  if (question.prompt.includes('`')) return 'code-output'
  if (/true or false/i.test(question.prompt)) return 'true-false'
  if (/which statement|what is|what does|which term/i.test(question.prompt)) return index % 4 === 0 ? 'concept-identification' : 'standard-mcq'
  return typeOrder[index % typeOrder.length]
}

const prerequisiteFor = (question: Question) => question.prerequisite ?? ({ Encapsulation: 'Classes & Objects', Inheritance: 'Classes & Objects', Polymorphism: 'Inheritance', Normalization: 'Relational tables', Joins: 'Relational tables', Routing: 'IP Addressing', Subnetting: 'Binary Numbers', 'Dynamic Programming': 'Recursion', Trees: 'Recursion', Graphs: 'Trees', Deadlocks: 'Process Management' }[question.topic] ?? question.topic)

const enrich = (question: Question, index: number): Question => ({ ...question, questionType: inferType(question, index), prerequisite: prerequisiteFor(question), explanation: question.explanation ?? `${question.options[question.correctIndex]} is correct because it best matches the defining concept tested in ${question.topic}.` })

const rotate = <T,>(items: T[], offset: number) => items.length ? items.slice(offset % items.length).concat(items.slice(0, offset % items.length)) : items

export function buildDiagnosticQueue(subjectIds: string[], goal: Goal): Question[] {
  const candidates = [...questionBank, ...diagnosticQuestions].filter(question => subjectIds.includes(question.subjectId)).map(enrich)
  const profile = goal === 'score80' ? scoreProfile : passProfile
  const used = new Set<string>(); const queue: Question[] = []
  profile.forEach((difficulty, position) => {
    const available = candidates.filter(question => !used.has(question.id) && question.difficulty === difficulty)
    const fallback = candidates.filter(question => !used.has(question.id))
    const pool = available.length ? available : fallback
    const selected = rotate(pool, position).find(question => !used.has(question.id))
    if (selected) { used.add(selected.id); queue.push(selected) }
  })
  return queue
}