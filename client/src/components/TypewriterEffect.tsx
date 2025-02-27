"use client";
import { TypewriterEffectSmooth } from "./ui/typewriter-effect";
import { useNavigate } from "react-router-dom";
import { LampContainer } from "./ui/lamp";
import { motion } from "framer-motion";

export function TypewriterEffectSmoothDemo() {
  const navigate = useNavigate();

  const startChattingHandler = (e) => {
    e.preventDefault();
    navigate("/chat");
  };

  const signUpHandler = (e) => {
    e.preventDefault();
    navigate("/signup");
  };

  const words = [
    {
      text: "Connect",
      className: "text-blue-600 dark:text-blue-400 font-bold",
    },
    {
      text: "instantly",
      className: "text-gray-800 dark:text-gray-200",
    },
    {
      text: "with",
      className: "text-gray-600 dark:text-gray-300",
    },
    {
      text: "anyone,",
      className: "text-gray-800 dark:text-gray-200",
    },
    {
      text: "anywhere",
      className:
        "text-gradient bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-400 dark:to-red-400 font-bold",
    },
    {
      text: "anytime.",
      className:
        "text-gradient bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-teal-500 dark:from-green-400 dark:to-teal-400 font-bold ",
    },
  ];

  return (
    <LampContainer className="">
      <motion.h1
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="bg-gradient-to-br from-slate-300 to-slate-500 py-2 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
      >
        <div className="flex flex-col items-center justify-center px-4 dark:from-gray-900 dark:to-gray-800">
          <p className="text-neutral-600 dark:text-neutral-300 text-2xl mb-6 font-medium">
            Communication made simple
          </p>
          <TypewriterEffectSmooth words={words}  />
          <div className="flex flex-col md:flex-row gap-4 mt-6">
            <button
              className="w-48 h-12 rounded-full bg-blue-500 hover:bg-blue-700 transition-colors duration-300 text-white font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              onClick={startChattingHandler}
            >
              Start chatting
            </button>
            <button
              className="w-48 h-12 rounded-full bg-white hover:bg-gray-50 transition-colors duration-300 text-gray-800 border-2 border-gray-300 font-semibold text-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              onClick={signUpHandler}
            >
              Sign up
            </button>
          </div>
        </div>
      </motion.h1>
    </LampContainer>
  );
}
