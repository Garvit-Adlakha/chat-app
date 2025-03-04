import { Link, useNavigate } from "react-router-dom"
import { HoverBorderGradient } from "../components/ui/hover-border-gradient";
import { IconMessage, IconRobot, IconHeartHandshake, IconShieldLock, IconBrandGoogle, IconBrandGithub } from '@tabler/icons-react';
import { useState } from "react";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login process
    try {
      // Add actual login logic here
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/chat');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  }
  
  const handleGuestChat = () => {
    // Navigate to guest chat experience
    navigate('/guest-chat');
  }
  
  return (
    <div className="hero min-h-screen bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <div className="hero-content flex-col lg:flex-row-reverse animate-fadeIn gap-8 max-w-6xl">
        <div className="text-center lg:text-left lg:w-1/2 mx-5 text-white">
          <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            Connect Seamlessly
          </h1>
          <p className="py-4 text-lg opacity-90 leading-relaxed">
            Join thousands of users who are already enjoying our modern chat platform. Stay connected with friends, family, and colleagues with ease.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-black/20 backdrop-blur-sm p-4 rounded-lg flex items-center">
              <div className="bg-blue-500/20 p-2 rounded-full mr-3">
                <IconShieldLock className="w-6 h-6 text-blue-300" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-white">End-to-End Encryption</h3>
                <p className="text-sm text-gray-300">Your conversations are always private</p>
              </div>
            </div>
            
            <div className="bg-black/20 backdrop-blur-sm p-4 rounded-lg flex items-center">
              <div className="bg-purple-500/20 p-2 rounded-full mr-3">
                <IconHeartHandshake className="w-6 h-6 text-purple-300" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-white">Group Collaboration</h3>
                <p className="text-sm text-gray-300">Create teams and share ideas instantly</p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/10">
            <h3 className="text-xl font-medium mb-3 flex items-center">
              <IconRobot className="mr-2 text-blue-300" /> Try Our AI Assistant
            </h3>
            <p className="mb-4 text-gray-300">
              Not ready to sign up? Chat with our AI assistant to explore the platform's capabilities.
            </p>
            <HoverBorderGradient
              containerClassName="rounded-full"
              as="button"
              onClick={handleGuestChat}
              className="dark:bg-black bg-gradient-to-r from-indigo-500 to-purple-500 text-white flex items-center space-x-2 px-6 py-3 w-full justify-center"
            >
              <IconMessage className="w-5 h-5" />
              <span className="font-medium">Start Guest Experience</span>
            </HoverBorderGradient>
          </div>
        </div>
        
        <div className="card bg-black/20 backdrop-blur-lg w-full max-w-md shrink-0 shadow-2xl transition-all duration-300 hover:shadow-3xl lg:w-1/2 border border-white/10">
          <div className="card-body animate-slideUp">
            <h1 className="text-3xl text-center mb-6 text-white font-bold">Welcome Back</h1>
            
            {/* Social Login Options */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <button 
                className="btn flex-1 bg-white hover:bg-gray-100 text-gray-800 font-semibold border-none"
                type="button"
              >
                <IconBrandGoogle className="w-5 h-5 mr-2" />
                <span>Google</span>
              </button>
              
              <button 
                className="btn flex-1 bg-gray-800 hover:bg-gray-900 text-white font-semibold border-none"
                type="button"
              >
                <IconBrandGithub className="w-5 h-5 mr-2" />
                <span>GitHub</span>
              </button>
            </div>
            
            <div className="divider text-white text-sm opacity-60">or continue with email</div>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-white">Email</span>
                </label>
                <div className="relative">
                  <input 
                    type="email" 
                    placeholder="your.email@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input input-bordered w-full bg-white/10 text-white placeholder:text-gray-400 border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-30"
                    required 
                  />
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-white">Password</span>
                  <a className="label-text-alt link link-hover text-blue-300">Forgot password?</a>
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input input-bordered w-full bg-white/10 text-white placeholder:text-gray-400 border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-30"
                    required 
                    minLength="6"
                  />
                  <button 
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      )}
                    </svg>
                  </button>
                </div>
                <div className="text-xs text-gray-300 mt-1 ml-1">
                  At least 6 characters required
                </div>
              </div>
              
              <div className="flex items-center mt-2">
                <input 
                  id="remember-me" 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="checkbox checkbox-sm checkbox-accent" 
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                  Remember me for 30 days
                </label>
              </div>
              
              <div className="form-control mt-6">
                <button 
                  type="submit" 
                  className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
              
              <p className="text-center text-white text-sm mt-4">
                Don't have an account? <Link className="text-blue-300 hover:text-blue-200 font-medium" to="/signup">Create account</Link>
              </p>
            </form>
            
            <p className="text-xs text-center text-gray-400 mt-8">
              By continuing, you agree to our <a className="hover:text-blue-300" href="#">Terms of Service</a> and <a className="hover:text-blue-300" href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
