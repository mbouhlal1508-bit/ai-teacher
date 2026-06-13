export interface MCQ {
  question: string
  choices: string[]
  answer: string
}

export interface TrueFalse {
  question: string
  answer: boolean
  explanation: string
}

export interface FillBlank {
  sentence: string
  answer: string
}

export interface FlashCard {
  front: string
  back: string
}

export interface MatchingPair {
  left: string
  right: string
}

export interface CrosswordItem {
  word: string
  clue: string
}

export interface WordSearchItem {
  word: string
  term: string
}

export interface QuestionBank {
  type: string
  question: string
  options?: string[]
  answer: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface LessonPlan {
  title: string
  grade: string
  objectives: string[]
  materials: string[]
  introduction: string
  steps: { order: number; duration: string; activity: string }[]
  assessment: string
  homework: string
}

export interface GeneratedActivities {
  lesson: string
  mcq: MCQ[]
  true_false: TrueFalse[]
  fill_blank: FillBlank[]
  flashcards: FlashCard[]
  matching: MatchingPair[]
  ordering: string[]
  crossword: CrosswordItem[]
  word_search: WordSearchItem[]
  question_bank: QuestionBank[]
  lesson_plan: LessonPlan
}

export interface Lesson {
  id: number
  user_id: number
  title: string
  grade: string
  objectives: string
  content: string
  subject: string
  created_at: string
  updated_at: string
}

export interface DashboardData {
  lessons_count: number
  activities_count: number
  games_count: number
  exams_count: number
  recent_lessons: { id: number; title: string; grade: string; created_at: string }[]
}
