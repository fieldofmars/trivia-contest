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
        const response = await TriviaApiService.fetchQuestions(
          10, 
          Difficulty.Medium
        )
        
        // Prepare questions with shuffled answers
        const preparedQuestions = response.results.map(q => ({
          ...q,
          all_answers: shuffleArray([
            ...q.incorrect_answers, 
            q.correct_answer
          ])
        }))

        setQuestions(preparedQuestions)
        setIsLoading(false)
      } catch (err) {
        setError('Failed to load questions')
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
      <div className="min-h-screen bg-red-100 flex items-center justify-center">
        <div className="text-red-600 text-2xl">{error}</div>
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
            {decodeHtmlEntities(currentQuestion.category)}
          </h2>
          <p className="text-2xl font-bold text-gray-900 mb-6">
            {decodeHtmlEntities(currentQuestion.question)}
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
              {decodeHtmlEntities(answer)}
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
