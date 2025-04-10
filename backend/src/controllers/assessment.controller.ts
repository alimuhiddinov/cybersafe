import { Request, Response } from 'express';
import assessmentService from '../services/assessment.service';
import { DifficultyLevel, UserRole } from '@prisma/client';

/**
 * Create a new assessment
 * @route POST /api/assessment
 * @access Private (Admin/Instructor)
 */
export const createAssessment = async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      description, 
      moduleId, 
      difficultyLevel, 
      timeLimit, 
      passThreshold, 
      isActive 
    } = req.body;

    // Validate required fields
    if (!title || !description || !moduleId) {
      return res.status(400).json({ message: 'Please provide title, description, and moduleId' });
    }

    const assessment = await assessmentService.createAssessment({
      title,
      description,
      timeLimit: timeLimit || 15,
      passThreshold: passThreshold || 70,
      isActive: isActive !== undefined ? isActive : true,
      learningModule: {
        connect: { id: parseInt(moduleId) }
      },
      ...(difficultyLevel ? { difficultyLevel: difficultyLevel as DifficultyLevel } : {})
    });

    res.status(201).json(assessment);
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ message: 'Server error creating assessment' });
  }
};

/**
 * Update an assessment
 * @route PUT /api/assessment/:id
 * @access Private (Admin/Instructor)
 */
export const updateAssessment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      moduleId, 
      difficultyLevel, 
      timeLimit, 
      passThreshold, 
      isActive 
    } = req.body;

    // Create update data
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (timeLimit !== undefined) updateData.timeLimit = timeLimit;
    if (passThreshold !== undefined) updateData.passThreshold = passThreshold;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    if (difficultyLevel !== undefined) {
      updateData.difficultyLevel = difficultyLevel as DifficultyLevel;
    }
    
    if (moduleId !== undefined) {
      updateData.learningModule = {
        connect: { id: parseInt(moduleId) }
      };
    }

    const assessment = await assessmentService.updateAssessment(parseInt(id), updateData);

    res.status(200).json(assessment);
  } catch (error) {
    console.error('Update assessment error:', error);
    res.status(500).json({ message: 'Server error updating assessment' });
  }
};

/**
 * Delete an assessment
 * @route DELETE /api/assessment/:id
 * @access Private (Admin/Instructor)
 */
export const deleteAssessment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const assessment = await assessmentService.deleteAssessment(parseInt(id));

    res.status(200).json({ message: 'Assessment deleted successfully', assessment });
  } catch (error) {
    console.error('Delete assessment error:', error);
    res.status(500).json({ message: 'Server error deleting assessment' });
  }
};

/**
 * Get an assessment by ID
 * @route GET /api/assessment/:id
 * @access Private
 */
export const getAssessmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const includeQuestions = req.query.includeQuestions !== 'false';
    
    const assessment = await assessmentService.getAssessmentById(parseInt(id), includeQuestions);

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    res.status(200).json(assessment);
  } catch (error) {
    console.error('Get assessment error:', error);
    res.status(500).json({ message: 'Server error retrieving assessment' });
  }
};

/**
 * Get all assessments with filtering
 * @route GET /api/assessment
 * @access Private (Admin/Instructor)
 */
export const getAllAssessments = async (req: Request, res: Response) => {
  try {
    const { 
      moduleId, 
      title, 
      isActive, 
      difficultyLevel,
      page,
      limit
    } = req.query;

    const filters = {
      moduleId: moduleId ? parseInt(moduleId as string) : undefined,
      title: title as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      difficultyLevel: difficultyLevel as DifficultyLevel,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10
    };

    const assessments = await assessmentService.getAssessments(filters);
    
    res.status(200).json(assessments);
  } catch (error) {
    console.error('Get assessments error:', error);
    res.status(500).json({ message: 'Server error retrieving assessments' });
  }
};

/**
 * Generate a new quiz for the user
 * @route POST /api/assessment/generate
 * @access Private
 */
export const generateQuiz = async (req: Request, res: Response) => {
  try {
    const { moduleId, difficultyLevel, questionCount } = req.body;
    
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User authentication required' });
    }
    
    const userId = req.user.id;

    // Generate quiz
    const quiz = await assessmentService.generateQuiz(
      userId, 
      moduleId, 
      difficultyLevel as DifficultyLevel,
      questionCount || 10
    );

    res.status(200).json(quiz);
  } catch (error) {
    console.error('Generate quiz error:', error);
    res.status(500).json({ message: 'Server error generating quiz' });
  }
};

/**
 * Submit an assessment attempt
 * @route POST /api/assessment/:id/submit
 * @access Private
 */
export const submitAssessment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { answers, timeSpentSeconds } = req.body;
    
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User authentication required' });
    }
    
    const userId = req.user.id;

    // Validate required fields
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ message: 'Please provide an array of answers' });
    }

    // Submit the assessment
    const result = await assessmentService.submitAssessment(
      userId,
      parseInt(id),
      answers,
      timeSpentSeconds || 0
    );

    res.status(200).json(result);
  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({ message: 'Server error submitting assessment' });
  }
};

/**
 * Get user's assessment history
 * @route GET /api/assessment/history
 * @access Private
 */
export const getAssessmentHistory = async (req: Request, res: Response) => {
  try {
    const { page, limit } = req.query;
    
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User authentication required' });
    }
    
    const userId = req.user.id;

    const history = await assessmentService.getUserAssessmentHistory(
      userId,
      page ? parseInt(page as string) : 1,
      limit ? parseInt(limit as string) : 10
    );

    res.status(200).json(history);
  } catch (error) {
    console.error('Get assessment history error:', error);
    res.status(500).json({ message: 'Server error retrieving assessment history' });
  }
};

/**
 * Get detailed results for a specific assessment attempt
 * @route GET /api/assessment/attempt/:id
 * @access Private
 */
export const getAttemptDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User authentication required' });
    }
    
    const userId = req.user.id;

    const details = await assessmentService.getAttemptDetails(parseInt(id), userId);

    res.status(200).json(details);
  } catch (error) {
    console.error('Get attempt details error:', error);
    res.status(500).json({ message: 'Server error retrieving attempt details' });
  }
};

/**
 * Get user's assessment progress metrics
 * @route GET /api/assessment/progress
 * @access Private
 */
export const getAssessmentProgress = async (req: Request, res: Response) => {
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User authentication required' });
    }
    
    const userId = req.user.id;

    const progress = await assessmentService.getUserAssessmentProgress(userId);

    res.status(200).json(progress);
  } catch (error) {
    console.error('Get assessment progress error:', error);
    res.status(500).json({ message: 'Server error retrieving assessment progress' });
  }
};
