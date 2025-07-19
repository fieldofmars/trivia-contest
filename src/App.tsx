import React, { useState, useEffect, useCallback, useRef } from 'react'
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
  
  // Use a ref to track if questions have been loaded
  const questionsLoadedRef = useRef(false)

  // Memoized and stable function to load questions
  const loadQuestions = useCallback(async () => {
    // Prevent multiple simultaneous or repeated loads
    if (questionsLoadedRef.current) {
      console.log('Questions already loaded. Preventing duplicate fetch.')
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Fetching questions...')
      const response = await TriviaApiService.fetchQuestions(
        10, 
        Difficulty.Medium
      )
      
      console.log('API Response received:', response)
      
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

      // Mark questions as loaded to prevent re-fetching
      questionsLoadedRef.current = true
      
      setQuestions(preparedQuestions)
      setIsLoading(false)
    } catch (err) {
      console.error('Question Loading Error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load questions')
      setIsLoading(false)
    }
  }, [])

  // Use effect with empty dependency array to load questions only once
  useEffect(() => {
    loadQuestions()
    
    // Cleanup function to reset the loaded state if needed
    return () => {
      questionsLoadedRef.current = false
    }
  }, [loadQuestions])

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
    // Reset the loaded state to allow re-fetching
    questionsLoadedRef.current = false
    loadQuestions()
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
          </div>
        </div>
      </div>
    )
  }

  // Quiz rendering (placeholder - you'll need to implement this part)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8">
        <h2 className="text-2xl font-bold mb-4">
          {questions[currentQuestionIndex].category}
        </h2>
        <p className="text-xl mb-6">
          {questions[currentQuestionIndex].question}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions[currentQuestionIndex].all_answers.map((answer, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(answer)}
              className={`
                py-3 px-4 rounded-lg text-left
                ${selectedAnswer === answer 
                  ? (answer === questions[currentQuestionIndex].correct_answer 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white')
                  : 'bg-gray-200 hover:bg-gray-300'
                }
              `}
              disabled={!!selectedAnswer}
            >
              {answer}
            </button>
          ))}
        </div>
        {selectedAnswer && (
          <div className="mt-6">
            <button
              onClick={handleNextQuestion}
              className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors"
              disabled={currentQuestionIndex >= questions.length - 1}
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish'}
            </button>
          </div>
        )}
        <div className="mt-4 text-xl">
          Score: {score} / {questions.length}
        </div>
      </div>
    </div>
  )
}

export default App
