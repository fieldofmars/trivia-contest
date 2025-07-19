import { 
  TriviaApiResponse, 
  SessionTokenResponse, 
  Difficulty, 
  QuestionType 
} from '../types/trivia'

const BASE_URL = 'https://opentdb.com/api.php'
const TOKEN_URL = 'https://opentdb.com/api_token.php'

export class TriviaApiService {
  private static sessionToken: string | null = null

  // Retrieve a new session token
  static async getSessionToken(): Promise<string> {
    const response = await fetch(`${TOKEN_URL}?command=request`)
    const data: SessionTokenResponse = await response.json()
    
    if (data.response_code === 0 && data.token) {
      this.sessionToken = data.token
      return data.token
    }
    
    throw new Error('Failed to retrieve session token')
  }

  // Fetch trivia questions
  static async fetchQuestions(
    amount: number = 10, 
    difficulty?: Difficulty, 
    type?: QuestionType,
    category?: number
  ): Promise<TriviaApiResponse> {
    // Ensure we have a session token
    if (!this.sessionToken) {
      await this.getSessionToken()
    }

    // Construct query parameters
    const params = new URLSearchParams({
      amount: amount.toString(),
      token: this.sessionToken || '',
      encode: 'url3986' // Use URL encoding to handle special characters
    })

    // Add optional parameters
    if (difficulty) params.append('difficulty', difficulty)
    if (type) params.append('type', type)
    if (category) params.append('category', category.toString())

    try {
      const response = await fetch(`${BASE_URL}?${params.toString()}`)
      const data: TriviaApiResponse = await response.json()

      // Handle different response codes
      switch (data.response_code) {
        case 0: // Success
          return data
        case 4: // Token empty, reset token
          await this.resetSessionToken()
          return this.fetchQuestions(amount, difficulty, type, category)
        default:
          throw new Error(`API Error: ${data.response_code}`)
      }
    } catch (error) {
      console.error('Trivia API Error:', error)
      throw error
    }
  }

  // Reset session token
  static async resetSessionToken(): Promise<void> {
    if (!this.sessionToken) return

    const response = await fetch(`${TOKEN_URL}?command=reset&token=${this.sessionToken}`)
    const data: SessionTokenResponse = await response.json()

    if (data.response_code !== 0) {
      throw new Error('Failed to reset session token')
    }
  }

  // Fetch available categories
  static async fetchCategories(): Promise<{id: number, name: string}[]> {
    const response = await fetch('https://opentdb.com/api_category.php')
    const data = await response.json()
    return data.trivia_categories
  }
}
