
// Data Dictionaries
const outfitAdvice: Record<string, string[]> = {
  clear: [
    "Sunny and warm — go light and comfy ☀️✨",
    "Avoid black today 💀 it's too hot!",
    "Cotton + light colors = perfect combo."
  ],
  clouds: [
    "Cloudy day — perfect for a cozy hoodie ☁️",
    "Light jacket recommended.",
    "Comfy clothes always win on cloudy days."
  ],
  mist: [
    "It's misty… go layered and comfy 😶‍🌫️",
    "Soft sweater weather.",
    "Wear warm colors — the world looks grey today."
  ],
  rain: [
    "Umbrella. Trust me. ☔",
    "Avoid white clothes today 💀",
    "Wear something waterproof."
  ],
  drizzle: [
    "Light rain — carry a small umbrella 🌧",
    "Quick-dry clothes recommended.",
    "A hoodie will be enough."
  ],
  thunderstorm: [
    "Don’t try to be fashionable today ⚡",
    "Wear something safe and dry.",
    "Avoid slippers or open shoes."
  ],
  snow: [
    "Bundle up — it's freezing ❄️🧣",
    "Sweater + jacket + warm shoes!",
    "Don't forget gloves!"
  ],
  haze: [
    "Hazy outside — light cotton + mask 😷",
    "Keep it breathable but covered.",
    "Avoid dusty areas."
  ]
};

const weatherMood: Record<string, string[]> = {
  clear: [
    "The sun is in a great mood today ☀️✨",
    "Warm skies… feeling bright!",
    "It's giving main character vibes."
  ],
  clouds: [
    "Clouds are being lazy today 😴☁️",
    "Soft, calm sky mood.",
    "Grey but peaceful."
  ],
  mist: [
    "Everything feels dreamy and lost in mist 😶‍🌫️",
    "It's a sleepy kind of day.",
    "Feels like the world is wrapped in a blanket."
  ],
  rain: [
    "Sky is crying again… mood 🌧",
    "Rainy vibes only.",
    "Soft, emotional weather."
  ],
  drizzle: [
    "A gentle drizzle… like the sky is whispering.",
    "Light rain = soft emotions today.",
    "Very chilled and calm."
  ],
  thunderstorm: [
    "The sky is angry today ⚡😤",
    "Dramatic energy everywhere!",
    "Even I'm scared rn."
  ],
  snow: [
    "Everything looks magical and cold ❄️✨",
    "Snow makes the world feel pure.",
    "Soft winter vibes!"
  ],
  haze: [
    "The sky feels tired and dusty 😷",
    "Hazy mood… unclear thoughts.",
    "Take it slow today."
  ]
};

const dailyTip: Record<string, string[]> = {
  clear: [
    "Drink extra water today! 💧",
    "Perfect day for a walk.",
    "Don't forget sunscreen SPF 50!"
  ],
  clouds: [
    "Great day to relax and chill ☁️",
    "Take it easy today.",
    "Perfect weather to listen to music."
  ],
  mist: [
    "Drive carefully — low visibility 😶‍🌫️",
    "Stay warm.",
    "Keep your room cozy today."
  ],
  rain: [
    "Carry an umbrella.",
    "Stay dry and comfy.",
    "Avoid slippery roads!"
  ],
  drizzle: [
    "A light umbrella is enough!",
    "Avoid white clothes.",
    "Good day for a warm drink."
  ],
  thunderstorm: [
    "Better stay indoors ⚡",
    "Don't go near open poles.",
    "Secure loose items outside."
  ],
  snow: [
    "Dress in layers ❄️",
    "Keep your hands warm.",
    "Be careful on icy ground."
  ],
  haze: [
    "Wear a mask outside 😷",
    "Avoid long outdoor walks.",
    "Drink something warm."
  ]
};

const getRandom = (arr: string[]): string => {
  if (!arr || arr.length === 0) return "Check the weather!";
  return arr[Math.floor(Math.random() * arr.length)];
};

// Normalize OWM conditions to our keys
const normalizeCondition = (condition: string): string => {
    const c = condition.toLowerCase();
    if (c.includes('clear')) return 'clear';
    if (c.includes('cloud')) return 'clouds';
    if (c.includes('rain')) return 'rain';
    if (c.includes('drizzle')) return 'drizzle';
    if (c.includes('storm') || c.includes('thunder')) return 'thunderstorm';
    if (c.includes('snow') || c.includes('ice')) return 'snow';
    if (c.includes('mist') || c.includes('fog')) return 'mist';
    return 'haze'; // Default fallback (Dust, Ash, Smoke, etc)
};

export const getInstantNpcResponse = (type: 'outfit' | 'mood' | 'tip', rawCondition: string): string => {
    const condition = normalizeCondition(rawCondition);
    
    if (type === 'outfit') return getRandom(outfitAdvice[condition]);
    if (type === 'mood') return getRandom(weatherMood[condition]);
    if (type === 'tip') return getRandom(dailyTip[condition]);
    
    return "Enjoy the weather!";
};
