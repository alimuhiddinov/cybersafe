import { ModuleStructuredContent } from '../../components/modules/ModuleDetailContent';

const phishingAwarenessContent: ModuleStructuredContent = {
  title: "Module 4: Phishing Awareness",
  
  overview: "The Phishing Awareness module provides comprehensive training on identifying, avoiding, and reporting increasingly sophisticated phishing attempts. Through exposure to realistic simulations of phishing emails, messages, and counterfeit websites, participants develop the critical evaluation skills needed to protect sensitive information. This module combines technical indicator analysis with practical experience to build instinctive recognition of deceptive communications and websites.",
  
  learningObjectives: [
    "Identify visual, contextual, and technical indicators of phishing attempts",
    "Analyze email headers and link destinations to verify legitimacy",
    "Recognize the various types of phishing attacks and their distinctive characteristics",
    "Properly handle suspicious communications without exposing sensitive information",
    "Implement appropriate reporting procedures for potential phishing attempts",
    "Apply defensive browsing techniques to prevent credential theft"
  ],
  
  contentSections: [
    {
      title: "Phishing Attack Landscape",
      topics: [
        {
          title: "Evolution of phishing techniques",
          description: "Historical progression of phishing from simple to sophisticated attacks"
        },
        {
          title: "Current phishing trends and statistics",
          description: "Data on prevalence, success rates, and target demographics"
        },
        {
          title: "Targeting strategies used by attackers",
          description: "How attackers select and research potential victims"
        },
        {
          title: "Organizational impact and breach case studies",
          description: "Real-world consequences of successful phishing attacks"
        },
        {
          title: "Common phishing goals and motivations",
          description: "Understanding what attackers aim to achieve through phishing"
        }
      ]
    },
    {
      title: "Email-Based Phishing Identification",
      topics: [
        {
          title: "Header Analysis",
          description: "Techniques for examining email headers to identify suspicious sender information"
        },
        {
          title: "Content Evaluation",
          description: "Recognizing psychological manipulation tactics in message content"
        },
        {
          title: "Link Inspection",
          description: "Methods for safely verifying the true destination of embedded links"
        },
        {
          title: "Attachment Danger Signs",
          description: "Identifying potentially malicious files based on type and context"
        },
        {
          title: "Brand Impersonation",
          description: "Spotting inconsistencies in brand representation and forgery attempts"
        }
      ]
    },
    {
      title: "Beyond Email: Expanded Phishing Vectors",
      topics: [
        {
          title: "SMS and messaging platform phishing (smishing)",
          description: "Identifying and handling suspicious text and chat messages"
        },
        {
          title: "Social media deception techniques",
          description: "Recognizing phishing attempts through social platforms"
        },
        {
          title: "Search engine phishing and malvertising",
          description: "Avoiding malicious websites in search results and advertisements"
        },
        {
          title: "QR code phishing methods",
          description: "Safely handling QR codes and preventing redirection attacks"
        },
        {
          title: "Business email compromise (BEC) attacks",
          description: "Detecting sophisticated targeted attacks against organizations"
        }
      ]
    },
    {
      title: "Counterfeit Website Detection",
      topics: [
        {
          title: "URL structure analysis and verification",
          description: "Examining web addresses for signs of spoofing or typosquatting"
        },
        {
          title: "Security certificate inspection",
          description: "Verifying HTTPS connections and certificate legitimacy"
        },
        {
          title: "Visual design inconsistency identification",
          description: "Spotting design elements that differ from legitimate sites"
        },
        {
          title: "Content and functionality red flags",
          description: "Recognizing suspicious behavior, errors, or content on fake sites"
        },
        {
          title: "Mobile site verification techniques",
          description: "Additional considerations for validating legitimacy on mobile devices"
        }
      ]
    },
    {
      title: "Organizational Response Protocols",
      topics: [
        {
          title: "Proper reporting procedures",
          description: "Established processes for documenting and escalating suspected phishing"
        },
        {
          title: "Information security team collaboration",
          description: "Working effectively with security personnel during incidents"
        },
        {
          title: "Evidence preservation methods",
          description: "Techniques for capturing phishing attempts for analysis"
        },
        {
          title: "Incident response timelines",
          description: "Understanding urgency and appropriate reaction times"
        },
        {
          title: "Breach containment procedures",
          description: "Actions to take if credentials may have been compromised"
        }
      ]
    }
  ],
  
  activities: [
    {
      title: "Phishing Simulation Campaign",
      description: "Receive and identify various types of simulated phishing attempts"
    },
    {
      title: "Email Forensics Lab",
      description: "Hands-on practice analyzing headers and message properties"
    },
    {
      title: "Website Authentication Challenges",
      description: "Exercises to distinguish legitimate websites from fraudulent ones"
    },
    {
      title: "Reporting Procedure Drills",
      description: "Practice proper documentation and escalation of suspicious communications"
    },
    {
      title: "Real-world Example Analysis",
      description: "Study actual phishing attempts that have been captured and neutralized"
    },
    {
      title: "Mobile Phishing Recognition",
      description: "Identify suspicious messages and sites specifically on mobile devices"
    }
  ],
  
  resources: [
    "Phishing indicator reference guide",
    "Email header analysis tool",
    "Suspicious link verification service",
    "Organizational reporting templates",
    "Browser security configuration guide"
  ],
  
  duration: [
    {
      title: "Core Content",
      time: "2 hours"
    },
    {
      title: "Simulation Exercises",
      time: "1.5 hours"
    },
    {
      title: "Assessment and Practice",
      time: "1 hour"
    }
  ],
  
  nextSteps: "This module includes enrollment in the Monthly Phishing Update program, which provides examples of new phishing techniques and tactics as they emerge. Quarterly refresher simulations maintain vigilance and reinforce recognition skills."
};

export default phishingAwarenessContent;
