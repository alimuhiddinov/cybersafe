import React from 'react';
import Link from 'next/link';
import ProgressIndicator from './ProgressIndicator';

// Types
type ModuleProgressItem = {
  id: number | string;
  title: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  progressPercentage: number;
  isCurrentModule?: boolean;
};

type ModuleProgressTrackerProps = {
  modules: ModuleProgressItem[];
  title?: string;
  showCompleted?: boolean;
};

const ModuleProgressTracker: React.FC<ModuleProgressTrackerProps> = ({
  modules,
  title = 'Your Learning Progress',
  showCompleted = true
}) => {
  // Filter modules based on settings
  const filteredModules = showCompleted
    ? modules
    : modules.filter(module => module.status !== 'COMPLETED');

  // Calculate overall progress
  const overallProgress = modules.length > 0
    ? Math.round(
        modules.reduce((sum, module) => {
          return sum + (module.status === 'COMPLETED' ? 100 : module.progressPercentage);
        }, 0) / modules.length
      )
    : 0;

  // Count completed modules
  const completedCount = modules.filter(module => module.status === 'COMPLETED').length;

  return (
    <div className="bg-navy-800 rounded-xl overflow-hidden">
      <div className="bg-navy-700 px-4 py-3 border-b border-navy-600">
        <h2 className="text-lg font-medium text-white">{title}</h2>
      </div>
      
      {/* Overall progress */}
      <div className="p-4 border-b border-navy-700">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-300">Overall Progress</span>
          <span className="text-sm font-medium text-blue-400">
            {completedCount}/{modules.length} modules
          </span>
        </div>
        <div className="w-full bg-navy-600 rounded-full h-2.5">
          <div
            className="h-2.5 rounded-full bg-blue-500"
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Module list */}
      <div className="p-2">
        {filteredModules.length > 0 ? (
          <ul className="divide-y divide-navy-700">
            {filteredModules.map((module) => (
              <li 
                key={module.id} 
                className={`p-3 ${module.isCurrentModule ? 'bg-navy-700' : ''} rounded-md ${
                  module.isCurrentModule ? '' : 'hover:bg-navy-700'
                } transition-colors`}
              >
                <Link 
                  href={`/modules/${module.id}`}
                  className="block"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-medium text-gray-200">
                      {module.title}
                      {module.isCurrentModule && (
                        <span className="ml-2 px-2 py-0.5 bg-blue-900 text-xs rounded-full">
                          Current
                        </span>
                      )}
                    </h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      module.status === 'COMPLETED' 
                        ? 'bg-green-900 text-green-200' 
                        : module.status === 'IN_PROGRESS'
                          ? 'bg-blue-900 text-blue-200'
                          : 'bg-gray-700 text-gray-300'
                    }`}>
                      {module.status === 'COMPLETED' 
                        ? 'Completed' 
                        : module.status === 'IN_PROGRESS'
                          ? 'In Progress'
                          : 'Not Started'}
                    </span>
                  </div>
                  <ProgressIndicator
                    percentage={module.progressPercentage}
                    status={module.status}
                    showLabel={false}
                    size="small"
                  />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-400 text-sm">No modules in progress</p>
          </div>
        )}
      </div>
      
      {/* View all link */}
      <div className="p-4 border-t border-navy-700">
        <Link
          href="/progress"
          className="text-blue-400 text-sm hover:text-blue-300 flex items-center justify-center"
        >
          View all learning progress
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default ModuleProgressTracker;
