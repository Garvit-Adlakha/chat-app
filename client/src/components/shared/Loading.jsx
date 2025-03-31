import { motion } from "framer-motion";


const Loading=()=>{

     return (
            <div className="flex-1 h-full flex flex-col items-center justify-center">
                <div className="p-6 bg-neutral-800/30 backdrop-blur-sm rounded-2xl shadow-lg">
                    <motion.div 
                        className="flex space-x-2 items-center"
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                    >
                        <motion.div 
                            className="w-3 h-3 bg-indigo-500 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.1 }}
                        />
                        <motion.div 
                            className="w-3 h-3 bg-purple-500 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.2 }}
                        />
                        <motion.div 
                            className="w-3 h-3 bg-pink-500 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.3 }}
                        />
                        <span className="text-sm text-neutral-300 ml-2">Loading messages...</span>
                    </motion.div>
                </div>
            </div>
        );

}
export default Loading;
