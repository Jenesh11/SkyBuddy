import React from 'react';
import { PersonalityProfile } from '../types';

interface InteractionButtonsProps {
  personality: PersonalityProfile;
  onInteraction: (type: 'outfit' | 'mood' | 'tip') => void;
  disabled?: boolean;
}

export const InteractionButtons: React.FC<InteractionButtonsProps> = ({
  personality,
  onInteraction,
  disabled
}) => {

  const hour = new Date().getHours();
  const isNight = hour < 6 || hour > 18;

  const btnBase = `
    px-4 py-2 rounded-full text-sm font-bold
    backdrop-blur-xl border shadow-md
    transition-all duration-300 active:scale-95
    whitespace-nowrap cursor-pointer
  `;

  const dayStyle = `
    bg-white/40 hover:bg-white/60
    border-white/20
    ${personality.colors.text}
  `;

  const nightStyle = `
    bg-white/10 hover:bg-white/20
    border-white/10 text-white
  `;

  const btnClass = `${btnBase} ${isNight ? nightStyle : dayStyle}`;

  return (
    <div className="flex justify-center items-center gap-4 mt-8 mb-10 w-full pointer-events-auto z-30 px-4 flex-wrap">
      
      <button
        onClick={() => onInteraction('outfit')}
        disabled={disabled}
        className={`${btnClass} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        👔 Outfit Advice
      </button>

      <button
        onClick={() => onInteraction('mood')}
        disabled={disabled}
        className={`${btnClass} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        ✨ Weather Mood
      </button>

      <button
        onClick={() => onInteraction('tip')}
        disabled={disabled}
        className={`${btnClass} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        💡 Daily Tip
      </button>

    </div>
  );
};
