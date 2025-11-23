import React from "react";
import { PersonalityProfile } from "../types";

interface CharacterDisplayProps {
  personality: PersonalityProfile;
  latestMessage: string | null;
  characterImageUrl: string | null;
  isGeneratingImage: boolean;
  isNight?: boolean;
}

export const CharacterDisplay: React.FC<CharacterDisplayProps> = ({
  personality,
  latestMessage,
  characterImageUrl,
  isGeneratingImage,
  isNight = false,
}) => {
  return (
    <div className="relative flex flex-col items-center justify-center w-full my-4 z-10">
      {/* Dialogue Bubble */}
      <div className="relative z-20 mb-4 w-full flex justify-center min-h-[80px]">
        {latestMessage ? (
          <div className="relative max-w-[90%] md:max-w-md text-center animate-float">
            <div
              className={`
                relative inline-block px-6 py-4 rounded-3xl text-lg font-bold 
                shadow-xl backdrop-blur-md border border-white/20 
                transition-colors duration-500 
                ${personality.colors.accent} ${personality.colors.text}
              `}
            >
              {latestMessage}

              {/* Bubble Tail */}
              <div
                className={`
                  absolute -bottom-2 left-1/2 transform -translate-x-1/2
                  w-4 h-4 rotate-45 ${personality.colors.accent}
                `}
              ></div>
            </div>
          </div>
        ) : (
          <div className="w-full h-[60px]"></div>
        )}
      </div>

      {/* Character Container */}
      <div className="character-container flex flex-col items-center justify-center w-full">
        <div
          className={`
            relative flex justify-center items-center w-full px-4
            transition-all duration-700 
            ${personality.animationClass}
          `}
        >
          {/* CHARACTER IMAGE */}
          {characterImageUrl ? (
            <img
              src={characterImageUrl}
              alt={personality.name}
              className={`
                character-img relative z-10 w-full h-auto object-contain 
                select-none 
                ${isNight ? "drop-shadow-[0_0_25px_rgba(255,255,255,0.35)]" : "drop-shadow-2xl"}
              `}
              style={{
                background: "transparent",
              }}
            />
          ) : (
            // Fallback Emoji
            <div
              className={`
                text-[100px] sm:text-[160px] leading-none select-none 
                drop-shadow-xl transform pt-5 transition-transform 
                ${isGeneratingImage ? "animate-pulse opacity-50 scale-95" : ""}
              `}
            >
              {personality.emoji}
            </div>
          )}

          {/* LOADING SPINNER */}
          {isGeneratingImage && !characterImageUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-white/40 border-t-white rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      {/* NAME LABEL */}
      <div
        className={`
          mt-4 px-6 py-2 rounded-full text-sm font-bold tracking-widest uppercase
          backdrop-blur-sm border shadow-sm z-10
          ${isNight ? "bg-white/10 text-white border-white/20" : "bg-black/20 text-white border-white/10"}
        `}
      >
        {personality.name}
      </div>

      {/* Responsive Image Size */}
      <style>{`
        .character-img {
          max-width: 240px;
          margin-top: 10px;
          pointer-events: none;
        }
        @media (min-width: 640px) {
          .character-img { max-width: 360px; }
        }
      `}</style>
    </div>
  );
};
