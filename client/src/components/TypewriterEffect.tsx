"use client";
import { TypewriterEffectSmooth } from "./ui/typewriter-effect";
import { useNavigate } from "react-router-dom";
import { LampContainer } from "./ui/lamp";
import { motion } from "framer-motion";

const WORDS = [
  { text: "Connect", className: "text-blue-500 dark:text-blue-400 font-bold" },
  { text: "instantly", className: "text-gray-800 dark:text-gray-200" },
  { text: "with", className: "text-gray-600 dark:text-gray-300" },
  { text: "anyone,", className: "text-gray-800 dark:text-gray-200" },
  { text: "anywhere", className: "bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent font-bold" },
  { text: "anytime.", className: "bg-gradient-to-r from-green-500 to-teal-500 dark:from-green-400 dark:to-teal-400 bg-clip-text text-transparent font-bold" },
];

const BUTTON_VARIANTS = {
  primary: "bg-blue-500 hover:bg-blue-600 text-white p-2",
  secondary: "bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 dark:bg-gray-800 dark:text-white dark:border-gray-600",
};

export function TypewriterEffectSmoothDemo() {
  const navigate = useNavigate();

  const handleNavigation = (path) => (e) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <LampContainer>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeInOut" }}
        className="flex flex-col items-center justify-center px-6 py-10 space-y-10 md:space-y-12 text-center"
      >
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <h1 className="bg-gradient-to-br from-slate-300 to-slate-500 bg-clip-text text-3xl sm:text-5xl md:text-7xl font-medium tracking-tight text-transparent">
            <span className="block text-neutral-600 dark:text-neutral-300 text-lg sm:text-2xl md:text-3xl font-medium mb-4 md:mb-6">
              Communication made simple
            </span>
            <TypewriterEffectSmooth words={WORDS} />
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-6"
        >
          {[
            { text: "Start chatting", variant: "primary", path: "/chat" },
            { text: "Sign up", variant: "secondary", path: "/signup" },
          ].map((button) => (
            <button
              key={button.text}
              onClick={handleNavigation(button.path)}
              className={`w-full sm:w-48 h-12 rounded-full font-semibold text-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 hover:bg-zinc-900 transition-all duration-300 ${BUTTON_VARIANTS[button.variant]}`}
            >
              {button.text}
            </button>
          ))}
        </motion.div>
      </motion.div>
    </LampContainer>
  );
}
