import { Thought } from '../types';

export interface MoodCount {
  emoji: string;
  label: string;
  count: number;
  percentage: number;
}

export interface TagCount {
  tag: string;
  count: number;
}

export interface EmotionalWeather {
  state: 'clarity' | 'tranquil' | 'processing' | 'turbulent' | 'renewal';
  icon: string;
  title: string;
  subtitle: string;
  velocity: 'Gentle' | 'Balanced' | 'High Velocity';
}

export interface EmotionalInsight {
  totalSaved: number;
  totalReleasedThisWeek: number;
  topMood?: MoodCount;
  moodBreakdown: MoodCount[];
  topThemes: TagCount[];
  weeklyThemeSummary: string;
  primaryEmotionTheme: string;
  reflectionGuidance: string;
  emotionalWeather: EmotionalWeather;
  hasEnoughData: boolean;
}


const MOOD_LABEL_MAP: Record<string, string> = {
  '😌': 'Calm',
  '💭': 'Reflective',
  '🌧️': 'Heavy',
  '⚡': 'Anxious',
  '🔥': 'Intense',
  '🌿': 'Peaceful',
  '✨': 'Hopeful',
  '🍃': 'Released',
  '🙏': 'Grateful',
  '🥰': 'Loved',
  '🤩': 'Excited',
  '😢': 'Sad',
  '😡': 'Angry',
  '🥱': 'Exhausted',
  '🥺': 'Vulnerable',
  '😮‍💨': 'Relieved',
  '😵‍💫': 'Overwhelmed',
  '🥀': 'Grieving',
  '🦁': 'Brave',
  '😶': 'Numb',
  '😨': 'Scared',
  '🩹': 'Healing',
  '💡': 'Inspired',
  '🌊': 'Flow',
  '🌱': 'Growing',
  '🤍': 'Serene',
};


