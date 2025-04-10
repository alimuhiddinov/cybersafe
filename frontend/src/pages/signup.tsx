import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function SignUp() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      email: '',
      password: '',
      confirmPassword: '',
    };
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      valid = false;
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Register logic would go here
      console.log('Form is valid, submitting...', formData);
      
      // Proceed to next step in onboarding
      router.push('/profile-creation');
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up | CyberSafe</title>
      </Head>
      
      <div className="min-h-screen bg-[#0A1437] text-white flex flex-col">
        {/* Navigation */}
        <header className="py-6 px-6 md:px-12">
          <nav className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-white">
              CyberSafe
            </Link>
            <div className="space-x-6">
              <Link href="/login" className="text-white hover:text-blue-300 transition-colors">
                Log In
              </Link>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex items-center justify-center px-6 py-12">
          <div className="bg-[#141F45] p-8 rounded-xl w-full max-w-md shadow-2xl">
            <h1 className="text-3xl font-bold mb-6 text-center">Create Your Account</h1>
            <p className="text-gray-300 mb-8 text-center">
              Join the CyberSafe community and start your cybersecurity journey
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-gray-300 mb-2">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#0A1437] border border-[#283539] rounded-md p-3 text-white focus:border-[#1A9FFF] focus:outline-none"
                  placeholder="you@example.com"
                />
                {errors.email && <p className="text-red-500 mt-1 text-sm">{errors.email}</p>}
              </div>
              
              <div>
                <label htmlFor="password" className="block text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-[#0A1437] border border-[#283539] rounded-md p-3 text-white focus:border-[#1A9FFF] focus:outline-none"
                  placeholder="At least 8 characters"
                />
                {errors.password && <p className="text-red-500 mt-1 text-sm">{errors.password}</p>}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-gray-300 mb-2">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full bg-[#0A1437] border border-[#283539] rounded-md p-3 text-white focus:border-[#1A9FFF] focus:outline-none"
                  placeholder="Re-enter your password"
                />
                {errors.confirmPassword && <p className="text-red-500 mt-1 text-sm">{errors.confirmPassword}</p>}
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform transition-all duration-300 hover:scale-105"
              >
                Create Account
              </button>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-gray-300">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-400 hover:text-blue-300">
                  Log In
                </Link>
              </p>
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="py-6 px-6 md:px-12 border-t border-gray-800">
          <div className="container mx-auto text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} CyberSafe. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
