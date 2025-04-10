import { Request, Response } from 'express';
import questionService from '../services/question.service';
import { QuestionType, DifficultyLevel } from '@prisma/client';

/**
 * Create a new question with answers
 * @route POST /api/question
 * @access Private (Admin/Instructor)
 */
export const createQuestion = async (req: Request, res: Response) => {
  try {
    const {
      questionText,
      questionType,
      explanation,
      points,
      difficultyLevel,
      assessmentId,
      answers
    } = req.body;

    // Validate required fields
    if (!questionText || !assessmentId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ 
        message: 'Please provide questionText, assessmentId, and an array of answers' 
      });
    }

    // For TRUE_FALSE questions, ensure exactly 2 answers
    if (questionType === QuestionType.TRUE_FALSE && answers.length !== 2) {
      return res.status(400).json({ 
        message: 'TRUE_FALSE questions must have exactly 2 answers (True and False)' 
      });
    }

    // For multiple choice, ensure at least 2 answers and one is correct
    if ((questionType === QuestionType.MULTIPLE_CHOICE || questionType === QuestionType.SINGLE_CHOICE) && 
        (answers.length < 2 || !answers.some((a: { isCorrect: boolean }) => a.isCorrect))) {
      return res.status(400).json({ 
        message: 'Choice questions must have at least 2 answers and one must be correct' 
      });
    }

    const questionData = {
      questionText,
      questionType: questionType || QuestionType.MULTIPLE_CHOICE,
      explanation,
      points: points || 1,
      difficultyLevel: difficultyLevel || DifficultyLevel.BEGINNER
    };

    // Transform answers to match the expected structure with answerText field
    const formattedAnswers = answers.map(answer => ({
      answerText: answer.text || answer.answerText,
      isCorrect: answer.isCorrect,
      explanation: answer.explanation,
      orderIndex: answer.orderIndex
    }));

    const question = await questionService.createQuestion(
      questionData,
      parseInt(assessmentId),
      formattedAnswers
    );

    res.status(201).json(question);
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ message: 'Server error creating question' });
  }
};

/**
 * Update an existing question
 * @route PUT /api/question/:id
 * @access Private (Admin/Instructor)
 */
export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      questionText,
      questionType,
      explanation,
      points,
      difficultyLevel
    } = req.body;

    const updateData: any = {};
    
    if (questionText !== undefined) updateData.questionText = questionText;
    if (questionType !== undefined) updateData.questionType = questionType;
    if (explanation !== undefined) updateData.explanation = explanation;
    if (points !== undefined) updateData.points = points;
    if (difficultyLevel !== undefined) updateData.difficultyLevel = difficultyLevel;

    const question = await questionService.updateQuestion(parseInt(id), updateData);

    res.status(200).json(question);
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ message: 'Server error updating question' });
  }
};

/**
 * Delete a question
 * @route DELETE /api/question/:id
 * @access Private (Admin/Instructor)
 */
export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const question = await questionService.deleteQuestion(parseInt(id));

    res.status(200).json({ message: 'Question deleted successfully', question });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Server error deleting question' });
  }
};

/**
 * Get a question by ID
 * @route GET /api/question/:id
 * @access Private
 */
export const getQuestionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const question = await questionService.getQuestionById(parseInt(id));

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.status(200).json(question);
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ message: 'Server error retrieving question' });
  }
};

/**
 * Get questions with filtering
 * @route GET /api/question
 * @access Private
 */
export const getQuestions = async (req: Request, res: Response) => {
  try {
    const {
      assessmentId,
      questionType,
      difficultyLevel,
      search,
      page,
      limit
    } = req.query;

    const filters = {
      assessmentId: assessmentId ? parseInt(assessmentId as string) : undefined,
      questionType: questionType as QuestionType,
      difficultyLevel: difficultyLevel as DifficultyLevel,
      search: search as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10
    };

    const questions = await questionService.getQuestions(filters);
    
    res.status(200).json(questions);
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Server error retrieving questions' });
  }
};

/**
 * Create a new answer for a question
 * @route POST /api/question/:id/answer
 * @access Private (Admin/Instructor)
 */
export const createAnswer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { answerText, isCorrect, explanation } = req.body;

    // Validate required fields
    if (!answerText) {
      return res.status(400).json({ message: 'Please provide answerText' });
    }

    const answer = await questionService.createAnswer(
      parseInt(id),
      {
        answerText,
        isCorrect: isCorrect !== undefined ? isCorrect : false,
        explanation
      }
    );

    res.status(201).json(answer);
  } catch (error) {
    console.error('Create answer error:', error);
    res.status(500).json({ message: 'Server error creating answer' });
  }
};