export const generateEmotionalInsight = (allThoughts: Thought[]): EmotionalInsight => {
  const savedThoughts = allThoughts.filter((t) => t.isSaved);
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  
  const releasedThisWeek = allThoughts.filter(
    (t) => !t.isSaved && t.releasedAt && t.releasedAt >= oneWeekAgo
  );

  const totalSaved = savedThoughts.length;
  const totalReleasedThisWeek = releasedThisWeek.length;

  if (totalSaved === 0) {
    return {
      totalSaved: 0,
      totalReleasedThisWeek,
      moodBreakdown: [],
      topThemes: [],
      weeklyThemeSummary: 'No saved thoughts yet. Keep a thought from the fading timeline to generate your first weekly insight.',
      primaryEmotionTheme: 'Blank Canvas',
      reflectionGuidance: 'Write down what is on your mind today. Choose whether to let it fade or keep it for future reflection.',
      emotionalWeather: {
        state: 'tranquil',
        icon: '🌤️',
        title: 'Calm Clearing',
        subtitle: 'A fresh, quiet mental canvas with zero lingering clutter.',
        velocity: 'Gentle',
      },
      hasEnoughData: false,
    };
  }

  // Calculate Mood Frequencies
  const moodMap: Record<string, number> = {};
  savedThoughts.forEach((t) => {
    if (t.moodEmoji) {
      moodMap[t.moodEmoji] = (moodMap[t.moodEmoji] || 0) + 1;
    }
  });

  const totalWithMood = Object.values(moodMap).reduce((a, b) => a + b, 0) || 1;

  const moodBreakdown: MoodCount[] = Object.entries(moodMap)
    .map(([emoji, count]) => ({
      emoji,
      label: MOOD_LABEL_MAP[emoji] || 'Mindful',
      count,
      percentage: Math.round((count / totalWithMood) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const topMood = moodBreakdown[0];

  // Extract Tags and Keyword Themes
  const tagMap: Record<string, number> = {};
  
  savedThoughts.forEach((t) => {
    // Check explicit tags
    if (t.tags && t.tags.length > 0) {
      t.tags.forEach((tag) => {
        const cleanTag = tag.toLowerCase().replace(/#/g, '');
        tagMap[cleanTag] = (tagMap[cleanTag] || 0) + 2;
      });
    }

    // Keyword extraction from text content
    const lower = t.content.toLowerCase();
    const commonKeywords = [
      'peace', 'clarity', 'work', 'focus', 'love', 'growth', 'family',
      'future', 'anxiety', 'calm', 'hope', 'fear', 'gratitude', 'healing',
      'relationship', 'breath', 'patience', 'accept', 'mindful', 'journey'
    ];

    commonKeywords.forEach((kw) => {
      if (lower.includes(kw)) {
        tagMap[kw] = (tagMap[kw] || 0) + 1;
      }
    });
  });

  const topThemes: TagCount[] = Object.entries(tagMap)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Synthesize Primary Emotion & Text Summary
  let primaryEmotionTheme = 'Inner Equilibrium';
  let weeklyThemeSummary = '';
  let reflectionGuidance = '';
  let weatherState: EmotionalWeather['state'] = 'tranquil';
  let weatherIcon = '⛅';
  let weatherTitle = 'Balanced Horizon';
  let weatherSubtitle = 'A steady, self-aware emotional climate across your reflections.';
  let velocity: EmotionalWeather['velocity'] = 'Balanced';

  const mainTag = topThemes[0]?.tag;

  if (totalReleasedThisWeek > 8) {
    velocity = 'High Velocity';
  } else if (totalReleasedThisWeek < 3) {
    velocity = 'Gentle';
  }

  if (topMood) {
    switch (topMood.emoji) {
      case '🌿':
      case '😌':
      case '🙏':
      case '🤍':
        primaryEmotionTheme = 'Tranquility & Harmony';
        weeklyThemeSummary = `Your reflections center on inner peace and quiet clarity. You've preserved moments of stillness${
          mainTag ? ` focused on '${mainTag}'` : ''
        }.`;
        reflectionGuidance = 'Notice how holding onto peaceful thoughts creates a mental anchor during turbulent moments.';
        weatherState = 'tranquil';
        weatherIcon = '☀️';
        weatherTitle = 'Golden Stillness';
        weatherSubtitle = 'High mental peace and grounding calm dominating your reflections.';
        break;
      case '💭':
      case '💡':
        primaryEmotionTheme = 'Deep Contemplation';
        weeklyThemeSummary = `This week reveals a strong reflective mindset analyzing personal patterns${
          mainTag ? ` around '${mainTag}'` : ''
        }.`;
        reflectionGuidance = 'Self-awareness is the precursor to intentional change. Honor your moments of insight.';
        weatherState = 'clarity';
        weatherIcon = '🌤️';
        weatherTitle = 'Clear Skies & Foresight';
        weatherSubtitle = 'Sharp self-awareness and active realization taking shape.';
        break;
      case '✨':
      case '🍃':
      case '🌱':
      case '🤩':
        primaryEmotionTheme = 'Renewal & Hope';
        weeklyThemeSummary = `A strong current of hope flows through your reflections, cultivating optimism and letting go of friction.`;
        reflectionGuidance = 'Your focus on growth is building long-term emotional resilience.';
        weatherState = 'renewal';
        weatherIcon = '🌈';
        weatherTitle = 'Fresh Renewal Tide';
        weatherSubtitle = 'Forward-looking optimism clearing out past friction.';
        break;
      case '⚡':
      case '🔥':
      case '🌧️':
      case '😡':
      case '😵‍💫':
        primaryEmotionTheme = 'Processing High Energy';
        weeklyThemeSummary = `You've used Undo to navigate intense feelings this week, acknowledging vulnerability with courage.`;
        reflectionGuidance = 'By putting feelings into words, you strip them of their chaos and create room for resolution.';
        weatherState = 'turbulent';
        weatherIcon = '⚡';
        weatherTitle = 'High Energy Discharge';
        weatherSubtitle = 'Courageously releasing heavy feelings to restore equilibrium.';
        break;
      default:
        primaryEmotionTheme = 'Mindful Intent';
        weeklyThemeSummary = `Your thoughts reflect conscious selection—preserving thoughts that matter while letting transient noise fade away.`;
        reflectionGuidance = 'Continue choosing which thoughts deserve a permanent home in your heart.';
        weatherState = 'processing';
        weatherIcon = '⛅';
        weatherTitle = 'Mindful Equilibrium';
        weatherSubtitle = 'Conscious curation of meaningful realizations.';
    }
  }

  return {
    totalSaved,
    totalReleasedThisWeek,
    topMood,
    moodBreakdown,
    topThemes,
    weeklyThemeSummary,
    primaryEmotionTheme,
    reflectionGuidance,
    emotionalWeather: {
      state: weatherState,
      icon: weatherIcon,
      title: weatherTitle,
      subtitle: weatherSubtitle,
      velocity,
    },
    hasEnoughData: true,
  };
};

/**
 * Ephemeral AI Mindful Reframer: Instant perspective shift before letting go
 */
export const generateMindfulPerspective = (content: string, emoji?: string): string => {
  const lower = content.toLowerCase();

  if (lower.includes('never') || lower.includes('always') || lower.includes('everyone') || lower.includes('nobody')) {
    return '✦ Mindful Shift: Notice all-or-nothing extremes. Is this completely true in every circumstance, or just heavy right now?';
  }
  if (lower.includes('should have') || lower.includes('could have') || lower.includes('regret') || lower.includes('fault')) {
    return '✦ Mindful Shift: You made the best choice you could with the awareness you had then. Forgive past you.';
  }
  if (lower.includes('worried') || lower.includes('what if') || lower.includes('scared') || lower.includes('fear') || emoji === '⚡') {
    return '✦ Mindful Shift: Worrying is trying to control the uncontrollable. Breathe into this present second—you are safe right now.';
  }
  if (lower.includes('angry') || lower.includes('hate') || lower.includes('mad') || emoji === '🔥' || emoji === '😡') {
    return '✦ Mindful Shift: Anger is often hurt protecting itself. By releasing these words, you take your peace back.';
  }
  if (lower.includes('tired') || lower.includes('exhausted') || lower.includes('overwhelmed') || emoji === '🥱' || emoji === '😵‍💫') {
    return '✦ Mindful Shift: You do not need to carry the whole world today. Rest is productive.';
  }
  if (lower.includes('sad') || lower.includes('lonely') || lower.includes('hurt') || emoji === '🌧️' || emoji === '😢') {
    return '✦ Mindful Shift: Emotions are weather passing through. Acknowledge the rain, knowing the sky itself remains intact.';
  }

  return '✦ Mindful Shift: By putting this into words and letting it dissolve, you create space for quiet clarity.';
};

