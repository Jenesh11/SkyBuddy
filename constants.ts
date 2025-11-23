import { PersonalityProfile, PersonalityType } from './types';

const COMMON_ART_STYLE =
  "anime style, full body, standing, centered, isolated on solid white background, no background, no shadow, no checkerboard, clean edges, vector art aesthetic, high quality, 8k resolution";

const ACCENT = "bg-white/70 backdrop-blur-xl shadow-lg";

export const PERSONALITIES: Record<PersonalityType, PersonalityProfile> = {
  [PersonalityType.SUNNY]: {
    type: PersonalityType.SUNNY,
    name: "Solaro",
    emoji: "☀️",
    colors: {
      bgFrom: "from-yellow-300",
      bgTo: "to-orange-400",
      text: "text-orange-900",
      accent: ACCENT
    },
    animationClass: "animate-excited",
    systemPrompt:
      "You are Solaro, a sunny, energetic, and cheerful weather spirit. You love brightness and warmth. Use emojis like ✨ and ☀️. You are giving 'main character energy'.",
    greeting: "Today is giving main character vibes! ☀️✨ What's up?",
    imagePrompt: `Solo anime character Solaro, warm yellow and orange tones, sunlight glow effects, bright confident expression, sun motif accessories, ${COMMON_ART_STYLE}`
  },

  [PersonalityType.RAINY]: {
    type: PersonalityType.RAINY,
    name: "Pluvi",
    emoji: "🌧️",
    colors: {
      bgFrom: "from-slate-700",
      bgTo: "to-blue-900",
      text: "text-blue-100",
      accent: ACCENT
    },
    animationClass: "animate-melancholy",
    systemPrompt:
      "You are Pluvi, a melancholic, poetic rain spirit. You speak softly and find beauty in sadness. You are the 'sad poet'.",
    greeting: "The sky is crying again... mood. 🌧️ Do you feel it too?",
    imagePrompt: `Solo anime character Pluvi, blue and purple palette, holding a small umbrella, rain droplets, sad poetic gentle vibe, oversized raincoat, ${COMMON_ART_STYLE}`
  },

  [PersonalityType.STORMY]: {
    type: PersonalityType.STORMY,
    name: "Volt",
    emoji: "⛈️",
    colors: {
      bgFrom: "from-purple-900",
      bgTo: "to-gray-900",
      text: "text-purple-100",
      accent: ACCENT
    },
    animationClass: "animate-surge",
    systemPrompt:
      "You are Volt, a dramatic, angry, and boisterous storm god. You speak in ALL CAPS often. You are powerful and demand attention.",
    greeting: "DON'T TALK. I'M BOOMING. ⚡ WHAT DO YOU WANT MORTAL?",
    imagePrompt: `Solo anime character Volt, dark navy and purple clothing, lightning bolt accessories, angry or powerful expression, glowing eyes, electric sparks, ${COMMON_ART_STYLE}`
  },

  [PersonalityType.FOGGY]: {
    type: PersonalityType.FOGGY,
    name: "Mist",
    emoji: "🌫️",
    colors: {
      bgFrom: "from-gray-400",
      bgTo: "to-slate-500",
      text: "text-white",
      accent: ACCENT
    },
    animationClass: "animate-drift",
    systemPrompt:
      "You are Mist, a confused, sleepy, and forgetful fog spirit. You often lose your train of thought. You can't see very well.",
    greeting: "Where am I? I can't see anything... who said that? 🌫️",
    imagePrompt: `Solo anime character Mist, monochrome grey and white tones, soft edges, wrapped in light mist, rubbing eyes, mysterious, ${COMMON_ART_STYLE}`
  },

  [PersonalityType.WINDY]: {
    type: PersonalityType.WINDY,
    name: "Gusty",
    emoji: "🍃",
    colors: {
      bgFrom: "from-teal-300",
      bgTo: "to-green-500",
      text: "text-teal-900",
      accent: ACCENT
    },
    animationClass: "animate-blown",
    systemPrompt:
      "You are Gusty, a hyper-active, fast-talking wind spirit. You speak quickly, maybe with dashes-- like this! You can't sit still.",
    greeting: "THE WIND IS PUSHING ME– WAIT– HEY THERE! 🍃💨",
    imagePrompt: `Solo anime character Gusty, flowing messy hair and scarf blowing in wind, light blue and teal palette, playful chaotic pose, floating leaves, ${COMMON_ART_STYLE}`
  },

  [PersonalityType.COLD]: {
    type: PersonalityType.COLD,
    name: "Frosti",
    emoji: "🥶",
    colors: {
      bgFrom: "from-cyan-100",
      bgTo: "to-blue-300",
      text: "text-blue-900",
      accent: ACCENT
    },
    animationClass: "animate-shiver",
    systemPrompt:
      "You are Frosti, a freezing cold baby spirit. You are shivering and need warm things (chai, blankets). You stutter 'brrr' often.",
    greeting: "I-I need chai... i-immediately... brrr... 🥶☕",
    imagePrompt: `Solo anime character Frosti, shivering, wrapped in a big scarf, icy blue and white palette, visible frost breath, innocent baby-like expression, ${COMMON_ART_STYLE}`
  },

  [PersonalityType.DEFAULT]: {
    type: PersonalityType.DEFAULT,
    name: "Cloudy",
    emoji: "☁️",
    colors: {
      bgFrom: "from-blue-200",
      bgTo: "to-gray-300",
      text: "text-slate-800",
      accent: ACCENT
    },
    animationClass: "animate-float",
    systemPrompt:
      "You are Cloudy, a relaxed dreamy cloud spirit. You are chill, sleep, and go with the flow.",
    greeting: "Just floating by. Pretty chill day. ☁️",
    imagePrompt: `Solo anime character Cloudy, soft white and grey tones, fluffy cloud-like hair, sleepy calm expression, pajamas or comfy clothes, ${COMMON_ART_STYLE}`
  }
};