/**
 * Update an answer
 * @route PUT /api/question/answer/:id
 * @access Private (Admin/Instructor)
 */
export const updateAnswer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { answerText, isCorrect, explanation } = req.body;

    const updateData: any = {};
    
    if (answerText !== undefined) updateData.answerText = answerText;
    if (isCorrect !== undefined) updateData.isCorrect = isCorrect;
    if (explanation !== undefined) updateData.explanation = explanation;

    const answer = await questionService.updateAnswer(parseInt(id), updateData);

    res.status(200).json(answer);
  } catch (error) {
    console.error('Update answer error:', error);
    res.status(500).json({ message: 'Server error updating answer' });
  }
};

/**
 * Delete an answer
 * @route DELETE /api/question/answer/:id
 * @access Private (Admin/Instructor)
 */
export const deleteAnswer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const answer = await questionService.deleteAnswer(parseInt(id));

    res.status(200).json({ message: 'Answer deleted successfully', answer });
  } catch (error) {
    console.error('Delete answer error:', error);
    res.status(500).json({ message: 'Server error deleting answer' });
  }
};

/**
 * Get all answers for a question
 * @route GET /api/question/:id/answers
 * @access Private
 */
export const getAnswers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const answers = await questionService.getAnswersByQuestionId(parseInt(id));

    res.status(200).json(answers);
  } catch (error) {
    console.error('Get answers error:', error);
    res.status(500).json({ message: 'Server error retrieving answers' });
  }
};

/**
 * Reorder questions in an assessment
 * @route PUT /api/question/reorder
 * @access Private (Admin/Instructor)
 */
export const reorderQuestions = async (req: Request, res: Response) => {
  try {
    const { assessmentId, questionOrder } = req.body;

    // Validate required fields
    if (!assessmentId || !questionOrder || !Array.isArray(questionOrder)) {
      return res.status(400).json({ 
        message: 'Please provide assessmentId and an array of questionOrder' 
      });
    }

    const result = await questionService.reorderQuestions(assessmentId, questionOrder);

    res.status(200).json({ success: result });
  } catch (error) {
    console.error('Reorder questions error:', error);
    res.status(500).json({ message: 'Server error reordering questions' });
  }
};

/**
 * Reorder answers for a question
 * @route PUT /api/question/:id/reorder-answers
 * @access Private (Admin/Instructor)
 */
export const reorderAnswers = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { answerOrder } = req.body;

    // Validate required fields
    if (!answerOrder || !Array.isArray(answerOrder)) {
      return res.status(400).json({ 
        message: 'Please provide an array of answerOrder' 
      });
    }

    const result = await questionService.reorderAnswers(parseInt(id), answerOrder);

    res.status(200).json({ success: result });
  } catch (error) {
    console.error('Reorder answers error:', error);
    res.status(500).json({ message: 'Server error reordering answers' });
  }
};

/**
 * Import questions in bulk for an assessment
 * @route POST /api/question/bulk-import
 * @access Private (Admin/Instructor)
 */
export const bulkImportQuestions = async (req: Request, res: Response) => {
  try {
    const { assessmentId, questions } = req.body;

    // Validate required fields
    if (!assessmentId || !questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ 
        message: 'Please provide assessmentId and a non-empty array of questions' 
      });
    }

    // Validate each question
    for (const question of questions) {
      if (!question.questionText || !question.answers || !Array.isArray(question.answers)) {
        return res.status(400).json({ 
          message: 'Each question must have questionText and an array of answers' 
        });
      }

      if ((question.questionType === QuestionType.MULTIPLE_CHOICE || question.questionType === QuestionType.SINGLE_CHOICE) && 
          !question.answers.some((a: { isCorrect: boolean }) => a.isCorrect)) {
        return res.status(400).json({ 
          message: 'Each choice question must have at least one correct answer' 
        });
      }
    }

    const createdQuestions = await questionService.bulkImportQuestions(assessmentId, questions);

    res.status(201).json({ 
      message: `Successfully imported ${createdQuestions.length} questions`, 
      questions: createdQuestions 
    });
  } catch (error) {
    console.error('Bulk import questions error:', error);
    res.status(500).json({ message: 'Server error importing questions' });
  }
};
