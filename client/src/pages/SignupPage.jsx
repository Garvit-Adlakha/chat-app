import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { IconCamera, IconHeartHandshake, IconShieldLock, IconUsers, IconBrandGoogle } from '@tabler/icons-react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import userService from "../service/userService";
import toast from "react-hot-toast";

// This component hides the file input but makes it accessible
const VisuallyHiddenInput = ({ children, ...props }) => {
  return (
    <input
      type="file"
      className="absolute w-0 h-0 opacity-0"
      style={{ clip: 'rect(0 0 0 0)', clipPath: 'inset(50%)' }}
      {...props}
    />
  );
};

const SignupPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [avatarPreview, setAvatarPreview] = useState("https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp");
  const [avatarFile, setAvatarFile] = useState(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bio, setBio] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add Google Sign-In SDK
  useEffect(() => {
    
    // Load the Google Sign-In SDK
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        console.error('Failed to load Google Sign-In SDK');
        setError('Google Sign-In is currently unavailable. Please use email registration instead.');
      };
      document.body.appendChild(script);
      return script;
    };

    const script = loadGoogleScript();

    return () => {
      // Clean up the script when component unmounts
      if (script && script.parentNode) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const googleAuthMutation = useMutation({
    mutationFn: async (idToken) => {
      return userService.googleAuth(idToken);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
      queryClient.invalidateQueries(['user']).then(() => {
        toast.success(data.message || "Signed up with Google successfully");
        setGoogleLoading(false);
        navigate("/chat");
      });
    },
    onError: (error) => {
      setError(error.message || "Google authentication failed");
      setGoogleLoading(false);
    }
  });

  // Add a function to check if Google API is loaded
  const isGoogleScriptLoaded = () => {
    return typeof window !== 'undefined' && typeof window.google !== 'undefined';
  };

  // Google Sign-In initialization
  const initializeGoogleSignIn = () => {
    if (!isGoogleScriptLoaded()) {
      console.error('Google API not loaded yet');
      setError('Google Sign-In temporarily unavailable. Please try again later.');
      setGoogleLoading(false);
      return false;
    }
    
    try {
      // Validate Google Client ID before initialization
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId || clientId === '') {
        console.error('Missing Google Client ID');
        setError('Google Sign-In is not configured. Please try email registration instead.');
        setGoogleLoading(false);
        return false;
      }
      
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCallback,
        cancel_on_tap_outside: true,
        error_callback: (error) => {
          console.error('Google Sign-In Error:', error);
          setError('Google Sign-In failed. Please try email registration instead.');
          setGoogleLoading(false);
        }
      });
      return true;
    } catch (error) {
      console.error('Google Sign-In initialization error:', error);
      setError('Google Sign-In configuration error. Please try email registration instead.');
      setGoogleLoading(false);
      return false;
    }
  };

  // Google Sign-In handler
  const handleGoogleSignIn = () => {
    setGoogleLoading(true);
    setError("");
    
    if (!initializeGoogleSignIn()) {
      return;
    }
    
    try {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          const reason = notification.getNotDisplayedReason();
          console.error('Google Sign-In not displayed reason:', reason);
          
          if (reason === 'unregistered_origin') {
            setError(
              'This website is not registered with Google. Please try email registration instead.'
            );
         
          } else if (reason === 'browser_not_supported') {
            setError('Your browser does not support Google Sign-In. Please try email registration instead.');
          } else if (reason === 'invalid_client') {
            setError('Google Sign-In client configuration error. Please try email registration instead.');
          } else {
            setError(`Google Sign-In unavailable (${reason}). Please try email registration instead.`);
          }
          
          setGoogleLoading(false);
        } else if (notification.isSkippedMoment()) {
          console.warn('Google Sign-In skipped reason:', notification.getSkippedReason());
          setGoogleLoading(false);
        } else if (notification.isDismissedMoment()) {
          console.warn('Google Sign-In dismissed reason:', notification.getDismissedReason());
          setGoogleLoading(false);
        }
      });
    } catch (error) {
      console.error('Google Sign-In prompt error:', error);
      setError('Failed to show Google Sign-In. Please try email registration instead.');
      setGoogleLoading(false);
    }
  };

  // Callback handler for Google sign-in
  const handleGoogleCallback = (response) => {
    if (response.credential) {
      // Send the ID token to your server
      googleAuthMutation.mutate(response.credential);
    } else {
      setGoogleLoading(false);
      setError("Google sign-in failed. Please try again.");
    }
  };

  const signupMutation = useMutation({
    mutationFn: async (formData) => {
      return userService.signUp(formData);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
      queryClient.invalidateQueries(['user']).then(() => {
        toast.success(data.message || "Account created successfully");
        navigate("/chat");
      });
    },
    onError: (error) => {
      setError(error.message || "Signup failed");
    }
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Avatar image must be less than 5MB");
        return;
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a valid image file (JPEG, PNG, or GIF)");
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Add debugging for FormData content
  const logFormData = (formData) => {
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Validation
      if (!avatarFile) {
        setError("Please upload a profile picture");
        setIsSubmitting(false);
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setIsSubmitting(false);
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters long");
        setIsSubmitting(false);
        return;
      }

      // Create form data for file upload
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("username", username || email.split('@')[0]);
      formData.append("password", password);
      formData.append("bio", bio || "Hey there! I'm using Chat App");
      
      // Ensure the file is properly attached with correct field name (matching server expectation)
      formData.append("avatar", avatarFile, avatarFile.name);
      
      // Log FormData contents for debugging
      logFormData(formData);
      
      signupMutation.mutate(formData);
    } catch (err) {
      console.error("Error in signup form submission:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="hero min-h-screen bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e]">
      <div className="hero-content flex-col lg:flex-row animate-fadeIn gap-8 max-w-6xl">
        <div className="card bg-black/20 backdrop-blur-lg w-full max-w-md shrink-0 shadow-2xl transition-all duration-300 hover:shadow-3xl lg:w-1/2 border border-white/10">
          <div className="card-body animate-slideUp py-6">
            {error && (
              <div className="alert alert-error text-sm mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-3" onSubmit={handleSubmit}>
              {/* Avatar Upload */}
              <div className="flex flex-col items-center justify-center">
                <label htmlFor="avatar" className="cursor-pointer group">
                  <div className="avatar relative">
                    <div className="w-20 h-20 rounded-full ring ring-blue-500 ring-offset-base-100 ring-offset-2 overflow-hidden transition-transform duration-300 ease-in-out group-hover:scale-110">
                      <img
                        src={avatarPreview}
                        alt="Avatar Preview"
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="absolute -bottom-2 right-0">
                      <IconCamera
                        aria-label="Change Avatar"
                        className="w-7 h-7 bg-blue-500 text-white rounded-full p-1.5 transition-colors duration-300 ease-in-out group-hover:bg-blue-600"
                      />
                    </div>
                  </div>
                </label>
                <VisuallyHiddenInput
                  type="file"
                  accept="image/*"
                  id="avatar"
                  onChange={handleAvatarChange}
                />
                <p className="text-xs text-gray-400 mt-1">
                  {avatarFile ? `Selected: ${avatarFile.name.substring(0, 20)}${avatarFile.name.length > 20 ? '...' : ''}` : "Upload profile picture"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Full Name */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-white">Full Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="input input-bordered w-full bg-white/10 text-white placeholder:text-gray-400 border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-30"
                  />
                </div>

                {/* Username */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-white">Username (optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input input-bordered w-full bg-white/10 text-white placeholder:text-gray-400 border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-30"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-white">Email Address</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input input-bordered w-full bg-white/10 text-white placeholder:text-gray-400 border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-30"
                  />
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/60" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Password */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-white">Password</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input input-bordered w-full bg-white/10 text-white placeholder:text-gray-400 border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-30"
                      required
                      minLength="8"
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
                </div>

                {/* Confirm Password */}
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-white">Confirm Password</span>
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input input-bordered w-full bg-white/10 text-white placeholder:text-gray-400 border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-30"
                    required
                  />
                </div>
              </div>

              <div className="text-xs text-gray-300 -mt-1 ml-1">
                At least 8 characters required
              </div>

              {/* Bio (Optional) */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-white">Bio (Optional)</span>
                </label>
                <textarea
                  placeholder="Tell us a bit about yourself"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="textarea textarea-bordered w-full bg-white/10 text-white placeholder:text-gray-400 border-white/20 focus:border-blue-400 focus:ring-2 focus:ring-blue-400 focus:ring-opacity-30"
                  rows="2"
                />
              </div>

              <div className="form-control mt-4">
                <button
                  type="submit"
                  className={`btn btn-primary w-full ${signupMutation.isPending || isSubmitting ? 'loading' : ''}`}
                  disabled={signupMutation.isPending || isSubmitting}
                >
                  {signupMutation.isPending || isSubmitting ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
              <p className="text-center text-white text-sm mt-1">
                Already have an account? <Link className="text-blue-300 hover:text-blue-200 font-medium" to="/login">Sign in instead</Link>
              </p>
            </form>
            <p className="text-xs text-center text-gray-400 mt-2">
              By creating an account, you agree to our <a className="hover:text-blue-300" href="#">Terms of Service</a> and <a className="hover:text-blue-300" href="#">Privacy Policy</a>.
            </p>
          </div>
        </div>


        <div className="text-center lg:text-left lg:w-1/2 mx-5 text-white">

                 {/* Social Signup Option */}
                 <div className="mb-4">
              <button
                className="btn w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold border-none"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
              >
                <IconBrandGoogle className="w-5 h-5 mr-2" />
                <span>{googleLoading ? 'Signing in...' : 'Continue with Google'}</span>
              </button>
            </div>
          <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            Join Our Community
          </h1>
          <p className="py-4 text-lg opacity-90 leading-relaxed">
            Create an account and start connecting with friends, colleagues, and communities around the world. Experience seamless communication like never before.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="bg-black/20 backdrop-blur-sm p-4 rounded-lg flex items-center">
              <div className="bg-blue-500/20 p-2 rounded-full mr-3">
                <IconShieldLock className="w-6 h-6 text-blue-300" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-white">Secure Messaging</h3>
                <p className="text-sm text-gray-300">Your data is always protected</p>
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-sm p-4 rounded-lg flex items-center">
              <div className="bg-green-500/20 p-2 rounded-full mr-3">
                <IconHeartHandshake className="w-6 h-6 text-green-300" />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-white">Connect Anywhere</h3>
                <p className="text-sm text-gray-300">Desktop, mobile, or web access</p>
              </div>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-sm p-4 rounded-lg flex items-center mt-4">
            <div className="bg-purple-500/20 p-2 rounded-full mr-3">
              <IconUsers className="w-6 h-6 text-purple-300" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-white">Growing Community</h3>
              <p className="text-sm text-gray-300">Join thousands of active users and groups</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
