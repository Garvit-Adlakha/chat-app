import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import VisuallyHiddenInput from "../components/shared/VisuallyHiddenInput";
import { IconCamera, IconHeartHandshake, IconShieldLock, IconUsers, IconBrandGoogle, IconBrandGithub } from '@tabler/icons-react';

const SignupPage = () => {
    const navigate = useNavigate();
    const [avatarPreview, setAvatarPreview] = useState("https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp");
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate signup process
        try {
            // Add actual signup logic here
            await new Promise(resolve => setTimeout(resolve, 1000));
            navigate('/chat');
        } catch (error) {
            console.error('Signup failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="hero min-h-max bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e]">
            <div className="hero-content flex-col lg:flex-row animate-fadeIn gap-8 max-w-6xl">

                <div className="card bg-black/20 backdrop-blur-lg max-h-screen w-full max-w-md shrink-0 shadow-2xl transition-all duration-300 hover:shadow-3xl lg:w-1/2 border border-white/10 ">
                    <div className="card-body max-h-screen animate-slideUp">
                        <h1 className="text-3xl text-center mb-2 text-white font-bold">Create Account</h1>

                        {/* Social Signup Options */}
                        <div className="flex flex-col sm:flex-row gap-3 ">
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

                        <div className="divider text-white text-sm opacity-60">or register with email</div>

                        <form className="space-y-2" onSubmit={handleSubmit}>
                            {/* Avatar Upload */}
                            <div className="flex flex-col items-center justify-center ">
                                <label htmlFor="avatar" className="cursor-pointer group">
                                    <div className="avatar relative">
                                        <div className="w-18 h-18 rounded-full ring ring-blue-500 ring-offset-base-100 ring-offset-2 overflow-hidden transition-transform duration-300 ease-in-out group-hover:scale-110">
                                            <img
                                                src={avatarPreview}
                                                alt="Avatar Preview"
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                        <div className="absolute -bottom-2 right-0">
                                            <IconCamera
                                                aria-label="Change Avatar"
                                                className="w-8 h-8 bg-blue-500 text-white rounded-full p-1 transition-colors duration-300 ease-in-out group-hover:bg-blue-600"
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
                                <p className="text-xs text-gray-400 mt-1">Upload profile picture</p>
                            </div>

                            {/* Full Name */}
                            <div className="form-control">
                                <label className="label">
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

                            {/* Email */}
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text text-white">Email Address</span>
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

                            {/* Password */}
                            <div className="form-control">
                                <label className="label">
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
                                        pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
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
                                    At least 8 characters with numbers, lowercase and uppercase letters
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="form-control">
                                <label className="label">
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
                            <div className="form-control mt-6">
                                <button
                                    type="submit"
                                    className={`btn btn-primary w-full ${isLoading ? 'loading' : ''}`}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Creating Account...' : 'Create Account'}
                                </button>
                            </div>
                            <p className="text-center text-white text-sm mt-2">
                                Already have an account? <Link className="text-blue-300 hover:text-blue-200 font-medium" to="/login">Sign in instead</Link>
                            </p>
                        </form>
                        <p className="text-xs text-center text-gray-400">
                            By creating an account, you agree to our <a className="hover:text-blue-300" href="#">Terms of Service</a> and <a className="hover:text-blue-300" href="#">Privacy Policy</a>.
                        </p>
                    </div>
                </div>
                <div className="text-center lg:text-left lg:w-1/2 mx-5 text-white">
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
