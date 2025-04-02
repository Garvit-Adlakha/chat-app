"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export function HoverBorderGradient({
    children,
    containerClassName,
    className,
    as: Tag = "button",
    duration = 1,
    clockwise = true,
    ...props
}) {
    const [hovered, setHovered] = useState(false);
    const [direction, setDirection] = useState("top");

    // Direction mapping
    const directions = ["top", "right", "bottom", "left"];
    
    // Prevent errors by ensuring the direction is valid
    const safeDirection = directions.includes(direction) ? direction : "top";
    
    // Function to rotate direction
    const rotateDirection = (currentDir) => {
        const currentIndex = directions.indexOf(currentDir);
        if (currentIndex === -1) return "top"; // fallback to default
        
        const nextIndex = (currentIndex + (clockwise ? 1 : -1) + directions.length) % directions.length;
        return directions[nextIndex];
    };

    // Mapping for gradient positions
    const movingMap = {
        top: "radial-gradient(20% 75% at 50% 0%, var(--moving-gradient) 0%, rgba(255, 255, 255, 0) 100%)",
        right: "radial-gradient(20% 75% at 100% 50%, var(--moving-gradient) 0%, rgba(255, 255, 255, 0) 100%)",
        bottom: "radial-gradient(20% 75% at 50% 100%, var(--moving-gradient) 0%, rgba(255, 255, 255, 0) 100%)",
        left: "radial-gradient(20% 75% at 0% 50%, var(--moving-gradient) 0%, rgba(255, 255, 255, 0) 100%)"
    };

    // Default gradient
    const defaultGradient = "radial-gradient(75% 181.15942028985506% at 50% 50%, #3275F8 0%, rgba(255, 255, 255, 0) 100%)";

    useEffect(() => {
        if (!hovered) {
            const interval = setInterval(() => {
                setDirection((prevState) => rotateDirection(prevState));
            }, duration * 1000);
            return () => clearInterval(interval);
        }
    }, [hovered, duration, clockwise]);
    
    return (
        <Tag
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={cn(
                "relative flex rounded-full border content-center bg-black/20 hover:bg-black/10 transition duration-500 dark:bg-white/20 items-center flex-col flex-nowrap gap-10 h-min justify-center overflow-visible p-px decoration-clone w-fit",
                containerClassName
            )}
            {...props}
        >
            <div
                className={cn("w-auto text-white z-10 bg-black px-4 py-2 rounded-[inherit]", className)}>
                {children}
            </div>
            <motion.div
                className={cn("flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]")}
                style={{
                    filter: "blur(2px)",
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    "--moving-gradient": "rgba(50, 117, 248, 0.8)"
                }}
                initial={{ background: movingMap[safeDirection] || defaultGradient }}
                animate={{
                    background: hovered
                        ? defaultGradient
                        : movingMap[safeDirection] || defaultGradient
                }}
                transition={{ duration: 0.5 }}
            />
        </Tag>
    );
}
