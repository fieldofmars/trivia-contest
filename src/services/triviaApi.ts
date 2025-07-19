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
  private static MAX_RETRIES = 3
  private static BASE_DELAY = 1000 // 1 second initial delay
  private static lastFetchTimestamp: number | null = null

  // Exponential backoff delay calculation
  private static calculateDelay(retryCount: number): number {
    return this.BASE_DELAY * Math.pow(2, retryCount)
  }

  // Delay utility function
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Prevent rapid successive calls
  private static preventRapidCalls() {
    const now = Date.now()
    if (this.lastFetchTimestamp && now - this.lastFetchTimestamp < 2000) {
      console.warn('Preventing rapid API calls')
      throw new Error('Too many rapid API calls')
    }
    this.lastFetchTimestamp = now
  }

  // Retrieve a new session token with retry
  static async getSessionToken(retryCount = 0): Promise<string> {
    try {
      this.preventRapidCalls()

      const response = await fetch(`${TOKEN_URL}?command=request`)
      
      if (!response.ok) {
        // Check for rate limiting
        if (response.status === 429 && retryCount < this.MAX_RETRIES) {
          const delayTime = this.calculateDelay(retryCount)
          console.warn(`Rate limited. Retrying in ${delayTime}ms...`)
          await this.delay(delayTime)
          return this.getSessionToken(retryCount + 1)
        }
        throw new Error(`Token request failed: ${response.status}`)
      }

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

  // Fetch trivia questions with advanced retry mechanism
  static async fetchQuestions(
    amount: number = 10, 
    difficulty?: Difficulty, 
    type?: QuestionType,
    category?: number,
    retryCount = 0
  ): Promise<TriviaApiResponse> {
    try {
      this.preventRapidCalls()

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

      const response = await fetch(`${BASE_URL}?${params.toString()}`)
      
      // Handle rate limiting with exponential backoff
      if (response.status === 429) {
        if (retryCount < this.MAX_RETRIES) {
          const delayTime = this.calculateDelay(retryCount)
          console.warn(`Rate limited. Retrying in ${delayTime}ms...`)
          await this.delay(delayTime)
          return this.fetchQuestions(amount, difficulty, type, category, retryCount + 1)
        }
        throw new Error('Max retries reached. API is rate-limiting requests.')
      }

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
      this.preventRapidCalls()

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
      this.preventRapidCalls()

      const response = await fetch('https://opentdb.com/api_category.php')
      const data = await response.json()
      return data.trivia_categories
    } catch (error) {
      console.error('Fetch Categories Error:', error)
      throw error
    }
  }
}
