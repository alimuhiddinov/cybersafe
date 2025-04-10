import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware to check if an assessment exists
 */
export const checkAssessmentExists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assessmentId = parseInt(req.params.id);
    
    if (isNaN(assessmentId)) {
      return res.status(400).json({ message: 'Invalid assessment ID' });
    }
    
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId }
    });
    
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    
    // Attach assessment to request for use in subsequent middleware or routes
    req.assessment = assessment;
    next();
  } catch (error) {
    console.error('Assessment exists check error:', error);
    return res.status(500).json({ message: 'Server error checking assessment' });
  }
};

/**
 * Middleware to check if a question exists
 */
export const checkQuestionExists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const questionId = parseInt(req.params.id);
    
    if (isNaN(questionId)) {
      return res.status(400).json({ message: 'Invalid question ID' });
    }
    
    const question = await prisma.question.findUnique({
      where: { id: questionId }
    });
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    // Attach question to request for use in subsequent middleware or routes
    req.question = question;
    next();
  } catch (error) {
    console.error('Question exists check error:', error);
    return res.status(500).json({ message: 'Server error checking question' });
  }
};

/**
 * Middleware to check if an answer exists
 */
export const checkAnswerExists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const answerId = parseInt(req.params.id);
    
    if (isNaN(answerId)) {
      return res.status(400).json({ message: 'Invalid answer ID' });
    }
    
    const answer = await prisma.answer.findUnique({
      where: { id: answerId }
    });
    
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }
    
    // Attach answer to request for use in subsequent middleware or routes
    req.answer = answer;
    next();
  } catch (error) {
    console.error('Answer exists check error:', error);
    return res.status(500).json({ message: 'Server error checking answer' });
  }
};

/**
 * Middleware to check if an assessment attempt exists and belongs to the user
 */
export const checkAssessmentAttemptAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const attemptId = parseInt(req.params.id);
    const userId = req.user?.id;
    
    if (isNaN(attemptId)) {
      return res.status(400).json({ message: 'Invalid attempt ID' });
    }
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const attempt = await prisma.userAssessmentAttempt.findUnique({
      where: { id: attemptId }
    });
    
    if (!attempt) {
      return res.status(404).json({ message: 'Assessment attempt not found' });
    }
    
    // Check if the attempt belongs to the user or if user is admin
    if (attempt.userId !== userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'You do not have permission to access this attempt' });
    }
    
    // Attach attempt to request for use in subsequent middleware or routes
    req.attempt = attempt;
    next();
  } catch (error) {
    console.error('Assessment attempt access check error:', error);
    return res.status(500).json({ message: 'Server error checking assessment attempt' });
  }
};

// Extend Express Request interface to include our custom properties
declare global {
  namespace Express {
    interface Request {
      assessment?: any;
      question?: any;
      answer?: any;
      attempt?: any;
    }
  }
}
