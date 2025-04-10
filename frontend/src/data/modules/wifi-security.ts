import { ModuleStructuredContent } from '../../components/modules/ModuleDetailContent';

const wifiSecurityContent: ModuleStructuredContent = {
  title: "Module 6: Wireless Threats (Wi-Fi Security)",
  
  overview: "The Wireless Threats module explores the unique vulnerabilities associated with wireless network technologies and provides comprehensive strategies for secure connectivity. Participants will gain practical knowledge of various Wi-Fi attack methods, network identification techniques, and signal disruption risks. Through simulated wireless attack scenarios and guided implementation of defensive measures, this module equips users with the skills to maintain secure connections in diverse environments, including high-risk public networks.",
  
  learningObjectives: [
    "Identify various types of wireless networks and their relative security levels",
    "Recognize common wireless attack methodologies and their indicators",
    "Implement VPN solutions for encrypted network traffic",
    "Configure secure wireless connections on various devices",
    "Detect potentially malicious wireless networks and avoid connection",
    "Respond effectively to suspected wireless security compromises",
    "Develop appropriate wireless usage policies for various environments"
  ],
  
  contentSections: [
    {
      title: "Wireless Network Fundamentals",
      topics: [
        {
          title: "Wi-Fi protocol security evolution and vulnerabilities",
          description: "Historical progression of wireless security standards and their weaknesses"
        },
        {
          title: "Network encryption standards comparison",
          description: "Analysis of WEP, WPA, WPA2, and WPA3 security protocols and their effectiveness"
        },
        {
          title: "Public vs. private network risk profiles",
          description: "Understanding the distinct security challenges in different network environments"
        },
        {
          title: "Wireless transmission interception mechanics",
          description: "How attackers can capture and analyze wireless network traffic"
        },
        {
          title: "IoT device wireless security considerations",
          description: "Special security challenges posed by Internet of Things devices"
        }
      ]
    },
    {
      title: "Common Wireless Attack Vectors",
      topics: [
        {
          title: "Evil Twin/Rogue Access Points",
          description: "How attackers create fraudulent networks that mimic legitimate connections"
        },
        {
          title: "Man-in-the-Middle Attacks",
          description: "Techniques for intercepting and potentially altering wireless communications"
        },
        {
          title: "Packet Sniffing",
          description: "Methods used to capture and analyze unencrypted wireless data"
        },
        {
          title: "Deauthentication Attacks",
          description: "Disrupting legitimate connections to force reconnection to malicious networks"
        },
        {
          title: "Password Cracking",
          description: "Techniques specifically targeting wireless network authentication"
        },
        {
          title: "Jamming and Denial of Service",
          description: "Signal disruption methods that can disable wireless communication"
        }
      ]
    },
    {
      title: "Secure Connection Strategies",
      topics: [
        {
          title: "VPN Implementation",
          description: "Selection, configuration, and verification of VPN services for secure browsing"
        },
        {
          title: "Public Network Safety",
          description: "Essential precautions when connecting to shared or untrusted Wi-Fi networks"
        },
        {
          title: "Mobile Hotspot Security",
          description: "Properly configuring and using personal hotspots as secure alternatives"
        },
        {
          title: "Captive Portal Awareness",
          description: "Safely navigating network login screens without exposing credentials"
        },
        {
          title: "Network Validation",
          description: "Techniques to verify the legitimacy of wireless networks before connecting"
        }
      ]
    },
    {
      title: "Advanced Wireless Protection",
      topics: [
        {
          title: "MAC address filtering and management",
          description: "Using hardware identifiers to control network access permissions"
        },
        {
          title: "Wireless intrusion detection systems",
          description: "Tools and techniques for monitoring network perimeters"
        },
        {
          title: "Network segmentation for wireless environments",
          description: "Creating separate network zones to isolate sensitive systems"
        },
        {
          title: "Guest network configuration best practices",
          description: "Securely accommodating visitors without compromising primary networks"
        },
        {
          title: "Home and office wireless security differences",
          description: "Adapting security approaches for different deployment scenarios"
        }
      ]
    }
  ],
  
  activities: [
    {
      title: "Network Identification Exercise",
      description: "Practice identifying legitimate versus suspicious wireless networks"
    },
    {
      title: "VPN Configuration Lab",
      description: "Hands-on setup and testing of secure VPN connections across devices"
    },
    {
      title: "Wi-Fi Attack Simulation",
      description: "Experience and respond to controlled wireless attack scenarios"
    },
    {
      title: "Secure Configuration Workshop",
      description: "Implement wireless protection measures on various device types"
    },
    {
      title: "Policy Development Challenge",
      description: "Create contextual wireless usage guidelines for different environments"
    },
    {
      title: "Public Wi-Fi Navigation Drill",
      description: "Practice secure connection procedures in simulated public environments"
    }
  ],
  
  resources: [
    "Wireless security configuration guides for various devices",
    "VPN selection and implementation guide",
    "Public Wi-Fi security checklist",
    "Network validation tool recommendations",
    "Mobile device wireless protection guide"
  ],
  
  duration: [
    {
      title: "Core Content",
      time: "2 hours"
    },
    {
      title: "Hands-on Implementation",
      time: "1.5 hours"
    },
    {
      title: "Simulation and Practice",
      time: "1.5 hours"
    }
  ],
  
  nextSteps: "This module emphasizes practical application in daily scenarios, ensuring participants can immediately implement protective measures across all wireless-enabled devices. The training focuses on building both technical configuration skills and behavioral awareness for various wireless environments encountered in professional and personal settings."
};

export default wifiSecurityContent;
