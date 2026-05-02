export const SUPPORTED_LOCALES = ["en", "ja", "zh-CN", "ko", "es", "pt-BR"] as const;

export type LocaleId = (typeof SUPPORTED_LOCALES)[number];

export type MessageKey = keyof typeof EN_MESSAGES;

export type Translator = {
  readonly locale: LocaleId;
  readonly t: (key: MessageKey, params?: Readonly<Record<string, string | number>>) => string;
};

const EN_MESSAGES = {
  "app.title": "KeyQuest",
  "app.subtitle": "A terminal typing adventure for steady hands.",
  "dev.banner": "DEV MODE - debug magic is not sung by bards.",
  "title.menu.heading": "Title",
  "title.menu.continue": "Continue",
  "title.menu.newGame": "New Game",
  "title.menu.loadGame": "Load Game",
  "title.menu.options": "Options",
  "title.menu.review": "Review Weak Keys",
  "title.menu.start": "Start",
  "title.menu.prompt": "Choose: ",
  "title.menu.planned": "planned",
  "title.menu.loadUnavailable": "Load Game will open save slots later. Use Continue for now.",
  "review.lessonTitle": "Weak-Key Review",
  "review.noMistakes": "No weak-key review is ready yet. Finish a session with mistakes first.",
  "terminal.sizeWarning": "WARNING: Terminal is {columns}x{rows}. Recommended minimum is 80x24.",
  "options.heading": "Options",
  "options.language": "Language",
  "options.back": "Back",
  "options.prompt": "Choose language: ",
  "options.saved": "Language set to {language}.",
  "story.heading": "Story",
  "story.noviceIntro": "The old instructor points to the home row.",
  "story.noviceQuote": '"Before the blade, learn the stance."',
  "status.heading": "Status",
  "status.hero": "Hero: {hero}",
  "status.xp": "XP: {xp}",
  "status.streak": "Streak: {days} days",
  "status.training": "Training: {skills}",
  "practice.heading": "Practice",
  "practice.lesson": "Lesson: {lesson}",
  "practice.homeHint": "Keep your fingers on the home position.",
  "practice.keys": "Keys: {keys}",
  "practice.fingers": "Fingers: {fingers}",
  "practice.type": "Type: {text}",
  "realtime.heading": "Real-time Practice",
  "realtime.expected": "Target: {text}",
  "realtime.typed": "Input:  {text}",
  "realtime.controls": "Enter to submit. Backspace edits. Ctrl+C cancels.",
  "session.segmentHeading": "Segment {current}/{total}",
  "session.finalHeading": "Session Result",
  "session.promptCount": "Prompts: {count}",
  "result.heading": "Result",
  "result.expected": "Expected: {text}",
  "result.typed": "Typed:    {text}",
  "result.accuracy": "Accuracy: {accuracy}%",
  "result.wpm": "WPM: {wpm}",
  "result.elapsed": "Time: {seconds}s",
  "result.mistakes": "Mistakes: {mistakes}",
  "result.xpGained": "XP gained: {xp}",
  "result.devClear": "DEV MODE CLEAR - the bards refuse to sing about debug magic.",
  "reward.heading": "Rewards",
  "reward.skillXp": "{skill}: +{xp} XP (Lv.{level})",
  "reward.levelUp": "Level up: {skill} Lv.{level}",
  "streak.heading": "Streak",
  "streak.current": "{days} days in a row.",
  "streak.milestoneThree": "Three days steady. The habit is taking root.",
  "streak.milestoneSeven": "Seven days unbroken. The road now remembers your steps.",
  "streak.milestoneThirty": "Thirty days complete. A full moon of practice is yours.",
  "achievement.heading": "Achievements",
  "achievement.unlocked": "Unlocked: {title}",
  "achievement.firstSession": "First Steps",
  "achievement.perfectSession": "Flawless Focus",
  "achievement.threeDaysPact": "Three Days Pact",
  "achievement.unbrokenSeven": "Unbroken 7",
  "achievement.moonCycle": "Moon Cycle",
  "achievement.longWatch": "Long Watch",
  "achievement.deepDive": "Deep Dive",
  "achievement.dungeonMarathon": "Dungeon Marathon",
  "titleReward.heading": "Titles",
  "titleReward.unlocked": "Earned title: {title}",
  "titleReward.noviceHallGraduate": "Novice Hall Graduate",
  "titleReward.meadowRoadPathfinder": "Meadow Road Pathfinder",
  "titleReward.riverGateFerryman": "River Gate Ferryman",
  "journey.heading": "Journey",
  "journey.nextDay": "Next lesson: Day {day} is ready for next time.",
  "journey.noviceHallClear": "Gatekeeper Trial cleared. The Novice Hall opens the road ahead.",
  "journey.meadowRoadClear": "Waystone Trial cleared. The Meadow Road opens into wider lands.",
  "journey.riverGateClear": "Ferryman Trial cleared. The River Gate yields to your steady hands.",
} as const;

