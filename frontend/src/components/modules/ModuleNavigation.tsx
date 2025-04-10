import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export type ModuleStep = 
  | 'selection' 
  | 'content' 
  | 'assessment' 
  | 'practice' 
  | 'feedback' 
  | 'results';

interface ModuleNavigationProps {
  moduleId?: number;
  currentStep: ModuleStep;
}

const ModuleNavigation: React.FC<ModuleNavigationProps> = ({ moduleId, currentStep }) => {
  const router = useRouter();
  
  // Define steps with labels, icons, and paths
  const steps = [
    { 
      id: 'selection' as ModuleStep, 
      label: 'Module Selection', 
      path: '/modules',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      )
    },
    { 
      id: 'content' as ModuleStep, 
      label: 'Module Content', 
      path: moduleId ? `/modules/${moduleId}` : '#',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    { 
      id: 'assessment' as ModuleStep, 
      label: 'Quiz/Assessment', 
      path: moduleId ? `/modules/${moduleId}/assessment` : '#',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    { 
      id: 'practice' as ModuleStep, 
      label: 'Practice Activity', 
      path: moduleId ? `/modules/${moduleId}/practice` : '#',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      id: 'feedback' as ModuleStep, 
      label: 'Feedback', 
      path: moduleId ? `/modules/${moduleId}/feedback` : '#',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      )
    },
    { 
      id: 'results' as ModuleStep, 
      label: 'Results', 
      path: moduleId ? `/modules/${moduleId}/results` : '#',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    }
  ];

  // Function to determine if a step is active, completed, or upcoming
  const getStepStatus = (stepId: ModuleStep) => {
    const stepIndices: { [key in ModuleStep]: number } = {
      selection: 0,
      content: 1,
      assessment: 2,
      practice: 3,
      feedback: 4,
      results: 5
    };

    const currentIndex = stepIndices[currentStep];
    const stepIndex = stepIndices[stepId];

    if (stepIndex === currentIndex) return 'current';
    if (stepIndex < currentIndex) return 'completed';
    return 'upcoming';
  };

  // Determine which steps should show connections and in what direction
  const getConnectionType = (index: number) => {
    // Special case for the fork after content
    if (index === 1) {
      return 'fork-down'; // Content to Assessment and Practice
    }
    // Special case for the merge before results
    else if (index === 4) {
      return 'fork-up'; // Feedback to Results
    }
    // Standard right arrow for other steps
    else if (index < steps.length - 1) {
      return 'right';
    }
    // No connection for the last step
    return 'none';
  };

  return (
    <div className="pt-4 pb-8">
      <div className="bg-navy-800 p-4 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-2 py-4 relative">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const connectionType = getConnectionType(index);
            
            // Determine colors based on status
            let statusClasses = 'bg-navy-700 text-gray-400'; // upcoming
            if (status === 'current') {
              statusClasses = 'bg-blue-900 text-blue-200 border-blue-500 border-2';
            } else if (status === 'completed') {
              statusClasses = 'bg-green-900 text-green-200';
            }
            
            return (
              <div key={step.id} className="flex flex-col items-center w-full md:w-auto relative">
                {/* Step circle with icon */}
                <Link 
                  href={step.path}
                  className={`rounded-full ${statusClasses} w-14 h-14 flex items-center justify-center z-10 transition-colors duration-300 ${
                    status === 'upcoming' ? 'cursor-not-allowed opacity-50' : 'hover:bg-opacity-90'
                  }`}
                  onClick={(e) => {
                    // Prevent navigation for upcoming steps
                    if (status === 'upcoming') {
                      e.preventDefault();
                    }
                  }}
                >
                  {step.icon}
                </Link>
                
                {/* Step label */}
                <span className={`mt-2 text-xs font-medium ${
                  status === 'current' ? 'text-blue-300' : 
                  status === 'completed' ? 'text-green-300' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
                
                {/* Connection lines between steps */}
                {connectionType !== 'none' && (
                  <div className="hidden md:block absolute">
                    {connectionType === 'right' && (
                      <div className={`absolute w-full h-0.5 top-7 left-14 ${
                        status === 'completed' ? 'bg-green-600' : 'bg-navy-700'
                      }`} style={{ width: 'calc(100% - 2rem)' }}></div>
                    )}
                    {connectionType === 'fork-down' && (
                      <>
                        {/* Horizontal line to the right */}
                        <div className={`absolute w-1/2 h-0.5 top-7 left-14 ${
                          status === 'completed' ? 'bg-green-600' : 'bg-navy-700'
                        }`}></div>
                        {/* Vertical line down */}
                        <div className={`absolute w-0.5 h-16 top-7 left-14 ml-20 ${
                          status === 'completed' ? 'bg-green-600' : 'bg-navy-700'
                        }`}></div>
                        {/* Horizontal line to the next node */}
                        <div className={`absolute w-12 h-0.5 top-23 left-14 ml-20 ${
                          status === 'completed' ? 'bg-green-600' : 'bg-navy-700'
                        }`}></div>
                      </>
                    )}
                    {connectionType === 'fork-up' && (
                      <>
                        {/* Vertical line up */}
                        <div className={`absolute w-0.5 h-16 bottom-16 left-7 ${
                          status === 'completed' ? 'bg-green-600' : 'bg-navy-700'
                        }`}></div>
                        {/* Horizontal line to the next node */}
                        <div className={`absolute w-12 h-0.5 bottom-16 left-7 ${
                          status === 'completed' ? 'bg-green-600' : 'bg-navy-700'
                        }`}></div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ModuleNavigation;
