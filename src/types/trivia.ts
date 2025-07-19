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

// Improved decoding function
export function decodeHtmlEntities(text: string): string {
  try {
    // First, try decoding URL-encoded text
    const urlDecoded = decodeURIComponent(text)
    
    // Create a temporary element to decode HTML entities
    const tempElement = document.createElement('textarea')
    tempElement.innerHTML = urlDecoded
    
    return tempElement.value
  } catch (error) {
    console.error('Decoding error:', error)
    return text // Return original text if decoding fails
  }
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