const CATALOGS: Readonly<Record<LocaleId, Readonly<Partial<Record<MessageKey, string>>>>> = {
  en: EN_MESSAGES,
  ja: {
    ...EN_MESSAGES,
    "app.subtitle": "落ち着いた指づかいのためのターミナルタイピング冒険。",
    "dev.banner": "DEV MODE - デバッグ魔法の功績は吟遊詩人が歌ってくれません。",
    "title.menu.heading": "タイトル",
    "title.menu.continue": "つづきから",
    "title.menu.newGame": "ニューゲーム",
    "title.menu.loadGame": "ロードゲーム",
    "title.menu.options": "オプション",
    "title.menu.review": "弱点キー復習",
    "title.menu.start": "スタート",
    "title.menu.prompt": "選択: ",
    "title.menu.planned": "予定",
    "title.menu.loadUnavailable":
      "ロードゲームは今後セーブスロットに対応します。今は「つづきから」を使ってください。",
    "review.lessonTitle": "弱点キー復習",
    "review.noMistakes":
      "弱点キー復習はまだありません。まずミスのあるセッションを完了してください。",
    "terminal.sizeWarning":
      "WARNING: 端末サイズは {columns}x{rows} です。推奨最小サイズは 80x24 です。",
    "options.heading": "オプション",
    "options.language": "言語",
    "options.back": "戻る",
    "options.prompt": "言語を選択: ",
    "options.saved": "言語を {language} に設定しました。",
    "story.heading": "ストーリー",
    "story.noviceIntro": "老教官はホームポジションを指さした。",
    "story.noviceQuote": "「剣の前に、まず構えを覚えよ。」",
    "status.heading": "ステータス",
    "status.hero": "勇者: {hero}",
    "status.xp": "XP: {xp}",
    "status.streak": "継続: {days}日",
    "status.training": "訓練: {skills}",
    "practice.heading": "練習",
    "practice.lesson": "レッスン: {lesson}",
    "practice.homeHint": "指をホームポジションに置いたままにしましょう。",
    "practice.keys": "キー: {keys}",
    "practice.fingers": "指: {fingers}",
    "practice.type": "入力: {text}",
    "realtime.heading": "リアルタイム練習",
    "realtime.expected": "お題: {text}",
    "realtime.typed": "入力: {text}",
    "realtime.controls": "Enterで決定、Backspaceで修正、Ctrl+Cで中断します。",
    "session.segmentHeading": "区間 {current}/{total}",
    "session.finalHeading": "セッション結果",
    "session.promptCount": "問題数: {count}",
    "result.heading": "結果",
    "result.expected": "お題: {text}",
    "result.typed": "入力: {text}",
    "result.accuracy": "正確性: {accuracy}%",
    "result.wpm": "WPM: {wpm}",
    "result.elapsed": "時間: {seconds}秒",
    "result.mistakes": "ミス: {mistakes}",
    "result.xpGained": "獲得XP: {xp}",
    "result.devClear": "DEV MODE CLEAR - デバッグ魔法なので少しだけ残念なクリアです。",
    "reward.heading": "報酬",
    "reward.skillXp": "{skill}: +{xp} XP (Lv.{level})",
    "reward.levelUp": "レベルアップ: {skill} Lv.{level}",
    "streak.heading": "継続",
    "streak.current": "{days}日連続です。",
    "streak.milestoneThree": "三日続きました。習慣が根を張りはじめています。",
    "streak.milestoneSeven": "七日途切れませんでした。道があなたの歩みを覚えています。",
    "streak.milestoneThirty": "三十日達成。ひと月分の鍛錬があなたのものです。",
    "achievement.heading": "実績",
    "achievement.unlocked": "解除: {title}",
    "achievement.firstSession": "最初の一歩",
    "achievement.perfectSession": "無傷の集中",
    "achievement.threeDaysPact": "三日の誓い",
    "achievement.unbrokenSeven": "途切れぬ7日",
    "achievement.moonCycle": "月の巡り",
    "achievement.longWatch": "長き見張り",
    "achievement.deepDive": "深き潜行",
    "achievement.dungeonMarathon": "迷宮マラソン",
    "titleReward.heading": "称号",
    "titleReward.unlocked": "獲得称号: {title}",
    "titleReward.noviceHallGraduate": "Novice Hall 卒業生",
    "titleReward.meadowRoadPathfinder": "Meadow Road の開拓者",
    "titleReward.riverGateFerryman": "River Gate の渡し守",
    "journey.heading": "旅路",
    "journey.nextDay": "次回は Day {day} のレッスンに進めます。",
    "journey.noviceHallClear": "Gatekeeper Trial クリア。Novice Hall の先の道が開きました。",
    "journey.meadowRoadClear":
      "Waystone Trial クリア。Meadow Road はさらに広い土地へ続いています。",
    "journey.riverGateClear":
      "Ferryman Trial クリア。River Gate はあなたの落ち着いた指に道を譲りました。",
  },
  "zh-CN": {
    ...EN_MESSAGES,
    "title.menu.heading": "标题",
    "title.menu.options": "选项",
    "title.menu.start": "开始",
    "options.heading": "选项",
    "options.language": "语言",
    "options.back": "返回",
    "story.heading": "故事",
    "status.heading": "状态",
    "practice.heading": "练习",
    "result.heading": "结果",
  },
  ko: {
    ...EN_MESSAGES,
    "title.menu.heading": "타이틀",
    "title.menu.options": "옵션",
    "title.menu.start": "시작",
    "options.heading": "옵션",
    "options.language": "언어",
    "options.back": "뒤로",
    "story.heading": "스토리",
    "status.heading": "상태",
    "practice.heading": "연습",
    "result.heading": "결과",
  },
  es: {
    ...EN_MESSAGES,
    "title.menu.heading": "Título",
    "title.menu.options": "Opciones",
    "title.menu.start": "Empezar",
    "options.heading": "Opciones",
    "options.language": "Idioma",
    "options.back": "Volver",
    "story.heading": "Historia",
    "status.heading": "Estado",
    "practice.heading": "Práctica",
    "result.heading": "Resultado",
  },
  "pt-BR": {
    ...EN_MESSAGES,
    "title.menu.heading": "Título",
    "title.menu.options": "Opções",
    "title.menu.start": "Começar",
    "options.heading": "Opções",
    "options.language": "Idioma",
    "options.back": "Voltar",
    "story.heading": "História",
    "status.heading": "Status",
    "practice.heading": "Prática",
    "result.heading": "Resultado",
  },
};

