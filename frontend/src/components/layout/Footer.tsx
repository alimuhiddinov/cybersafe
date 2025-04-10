import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-heading">CyberSafe</h3>
            <p className="footer-description">
              Gamified cybersecurity education platform designed to make learning security concepts engaging and accessible.
            </p>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links">
              <li>
                <Link href="/modules">Learning Modules</Link>
              </li>
              <li>
                <Link href="/assessments">Assessments</Link>
              </li>
              <li>
                <Link href="/achievements">Achievements</Link>
              </li>
              <li>
                <Link href="/community">Community</Link>
              </li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-heading">Resources</h3>
            <ul className="footer-links">
              <li>
                <Link href="/resources/glossary">Cybersecurity Glossary</Link>
              </li>
              <li>
                <Link href="/resources/tools">Security Tools</Link>
              </li>
              <li>
                <Link href="/resources/blog">Security Blog</Link>
              </li>
              <li>
                <Link href="/resources/faq">FAQ</Link>
              </li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3 className="footer-heading">Contact</h3>
            <ul className="footer-links">
              <li>
                <Link href="/support">Support</Link>
              </li>
              <li>
                <Link href="/contact">Contact Us</Link>
              </li>
              <li>
                <Link href="/feedback">Feedback</Link>
              </li>
              <li>
                <Link href="/report-issue">Report Issue</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-copyright">
            &copy; {currentYear} CyberSafe. All rights reserved.
          </div>
          
          <div className="footer-legal">
            <Link href="/terms">Terms of Service</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/cookies">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
