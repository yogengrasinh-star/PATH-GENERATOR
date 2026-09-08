export interface Branch { id: string; name: string; icon: string; active: boolean }
export interface Subject { id: string; name: string; branchId: string; year: number }
export type Difficulty = 'easy' | 'medium' | 'hard'
export type QuestionType = 'standard-mcq' | 'concept-identification' | 'scenario' | 'code-output' | 'error-identification' | 'example-selection' | 'fill-in-the-blank' | 'sequence-order' | 'true-false' | 'match-concept'
export interface Question { id: string; subjectId: string; topic: string; subtopic?: string; difficulty: Difficulty; prompt: string; options: string[]; correctIndex: number; explanation?: string; prerequisite?: string; questionType?: QuestionType }
export interface QuestionResult { questionId: string; subjectId: string; topic: string; prerequisite?: string; questionType?: QuestionType; correct: boolean; timedOut: boolean; responseTimeSec: number; difficulty: Difficulty }
export type Goal = 'pass' | 'score80' | 'master' | 'placement' | 'competitive'
export interface StudyTime { id: string; label: string; minutesPerDay: number }
export type ProctorEventType = 'tab-switch' | 'copy-attempt' | 'paste-attempt' | 'cut-attempt' | 'context-menu-attempt'
export interface ProctorEvent { type: ProctorEventType; timestamp: number }
export interface IntegrityCounts { tabSwitches: number; copyAttempts: number; pasteAttempts: number; cutAttempts: number; contextMenuAttempts: number; total: number }
export interface DifficultyStat { difficulty: Difficulty; total: number; correct: number; accuracy: number }
export interface TopicStat { topic: string; subjectId: string; accuracy: number; status: 'Strong' | 'Good' | 'Developing' | 'Weak' }
export interface SubjectStat { subjectId: string; subjectName: string; accuracy: number; status: 'Excellent' | 'Strong' | 'Good' | 'Developing' | 'Weak'; topics: TopicStat[] }
export interface AssessmentSummary { totalQuestions: number; correct: number; accuracy: number; avgResponseTime: number; fastestResponse: number; slowestResponse: number; timeouts: number; subjectStats: SubjectStat[]; difficultyStats: DifficultyStat[]; prerequisiteGaps: { prerequisite: string; topic: string; accuracy: number }[]; proctorEvents: ProctorEvent[]; integrity: IntegrityCounts }
export interface RoadmapNode { id: string; title: string; reason: string; status: 'recovery' | 'core' | 'practice' | 'milestone' }