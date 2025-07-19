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

  // Fetch questions when component mounts
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
      } catch (err) {
        console.error('Question Loading Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load questions')
        setIsLoading(false)
      }
    }

    loadQuestions()
  }, [])

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
    setError(null)
    setIsLoading(true)
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
          <button 
            onClick={handleRetry}
            className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // No questions
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl">No questions available</div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {currentQuestion.category}
          </h2>
          <p className="text-2xl font-bold text-gray-900 mb-6">
            {currentQuestion.question}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.all_answers?.map((answer, index) => (
            <button
              key={index}
              onClick={() => handleAnswerSelect(answer)}
              className={`
                py-3 px-4 rounded-lg text-lg font-semibold transition-all duration-300
                ${selectedAnswer === answer 
                  ? (answer === currentQuestion.correct_answer 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white')
                  : 'bg-gray-100 hover:bg-blue-100 text-gray-800'
                }
              `}
              disabled={!!selectedAnswer}
            >
              {answer}
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-lg font-medium">
            Score: <span className="text-blue-600">{score}</span> / {questions.length}
          </div>
          
          {selectedAnswer && currentQuestionIndex < questions.length - 1 && (
            <button
              onClick={handleNextQuestion}
              className="bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Next Question
            </button>
          )}
        </div>

        {currentQuestionIndex === questions.length - 1 && selectedAnswer && (
          <div className="mt-6 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Quiz Completed!
            </h3>
            <p className="text-xl text-gray-700">
              Your final score: {score} / {questions.length}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
