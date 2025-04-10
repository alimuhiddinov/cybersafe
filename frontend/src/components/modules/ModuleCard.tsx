import React from 'react';
import Image from 'next/image';
import { Module } from '../../pages/modules/index';

type ModuleCardProps = {
  module: Module;
  onClick: () => void;
  featured?: boolean;
};

// Fallback images for different categories
const getFallbackImage = (title: string) => {
  // Map titles to generalized categories for fallback images
  const bgColors: Record<string, string> = {
    assessment: '5172DC',
    social: 'E91E63',
    password: '4CAF50',
    phishing: 'FF9800',
    device: '9C27B0',
    wifi: '00BCD4',
    incident: 'F44336',
    default: '607D8B'
  };
  
  let category: string = 'default';
  
  if (title.toLowerCase().includes('iq') || title.toLowerCase().includes('assessment')) {
    category = 'assessment';
  } else if (title.toLowerCase().includes('social')) {
    category = 'social';
  } else if (title.toLowerCase().includes('password')) {
    category = 'password';
  } else if (title.toLowerCase().includes('phishing')) {
    category = 'phishing';
  } else if (title.toLowerCase().includes('device') || title.toLowerCase().includes('physical')) {
    category = 'device';
  } else if (title.toLowerCase().includes('wireless') || title.toLowerCase().includes('wifi') || title.toLowerCase().includes('wi-fi')) {
    category = 'wifi';
  } else if (title.toLowerCase().includes('incident') || title.toLowerCase().includes('response')) {
    category = 'incident';
  }
  
  // Generate a data URI for a colored rectangle with text
  const textColor = 'FFFFFF';
  const text = encodeURIComponent(title.length > 25 ? title.substring(0, 22) + '...' : title);
  
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='160' viewBox='0 0 400 160'%3E%3Crect width='400' height='160' fill='%23${bgColors[category]}' /%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='16' fill='%23${textColor}' text-anchor='middle' dominant-baseline='middle'%3E${text}%3C/text%3E%3C/svg%3E`;
};

const ModuleCard: React.FC<ModuleCardProps> = ({ module, onClick, featured = false }) => {
  // Format difficulty level to title case
  const formatDifficulty = (level: string) => {
    return level.charAt(0) + level.slice(1).toLowerCase();
  };

  // Format time (e.g., 75 -> "1 hr 15 min")
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 
      ? `${hours} hr ${remainingMinutes} min` 
      : `${hours} hr`;
  };

  const [imageError, setImageError] = React.useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const imageUrl = imageError || !module.imageUrl 
    ? getFallbackImage(module.title)
    : module.imageUrl;

  return (
    <div 
      className={`relative overflow-hidden rounded-xl transition-transform duration-300 hover:-translate-y-1 cursor-pointer h-full ${featured ? 'aspect-[4/3]' : 'aspect-square'}`}
      onClick={onClick}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl}
          alt={module.title}
          fill
          className="object-cover"
          onError={handleImageError}
        />
      </div>
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white">
        <h3 className="font-semibold text-lg mb-1">{module.title}</h3>
        <p className="text-sm opacity-90 line-clamp-2 mb-3">{module.description}</p>
        
        <div className="flex flex-wrap gap-2 mt-auto">
          {!featured && (
            <div className="text-xs opacity-80">
              {formatTime(module.estimatedTimeMinutes)}
            </div>
          )}
          
          {module.completionStatus && (
            <div className="ml-auto text-xs">
              {module.completionStatus === 'COMPLETED' ? (
                <span className="text-green-400">Completed</span>
              ) : module.completionStatus === 'IN_PROGRESS' ? (
                <span className="text-blue-400">In Progress</span>
              ) : (
                <span className="text-gray-400">Not Started</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleCard;
