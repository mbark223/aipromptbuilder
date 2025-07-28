// Comprehensive geo-targeted betting suggestions for Sportsbook & iCasino content

export const SUBJECT_SUGGESTIONS = [
  // Sportsbook FL (40-65+ demographic)
  'mature Florida sports fan checking odds on tablet',
  'golf course betting at Florida country club',
  'Florida retiree watching NFL on big screen',
  'Dolphins game day betting experience',
  'Tampa Bay Buccaneers touchdown celebration',
  'Jacksonville Jaguars betting opportunities',
  'Florida horse racing at Gulfstream Park',
  'NASCAR Daytona 500 betting action',
  'fishing tournament betting in Florida Keys',
  'Florida sports bar mature crowd',
  'retirement community game day gathering',
  'PGA tour betting at Florida courses',
  'spring training baseball betting',
  'Florida jai alai betting tradition',
  'mature couple betting on cruise ship',
  
  // iCasino NJ
  'Atlantic City online slots at home',
  'New Jersey player winning jackpot',
  'Garden State online blackjack session',
  'Jersey Shore themed slot games',
  'NJ licensed casino app interface',
  'Atlantic City boardwalk casino vibes',
  'Borgata online partnership branding',
  'New Jersey DGE compliance display',
  
  // iCasino PA
  'Pennsylvania online casino at home',
  'Philly themed slot game experience',
  'Pittsburgh player hitting jackpot',
  'Liberty Bell slot machine symbols',
  'PA Gaming Control Board approved',
  'Pocono mountains casino backdrop',
  'Keystone State gaming pride',
  'Pennsylvania Dutch themed games',
  
  // iCasino MI
  'Michigan online slots Great Lakes theme',
  'Detroit skyline casino gaming',
  'Motor City jackpot celebration',
  'Pure Michigan casino experience',
  'Great Lakes themed slot games',
  'Michigan wildlife casino symbols',
  'Detroit casino partnership online',
  'Lansing area player winning big',
  
  // iCasino - Table Games
  'blackjack perfect hand',
  'roulette ball landing',
  'poker royal flush reveal',
  'baccarat card draw',
  'craps dice roll',
  'dealer shuffling cards',
  'chip stack growing',
  'live dealer interaction',
  'VIP table atmosphere',
  'high roller room',
  
  // iCasino - Live Casino
  'live dealer dealing cards',
  'roulette wheel spinning',
  'game show wheel spin',
  'lightning multiplier strike',
  'live casino studio',
  'dealer celebration',
  'player chat interaction',
  'side bet winning',
  'perfect pairs payout',
  'dragon bonus win',
  
  // General Betting
  'winner celebration moment',
  'odds comparison display',
  'account balance increase',
  'withdrawal confirmation',
  'VIP rewards presentation',
  'loyalty points accumulation',
  'tournament leaderboard',
  'prize pool display',
  'bonus activation moment',
  'referral reward unlock',
];

export const MOTION_SUGGESTIONS = [
  // Sports Motion (40-65+ friendly)
  'smooth slow-motion replay',
  'comfortable pacing transitions',
  'clear odds display updates',
  'gentle camera movements',
  'celebration moments captured',
  'easy-to-read ticker scrolling',
  'stats appearing clearly',
  'multiple angle replays',
  'relaxed time progression',
  'UI demonstrations at readable pace',
  
  // Casino Motion
  'slot reels spinning rapidly',
  'coins cascading down',
  'cards flipping dramatically',
  'roulette ball bouncing',
  'dice tumbling in slow-mo',
  'chips sliding across table',
  'jackpot counter climbing',
  'winning symbols pulsing',
  'explosion of confetti',
  'money rain effect',
  
  // UI/UX Motion
  'smooth app navigation',
  'button press feedback',
  'swipe to reveal odds',
  'pull to refresh bets',
  'notification slide-in',
  'balance counter animation',
  'achievement unlock effect',
  'loading spinner elegance',
  'transition between games',
  'menu drawer sliding',
];

export const TECHNICAL_SUGGESTIONS = [
  // Format Specific
  '1:1 square format for social feeds',
  '9:16 vertical for mobile stories',
  '16:9 horizontal for web display',
  'multi-format export capability',
  'responsive aspect ratio switching',
  
  // Quality Specs (Age-Appropriate)
  'HD quality with clear text',
  '30fps for comfortable viewing',
  'high contrast for readability',
  'larger UI elements visible',
  'broadcast quality standard',
  'optimized file size for mobile',
  'loop-ready for continuous play',
  'captions and subtitles ready',
  
  // Geo-Specific Compliance
  'Florida 21+ disclaimer visible',
  'NJ DGE license prominent',
  'PA Gaming Control Board seal',
  'MI regulatory compliance shown',
  'state geo-fence messaging',
  'responsible gaming footer',
  'local partnership branding',
  
  // Betting Specific
  'responsible gambling compliant',
  'age verification visible',
  'odds display clarity',
  'legal disclaimer included',
  'geo-targeting ready',
  'multi-language support',
  'currency display clear',
  'time zone adaptive',
  'live data integration',
  'real-time updates capable',
];

