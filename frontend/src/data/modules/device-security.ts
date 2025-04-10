import { ModuleStructuredContent } from '../../components/modules/ModuleDetailContent';

const deviceSecurityContent: ModuleStructuredContent = {
  title: "Module 5: Physical Hacking and Device Security",
  
  overview: "The Physical Hacking and Device Security module addresses the often-overlooked physical dimension of cybersecurity by focusing on tangible threats to digital systems. This module explores the various ways attackers can exploit physical access to devices, storage media, and network infrastructure. Through practical demonstrations and defensive strategy development, participants will learn to identify and mitigate risks associated with device tampering, unauthorized physical access, and emerging hardware-based attack tools.",
  
  learningObjectives: [
    "Identify physical security vulnerabilities in computing environments",
    "Recognize signs of device tampering and unauthorized access",
    "Understand the capabilities and limitations of common hardware attack tools",
    "Implement comprehensive physical security protocols for devices and media",
    "Develop response strategies for suspected physical security breaches",
    "Create layered defense plans that integrate digital and physical security measures"
  ],
  
  contentSections: [
    {
      title: "Physical Attack Vectors",
      topics: [
        {
          title: "The intersection of physical and digital security",
          description: "Understanding how physical access compromises digital protection"
        },
        {
          title: "Common entry points and access vulnerabilities",
          description: "Identifying the most frequent pathways for physical security breaches"
        },
        {
          title: "Unauthorized device access scenarios",
          description: "Real-world examples of how attackers gain physical access to systems"
        },
        {
          title: "Social engineering for physical access",
          description: "How attackers manipulate people to bypass physical security controls"
        },
        {
          title: "Physical security breach statistics and case studies",
          description: "Data and examples highlighting the prevalence and impact of physical attacks"
        }
      ]
    },
    {
      title: "USB and Peripheral Threats",
      topics: [
        {
          title: "USB Attack Mechanisms",
          description: "How malicious USB devices compromise systems through various techniques"
        },
        {
          title: "Rubber Ducky and BadUSB",
          description: "Understanding HID emulation attack tools that mimic trusted peripherals"
        },
        {
          title: "Data Exfiltration Devices",
          description: "Identifying hardware designed for unauthorized data access and theft"
        },
        {
          title: "Charging Port Vulnerabilities",
          description: "Risks associated with public charging stations and power-only cables"
        },
        {
          title: "Defense Strategies",
          description: "USB port security measures and safe peripheral handling practices"
        }
      ]
    },
    {
      title: "Advanced Hardware Attack Tools",
      topics: [
        {
          title: "Flipper Zero",
          description: "Understanding the capabilities, limitations, and detection of this multi-tool device"
        },
        {
          title: "Wi-Fi Jammers",
          description: "How signal disruption tools can create availability attacks and bypass security"
        },
        {
          title: "RFID/NFC Cloners",
          description: "Credential theft techniques targeting contactless cards and access systems"
        },
        {
          title: "Hardware Keyloggers",
          description: "Detecting and preventing physical devices that capture keystrokes"
        },
        {
          title: "Mobile Device Cracking Tools",
          description: "Understanding tools designed to extract data from smartphones and tablets"
        }
      ]
    },
    {
      title: "Secure Device Management",
      topics: [
        {
          title: "Lost and stolen device protocols",
          description: "Procedures for responding to missing devices with sensitive data"
        },
        {
          title: "Remote wipe and tracking implementation",
          description: "Setting up device management solutions for security incidents"
        },
        {
          title: "Device disposal and data destruction methods",
          description: "Proper techniques for securely decommissioning hardware"
        },
        {
          title: "Hardware inventory and chain of custody practices",
          description: "Maintaining accountability and tracking of sensitive devices"
        },
        {
          title: "BYOD security considerations and policies",
          description: "Managing security risks of personal devices in organizational settings"
        }
      ]
    },
    {
      title: "Physical Environment Security",
      topics: [
        {
          title: "Workspace security and clean desk policies",
          description: "Preventing information exposure in physical workspaces"
        },
        {
          title: "Server room and network closet protection",
          description: "Securing critical infrastructure from unauthorized access"
        },
        {
          title: "Visitor management and escort procedures",
          description: "Protocols for controlling non-employee access to facilities"
        },
        {
          title: "Security camera and access log implementation",
          description: "Monitoring and recording physical access for accountability"
        },
        {
          title: "Environmental hazard protection",
          description: "Safeguarding against threats like fire, water, and power issues"
        }
      ]
    }
  ],
  
  activities: [
    {
      title: "Device Tampering Recognition",
      description: "Practice identifying signs of physical compromise on various devices"
    },
    {
      title: "USB Attack Simulation",
      description: "Experience controlled demonstration of USB-based threats and defenses"
    },
    {
      title: "Physical Security Audit",
      description: "Conduct a systematic assessment of workspace security vulnerabilities"
    },
    {
      title: "Hardware Defense Planning",
      description: "Develop comprehensive protection strategies for various device types"
    },
    {
      title: "Incident Response Simulation",
      description: "Practice appropriate responses to physical security breach scenarios"
    },
    {
      title: "Secure Device Configuration Lab",
      description: "Implement hardware-level protection features on computers and mobile devices"
    }
  ],
  
  resources: [
    "Physical security assessment checklist",
    "Suspicious hardware identification guide",
    "Device security configuration templates",
    "Storage media handling protocols",
    "Incident response flow charts"
  ],
  
  duration: [
    {
      title: "Core Content",
      time: "2.5 hours"
    },
    {
      title: "Demonstration and Practice",
      time: "2 hours"
    },
    {
      title: "Assessment and Planning",
      time: "1 hour"
    }
  ],
  
  nextSteps: "This module emphasizes the integration of physical security measures with digital security practices, highlighting the importance of a unified approach to information protection that extends beyond purely technical controls. Participants will develop a holistic security mindset that considers both virtual and physical threat landscapes."
};

export default deviceSecurityContent;
