import React from 'react';

interface ModuleSection {
  title: string;
  content: string | string[] | { title: string; items: string[] }[];
}

export interface ModuleStructuredContent {
  title: string;
  overview: string;
  learningObjectives: string[];
  contentSections: {
    title: string;
    topics: {
      title: string;
      description: string;
    }[];
  }[];
  activities: {
    title: string;
    description: string;
  }[];
  resources: string[];
  duration: {
    title: string;
    time: string;
  }[];
  nextSteps?: string;
}

interface ModuleDetailContentProps {
  moduleContent: ModuleStructuredContent;
}

const ModuleDetailContent: React.FC<ModuleDetailContentProps> = ({ moduleContent }) => {
  return (
    <div className="module-content prose prose-lg max-w-none">
      {/* Module Title */}
      <h1 className="text-3xl font-bold mb-6">{moduleContent.title}</h1>
      
      {/* Module Overview */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Module Overview</h2>
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <p>{moduleContent.overview}</p>
        </div>
      </section>
      
      {/* Learning Objectives */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Learning Objectives</h2>
        <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
          <p className="mb-3 font-medium text-indigo-800">By the end of this module, participants will be able to:</p>
          <ul className="list-disc pl-6 space-y-2">
            {moduleContent.learningObjectives.map((objective, index) => (
              <li key={index} className="text-indigo-900">{objective}</li>
            ))}
          </ul>
        </div>
      </section>
      
      {/* Module Content */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Module Content</h2>
        <div className="space-y-6">
          {moduleContent.contentSections.map((section, idx) => (
            <div key={idx} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-xl font-semibold mb-3">{idx + 1}. {section.title}</h3>
              <ul className="list-disc pl-6 space-y-2">
                {section.topics.map((topic, topicIdx) => (
                  <li key={topicIdx} className="mb-2">
                    <span className="font-medium">{topic.title}:</span> {topic.description}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      
      {/* Activities & Assessments */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Activities & Assessments</h2>
        <div className="bg-green-50 p-6 rounded-lg border border-green-100">
          <ul className="list-none space-y-4">
            {moduleContent.activities.map((activity, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 bg-green-600 rounded-full flex items-center justify-center mt-1 mr-3">
                  <span className="text-white text-sm font-bold">{index + 1}</span>
                </div>
                <div>
                  <h4 className="font-bold text-green-800">{activity.title}</h4>
                  <p className="text-green-900">{activity.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
      
      {/* Resources */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Resources</h2>
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-100">
          <ul className="list-disc pl-6 space-y-2">
            {moduleContent.resources.map((resource, index) => (
              <li key={index} className="text-purple-900">{resource}</li>
            ))}
          </ul>
        </div>
      </section>
      
      {/* Estimated Duration */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Estimated Duration</h2>
        <div className="bg-amber-50 p-6 rounded-lg border border-amber-100">
          <div className="space-y-2">
            {moduleContent.duration.map((item, index) => (
              <div key={index} className="flex justify-between items-center border-b border-amber-200 pb-2 last:border-b-0">
                <span className="font-medium text-amber-900">{item.title}</span>
                <span className="text-amber-800">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Next Steps */}
      {moduleContent.nextSteps && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Next Steps</h2>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <p>{moduleContent.nextSteps}</p>
          </div>
        </section>
      )}
    </div>
  );
};

export default ModuleDetailContent;
