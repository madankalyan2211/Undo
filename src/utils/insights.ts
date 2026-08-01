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

export interface EmotionalInsight {
  totalSaved: number;
  totalReleasedThisWeek: number;
  topMood?: MoodCount;
  moodBreakdown: MoodCount[];
  topThemes: TagCount[];
  weeklyThemeSummary: string;
  primaryEmotionTheme: string;
  reflectionGuidance: string;
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

  const mainTag = topThemes[0]?.tag;

  if (topMood) {
    switch (topMood.emoji) {
      case '🌿':
      case '😌':
        primaryEmotionTheme = 'Tranquility & Harmony';
        weeklyThemeSummary = `Your saved reflections this week center on inner peace and quiet clarity. You've consistently chosen to preserve moments of stillness${
          mainTag ? ` focused on '${mainTag}'` : ''
        }.`;
        reflectionGuidance = 'Notice how holding onto peaceful thoughts creates a mental anchor during turbulent moments.';
        break;
      case '💭':
        primaryEmotionTheme = 'Deep Contemplation';
        weeklyThemeSummary = `This week reveals a strong reflective mindset. You are actively analyzing personal patterns and meaningful realization${
          mainTag ? ` around '${mainTag}'` : ''
        }.`;
        reflectionGuidance = 'Self-awareness is the precursor to intentional change. Honor your moments of insight.';
        break;
      case '✨':
      case '🍃':
        primaryEmotionTheme = 'Renewal & Hope';
        weeklyThemeSummary = `A strong current of hope and forward energy flows through your saved thoughts. You are cultivating optimism and letting go of unnecessary friction.`;
        reflectionGuidance = 'Your focus on growth is building long-term emotional resilience.';
        break;
      case '⚡':
      case '🔥':
      case '🌧️':
        primaryEmotionTheme = 'Processing High Energy';
        weeklyThemeSummary = `You've used Undo to navigate intense feelings this week. Saving these reflections shows courage in acknowledging vulnerability without being overwhelmed by it.`;
        reflectionGuidance = 'By putting feelings into words, you strip them of their chaos and create room for resolution.';
        break;
      default:
        primaryEmotionTheme = 'Mindful Intent';
        weeklyThemeSummary = `Your saved thoughts reflect conscious selection—preserving thoughts that matter while letting transient noise fade away.`;
        reflectionGuidance = 'Continue choosing which thoughts deserve a permanent home in your heart.';
    }
  } else {
    primaryEmotionTheme = 'Selective Preservation';
    weeklyThemeSummary = `You have saved ${totalSaved} reflection${totalSaved > 1 ? 's' : ''} worth keeping. These form your personal baseline of clarity.`;
    reflectionGuidance = 'Try selecting a mood emoji when releasing your next thought to uncover richer emotional patterns.';
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
    hasEnoughData: true,
  };
};
