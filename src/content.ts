export const sections = [
  { id: 'home', label: 'Home' },
  { id: 'matchday', label: 'Live Matchday' },
  { id: 'fan-talk', label: 'Fan Talk' },
  { id: 'challenges', label: 'Challenges' },
  { id: 'competitions', label: 'Competitions' },
  { id: 'support', label: 'Connect & Support' },
  { id: 'waitlist', label: 'Waitlist' },
] as const;

export const content = {
  hero: {
    pill: 'FOOTBALL FIRST · ANDROID SOON',
    description:
      'Live scores, real-time fan talk, friend challenges and every competition you follow — together in one place.',
  },
  matchday: {
    index: '01 / LIVE MATCHDAY',
    title: ['Know what happened.', 'Feel like you were there.'],
    description:
      'A complete live timeline, match context, stats and lineups — designed around the moments fans actually care about.',
    features: [
      ['LIVE TIMELINE', 'Every goal, card and substitution as it happens.'],
      ['MATCH CONTEXT', 'Score, momentum and critical moments in one view.'],
      [
        'ONE TAP DEEP DIVE',
        'Move between commentary, stats and lineups instantly.',
      ],
    ],
  },
  talk: {
    index: '02 / FAN TALK',
    title: ['Don’t just watch.', 'Watch together.'],
    description:
      'Every match has a live conversation. Friends appear first, reactions stay instant, and the noise feels like your group chat — only built for matchday.',
    comments: [
      'What a goal by De Bruyne! Pure class 🚀',
      'Haaland is unstoppable today 🔥',
      'Already predicting a hat-trick.',
    ],
  },
  challenges: {
    index: '03 / FRIEND CHALLENGES',
    title: [
      'Predictions are better',
      'when bragging rights',
      'are on the line.',
    ],
    description:
      'Pick a match. Make your call. Challenge a friend. FanArena keeps score so the group chat doesn’t have to.',
    metrics: [
      ['#1', 'YOU'],
      ['12', 'WINS'],
      ['68%', 'ACCURACY'],
    ],
    note: 'Settle the argument with a leaderboard, not screenshots.',
  },
  competitions: {
    index: '04 / COMPETITIONS',
    title: ['Every league. Every table.', 'Nothing to hunt for.'],
    description:
      'Fixtures, results, standings and leaders for the competitions you actually follow.',
    leagues: [
      'PREMIER LEAGUE',
      'LA LIGA',
      'CHAMPIONS LEAGUE',
      'ISL',
      'BUNDESLIGA',
      'SERIE A',
    ],
  },
  support: {
    index: 'CONNECT WITH FANARENA',
    title: ['Follow the journey.', 'Tell us what needs fixing.'],
    description:
      'Questions, feedback or grievances — send them directly to the FanArena team. You can also follow product updates and launch news.',
    platforms: [
      {
        name: 'Instagram',
        description: 'Follow updates, previews and launch news',
        asset: 'logo-instagram',
      },
      {
        name: 'Google Play',
        description: 'Android app',
        asset: 'logo-google-play',
      },
      {
        name: 'App Store',
        description: 'iPhone and iPad',
        asset: 'logo-app-store',
      },
    ],
    categories: ['General query', 'Feedback', 'Grievance'],
  },
  waitlist: {
    index: 'GET IN BEFORE KICKOFF',
    title: ['Be there from', 'day one.'],
    description:
      'Early access, priority invites, and a front-row seat as FanArena launches.',
    privacy: 'No spam. We’ll only email when FanArena is ready.',
  },
};
