import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function ProfileCreation() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    role: 'student',
    location: '',
    bio: '',
    experience: 'beginner'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Profile data:', formData);
    
    // Move to the next step in the onboarding flow
    router.push('/skills-assessment');
  };

  return (
    <>
      <Head>
        <title>Create Your Profile | CyberSafe</title>
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
              
              <div className="h-1 w-16 bg-gray-600"></div>
              
              <div className="flex items-center">
                <div className="bg-gray-600 rounded-full h-8 w-8 flex items-center justify-center">
                  <span className="text-white font-bold">3</span>
                </div>
                <div className="ml-2">
                  <p className="text-gray-400">Assessment</p>
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
          <h1 className="text-3xl font-bold mb-8 text-center">Create Your Profile</h1>
          
          <div className="bg-[#141F45] p-8 rounded-xl shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="block text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0A1437] border border-[#283539] rounded-md p-3 text-white focus:border-[#1A9FFF] focus:outline-none"
                  />
                </div>
                
                <div>
                  <label htmlFor="username" className="block text-gray-300 mb-2">Username</label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#0A1437] border border-[#283539] rounded-md p-3 text-white focus:border-[#1A9FFF] focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="role" className="block text-gray-300 mb-2">Role</label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full bg-[#0A1437] border border-[#283539] rounded-md p-3 text-white focus:border-[#1A9FFF] focus:outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="professional">Professional</option>
                    <option value="educator">Educator</option>
                    <option value="security_professional">Security Professional</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-gray-300 mb-2">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full bg-[#0A1437] border border-[#283539] rounded-md p-3 text-white focus:border-[#1A9FFF] focus:outline-none"
                    placeholder="City, Country"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="bio" className="block text-gray-300 mb-2">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full bg-[#0A1437] border border-[#283539] rounded-md p-3 text-white focus:border-[#1A9FFF] focus:outline-none min-h-[100px]"
                  placeholder="Tell us a little about yourself..."
                ></textarea>
              </div>
              
              <div>
                <label className="block text-gray-300 mb-2">Cybersecurity Experience</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`border ${formData.experience === 'beginner' ? 'border-blue-500' : 'border-[#283539]'} rounded-lg p-4 cursor-pointer hover:border-blue-400 transition-colors`}
                       onClick={() => setFormData({...formData, experience: 'beginner'})}>
                    <input
                      type="radio"
                      id="beginner"
                      name="experience"
                      value="beginner"
                      checked={formData.experience === 'beginner'}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <label htmlFor="beginner" className="flex flex-col items-center cursor-pointer">
                      <div className="h-12 w-12 rounded-full bg-blue-900 flex items-center justify-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                        </svg>
                      </div>
                      <span className="font-medium">Beginner</span>
                      <span className="text-xs text-gray-400 text-center mt-1">New to cybersecurity</span>
                    </label>
                  </div>
                  
                  <div className={`border ${formData.experience === 'intermediate' ? 'border-blue-500' : 'border-[#283539]'} rounded-lg p-4 cursor-pointer hover:border-blue-400 transition-colors`}
                       onClick={() => setFormData({...formData, experience: 'intermediate'})}>
                    <input
                      type="radio"
                      id="intermediate"
                      name="experience"
                      value="intermediate"
                      checked={formData.experience === 'intermediate'}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <label htmlFor="intermediate" className="flex flex-col items-center cursor-pointer">
                      <div className="h-12 w-12 rounded-full bg-blue-900 flex items-center justify-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
                        </svg>
                      </div>
                      <span className="font-medium">Intermediate</span>
                      <span className="text-xs text-gray-400 text-center mt-1">Some knowledge</span>
                    </label>
                  </div>
                  
                  <div className={`border ${formData.experience === 'advanced' ? 'border-blue-500' : 'border-[#283539]'} rounded-lg p-4 cursor-pointer hover:border-blue-400 transition-colors`}
                       onClick={() => setFormData({...formData, experience: 'advanced'})}>
                    <input
                      type="radio"
                      id="advanced"
                      name="experience"
                      value="advanced"
                      checked={formData.experience === 'advanced'}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <label htmlFor="advanced" className="flex flex-col items-center cursor-pointer">
                      <div className="h-12 w-12 rounded-full bg-blue-900 flex items-center justify-center mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                        </svg>
                      </div>
                      <span className="font-medium">Advanced</span>
                      <span className="text-xs text-gray-400 text-center mt-1">Experienced user</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Link href="/signup" className="px-6 py-2 border border-[#283539] rounded-lg text-white hover:bg-[#0D1326] transition-colors">
                  Back
                </Link>
                <button 
                  type="submit" 
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                >
                  Continue to Assessment
                </button>
              </div>
            </form>
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
