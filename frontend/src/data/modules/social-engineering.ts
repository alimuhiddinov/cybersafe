import { ModuleStructuredContent } from '../../components/modules/ModuleDetailContent';

const socialEngineeringContent: ModuleStructuredContent = {
  title: "Module 2: Social Engineering",
  
  overview: "The Social Engineering module explores the psychological manipulation techniques used by cybercriminals to exploit human vulnerabilities rather than technical weaknesses. This module develops your ability to recognize and respond to social engineering attempts across various communication channels. Through realistic simulations and interactive scenarios, you'll gain practical experience identifying manipulation tactics and implementing effective countermeasures.",
  
  learningObjectives: [
    "Define social engineering and explain its role in cybersecurity breaches",
    "Identify common social engineering tactics and psychological triggers",
    "Recognize warning signs of manipulation attempts across multiple channels",
    "Apply critical thinking strategies to evaluate suspicious communications",
    "Demonstrate appropriate response protocols when confronted with potential attacks",
    "Develop a personal protection plan against social engineering attempts"
  ],
  
  contentSections: [
    {
      title: "Fundamentals of Social Engineering",
      topics: [
        {
          title: "Psychological principles exploited by attackers",
          description: "Understanding the core psychological vulnerabilities that make social engineering effective"
        },
        {
          title: "The anatomy of a social engineering attack",
          description: "Breaking down the stages and components of successful social engineering campaigns"
        },
        {
          title: "Historical case studies and their impact",
          description: "Analysis of significant social engineering breaches and their consequences"
        },
        {
          title: "Statistics on prevalence and effectiveness",
          description: "Data-driven insights into the scale and success rates of social engineering attacks"
        }
      ]
    },
    {
      title: "Common Attack Vectors",
      topics: [
        {
          title: "Phishing and Spear Phishing",
          description: "Targeted email deception techniques designed to harvest credentials or deliver malware"
        },
        {
          title: "Vishing",
          description: "Voice-based phone scams and manipulation tactics used to extract information"
        },
        {
          title: "Smishing",
          description: "SMS and text message fraud methods that exploit mobile communication trust"
        },
        {
          title: "Impersonation",
          description: "Authority figure and colleague impersonation tactics that leverage organizational hierarchies"
        },
        {
          title: "Pretexting",
          description: "Creating fictional scenarios to extract information by establishing false contexts"
        },
        {
          title: "Baiting",
          description: "Using enticing offers to deliver malware or obtain credentials through curiosity"
        }
      ]
    },
    {
      title: "Real-World Impersonation Techniques",
      topics: [
        {
          title: "Executive and authority figure impersonation",
          description: "Tactics used to mimic leadership to pressure employees into taking unauthorized actions"
        },
        {
          title: "IT support and help desk fraud",
          description: "Methods used to exploit trust in technical support personnel to gain system access"
        },
        {
          title: "Vendor and third-party deception",
          description: "Approaches for impersonating trusted business partners to infiltrate organizations"
        },
        {
          title: "Government agency impersonation",
          description: "Techniques that leverage fear of authority to manipulate targets into compliance"
        }
      ]
    },
    {
      title: "Defense Strategies",
      topics: [
        {
          title: "Verification protocols for sensitive requests",
          description: "Establishing multi-channel verification procedures for high-risk communications"
        },
        {
          title: "Communication security in professional environments",
          description: "Creating secure communication channels and practices within organizations"
        },
        {
          title: "Building a healthy skepticism mindset",
          description: "Developing balanced critical thinking that questions without paralyzing decision-making"
        },
        {
          title: "Organizational reporting procedures",
          description: "Implementing clear processes for reporting and responding to suspected social engineering"
        }
      ]
    }
  ],
  
  activities: [
    {
      title: "Interactive Simulations",
      description: "Experience and respond to simulated attacks in a safe environment to build recognition skills"
    },
    {
      title: "Role-Playing Exercises",
      description: "Practice both attacker and defender perspectives to understand manipulation from all angles"
    },
    {
      title: "Red Team/Blue Team Challenges",
      description: "Collaborative defense scenarios that build team response capabilities and awareness"
    },
    {
      title: "Voice Analysis Practice",
      description: "Identify manipulation cues in recorded calls to detect social engineering attempts in real-time"
    },
    {
      title: "Email Identification Drills",
      description: "Distinguish legitimate from fraudulent communications through guided analysis exercises"
    },
    {
      title: "Decision Tree Exercises",
      description: "Practice proper response protocols through scenario-based decision-making simulations"
    }
  ],
  
  resources: [
    "Social engineering attack identification checklist",
    "Organizational communication verification templates",
    "Response protocol quick reference guide",
    "Psychological manipulation tactics reference"
  ],
  
  duration: [
    {
      title: "Core Content",
      time: "2 hours"
    },
    {
      title: "Interactive Exercises",
      time: "1.5 hours"
    },
    {
      title: "Assessment and Practice",
      time: "1 hour"
    }
  ],
  
  nextSteps: "This module contributes to the Social Engineering Defense certification path and provides foundational knowledge for advanced threat detection specializations. Successful completion is verified through practical simulations that test both recognition and response capabilities."
};

export default socialEngineeringContent;
