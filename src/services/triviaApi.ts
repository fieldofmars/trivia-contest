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
    try {
      const response = await fetch(`${TOKEN_URL}?command=request`)
      const data: SessionTokenResponse = await response.json()
      
      if (data.response_code === 0 && data.token) {
        this.sessionToken = data.token
        return data.token
      }
      
      throw new Error('Failed to retrieve session token')
    } catch (error) {
      console.error('Session Token Error:', error)
      throw error
    }
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
      try {
        await this.getSessionToken()
      } catch (tokenError) {
        console.error('Token Retrieval Failed:', tokenError)
        throw new Error('Could not obtain session token')
      }
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
      
      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: TriviaApiResponse = await response.json()

      // Log the raw response for debugging
      console.log('API Response:', data)

      // Handle different response codes
      switch (data.response_code) {
        case 0: // Success
          // Validate that we have results
          if (!data.results || data.results.length === 0) {
            throw new Error('No questions returned')
          }
          return data
        case 1:
          throw new Error('No Results: Not enough questions')
        case 2:
          throw new Error('Invalid Parameter')
        case 3:
          throw new Error('Token Not Found')
        case 4:
          // Token empty, reset token
          await this.resetSessionToken()
          return this.fetchQuestions(amount, difficulty, type, category)
        case 5:
          throw new Error('Rate Limited')
        default:
          throw new Error(`Unknown API Error: ${data.response_code}`)
      }
    } catch (error) {
      console.error('Trivia API Fetch Error:', error)
      throw error
    }
  }

  // Reset session token
  static async resetSessionToken(): Promise<void> {
    if (!this.sessionToken) return

    try {
      const response = await fetch(`${TOKEN_URL}?command=reset&token=${this.sessionToken}`)
      const data: SessionTokenResponse = await response.json()

      if (data.response_code !== 0) {
        throw new Error('Failed to reset session token')
      }
    } catch (error) {
      console.error('Reset Token Error:', error)
      throw error
    }
  }

  // Fetch available categories
  static async fetchCategories(): Promise<{id: number, name: string}[]> {
    try {
      const response = await fetch('https://opentdb.com/api_category.php')
      const data = await response.json()
      return data.trivia_categories
    } catch (error) {
      console.error('Fetch Categories Error:', error)
      throw error
    }
  }
}
