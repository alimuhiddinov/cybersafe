import { Request, Response, NextFunction } from 'express';
import { PrismaClient, LearningModule } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware to check if a module exists
 * If it does, attaches it to the request object
 */
export const moduleExists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const moduleId = parseInt(req.params.moduleId);
    
    if (isNaN(moduleId)) {
      return res.status(400).json({ message: 'Invalid module ID' });
    }

    const module = await prisma.learningModule.findUnique({
      where: { id: moduleId }
    });

    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // Attach module to request object
    (req as any).module = module;
    next();
  } catch (error) {
    console.error('Module exists middleware error:', error);
    res.status(500).json({ message: 'Server error checking module existence' });
  }
};

/**
 * Middleware to check if user has premium access to a module
 * Requires authentication middleware to run first
 */
export const checkPremiumAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const module = (req as any).module as LearningModule;
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // For now, all content is accessible as premium flag isn't in the schema
    // This middleware can be expanded later when premium content is implemented
    return next();

    // The following code can be uncommented and adapted when premium flag is added to the schema
    /*
    // If module is premium, check if user has premium access
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required for premium content' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if user has premium access
    if (!user.isPremium) {
      return res.status(403).json({ 
        message: 'Premium subscription required to access this content',
        isPremium: false
      });
    }

    // If premium has expired
    if (user.premiumExpiryDate && user.premiumExpiryDate < new Date()) {
      return res.status(403).json({ 
        message: 'Your premium subscription has expired',
        isPremium: false,
        expired: true
      });
    }
    */

    // User has valid premium access
    next();
  } catch (error) {
    console.error('Premium access middleware error:', error);
    res.status(500).json({ message: 'Server error checking premium access' });
  }
};

/**
 * Middleware to check if a module is published
 * If unpublished, only allow admin and instructor access
 */
export const checkModulePublished = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const module = (req as any).module as LearningModule;
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    // If module is published, allow access
    if (module.isPublished) {
      return next();
    }

    // If module is not published, only allow admin and instructor access
    const userRole = req.user?.role;
    
    if (!userRole || (userRole !== 'ADMIN' && userRole !== 'INSTRUCTOR')) {
      return res.status(403).json({ 
        message: 'This module is not yet published',
        isPublished: false
      });
    }

    // Admin or instructor can access unpublished modules
    next();
  } catch (error) {
    console.error('Module published middleware error:', error);
    res.status(500).json({ message: 'Server error checking module publication status' });
  }
};