export const ATMOSPHERE_SUGGESTIONS = [
  // Sports Atmosphere (40-65+ FL)
  'comfortable Florida sports bar',
  'upscale country club ambiance',
  'relaxed game day gathering',
  'mature fan celebration',
  'sophisticated betting lounge',
  'Florida sunshine atmosphere',
  'retirement community excitement',
  'golf course clubhouse vibe',
  'yacht club sports viewing',
  'beachside betting experience',
  
  // Casino Atmosphere (State-Specific)
  'Atlantic City boardwalk energy',
  'Jersey Shore casino vibes',
  'Pennsylvania gaming excitement',
  'Philly sophistication',
  'Michigan casino atmosphere',
  'Detroit gaming energy',
  'home comfort gaming',
  'regulated safe environment',
  'local casino partnership feel',
  'state pride gaming experience',
  
  // Emotional Tones
  'adrenaline pumping',
  'heart-racing suspense',
  'triumphant celebration',
  'exclusive privilege',
  'competitive spirit',
  'winning confidence',
  'strategic thinking',
  'risk and reward',
  'fortune and glory',
  'ultimate victory',
];

export const COLOR_PALETTE_SUGGESTIONS = [
  // Sports Colors
  'team colors dominant',
  'green field contrast',
  'stadium lights glow',
  'scoreboard amber',
  'championship gold',
  'victory confetti mix',
  'grass and sky',
  'night game neon',
  'jersey color pop',
  'trophy metallic shine',
  
  // Casino Colors
  'red and black roulette',
  'green felt luxury',
  'gold jackpot shine',
  'neon Vegas lights',
  'royal purple VIP',
  'lucky red accents',
  'silver coin gleam',
  'diamond sparkle white',
  'rich burgundy depth',
  'platinum prestige',
  
  // Brand Colors
  'corporate brand palette',
  'app interface colors',
  'promotional gold',
  'trust blue tones',
  'energy orange burst',
  'success green highlight',
  'premium black elegance',
  'clean white space',
  'accent color pop',
  'gradient transitions',
];

// Geo-targeted betting prompt templates
export const BETTING_TEMPLATES = {
  floridaSportsBetting: {
    name: 'Florida Sports Betting (40-65+)',
    formats: ['1:1', '9:16'],
    content: {
      subject: 'Mature Florida resident using sports betting app in comfortable home setting, local team highlights on TV',
      style: 'Sophisticated and relatable to 40-65 demographic, warm Florida aesthetics',
      composition: {
        '1:1': 'Balanced view of user and betting interface',
        '9:16': 'Mobile-first with Florida context visible'
      },
      lighting: 'Natural Florida sunlight, warm interior lighting',
      motion: 'Smooth UI interactions, relaxed pacing appropriate for demographic',
      technical: 'Clear text display, Florida compliance messaging, responsible gaming visible',
    }
  },
  njOnlineCasino: {
    name: 'New Jersey iCasino Experience',
    formats: ['1:1', '9:16'],
    content: {
      subject: 'NJ player enjoying online casino from home with Atlantic City imagery',
      style: 'Jersey Shore authenticity with premium online gaming feel',
      composition: {
        '1:1': 'Device and NJ setting equally featured',
        '9:16': 'Mobile gaming with NJ landmarks'
      },
      lighting: 'Bright casino graphics with coastal ambiance',
      motion: 'Winning animations, smooth gameplay demonstration',
      technical: 'NJ DGE compliance prominent, geo-location indicators',
    }
  },
  paOnlineSlots: {
    name: 'Pennsylvania iCasino Slots',
    formats: ['1:1', '9:16'],
    content: {
      subject: 'PA-themed slot game with Liberty Bell symbols, Keystone State player winning',
      style: 'Pennsylvania pride with modern online gaming excitement',
      composition: {
        '1:1': 'Slot game centered with PA context',
        '9:16': 'Mobile slot interface with state elements'
      },
      lighting: 'Bright slot animations, warm PA home setting',
      motion: 'Reels spinning with PA symbols, celebration effects',
      technical: 'PA Gaming Control Board seal visible, state compliance messaging',
    }
  },
  michiganLiveCasino: {
    name: 'Michigan Live Dealer Games',
    formats: ['1:1', '9:16'],
    content: {
      subject: 'Live dealer on screen with Michigan player at home, Great Lakes themed backdrop',
      style: 'Motor City elegance meets accessible online gaming',
      composition: {
        '1:1': 'Split between dealer and Michigan setting',
        '9:16': 'Vertical live stream with MI branding'
      },
      lighting: 'Professional studio lights, cozy Michigan home',
      motion: 'Real-time dealing, smooth streaming quality',
      technical: 'MI regulatory compliance, Detroit partnership visible',
    }
  },
  matureAudiencePromo: {
    name: 'Florida 40-65+ Welcome Offer',
    formats: ['1:1', '9:16'],
    content: {
      subject: 'Mature couple in Florida discovering sports betting app benefits, easy interface demo',
      style: 'Approachable, trustworthy, age-appropriate design',
      composition: {
        '1:1': 'Couple with device, clear UI visibility',
        '9:16': 'Mobile-first tutorial style presentation'
      },
      lighting: 'Bright, clear, high contrast for readability',
      motion: 'Slow, clear demonstrations of app features',
      technical: 'Large text, simplified UI, Florida compliance, tutorial pacing',
    }
  },
};