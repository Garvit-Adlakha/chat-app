import { useState, useRef } from "react";
import { useClickOutside } from "../../hooks/UseClickOutside.js";
import { IconSend, IconPaperclip, IconMoodSmile } from '@tabler/icons-react';
import EmojiPicker from 'emoji-picker-react';

export const MessageInput = ({ onSendMessage }) => {
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef(null);
  
    const handleSubmit = (e) => {
      e.preventDefault();
      if (!message.trim()) return;
      onSendMessage(message);
      setMessage('');
    };

    const onEmojiClick = (emojiObject) => {
      setMessage((prevMsg) => prevMsg + emojiObject.emoji);
    };
  
    useClickOutside(emojiPickerRef, () => setShowEmojiPicker(false));
  
    return (
      <footer className="p-4 bg-neutral-800/90 backdrop-blur-xl border-t border-neutral-700 z-10">
        <form onSubmit={handleSubmit} className="flex items-center gap-4">
          <label className="p-2 hover:bg-neutral-700 rounded-full transition-colors cursor-pointer">
            <input 
              type="file" 
              className="hidden" 
              onChange={(e) => console.log('File selected:', e.target.files[0])} 
            />
            <IconPaperclip className="w-5 h-5 text-neutral-400" />
          </label>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message"
              className="w-full px-4 py-2 bg-neutral-700/50 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-neutral-400"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1.5 hover:bg-neutral-600 rounded-full transition-colors"
              >
                <IconMoodSmile className="w-5 h-5 text-neutral-400" />
              </button>
              
              {showEmojiPicker && (
                <div 
                  ref={emojiPickerRef}
                  className="absolute bottom-12 right-0 z-50"
                >
                  <EmojiPicker
                    onEmojiClick={onEmojiClick}
                    theme="dark"
                    width={320}
                    height={400}
                  />
                </div>
              )}
            </div>
          </div>
          
          <button
            type="submit"
            disabled={!message.trim()}
            className={`p-2 rounded-full transition-colors ${
              message.trim() 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-neutral-700 text-neutral-400'
            }`}
          >
            <IconSend className="w-5 h-5" />
          </button>
        </form>
      </footer>
    );
};

export default MessageInput;