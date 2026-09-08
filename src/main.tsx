import { StrictMode, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { createRoot } from 'react-dom/client'
import { AmbientBackground, BranchSelectPage, DiagnosticTestPage, GoalSelectPage, LandingPage, ResultsPage, RoadmapPage, SubjectSelectPage, YearSelectPage } from './screens'
import { buildSummary, generateRoadmap } from './lib/engine'
import type { AssessmentSummary, Branch, Goal, RoadmapNode } from './types'
import './index.css'

type Screen = 'landing' | 'branch' | 'year' | 'subjects' | 'goal' | 'test' | 'results' | 'roadmap'

function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [branch, setBranch] = useState<Branch | null>(null)
  const [year, setYear] = useState<number | null>(null)
  const [subjectIds, setSubjectIds] = useState<string[]>([])
  const [goal, setGoal] = useState<Goal | null>(null)
  const [studyTimeId, setStudyTimeId] = useState('1h')
  const [summary, setSummary] = useState<AssessmentSummary | null>(null)
  const [roadmap, setRoadmap] = useState<RoadmapNode[]>([])

  const restart = () => { setScreen('landing'); setBranch(null); setYear(null); setSubjectIds([]); setGoal(null); setStudyTimeId('1h'); setSummary(null); setRoadmap([]) }
  const page = screen === 'landing' ? <LandingPage onStart={() => setScreen('branch')} /> : screen === 'branch' ? <BranchSelectPage onSelect={value => { setBranch(value); setScreen('year') }} /> : screen === 'year' && branch ? <YearSelectPage branch={branch} onSelect={value => { setYear(value); setScreen('subjects') }} /> : screen === 'subjects' && branch && year ? <SubjectSelectPage branch={branch} year={year} onNext={value => { setSubjectIds(value); setScreen('goal') }} /> : screen === 'goal' ? <GoalSelectPage onNext={(value, time) => { setGoal(value); setStudyTimeId(time); setScreen('test') }} /> : screen === 'test' ? <DiagnosticTestPage subjectIds={subjectIds} goal={goal ?? 'pass'} onComplete={(results, _tabSwitches, events) => { setSummary(buildSummary(results, events)); setScreen('results') }} /> : screen === 'results' && summary ? <ResultsPage summary={summary} onSeeRoadmap={() => { const next = generateRoadmap(summary, goal ?? 'pass'); setRoadmap(next); setScreen('roadmap') }} /> : screen === 'roadmap' ? <RoadmapPage nodes={roadmap} onRestart={restart} /> : <LandingPage onStart={() => setScreen('branch')} />
  void studyTimeId
  return <><AmbientBackground /><AnimatePresence mode="wait">{page}</AnimatePresence></>
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
