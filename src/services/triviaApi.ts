import { 
  TriviaApiResponse, 
  SessionTokenResponse, 
  Difficulty, 
  QuestionType,
  TEST_TRIVIA_DATA  // Add the new test data import
} from '../types/trivia'

const BASE_URL = 'https://opentdb.com/api.php'
const TOKEN_URL = 'https://opentdb.com/api_token.php'

export class TriviaApiService {
  // Add a static property to control test mode
  private static TEST_MODE = true  // Default to test mode

  // Method to toggle test mode
  static setTestMode(enabled: boolean) {
    this.TEST_MODE = enabled
    console.log(`Trivia API Test Mode: ${enabled ? 'ENABLED' : 'DISABLED'}`)
  }

  // Existing methods remain the same, but modify fetchQuestions
  static async fetchQuestions(
    amount: number = 10, 
    difficulty?: Difficulty, 
    type?: QuestionType,
    category?: number,
    retryCount = 0
  ): Promise<TriviaApiResponse> {
    // If test mode is on, immediately return test data
    if (this.TEST_MODE) {
      console.warn('Using Test Mode Trivia Data')
      return Promise.resolve(TEST_TRIVIA_DATA)
    }

    // Rest of the existing fetchQuestions method remains unchanged
    try {
      this.preventRapidCalls()

      // ... (existing implementation)
    } catch (error) {
      console.error('Trivia API Fetch Error:', error)
      throw error
    }
  }

  // Rest of the class remains exactly the same
}
