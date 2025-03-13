import { IconSearch } from '@tabler/icons-react';

export const Search = ({ placeholder, value, onChange }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <IconSearch className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
        </div>
        <input
            type="text"
            className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 transition-colors"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
        />
    </div>
);
