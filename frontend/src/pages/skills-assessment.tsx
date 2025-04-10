import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

type Question = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
};

export default function SkillsAssessment() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  // Sample assessment questions
  const questions: Question[] = [
    {
      id: 1,
      question: "Which of the following is considered a strong password?",
      options: [
        "password123",
        "qwerty",
        "P@$$w0rd!2023",
        "birthday"
      ],
      correctAnswer: 2
    },
    {
      id: 2,
      question: "What is phishing?",
      options: [
        "A legitimate email from your bank",
        "A type of fishing sport",
        "A cyberattack where attackers disguise as trustworthy entities to steal data",
        "A computer virus that deletes files"
      ],
      correctAnswer: 2
    },
    {
      id: 3,
      question: "What does a firewall primarily help protect against?",
      options: [
        "Physical theft of computers",
        "Power surges",
        "Unauthorized network access",
        "Hard drive failure"
      ],
      correctAnswer: 2
    },
    {
      id: 4,
      question: "Which of these is NOT a recommended security practice?",
      options: [
        "Using different passwords for different accounts",
        "Writing down all your passwords on a sticky note at your desk",
        "Enabling two-factor authentication",
        "Regularly updating your software"
      ],
      correctAnswer: 1
    },
    {
      id: 5,
      question: "What is ransomware?",
      options: [
        "Software that speeds up your computer",
        "Malware that locks your files and demands payment to unlock them",
        "A tool used by IT professionals to recover lost data",
        "An authentication method"
      ],
      correctAnswer: 1
    }
  ];

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Show results
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let score = 0;
    selectedAnswers.forEach((answer, index) => {
      if (answer === questions[index].correctAnswer) {
        score++;
      }
    });
    return score;
  };

  const handleFinish = () => {
    // In a real app, you'd save the assessment results
    console.log('Assessment completed with score:', calculateScore());
    
    // Navigate to dashboard
    router.push('/dashboard');
  };

  return (
    <>
      <Head>
        <title>Skills Assessment | CyberSafe</title>
      </Head>
      
      <div className="min-h-screen bg-[#0A1437] text-white flex flex-col">
        {/* Progress Bar */}
        <div className="w-full bg-[#141F45] p-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              <div className="flex items-center">
                <div className="bg-blue-500 rounded-full h-8 w-8 flex items-center justify-center">
                  <span className="text-white font-bold">1</span>
                </div>
                <div className="ml-2">
                  <p className="text-blue-500 font-medium">Sign Up</p>
                </div>
              </div>
              
              <div className="h-1 w-16 bg-blue-500"></div>
              
              <div className="flex items-center">
                <div className="bg-blue-500 rounded-full h-8 w-8 flex items-center justify-center">
                  <span className="text-white font-bold">2</span>
                </div>
                <div className="ml-2">
                  <p className="text-blue-500 font-medium">Profile</p>
                </div>
              </div>
              
              <div className="h-1 w-16 bg-blue-500"></div>
              
              <div className="flex items-center">
                <div className="bg-blue-500 rounded-full h-8 w-8 flex items-center justify-center">
                  <span className="text-white font-bold">3</span>
                </div>
                <div className="ml-2">
                  <p className="text-blue-500 font-medium">Assessment</p>
                </div>
              </div>
              
              <div className="h-1 w-16 bg-gray-600"></div>
              
              <div className="flex items-center">
                <div className="bg-gray-600 rounded-full h-8 w-8 flex items-center justify-center">
                  <span className="text-white font-bold">4</span>
                </div>
                <div className="ml-2">
                  <p className="text-gray-400">Dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-grow container mx-auto px-6 py-12 max-w-3xl">
          <h1 className="text-3xl font-bold mb-8 text-center">Skills Assessment</h1>
          
          <div className="bg-[#141F45] p-8 rounded-xl shadow-lg">
            {!showResults ? (
              <>
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span>Question {currentQuestion + 1} of {questions.length}</span>
                    <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete</span>
                  </div>
                  <div className="w-full bg-[#0A1437] rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}></div>
                  </div>
                </div>
                
                <div className="mb-8">
                  <h2 className="text-xl font-bold mb-4">{questions[currentQuestion].question}</h2>
                  
                  <div className="space-y-3">
                    {questions[currentQuestion].options.map((option, index) => (
                      <div 
                        key={index}
                        className={`border ${selectedAnswers[currentQuestion] === index ? 'border-blue-500 bg-blue-900/20' : 'border-[#283539]'} rounded-lg p-4 cursor-pointer hover:border-blue-400 transition-colors`}
                        onClick={() => handleAnswerSelect(index)}
                      >
                        <div className="flex items-center">
                          <div className={`h-5 w-5 rounded-full border ${selectedAnswers[currentQuestion] === index ? 'border-blue-500 bg-blue-500' : 'border-[#283539]'} mr-3 flex items-center justify-center`}>
                            {selectedAnswers[currentQuestion] === index && (
                              <div className="h-2 w-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <span>{option}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button 
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className={`px-6 py-2 border border-[#283539] rounded-lg text-white transition-colors ${currentQuestion === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#0D1326]'}`}
                  >
                    Previous
                  </button>
                  
                  <button 
                    onClick={handleNext}
                    disabled={selectedAnswers[currentQuestion] === undefined}
                    className={`px-6 py-2 bg-blue-600 rounded-lg text-white transition-colors ${selectedAnswers[currentQuestion] === undefined ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                  >
                    {currentQuestion < questions.length - 1 ? 'Next' : 'Finish'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-blue-900 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Assessment Complete!</h2>
                  <p className="text-gray-300 mb-6">Your score: {calculateScore()} out of {questions.length}</p>
                </div>
                
                <div className="mb-8">
                  <div className="p-6 bg-[#0A1437] rounded-lg">
                    <h3 className="font-bold mb-2">Your Cybersecurity Skill Level:</h3>
                    {calculateScore() <= 2 && (
                      <p className="text-yellow-400">Beginner - We'll start with the basics to build your knowledge.</p>
                    )}
                    {calculateScore() > 2 && calculateScore() <= 4 && (
                      <p className="text-blue-400">Intermediate - You have a good foundation, but there's more to learn.</p>
                    )}
                    {calculateScore() > 4 && (
                      <p className="text-green-400">Advanced - Great job! You already have strong knowledge.</p>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={handleFinish}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105"
                >
                  Continue to Dashboard
                </button>
              </div>
            )}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="py-6 px-6 border-t border-gray-800">
          <div className="container mx-auto text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} CyberSafe. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
