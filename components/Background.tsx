import React from 'react';
import { PersonalityProfile, PersonalityType } from '../types';

interface BackgroundProps {
  personality: PersonalityProfile;
}

export const Background: React.FC<BackgroundProps> = ({ personality }) => {

  const hour = new Date().getHours();
  const isNight = hour < 6 || hour > 18;

  /* --------------------------
     WEATHER EFFECTS
  ---------------------------*/
  const getWeatherEffects = () => {
    switch (personality.type) {
      case PersonalityType.RAINY:
      case PersonalityType.STORMY:
        return (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(25)].map((_, i) => (
              <div
                key={i}
                className="absolute w-[2px] h-16 bg-blue-200/40 animate-rain"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random()}s`,
                  animationDuration: `${0.4 + Math.random()}s`,
                }}
              />
            ))}

            {personality.type === PersonalityType.STORMY && (
              <div className="absolute inset-0 bg-white opacity-0 animate-flash mix-blend-overlay"></div>
            )}
          </div>
        );
      case PersonalityType.FOGGY:
        return <div className="absolute inset-0 bg-white/15 backdrop-blur-sm"></div>;
      default:
        return null;
    }
  };

  /* --------------------------
     🌙 NIGHT MODE EFFECTS
  ---------------------------*/
  const nightSky = isNight
    ? "from-[#0a0f29] to-[#000000]" // deep navy → black
    : `${personality.colors.bgFrom} ${personality.colors.bgTo}`;

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-br ${nightSky} transition-all duration-[1500ms] ease-in-out`}
    >
      {/* WEATHER ANIMATIONS */}
      {getWeatherEffects()}

      {/* 🌟 STAR FIELD */}
      {isNight && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(60)].map((_, i) => (
            <div
              key={i}
              className="absolute bg-white rounded-full animate-twinkle"
              style={{
                width: "2px",
                height: "2px",
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.9 + 0.1,
                animationDuration: `${2 + Math.random() * 4}s`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            ></div>
          ))}
        </div>
      )}

      {/* 🌕 MOON GLOW */}
      {isNight && (
        <div className="absolute top-10 right-10 w-40 h-40 bg-yellow-200 rounded-full blur-3xl opacity-20"></div>
      )}

      {/* NOISE OVERLAY */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
        }}
      ></div>
    </div>
  );
};
