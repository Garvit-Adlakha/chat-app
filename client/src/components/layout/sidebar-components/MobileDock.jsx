import React from 'react';
import { motion } from 'framer-motion';

export const MobileDock = ({ children }) => {
  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        mass: 1
      }}
      className="
        md:hidden fixed bottom-0 left-0 right-0 
        bg-white/75 dark:bg-neutral-900/75 backdrop-blur-2xl
        px-6 py-3 mx-3 mb-3 rounded-3xl
        flex items-center justify-around gap-2
        border border-neutral-200/50 dark:border-neutral-800/50
        shadow-[0_8px_32px_rgba(0,0,0,0.12)]
        dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]
        safe-bottom
        z-50
        [&>*]:transition-transform [&>*]:duration-200
        [&>*]:hover:scale-110 [&>*]:active:scale-95
      "
    >
      {children}
    </motion.div>
  );
};
