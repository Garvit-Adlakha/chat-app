import { Link } from "react-router-dom";
import { useState } from "react";
import VisuallyHiddenInput from "../components/VisuallyHiddenInput";
import { IconCamera } from '@tabler/icons-react';

const SignupPage = () => {
    const [avatarPreview, setAvatarPreview] = useState("https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp");

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();

    }

    return (
        <div className="hero min-h-screen bg-gradient-to-r from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
            <div className="hero-content flex-col lg:flex-row-reverse animate-fadeIn">
                <div className="text-center lg:text-left mx-5">
                    <h2 className="text-4xl font-bold mb-4 animate-fadeInUp">Welcome to Our Platform!</h2>
                    <p className="py-2 text-lg">
                        Join us and experience seamless communication. Create your account now and start collaborating instantly!
                    </p>
                </div>
                <div className="card bg-opacity-30 bg-black backdrop-blur-xl w-full max-w-lg shadow-xl transition-transform duration-300 hover:scale-105">
                    <div className="card-body animate-slideUp">
                        <fieldset className="fieldset w-full" onSubmit={handleSubmit}>
                            <h1 className="text-3xl text-center mb-6 font-extrabold text-white">Create an Account</h1>

                            <div className="flex flex-col items-center justify-center mb-6">
                                <label htmlFor="avatar" className="cursor-pointer group">
                                    <div className="avatar relative">
                                        <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden transition-transform duration-300 ease-in-out group-hover:scale-110">
                                            <img
                                                src={avatarPreview}
                                                alt="Avatar Preview"
                                                className="object-cover w-full h-full"
                                            />
                                        </div>
                                        <div className="absolute -bottom-2 right-0">
                                            <IconCamera
                                                aria-label="Change Avatar"
                                                className="w-8 h-8 bg-[#302b63] text-white rounded-full p-1 transition-colors duration-300 ease-in-out group-hover:bg-[#24243e] group-hover:text-black"
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
                            </div>


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/** Name Input **/}
                                <label className="input input-sm bg-opacity-20 bg-black rounded-lg focus-within:ring-2 ring-[#302b63]">
                                    <input
                                        type="text"
                                        placeholder="John Doe"
                                        required
                                        className="focus:outline-none bg-transparent text-white placeholder:text-gray-400"
                                    />
                                </label>

                                {/** Email Input **/}
                                <label className="input input-sm bg-opacity-20 bg-black rounded-lg focus-within:ring-2 ring-[#302b63]">
                                    <input
                                        type="email"
                                        placeholder="mail@site.com"
                                        required
                                        className="focus:outline-none bg-transparent text-white placeholder:text-gray-400"
                                    />
                                </label>

                                {/** Password Input **/}
                                <label className="input input-sm bg-opacity-20 bg-black rounded-lg focus-within:ring-2 ring-[#302b63]">
                                    <input
                                        type="password"
                                        required
                                        placeholder="Password"
                                        minLength="8"
                                        pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                                        title="Must be at least 8 characters, including a number, lowercase, and uppercase letter"
                                        className="focus:outline-none bg-transparent text-white placeholder:text-gray-400"
                                    />
                                </label>

                                {/** Confirm Password Input **/}
                                <label className="input input-sm bg-opacity-20 bg-black rounded-lg focus-within:ring-2 ring-[#302b63]">
                                    <input
                                        type="password"
                                        required
                                        placeholder="Confirm Password"
                                        className="focus:outline-none bg-transparent text-white placeholder:text-gray-400"
                                    />
                                </label>
                            </div>

                            <button className="btn bg-[#302b63] text-white border-none btn-sm mt-6 w-full transition-all duration-300 hover:bg-[#24243e] hover:scale-105" 
                            >
                                Sign Up
                            </button>

                            <div className="text-sm text-center mt-4">
                                <p>
                                    Already have an account?
                                    <Link
                                        className="mx-1 link link-hover text-[#a898ff] hover:text-white transition-colors"
                                        to="/login"
                                    >
                                        Login
                                    </Link>
                                </p>
                            </div>
                        </fieldset>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
