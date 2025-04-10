import { PrismaClient, Question, Answer, QuestionType, DifficultyLevel, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Define interfaces for filters
interface QuestionFilterParams {
  assessmentId?: number;
  questionType?: QuestionType;
  difficultyLevel?: DifficultyLevel;
  search?: string;
  page?: number;
  limit?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * Service for question and answer management
 */
export class QuestionService {
  /**
   * Create a new question with answers
   */
  async createQuestion(
    questionData: Omit<Prisma.QuestionCreateInput, 'assessment' | 'answers'>,
    assessmentId: number,
    answers: Array<Omit<Prisma.AnswerCreateInput, 'question'>>
  ): Promise<Question> {
    return prisma.question.create({
      data: {
        ...questionData,
        assessment: {
          connect: {
            id: assessmentId
          }
        },
        answers: {
          create: answers
        }
      },
      include: {
        answers: true
      }
    });
  }

  /**
   * Update an existing question
   */
  async updateQuestion(
    id: number,
    questionData: Omit<Prisma.QuestionUpdateInput, 'assessment' | 'answers'>
  ): Promise<Question> {
    return prisma.question.update({
      where: { id },
      data: questionData,
      include: {
        answers: true
      }
    });
  }

  /**
   * Delete a question and its answers
   */
  async deleteQuestion(id: number): Promise<Question> {
    return prisma.question.delete({
      where: { id },
      include: {
        answers: true
      }
    });
  }

  /**
   * Get a question by ID with its answers
   */
  async getQuestionById(id: number): Promise<Question | null> {
    return prisma.question.findUnique({
      where: { id },
      include: {
        answers: {
          orderBy: {
            orderIndex: 'asc'
          }
        }
      }
    });
  }

  /**
   * Get questions with filtering and pagination
   */
  async getQuestions(params: QuestionFilterParams): Promise<PaginatedResponse<Question>> {
    const {
      assessmentId,
      questionType,
      difficultyLevel,
      search,
      page = 1,
      limit = 10
    } = params;

    // Build where clause
    const where: Prisma.QuestionWhereInput = {};

    if (assessmentId !== undefined) {
      where.assessmentId = assessmentId;
    }

    if (questionType) {
      where.questionType = questionType;
    }

    if (difficultyLevel) {
      where.difficultyLevel = difficultyLevel;
    }

    if (search) {
      where.questionText = {
        contains: search
      };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.question.count({ where });

    // Get data with pagination
    const data = await prisma.question.findMany({
      where,
      include: {
        answers: {
          orderBy: {
            orderIndex: 'asc'
          }
        },
        assessment: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        orderIndex: 'asc'
      },
      skip,
      take: limit
    });

    // Calculate total pages
    const pages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        pages
      }
    };
  }

  /**
   * Create a new answer for a question
   */
  async createAnswer(questionId: number, answerData: Omit<Prisma.AnswerCreateInput, 'question'>): Promise<Answer> {
    return prisma.answer.create({
      data: {
        ...answerData,
        question: {
          connect: {
            id: questionId
          }
        }
      }
    });
  }

  /**
   * Update an existing answer
   */
  async updateAnswer(id: number, answerData: Omit<Prisma.AnswerUpdateInput, 'question'>): Promise<Answer> {
    return prisma.answer.update({
      where: { id },
      data: answerData
    });
  }

  /**
   * Delete an answer
   */
  async deleteAnswer(id: number): Promise<Answer> {
    return prisma.answer.delete({
      where: { id }
    });
  }

  /**
   * Get all answers for a question
   */
  async getAnswersByQuestionId(questionId: number): Promise<Answer[]> {
    return prisma.answer.findMany({
      where: { questionId },
      orderBy: {
        orderIndex: 'asc'
      }
    });
  }

  /**
   * Reorder questions in an assessment
   */
  async reorderQuestions(assessmentId: number, questionOrder: number[]): Promise<boolean> {
    // Verify all questions belong to the assessment
    const assessmentQuestions = await prisma.question.findMany({
      where: { assessmentId },
      select: { id: true }
    });

    const assessmentQuestionIds = assessmentQuestions.map(q => q.id);
    
    // Check that all provided IDs belong to the assessment
    const allQuestionsValid = questionOrder.every(id => assessmentQuestionIds.includes(id));
    
    if (!allQuestionsValid) {
      throw new Error('Some question IDs do not belong to this assessment');
    }

    // Update order indexes in transaction
    await prisma.$transaction(
      questionOrder.map((questionId, index) => 
        prisma.question.update({
          where: { id: questionId },
          data: { orderIndex: index }
        })
      )
    );

    return true;
  }

  /**
   * Reorder answers for a question
   */
  async reorderAnswers(questionId: number, answerOrder: number[]): Promise<boolean> {
    // Verify all answers belong to the question
    const questionAnswers = await prisma.answer.findMany({
      where: { questionId },
      select: { id: true }
    });

    const questionAnswerIds = questionAnswers.map(a => a.id);
    
    // Check that all provided IDs belong to the question
    const allAnswersValid = answerOrder.every(id => questionAnswerIds.includes(id));
    
    if (!allAnswersValid) {
      throw new Error('Some answer IDs do not belong to this question');
    }

    // Update order indexes in transaction
    await prisma.$transaction(
      answerOrder.map((answerId, index) => 
        prisma.answer.update({
          where: { id: answerId },
          data: { orderIndex: index }
        })
      )
    );

    return true;
  }

  /**
   * Import questions in bulk for an assessment
   */
  async bulkImportQuestions(
    assessmentId: number, 
    questions: Array<{
      questionText: string;
      questionType: QuestionType;
      explanation?: string;
      points: number;
      difficultyLevel: DifficultyLevel;
      answers: Array<{
        answerText: string;
        isCorrect: boolean;
        explanation?: string;
      }>
    }>
  ): Promise<Question[]> {
    // Verify assessment exists
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId }
    });

    if (!assessment) {
      throw new Error('Assessment not found');
    }

    // Get current max order index
    const maxOrderIndex = await prisma.question.findFirst({
      where: { assessmentId },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true }
    });

    let startOrderIndex = (maxOrderIndex?.orderIndex || -1) + 1;

    // Create questions with answers in transaction
    const createdQuestions = await prisma.$transaction(
      questions.map((question, index) => {
        return prisma.question.create({
          data: {
            questionText: question.questionText,
            questionType: question.questionType,
            explanation: question.explanation,
            points: question.points,
            difficultyLevel: question.difficultyLevel,
            orderIndex: startOrderIndex + index,
            assessment: {
              connect: { id: assessmentId }
            },
            answers: {
              create: question.answers.map((answer, answerIndex) => ({
                answerText: answer.answerText,
                isCorrect: answer.isCorrect,
                explanation: answer.explanation,
                orderIndex: answerIndex
              }))
            }
          },
          include: {
            answers: true
          }
        });
      })
    );

    return createdQuestions;
  }
}

export default new QuestionService();
