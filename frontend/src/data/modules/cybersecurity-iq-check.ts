import { ModuleStructuredContent } from '../../components/modules/ModuleDetailContent';

const cybersecurityIQCheckContent: ModuleStructuredContent = {
  title: "Module 1: Cybersecurity IQ Check",
  
  overview: "The Cybersecurity IQ Check serves as an entry point to your cybersecurity learning journey. This assessment-based module evaluates your current understanding of fundamental internet security concepts and practices, establishing a baseline for your personalized learning path. Through interactive quizzes and scenarios, you'll discover your cybersecurity strengths and identify key areas for improvement.",
  
  learningObjectives: [
    "Assess their current knowledge of basic cybersecurity principles",
    "Identify personal knowledge gaps in various security domains",
    "Understand their cybersecurity preparedness level",
    "Receive a customized learning roadmap based on assessment results",
    "Prioritize which subsequent modules will provide the most value"
  ],
  
  contentSections: [
    {
      title: "Pre-Assessment Orientation",
      topics: [
        {
          title: "Introduction to cybersecurity fundamentals",
          description: "A brief overview of key cybersecurity concepts to ensure all participants have the baseline knowledge needed for the assessment"
        },
        {
          title: "Overview of assessment methodology",
          description: "Explanation of how the assessment is structured, what types of questions to expect, and how difficulty adapts to your responses"
        },
        {
          title: "How to interpret results and scoring",
          description: "Guidance on understanding your assessment results and how they translate to your cybersecurity skill level"
        }
      ]
    },
    {
      title: "Comprehensive Assessment Areas",
      topics: [
        {
          title: "General Security Knowledge",
          description: "Basic security terminology and concepts that every internet user should understand"
        },
        {
          title: "Online Behavior",
          description: "Evaluation of risk awareness in daily online activities and browsing habits"
        },
        {
          title: "Device Security",
          description: "Understanding of proper device protection measures including updates, encryption, and physical security"
        },
        {
          title: "Network Security",
          description: "Knowledge of secure connection practices for home, public, and workplace networks"
        },
        {
          title: "Data Protection",
          description: "Awareness of proper data handling, backup strategies, and privacy settings"
        },
        {
          title: "Threat Recognition",
          description: "Ability to identify common cybersecurity threats including phishing, malware, and social engineering"
        }
      ]
    },
    {
      title: "Results Analysis",
      topics: [
        {
          title: "Detailed breakdown of performance",
          description: "Comprehensive analysis of your performance across all security domains assessed"
        },
        {
          title: "Comparative analysis",
          description: "How your knowledge compares to industry benchmarks and peers in similar roles"
        },
        {
          title: "Identification of knowledge strengths and critical gaps",
          description: "Clear visualization of your strongest areas and those requiring immediate attention"
        },
        {
          title: "Visual representation of security preparedness",
          description: "Interactive dashboard showing your security readiness across different domains"
        }
      ]
    }
  ],
  
  activities: [
    {
      title: "Adaptive Quiz System",
      description: "Questions adjust in difficulty based on your responses, ensuring an accurate assessment of your knowledge level"
    },
    {
      title: "Scenario-Based Challenges",
      description: "Apply your knowledge to realistic security situations that simulate common threats and decision points"
    },
    {
      title: "Knowledge Verification Checkpoints",
      description: "Periodic mini-assessments that confirm your understanding of core concepts before advancing"
    },
    {
      title: "Self-Reflection Prompts",
      description: "Guided questions that help you evaluate your own security practices and identify personal risk areas"
    },
    {
      title: "Custom Learning Path Generator",
      description: "Automatically creates your personalized training program based on assessment results and learning goals"
    }
  ],
  
  resources: [
    "Cybersecurity terminology glossary for reference during assessment",
    "Preliminary reading materials to refresh basic knowledge before beginning",
    "Quick reference guides for common security best practices",
    "Interactive cybersecurity readiness calculator",
    "Post-assessment interpretation guide"
  ],
  
  duration: [
    {
      title: "Assessment Time",
      time: "25-30 minutes"
    },
    {
      title: "Results Review",
      time: "15 minutes"
    },
    {
      title: "Learning Path Planning",
      time: "15 minutes"
    }
  ],
  
  nextSteps: "Upon completion of your Cybersecurity IQ Check, you'll receive immediate feedback with actionable insights and a recommended sequence of modules tailored to address your specific needs. Your personalized dashboard will track your progress throughout the entire program, allowing you to visualize your growing cybersecurity competence."
};

export default cybersecurityIQCheckContent;
