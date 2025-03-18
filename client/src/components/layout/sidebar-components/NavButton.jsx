
export const NavButton = ({ 
    icon: Icon, 
    label, 
    isActive, 
    onClick, 
    badge 
}) => (
    <button
        className={`
            p-2 rounded-md cursor-pointer transition-colors
            ${isActive 
                ? 'bg-blue-500 text-white' 
                : 'bg-transparent hover:bg-neutral-300 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200'
            }
        `}
        onClick={onClick}
        aria-label={label}
    >
        <Icon className="w-6 h-6" />
        {badge > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                {badge}
            </span>
        )}
    </button>
);