export function createTranslator(locale: string): Translator {
  const resolvedLocale = resolveLocale(locale);
  const catalog = CATALOGS[resolvedLocale];

  return {
    locale: resolvedLocale,
    t(key: MessageKey, params: Readonly<Record<string, string | number>> = {}): string {
      return interpolate(catalog[key] ?? EN_MESSAGES[key], params);
    },
  };
}

export function resolveLocale(locale: string): LocaleId {
  return SUPPORTED_LOCALES.includes(locale as LocaleId) ? (locale as LocaleId) : "en";
}

export function localeDisplayName(locale: LocaleId): string {
  const names: Readonly<Record<LocaleId, string>> = {
    en: "English",
    ja: "日本語",
    "zh-CN": "简体中文",
    ko: "한국어",
    es: "Español",
    "pt-BR": "Português (Brasil)",
  };

  return names[locale];
}

export function assertCompleteCatalogs(): void {
  const keys = Object.keys(EN_MESSAGES) as MessageKey[];

  for (const locale of SUPPORTED_LOCALES) {
    for (const key of keys) {
      if (CATALOGS[locale][key] === undefined) {
        throw new Error(`Missing message key ${key} for locale ${locale}`);
      }
    }
  }
}

function interpolate(message: string, params: Readonly<Record<string, string | number>>): string {
  return message.replaceAll(/\{([a-zA-Z0-9]+)\}/g, (_, key: string) => {
    const value = params[key];
    return value === undefined ? `{${key}}` : String(value);
  });
}
