import { PrismaClient, DifficultyLevel, CompletionStatus, QuestionType } from '@prisma/client';
import assessmentService from './services/assessment.service';

const prisma = new PrismaClient();

interface QuestionWithAnswers {
  id: number;
  questionText: string;
  questionType: QuestionType;
  difficultyLevel: DifficultyLevel;
  orderIndex: number;
  points: number;
  assessmentId: number;
  answers: Array<{
    id: number;
    answerText: string;
    isCorrect: boolean;
    explanation?: string;
  }>;
}

interface AssessmentWithQuestions {
  id: number;
  title: string;
  description: string;
  passThreshold: number;
  timeLimit: number | null;
  moduleId: number;
  isActive: boolean;
  randomizeQuestions: boolean;
  questions: QuestionWithAnswers[];
}

async function testAssessmentEngine() {
  try {
    console.log('\n--- CyberSafe Assessment Engine Test ---\n');
    
    // Step 1: Get an example user from the database
    console.log('Finding test user...');
    const user = await prisma.user.findFirst({
      where: { role: 'USER' }
    });
    
    if (!user) {
      console.error('No test user found. Please ensure the database is seeded with at least one user.');
      return;
    }
    
    console.log(`Using test user: ${user.username} (ID: ${user.id})`);
    
    // Step 2: Get an example module
    console.log('\nFinding test module...');
    const module = await prisma.learningModule.findFirst();
    
    if (!module) {
      console.error('No learning modules found. Please ensure the database is seeded with at least one module.');
      return;
    }
    
    console.log(`Using test module: ${module.title} (ID: ${module.id})`);
    
    // Step 3: Generate a quiz
    console.log('\nGenerating quiz...');
    try {
      const quiz = await assessmentService.generateQuiz(
        user.id,
        module.id,
        DifficultyLevel.BEGINNER,
        5 // 5 questions
      ) as unknown as AssessmentWithQuestions;
      
      console.log(`Quiz generated with ${quiz.questions.length} questions`);
      console.log(`Quiz title: ${quiz.title}`);
      
      // Step 4: Submit an assessment (simulate answering all questions)
      console.log('\nSimulating assessment submission...');
      
      // Create an array of answers (randomly select the first answer for each question)
      const answers = quiz.questions.map(question => {
        const answerId = question.answers.length > 0 ? question.answers[0].id : null;
        return {
          questionId: question.id,
          answerId: answerId,
          textAnswer: !answerId ? 'Sample answer text' : undefined
        };
      });
      
      const result = await assessmentService.submitAssessment(
        user.id,
        quiz.id,
        answers,
        120 // 2 minutes spent on assessment
      );
      
      console.log(`Assessment submitted successfully!`);
      console.log(`Score: ${result.attempt.score}%`);
      console.log(`Passed: ${result.attempt.isPassed ? 'Yes' : 'No'}`);
      console.log(`Points earned: ${result.attempt.pointsEarned}`);
      console.log(`Correct answers: ${result.feedback.correctAnswers}/${result.feedback.totalQuestions}`);
      
      // Step 5: Get history
      console.log('\nGetting assessment history...');
      const history = await assessmentService.getUserAssessmentHistory(user.id);
      console.log(`User has ${history.data.length} assessment attempts in their history`);
      
      // Step 6: Get assessment progress
      console.log('\nGetting assessment progress metrics...');
      const progress = await assessmentService.getUserAssessmentProgress(user.id);
      console.log(`Overall assessment pass rate: ${progress.summary.passRate.toFixed(2)}%`);
      console.log(`Average score: ${progress.summary.averageScore.toFixed(2)}%`);
      console.log(`Answer accuracy: ${progress.summary.accuracy.toFixed(2)}%`);
      
    } catch (error) {
      console.error('Error testing assessment engine:', error);
    }
    
    console.log('\nAssessment engine test complete!');
  } catch (error) {
    console.error('Error during assessment engine test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAssessmentEngine().then(() => {
  console.log('Test completed');
});
