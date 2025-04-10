import { ModuleStructuredContent } from '../../components/modules/ModuleDetailContent';
import cybersecurityIQCheckContent from './cybersecurity-iq-check';
import socialEngineeringContent from './social-engineering';
import passwordStrengthContent from './password-strength';
import phishingAwarenessContent from './phishing-awareness';
import deviceSecurityContent from './device-security';
import wifiSecurityContent from './wifi-security';
import incidentResponseContent from './incident-response';

// Map module IDs to their structured content
const moduleContentMap: Record<number, ModuleStructuredContent> = {
  1: cybersecurityIQCheckContent,
  2: socialEngineeringContent,
  3: passwordStrengthContent,
  4: phishingAwarenessContent,
  5: deviceSecurityContent,
  6: wifiSecurityContent,
  7: incidentResponseContent
};

// Title to ID mapping to help with lookup by title
const moduleTitleMap: Record<string, number> = {
  "Cybersecurity IQ Check": 1,
  "Social Engineering": 2,
  "Password Strength": 3,
  "Phishing Awareness": 4,
  "Physical Hacking and Device Security": 5,
  "Wireless Threats (Wi-Fi Security)": 6,
  "Incident Response": 7
};

// Function to get content by module ID
export const getModuleContent = (id: number): ModuleStructuredContent | null => {
  return moduleContentMap[id] || null;
};

// Function to get content by module title
export const getModuleContentByTitle = (title: string): ModuleStructuredContent | null => {
  const normalizedTitle = title.trim();
  const moduleId = moduleTitleMap[normalizedTitle];
  
  if (moduleId) {
    return moduleContentMap[moduleId];
  }
  
  // Try a partial match if exact match fails
  for (const [moduleTitle, id] of Object.entries(moduleTitleMap)) {
    if (normalizedTitle.includes(moduleTitle) || moduleTitle.includes(normalizedTitle)) {
      return moduleContentMap[id];
    }
  }
  
  return null;
};

// Export all module content
export {
  cybersecurityIQCheckContent,
  socialEngineeringContent,
  passwordStrengthContent,
  phishingAwarenessContent,
  deviceSecurityContent,
  wifiSecurityContent,
  incidentResponseContent
};
