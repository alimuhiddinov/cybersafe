import { PrismaClient, Assessment, Question, Answer, DifficultyLevel, QuestionType, Prisma, CompletionStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Define interfaces for filtering and pagination
interface AssessmentFilterParams {
  moduleId?: number;
  title?: string;
  isActive?: boolean;
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
 * Service for assessment management
 */
export class AssessmentService {
  /**
   * Create a new assessment
   */
  async createAssessment(data: Prisma.AssessmentCreateInput): Promise<Assessment> {
    return prisma.assessment.create({
      data
    });
  }

  /**
   * Update an existing assessment
   */
  async updateAssessment(id: number, data: Prisma.AssessmentUpdateInput): Promise<Assessment> {
    return prisma.assessment.update({
      where: { id },
      data
    });
  }

  /**
   * Delete an assessment
   */
  async deleteAssessment(id: number): Promise<Assessment> {
    return prisma.assessment.delete({
      where: { id }
    });
  }

  /**
   * Get an assessment by ID with questions and answers
   */
  async getAssessmentById(id: number, includeQuestions: boolean = true): Promise<Assessment | null> {
    return prisma.assessment.findUnique({
      where: { id },
      include: includeQuestions ? {
        questions: {
          include: {
            answers: true
          },
          orderBy: {
            orderIndex: 'asc'
          }
        },
        learningModule: true
      } : {}
    });
  }

  /**
   * Get all assessments with filtering and pagination
   */
  async getAssessments(params: AssessmentFilterParams): Promise<PaginatedResponse<Assessment>> {
    const {
      moduleId,
      title,
      isActive,
      page = 1,
      limit = 10
    } = params;

    // Build where clause
    const where: Prisma.AssessmentWhereInput = {};

    if (moduleId !== undefined) {
      where.moduleId = moduleId;
    }

    if (title) {
      where.title = {
        contains: title
      };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await prisma.assessment.count({ where });

    // Get data with pagination
    const data = await prisma.assessment.findMany({
      where,
      include: {
        learningModule: {
          select: {
            title: true
          }
        },
        _count: {
          select: {
            questions: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
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
   * Create a new question for an assessment
   */
  async createQuestion(
    assessmentId: number,
    questionData: Prisma.QuestionCreateInput
  ): Promise<Question> {
    return prisma.question.create({
      data: questionData
    });
  }

  /**
   * Update an existing question
   */
  async updateQuestion(
    id: number,
    questionData: Prisma.QuestionUpdateInput
  ): Promise<Question> {
    return prisma.question.update({
      where: { id },
      data: questionData
    });
  }

  /**
   * Delete a question
   */
  async deleteQuestion(id: number): Promise<Question> {
    return prisma.question.delete({
      where: { id }
    });
  }

  /**
   * Create a new answer for a question
   */
  async createAnswer(
    questionId: number,
    answerData: Prisma.AnswerCreateInput
  ): Promise<Answer> {
    return prisma.answer.create({
      data: answerData
    });
  }

  /**
   * Generate a quiz based on module ID and difficulty
   */
  async generateQuiz(
    userId: number,
    moduleId: number,
    difficulty: DifficultyLevel = DifficultyLevel.BEGINNER,
    questionCount: number = 10
  ): Promise<Assessment & { questions: (Question & { answers: Answer[] })[] }> {
    // First, check if there's an existing assessment for this module
    const existingAssessment = await prisma.assessment.findFirst({
      where: {
        moduleId,
        isActive: true
      },
      include: {
        questions: {
          include: {
            answers: true
          },
          where: {
            difficultyLevel: difficulty
          },
          orderBy: {
            orderIndex: 'asc'
          }
        }
      }
    });

    // If there's an existing assessment with enough questions of the right difficulty, use it
    if (existingAssessment && existingAssessment.questions.length >= questionCount) {
      // Randomize questions if needed
      let quizQuestions = [...existingAssessment.questions];
      
      if (existingAssessment.randomizeQuestions) {
        quizQuestions = this.shuffleArray(quizQuestions).slice(0, questionCount);
      } else {
        quizQuestions = quizQuestions.slice(0, questionCount);
      }

      return {
        ...existingAssessment,
        questions: quizQuestions
      };
    }

    // Otherwise, we need to create a dynamic quiz
    // First, get all suitable questions from assessments for this module
    const moduleLearningPathIds = [moduleId];
    const targetModuleIds = [...moduleLearningPathIds, moduleId];

    // Check if we have any questions available for this module and difficulty
    const availableQuestions = await prisma.question.findMany({
      where: {
        assessment: {
          moduleId: {
            in: targetModuleIds
          },
          isActive: true
        },
        difficultyLevel: difficulty
      },
      include: {
        answers: true
      },
      orderBy: {
        orderIndex: 'asc'
      }
    });

    // If we have enough questions, create a dynamic assessment
    if (availableQuestions.length >= questionCount) {
      // Create a new assessment for this quiz
      const quiz = await prisma.assessment.create({
        data: {
          title: `${difficulty} Quiz - Module ${moduleId}`,
          description: `Dynamically generated quiz for difficulty level: ${difficulty}`,
          timeLimit: 15,
          passThreshold: 70,
          isActive: true,
          moduleId,
          randomizeQuestions: true
        }
      });

      // Randomly select questions
      const selectedQuestions = this.shuffleArray(availableQuestions).slice(0, questionCount);

      // Add selected questions to the assessment
      await Promise.all(selectedQuestions.map((question, index) => 
        prisma.question.create({
          data: {
            questionText: question.questionText,
            orderIndex: index,
            difficultyLevel: question.difficultyLevel,
            questionType: question.questionType,
            points: question.points,
            assessmentId: quiz.id,
            answers: {
              create: question.answers.map(answer => ({
                answerText: answer.answerText,
                isCorrect: answer.isCorrect,
                explanation: answer.explanation
              }))
            }
          }
        })
      ));

      // Return the created quiz with questions
      return prisma.assessment.findUnique({
        where: { id: quiz.id },
        include: {
          questions: {
            include: {
              answers: true
            },
            orderBy: {
              orderIndex: 'asc'
            }
          },
          learningModule: true
        }
      }) as Promise<Assessment & { questions: (Question & { answers: Answer[] })[] }>;
    }

    // If we don't have enough questions, create a basic assessment with generic questions
    const quiz = await prisma.assessment.create({
      data: {
        title: `${difficulty} Quiz - Module ${moduleId}`,
        description: `Basic assessment for module ${moduleId}`,
        timeLimit: Math.min(questionCount * 1.5, 30), // 1.5 minutes per question, max 30 min
        passThreshold: 70,
        isActive: true,
        moduleId,
        randomizeQuestions: true
      }
    });

    // Create basic questions
    const difficultyPoints = {
      [DifficultyLevel.BEGINNER]: 5,
      [DifficultyLevel.INTERMEDIATE]: 10,
      [DifficultyLevel.ADVANCED]: 15,
      [DifficultyLevel.EXPERT]: 20
    };

    for (let i = 0; i < questionCount; i++) {
      await prisma.question.create({
        data: {
          questionText: `Sample ${difficulty} question ${i + 1}`,
          orderIndex: i,
          difficultyLevel: difficulty,
          questionType: QuestionType.MULTIPLE_CHOICE,
          points: difficultyPoints[difficulty] || 5,
          assessmentId: quiz.id,
          answers: {
            create: [
              {
                answerText: 'Correct answer',
                isCorrect: true,
                explanation: 'This is the correct answer'
              },
              {
                answerText: 'Wrong answer 1',
                isCorrect: false,
                explanation: 'This is incorrect'
              },
              {
                answerText: 'Wrong answer 2',
                isCorrect: false,
                explanation: 'This is also incorrect'
              },
              {
                answerText: 'Wrong answer 3',
                isCorrect: false,
                explanation: 'This is incorrect as well'
              }
            ]
          }
        }
      });
    }

    // Return the created quiz with questions
    return prisma.assessment.findUnique({
      where: { id: quiz.id },
      include: {
        questions: {
          include: {
            answers: true
          },
          orderBy: {
            orderIndex: 'asc'
          }
        },
        learningModule: true
      }
    }) as Promise<Assessment & { questions: (Question & { answers: Answer[] })[] }>;
  }

  /**
   * Submit an assessment attempt
   */
  async submitAssessment(
    userId: number,
    assessmentId: number,
    answers: Array<{ questionId: number, answerId: number | null, textAnswer?: string }>,
    timeSpentSeconds: number
  ) {
    // Get the assessment with questions and answers
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questions: {
          include: {
            answers: true
          }
        },
        learningModule: true
      }
    });

    if (!assessment) {
      throw new Error('Assessment not found');
    }

    // Calculate the score
    let totalPoints = 0;
    let earnedPoints = 0;
    let correctAnswers = 0;

    // Create a map of the submitted answers
    const submittedAnswersMap = new Map(
      answers.map(a => [a.questionId, { answerId: a.answerId, textAnswer: a.textAnswer }])
    );

    // Process each question
    assessment.questions.forEach(question => {
      const submission = submittedAnswersMap.get(question.id);
      
      // Skip if no answer was submitted for this question
      if (!submission) return;

      totalPoints += question.points;
      
      // For multiple choice questions, check if the selected answer is correct
      if (question.questionType === QuestionType.MULTIPLE_CHOICE) {
        const selectedAnswer = question.answers.find(a => a.id === submission.answerId);
        if (selectedAnswer?.isCorrect) {
          earnedPoints += question.points;
          correctAnswers++;
        }
      }
      
      // For text/open-ended questions, we would need manual grading
      // For now, let's assume they get 50% of points automatically
      if (question.questionType === QuestionType.FILL_BLANK && submission.textAnswer) {
        earnedPoints += question.points * 0.5;
        correctAnswers += 0.5;
      }
    });

    // Calculate percentage score
    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const isPassed = score >= assessment.passThreshold;
    
    // Calculate time spent in minutes
    const timeSpentMinutes = timeSpentSeconds / 60;
    const isWithinTimeLimit = assessment.timeLimit === null || timeSpentMinutes <= assessment.timeLimit;

    // Get attempt number
    const previousAttempts = await prisma.userAssessmentAttempt.count({
      where: {
        userId,
        assessmentId
      }
    });

    // Create the attempt record
    const attempt = await prisma.userAssessmentAttempt.create({
      data: {
        userId,
        assessmentId,
        startedAt: new Date(Date.now() - timeSpentSeconds * 1000),
        completedAt: new Date(),
        score,
        isPassed: isPassed && isWithinTimeLimit,
        attemptNumber: previousAttempts + 1,
        timeSpentSeconds,
        userAnswers: {
          create: answers.map(answer => ({
            userId,
            questionId: answer.questionId,
            answerId: answer.answerId,
            textAnswer: answer.textAnswer
          }))
        }
      }
    });

    // If passed, update the module progress
    if (isPassed && assessment.moduleId) {
      await prisma.userProgress.upsert({
        where: {
          userId_moduleId: {
            userId,
            moduleId: assessment.moduleId
          }
        },
        update: {
          completionStatus: CompletionStatus.COMPLETED,
          progressPercentage: 100,
          pointsEarned: {
            increment: earnedPoints
          },
          lastAccessedAt: new Date()
        },
        create: {
          userId,
          moduleId: assessment.moduleId,
          pointsEarned: earnedPoints,
          progressPercentage: 100,
          completionStatus: CompletionStatus.COMPLETED,
          lastAccessedAt: new Date()
        }
      });
    }

    // Return results
    return {
      attempt: {
        id: attempt.id,
        score,
        isPassed: isPassed && isWithinTimeLimit,
        pointsEarned: earnedPoints
      },
      feedback: {
        totalQuestions: assessment.questions.length,
        correctAnswers,
        timeSpent: timeSpentMinutes,
        withinTimeLimit: isWithinTimeLimit
      }
    };
  }

  /**
   * Get detailed results for a specific assessment attempt
   */
  async getAttemptDetails(attemptId: number, userId: number) {
    // Find the attempt and ensure it belongs to the user
    const attempt = await prisma.userAssessmentAttempt.findFirst({
      where: {
        id: attemptId,
        userId
      },
      include: {
        assessment: {
          include: {
            learningModule: {
              select: {
                title: true,
                id: true
              }
            }
          }
        },
        userAnswers: {
          include: {
            question: true,
            answer: true
          }
        }
      }
    });

    if (!attempt) {
      throw new Error('Assessment attempt not found or access denied');
    }

    // Calculate metrics
    const totalQuestions = attempt.userAnswers.length;
    const correctAnswers = attempt.userAnswers.filter(a => a.answer?.isCorrect).length;
    const incorrectAnswers = totalQuestions - correctAnswers;
    
    // Format question results
    const questionResults = attempt.userAnswers.map(userAnswer => {
      const isCorrect = userAnswer.answer?.isCorrect || false;
      return {
        questionId: userAnswer.questionId,
        questionText: userAnswer.question.questionText,
        questionType: userAnswer.question.questionType,
        difficulty: userAnswer.question.difficultyLevel,
        points: userAnswer.question.points,
        answerId: userAnswer.answerId,
        answerText: userAnswer.answer?.answerText || userAnswer.textAnswer,
        isCorrect,
        explanation: userAnswer.answer?.explanation || null
      };
    });

    return {
      attempt: {
        id: attempt.id,
        assessmentId: attempt.assessmentId,
        title: attempt.assessment.title,
        moduleId: attempt.assessment.moduleId,
        moduleTitle: attempt.assessment.learningModule?.title,
        score: attempt.score,
        isPassed: attempt.isPassed,
        completedAt: attempt.completedAt,
        timeSpentSeconds: attempt.timeSpentSeconds
      },
      results: {
        totalQuestions,
        correctAnswers,
        incorrectAnswers,
        accuracy: totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0
      },
      questions: questionResults
    };
  }

  /**
   * Get assessment attempt history for a user
   */
  async getUserAssessmentHistory(userId: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    // Get total count
    const total = await prisma.userAssessmentAttempt.count({
      where: { userId }
    });
    
    // Get attempts with pagination
    const attempts = await prisma.userAssessmentAttempt.findMany({
      where: { userId },
      include: {
        assessment: {
          include: {
            learningModule: {
              select: {
                title: true
              }
            }
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      },
      skip,
      take: limit
    });
    
    // Format the data
    const formattedAttempts = attempts.map(attempt => ({
      id: attempt.id,
      assessmentId: attempt.assessmentId,
      title: attempt.assessment.title,
      moduleTitle: attempt.assessment.learningModule?.title,
      score: attempt.score,
      isPassed: attempt.isPassed,
      attemptNumber: attempt.attemptNumber,
      completedAt: attempt.completedAt,
      timeSpentSeconds: attempt.timeSpentSeconds
    }));
    
    return {
      data: formattedAttempts,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }
  
  /**
   * Get assessment progress metrics for a user
   */
  async getUserAssessmentProgress(userId: number) {
    // Get all attempts for this user
    const attempts = await prisma.userAssessmentAttempt.findMany({
      where: { userId },
      include: {
        assessment: {
          include: {
            learningModule: {
              select: {
                title: true,
                id: true
              }
            }
          }
        },
        userAnswers: {
          include: {
            question: true,
            answer: true
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    });
    
    if (attempts.length === 0) {
      return {
        summary: {
          totalAttempts: 0,
          passRate: 0,
          averageScore: 0,
          accuracy: 0,
          timePerQuestion: 0
        },
        byModule: [],
        byDifficulty: [],
        recentAttempts: []
      };
    }
    
    // Calculate metrics
    const totalAttempts = attempts.length;
    const passedAttempts = attempts.filter(attempt => attempt.isPassed).length;
    const passRate = (passedAttempts / totalAttempts) * 100;
    const averageScore = attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / totalAttempts;
    
    // Calculate answer accuracy
    let correctAnswers = 0;
    let totalAnswers = 0;
    
    attempts.forEach(attempt => {
      attempt.userAnswers.forEach(userAnswer => {
        totalAnswers++;
        // Safely check if answer exists and is correct
        if (userAnswer.answer && userAnswer.answer.isCorrect === true) {
          correctAnswers++;
        }
      });
    });
    
    const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0;
    
    // Calculate average time per question
    const totalQuestions = attempts.reduce((sum, attempt) => sum + attempt.userAnswers.length, 0);
    const totalTime = attempts.reduce((sum, attempt) => sum + (attempt.timeSpentSeconds || 0), 0);
    const timePerQuestion = totalQuestions > 0 ? totalTime / totalQuestions : 0;
    
    // Group by module
    const moduleMap = new Map();
    attempts.forEach(attempt => {
      const moduleId = attempt.assessment.moduleId;
      const moduleTitle = attempt.assessment.learningModule?.title || `Module ${moduleId}`;
      
      if (!moduleMap.has(moduleId)) {
        moduleMap.set(moduleId, {
          moduleId,
          moduleTitle,
          attempts: 0,
          passed: 0,
          averageScore: 0,
          scores: []
        });
      }
      
      const moduleStats = moduleMap.get(moduleId);
      moduleStats.attempts++;
      if (attempt.isPassed) moduleStats.passed++;
      moduleStats.scores.push(attempt.score || 0);
    });
    
    // Calculate averages for each module
    const byModule = Array.from(moduleMap.values()).map(stats => ({
      moduleId: stats.moduleId,
      moduleTitle: stats.moduleTitle,
      attempts: stats.attempts,
      passRate: (stats.passed / stats.attempts) * 100,
      averageScore: stats.scores.reduce((a: number, b: number) => a + b, 0) / stats.scores.length
    }));
    
    // Format recent attempts
    const recentAttempts = attempts.slice(0, 5).map(attempt => ({
      id: attempt.id,
      assessmentId: attempt.assessmentId,
      assessmentTitle: attempt.assessment.title,
      moduleId: attempt.assessment.moduleId,
      moduleTitle: attempt.assessment.learningModule?.title,
      score: attempt.score,
      isPassed: attempt.isPassed,
      attemptNumber: attempt.attemptNumber,
      completedAt: attempt.completedAt
    }));
    
    return {
      summary: {
        totalAttempts,
        passRate,
        averageScore,
        accuracy,
        timePerQuestion
      },
      byModule,
      recentAttempts
    };
  }

  /**
   * Utility method to shuffle an array
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export default new AssessmentService();
