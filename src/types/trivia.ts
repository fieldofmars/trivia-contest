// Enums for difficulty and question types
export enum Difficulty {
  Easy = 'easy',
  Medium = 'medium',
  Hard = 'hard'
}

export enum QuestionType {
  Multiple = 'multiple',
  Boolean = 'boolean'
}

// API Response Types
export interface TriviaQuestion {
  category: string
  type: QuestionType
  difficulty: Difficulty
  question: string
  correct_answer: string
  incorrect_answers: string[]
}

export interface TriviaApiResponse {
  response_code: number
  results: TriviaQuestion[]
}

// Session Token Types
export interface SessionTokenResponse {
  response_code: number
  response_message: string
  token?: string
}

// Utility function to decode HTML entities
export function decodeHtmlEntities(text: string): string {
  const textArea = document.createElement('textarea')
  textArea.innerHTML = text
  return textArea.value
}

// Shuffle array utility (for randomizing answer order)
export function shuffleArray<T>(array: T[]): T[] {
  const shuffledArray = [...array]
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]
  }
  return shuffledArray
}
