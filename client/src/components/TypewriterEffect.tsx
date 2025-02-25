"use client";
import { TypewriterEffectSmooth } from "./ui/typewriter-effect";
import { useNavigate } from "react-router-dom";

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
    },
    {
      text: "instantly",
    },
    {
      text: "with",
    },
    {
      text: "anyone,",
    },
    {
      text: "anywhere.",
      className: "text-blue-500 dark:text-blue-500",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-[40rem]">
      <p className="text-neutral-600 dark:text-neutral-200 text-xs sm:text-base">
        Communication made simple
      </p>
      <TypewriterEffectSmooth words={words} />
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4">
        <button
          className="btn w-40 h-10 rounded-xl bg-black border dark:border-white border-transparent text-white text-sm"
          onClick={startChattingHandler}
        >
          Start chatting
        </button>
        <button
          className="btn w-40 h-10 rounded-xl bg-white text-black border border-black text-sm"
          onClick={signUpHandler}
        >
          Sign up
        </button>
      </div>
    </div>
  );
}
