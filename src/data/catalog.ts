import type { Branch, Goal, StudyTime, Subject } from '../types'

export const branches: Branch[] = [
  { id: 'it', name: 'Information Technology', icon: 'Terminal', active: true }, { id: 'comp', name: 'Computer Engineering', icon: 'Cpu', active: false }, { id: 'mech', name: 'Mechanical Engineering', icon: 'Cog', active: false }, { id: 'civil', name: 'Civil Engineering', icon: 'Building2', active: false },
  { id: 'ee', name: 'Electrical Engineering', icon: 'Zap', active: false }, { id: 'entc', name: 'Electronics & Telecommunication', icon: 'Radio', active: false }, { id: 'aids', name: 'Artificial Intelligence & Data Science', icon: 'BrainCircuit', active: false }, { id: 'aiml', name: 'Artificial Intelligence & Machine Learning', icon: 'Sparkles', active: false },
]
export const years = [1, 2, 3, 4]
export const subjects: Subject[] = [
  { id: 'ds', name: 'Data Structures', branchId: 'it', year: 2 }, { id: 'dbms', name: 'Database Management Systems', branchId: 'it', year: 2 }, { id: 'oop', name: 'Object-Oriented Programming', branchId: 'it', year: 2 }, { id: 'os', name: 'Operating Systems', branchId: 'it', year: 2 }, { id: 'cn', name: 'Computer Networks', branchId: 'it', year: 2 },
]
export const goals: { id: Goal; title: string; description: string }[] = [
  { id: 'pass', title: 'Pass Semester Exam', description: 'Focus on core concepts and the topics most likely to appear on the paper.' }, { id: 'score80', title: 'Score 80%+', description: 'Deeper coverage with extra practice on borderline and weak topics.' },
]
export const studyTimes: StudyTime[] = [{ id: '30m', label: '30 min/day', minutesPerDay: 30 }, { id: '1h', label: '1 hr/day', minutesPerDay: 60 }, { id: '2h', label: '2 hr/day', minutesPerDay: 120 }, { id: '3h', label: '3+ hr/day', minutesPerDay: 180 }]
export const prerequisiteGraph: Record<string, string[]> = { Routing: ['Subnetting'], Subnetting: ['IP Addressing'], 'IP Addressing': ['Binary Numbers'], Trees: ['Recursion'], Graphs: ['Trees'], 'Dynamic Programming': ['Recursion'], Joins: ['Normalization'], Normalization: ['ER Model'], Indexing: ['Normalization'], Threading: ['Process Management'], Deadlocks: ['Process Management'], Inheritance: ['Classes & Objects'], Polymorphism: ['Inheritance'] }