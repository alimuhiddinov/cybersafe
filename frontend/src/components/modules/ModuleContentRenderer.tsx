import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

type ModuleContentRendererProps = {
  moduleId: number | string;
  content: string;
  onSectionComplete?: () => void;
};

const ModuleContentRenderer: React.FC<ModuleContentRendererProps> = ({ 
  moduleId, 
  content,
  onSectionComplete 
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Track when user scrolls to section boundaries
  useEffect(() => {
    if (!contentRef.current) return;
    
    // Find all section headers in content
    const sectionHeaders = contentRef.current.querySelectorAll('h2, h3');
    if (sectionHeaders.length === 0) return;
    
    // Track progress as user scrolls through content
    const trackProgress = () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const scrollPosition = window.scrollY + window.innerHeight;
      let currentSection = null;
      
      // Check which section is currently visible
      for (let i = 0; i < sectionHeaders.length; i++) {
        const header = sectionHeaders[i];
        const headerPosition = header.getBoundingClientRect().top + window.scrollY;
        
        if (scrollPosition >= headerPosition) {
          currentSection = header.textContent;
          
          // If this is the last section and we've scrolled past 80% of the content
          const contentHeight = contentRef.current?.scrollHeight || 0;
          if (i === sectionHeaders.length - 1 && scrollPosition >= window.scrollY + (contentHeight * 0.8)) {
            // Record section completion
            axios.post(
              `${API_URL}/progress/module/${moduleId}/activity`,
              { 
                activityType: 'SECTION_COMPLETED',
                sectionId: currentSection,
                additionalInfo: 'last-section'
              },
              { headers: { Authorization: `Bearer ${token}` } }
            ).catch(err => console.error('Error recording section completion:', err));
            
            // Call section complete callback
            if (onSectionComplete) {
              onSectionComplete();
            }
            
            // Remove scroll listener after completing last section
            window.removeEventListener('scroll', trackProgress);
          }
        }
      }
      
      // Record activity if we have a current section
      if (currentSection) {
        axios.post(
          `${API_URL}/progress/module/${moduleId}/activity`,
          { 
            activityType: 'PAGE_VIEW',
            sectionId: currentSection
          },
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(err => console.error('Error recording page view:', err));
      }
    };
    
    // Throttle scroll event to prevent too many API calls
    let timeout: NodeJS.Timeout;
    const throttledTrackProgress = () => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(trackProgress, 2000); // Wait 2 seconds after scrolling stops
    };
    
    window.addEventListener('scroll', throttledTrackProgress);
    
    return () => {
      window.removeEventListener('scroll', throttledTrackProgress);
      if (timeout) clearTimeout(timeout);
    };
  }, [moduleId, onSectionComplete]);
  
  // Add interactive elements to content
  useEffect(() => {
    if (!contentRef.current) return;
    
    // Make external links open in new tab
    const links = contentRef.current.querySelectorAll('a');
    links.forEach(link => {
      if (link.hostname !== window.location.hostname) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });
    
    // Add click handlers to interactive elements
    const interactiveElements = contentRef.current.querySelectorAll('.interactive-element');
    interactiveElements.forEach(element => {
      element.addEventListener('click', () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        axios.post(
          `${API_URL}/progress/module/${moduleId}/activity`,
          { 
            activityType: 'EXERCISE_COMPLETED',
            sectionId: element.id
          },
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(err => console.error('Error recording exercise completion:', err));
      });
    });
  }, [content, moduleId]);
  
  return (
    <div ref={contentRef} className="module-content-container">
      {/* Additional interactive table of contents */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-lg font-medium mb-2">In this module:</h4>
        <div className="table-of-contents" dangerouslySetInnerHTML={{ 
          __html: generateTableOfContents(content) 
        }} />
      </div>
      
      {/* Render the actual content */}
      <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

// Helper function to generate table of contents from module content
const generateTableOfContents = (content: string): string => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = content;
  
  const headers = tempDiv.querySelectorAll('h2, h3');
  if (headers.length === 0) return '<p>No sections found</p>';
  
  let toc = '<ul class="list-disc ml-4 space-y-1">';
  
  headers.forEach((header, index) => {
    const id = `section-${index}`;
    const text = header.textContent || `Section ${index + 1}`;
    const isSubsection = header.tagName.toLowerCase() === 'h3';
    
    // Add ID to the original header in content
    header.id = id;
    
    // Add entry to TOC
    toc += `<li${isSubsection ? ' class="ml-4"' : ''}>
      <a href="#${id}" class="text-blue-600 hover:underline">${text}</a>
    </li>`;
  });
  
  toc += '</ul>';
  
  return toc;
};

export default ModuleContentRenderer;
