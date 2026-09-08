import { prerequisiteGraph, subjects } from '../data/catalog'
import type { AssessmentSummary, QuestionResult, RoadmapNode, SubjectStat, TopicStat, ProctorEvent, IntegrityCounts, DifficultyStat } from '../types'

const subjectStatus = (accuracy: number): SubjectStat['status'] => accuracy >= 85 ? 'Excellent' : accuracy >= 70 ? 'Strong' : accuracy >= 55 ? 'Good' : accuracy >= 40 ? 'Developing' : 'Weak'
const topicStatus = (accuracy: number): TopicStat['status'] => accuracy >= 70 ? 'Strong' : accuracy >= 55 ? 'Good' : accuracy >= 40 ? 'Developing' : 'Weak'

export function buildSummary(results: QuestionResult[], proctorEvents: ProctorEvent[]): AssessmentSummary {
  const totalQuestions = results.length
  const correct = results.filter(result => result.correct).length
  const responseTimes = results.map(result => result.responseTimeSec)
  const bySubject = new Map<string, QuestionResult[]>()
  results.forEach(result => bySubject.set(result.subjectId, [...(bySubject.get(result.subjectId) ?? []), result]))
  const difficultyStats: DifficultyStat[] = (['easy', 'medium', 'hard'] as const).map(difficulty => { const difficultyResults = results.filter(result => result.difficulty === difficulty); const difficultyCorrect = difficultyResults.filter(result => result.correct).length; return { difficulty, total: difficultyResults.length, correct: difficultyCorrect, accuracy: difficultyResults.length ? Math.round(difficultyCorrect / difficultyResults.length * 100) : 0 } })
  const prerequisiteResults = new Map<string, { topic: string; correct: number; total: number }>()
  results.forEach(result => { if (!result.prerequisite) return; const key = `${result.prerequisite}|${result.topic}`; const entry = prerequisiteResults.get(key) ?? { topic: result.topic, correct: 0, total: 0 }; entry.total += 1; if (result.correct) entry.correct += 1; prerequisiteResults.set(key, entry) })
  const prerequisiteGaps = [...prerequisiteResults.entries()].map(([key, value]) => { const [prerequisite] = key.split('|'); return { prerequisite, topic: value.topic, accuracy: Math.round(value.correct / value.total * 100) } }).filter(gap => gap.accuracy < 55).sort((a, b) => a.accuracy - b.accuracy)
  const subjectStats = [...bySubject.entries()].map(([subjectId, subjectResults]) => {
    const accuracy = Math.round(subjectResults.filter(result => result.correct).length / subjectResults.length * 100)
    const byTopic = new Map<string, QuestionResult[]>()
    subjectResults.forEach(result => byTopic.set(result.topic, [...(byTopic.get(result.topic) ?? []), result]))
    const topics = [...byTopic.entries()].map(([topic, topicResults]) => { const topicAccuracy = Math.round(topicResults.filter(result => result.correct).length / topicResults.length * 100); return { topic, subjectId, accuracy: topicAccuracy, status: topicStatus(topicAccuracy) } }).sort((a, b) => b.accuracy - a.accuracy)
    return { subjectId, subjectName: subjects.find(subject => subject.id === subjectId)?.name ?? subjectId, accuracy, status: subjectStatus(accuracy), topics }
  }).sort((a, b) => b.accuracy - a.accuracy)
  const integrity: IntegrityCounts = { tabSwitches: proctorEvents.filter(event => event.type === 'tab-switch').length, copyAttempts: proctorEvents.filter(event => event.type === 'copy-attempt').length, pasteAttempts: proctorEvents.filter(event => event.type === 'paste-attempt').length, cutAttempts: proctorEvents.filter(event => event.type === 'cut-attempt').length, contextMenuAttempts: proctorEvents.filter(event => event.type === 'context-menu-attempt').length, total: proctorEvents.length }
  return { totalQuestions, correct, accuracy: totalQuestions ? Math.round(correct / totalQuestions * 100) : 0, avgResponseTime: responseTimes.length ? Math.round(responseTimes.reduce((sum, value) => sum + value, 0) / responseTimes.length * 10) / 10 : 0, fastestResponse: responseTimes.length ? Math.min(...responseTimes) : 0, slowestResponse: responseTimes.length ? Math.max(...responseTimes) : 0, timeouts: results.filter(result => result.timedOut).length, subjectStats, difficultyStats, prerequisiteGaps, proctorEvents, integrity }
}

const practiceLabelForGoal = (goal: string) => goal === 'placement' ? 'Interview-Style Practice' : goal === 'competitive' ? 'Timed Speed Practice' : goal === 'score80' ? 'Extra Practice Set' : goal === 'master' ? 'Advanced Practice' : 'Exam-Style Revision'

export function generateRoadmap(summary: AssessmentSummary, goal = 'pass'): RoadmapNode[] {
  // TODO: Replace this deterministic engine with the Gemini-backed recommender in the production build.
  const topicAccuracy = new Map<string, number>()
  summary.subjectStats.forEach(subject => subject.topics.forEach(topic => topicAccuracy.set(topic.topic, topic.accuracy)))
  const weakTopics = [...topicAccuracy.entries()].filter(([, accuracy]) => accuracy < 55).sort((a, b) => a[1] - b[1])
  const nodes: RoadmapNode[] = []; const seen = new Set<string>()
  const addPrereqChain = (topic: string, forTopic: string) => { (prerequisiteGraph[topic] ?? []).forEach(prerequisite => { if (seen.has(prerequisite)) return; if (!topicAccuracy.has(prerequisite) || (topicAccuracy.get(prerequisite) ?? 100) < 55) { addPrereqChain(prerequisite, forTopic); seen.add(prerequisite); nodes.push({ id: prerequisite, title: `${prerequisite} — Recovery`, reason: `Prerequisite gap found behind "${forTopic}"`, status: 'recovery' }) } }) }
  summary.prerequisiteGaps.forEach(gap => { if (seen.has(gap.prerequisite)) return; seen.add(gap.prerequisite); nodes.push({ id: gap.prerequisite, title: `${gap.prerequisite} — Recovery`, reason: `Possible prerequisite gap behind "${gap.topic}"`, status: 'recovery' }) })
  weakTopics.forEach(([topic, accuracy]) => { addPrereqChain(topic, topic); if (!seen.has(topic)) { seen.add(topic); nodes.push({ id: topic, title: `${topic} — Core`, reason: `Weak topic — scored ${accuracy}%`, status: 'core' }); nodes.push({ id: `${topic}-practice`, title: `${topic} — ${practiceLabelForGoal(goal)}`, reason: 'Reinforcement before reassessment', status: 'practice' }) } })
  nodes.push({ id: 'milestone', title: 'Milestone Assessment', reason: 'Confirms mastery before unlocking the next module', status: 'milestone' })
  return nodes
}