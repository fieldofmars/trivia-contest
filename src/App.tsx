import React, { useState, useEffect } from 'react'
import { 
  TriviaApiService 
} from './services/triviaApi'
import { 
  TriviaQuestion, 
  Difficulty, 
  QuestionType,
  decodeHtmlEntities,
  shuffleArray
} from './types/trivia'

function App() {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Fetch questions when component mounts or retry is triggered
  useEffect(() => {
    async function loadQuestions() {
      try {
        setIsLoading(true)
        setError(null)
        
        const response = await TriviaApiService.fetchQuestions(
          10, 
          Difficulty.Medium
        )
        
        // Prepare questions with shuffled answers and decoded content
        const preparedQuestions = response.results.map(q => ({
          ...q,
          category: decodeHtmlEntities(q.category),
          question: decodeHtmlEntities(q.question),
          correct_answer: decodeHtmlEntities(q.correct_answer),
          incorrect_answers: q.incorrect_answers.map(decodeHtmlEntities),
          all_answers: shuffleArray([
            ...q.incorrect_answers.map(decodeHtmlEntities), 
            decodeHtmlEntities(q.correct_answer)
          ])
        }))

        setQuestions(preparedQuestions)
        setIsLoading(false)
        setRetryCount(0)
      } catch (err) {
        console.error('Question Loading Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load questions')
        setIsLoading(false)
      }
    }

    loadQuestions()
  }, [retryCount])

  // Handle answer selection
  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer) return // Prevent multiple selections

    setSelectedAnswer(answer)

    // Check if answer is correct
    if (answer === questions[currentQuestionIndex].correct_answer) {
      setScore(prev => prev + 1)
    }
  }

  // Move to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedAnswer(null)
    }
  }

  // Retry loading questions
  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-2xl">Loading Questions...</div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
          <div className="text-red-600 text-2xl mb-4">Error Loading Trivia</div>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="flex flex-col space-y-4">
            <button 
              onClick={handleRetry}
              className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
            {retryCount > 0 && (
              <div className="text-sm text-gray-600">
                Retry attempts: {retryCount}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Rest of the component remains the same...
  // (Previous implementation of quiz rendering)
}

export default App
