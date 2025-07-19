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
    // Optional: You can dynamically set test mode here if needed
    // TriviaApiService.setTestMode(true)
    
    loadQuestions()
    
    // Cleanup function to reset the loaded state if needed
    return () => {
      questionsLoadedRef.current = false
    }
  }, [loadQuestions])

  // Rest of the component remains unchanged
  // ... (all other methods and render logic stay the same)

  return (
    // Existing render logic remains the same
  )
}

export default App
