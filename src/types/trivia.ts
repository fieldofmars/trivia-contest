// Existing imports and types remain the same

// Add a new constant for test data
export const TEST_TRIVIA_DATA: TriviaApiResponse = {
  response_code: 0,
  results: [
    {
      type: QuestionType.Multiple,
      difficulty: Difficulty.Medium,
      category: "Entertainment: Video Games",
      question: "What type of genre is the controversial 2015 game \"Hatred\"?",
      correct_answer: "Shoot 'Em Up",
      incorrect_answers: [
        "Point & Click",
        "MMORPG", 
        "Simulation"
      ]
    },
    // ... (rest of the questions from the previous payload)
    {
      type: QuestionType.Multiple,
      difficulty: Difficulty.Medium,
      category: "Sports",
      question: "Which sport is NOT traditionally played during the Mongolian Naadam festival?",
      correct_answer: "American Football",
      incorrect_answers: [
        "Wrestling",
        "Archery", 
        "Horse-Racing"
      ]
    }
  ]
}
