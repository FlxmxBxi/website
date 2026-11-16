import { GRADES } from "./grades.js";
import { buildPlan } from "./plan.js";
import { TRAPS } from "./survey.js";
import {
  findClocks,
  formatClock,
  formatDuration,
  hoursBetween,
  isSchoolWake,
  looseMorningHour,
} from "./time.js";

export function emptyProfile() {
  return {
    grade: null,
    trap: null,
    wakeMinutes: null,
    bedMinutes: null,
    homeworkHabit: null,
    screenBlock: null,
    worryLevel: null,
    shorten: false,
  };
}

export function sanitizeProfile(input) {
  const profile = emptyProfile();
  if (!input || typeof input !== "object") return profile;
  if (GRADES[input.grade]) profile.grade = input.grade;
  if (TRAPS.some((item) => item.id === input.trap)) profile.trap = input.trap;
  for (const key of ["wakeMinutes", "bedMinutes"]) {
    if (input[key] == null || input[key] === "") continue;
    const value = Number(input[key]);
    if (Number.isInteger(value) && value >= 0 && value < 1440) profile[key] = value;
  }
  if (["usually", "sometimes", "rarely"].includes(input.homeworkHabit)) {
    profile.homeworkHabit = input.homeworkHabit;
  }
  if (["under-1", "1-2", "over-2"].includes(input.screenBlock)) {
    profile.screenBlock = input.screenBlock;
  }
  if (["quiet", "there", "loud"].includes(input.worryLevel)) {
    profile.worryLevel = input.worryLevel;
  }
  profile.shorten = Boolean(input.shorten);
  return profile;
}

export function profileReady(profile) {
  return Boolean(profile?.grade && profile.trap && profile.wakeMinutes != null);
}

export function detectGrade(text) {
  const raw = String(text);
  const named = [
    [6, /\b(?:grade\s*)?6th\b|\bsixth\b|\bgrade\s*6\b/i],
    [7, /\b(?:grade\s*)?7th\b|\bseventh\b|\bgrade\s*7\b/i],
    [8, /\b(?:grade\s*)?8th\b|\beighth\b|\bgrade\s*8\b/i],
    [9, /\b(?:grade\s*)?9th\b|\bninth\b|\bgrade\s*9\b/i],
  ];
  for (const [grade, pattern] of named) {
    if (pattern.test(raw)) return grade;
  }
  const stripped = raw
    .replace(/\b\d{1,2}:\d{2}\b/g, " ")
    .replace(/\b\d{1,2}\s*(?:a\.?m\.?|p\.?m\.?)\b/gi, " ");
  const bare = stripped
    .trim()
    .match(/^(?:i(?:'m| am)|im)?\s*(?:in\s+)?(?:grade\s*)?([6-9])\s*\.?$/i);
  return bare ? Number(bare[1]) : null;
}

export function detectTrap(text) {
  const value = String(text).toLowerCase();
  if (/\bmix\b|a bit of both|all of|everything/.test(value)) return "mix";
  const games = /\bgames?\b|gaming|roblox|minecraft|console|playing/.test(value);
  const screens = /\bscreens?\b|\bphone\b|tiktok|youtube|scroll|video|social|netflix|\btv\b/.test(
    value,
  );
  const homework = /\bhomework\b|schoolwork|assignment/.test(value);
  const worry = /\bworr|\banxious|\banxiety\b|\btests?\b/.test(value);
  const hits = [games, screens, homework, worry].filter(Boolean).length;
  if (hits > 1) return "mix";
  if (games) return "games";
  if (screens) return "screens";
  if (homework) return "homework";
  if (worry) return "worry";
  return null;
}

function mentions(text, pattern) {
  return pattern.test(text);
}

function firstClock(text, context) {
  const clocks = findClocks(text, context);
  if (clocks.length) return clocks[0];
  if (context === "morning") return looseMorningHour(text);
  return null;
}

const READY_SUGGESTIONS = [
  "I can't stop playing",
  "Homework never ends",
  "I studied but I'm still anxious",
  "What about weekends?",
  "Make it shorter",
];

const TRAP_SUGGESTIONS = TRAPS.map((item) => item.label);

function missingField(profile) {
  if (!profile.grade) return "grade";
  if (!profile.trap) return "trap";
  if (profile.wakeMinutes == null) return "wake";
  return null;
}

function questionFor(field, profile) {
  if (field === "grade") {
    return {
      text: "I'm Bell. I help with the hours after school and before sleep. What grade are you in?",
      suggestions: ["Grade 6", "Grade 7", "Grade 8", "Grade 9"],
    };
  }
  if (field === "trap") {
    return {
      text: `Grade ${profile.grade}. What usually takes your evening: games, other screens, homework, worry about school, or a mix?`,
      suggestions: TRAP_SUGGESTIONS,
    };
  }
  return {
    text: "What time do you have to get up on a school day?",
    suggestions: ["6:00 a.m.", "6:30 a.m.", "7:00 a.m.", "7:30 a.m."],
  };
}

function planIntro(profile, plan) {
  const info = GRADES[profile.grade];
  const screenSentence =
    plan.screenWindow > 0
      ? `Screens, if the homework is closed, run ${formatClock(plan.screenStart)} to ${formatClock(plan.screenEnd)}.`
      : "Screens stay off on this school night, because the evening is already going to homework or worry.";
  return [
    info.body,
    `Here is a school night that aims for ${plan.aimNote}, with an alarm at ${formatClock(plan.wakeMinutes)} and lights out at ${formatClock(plan.bedtime)}.`,
    `Homework is ${formatClock(plan.homeworkStart)} to ${formatClock(plan.homeworkEnd)}. ${screenSentence} Wind-down starts at ${formatClock(plan.screenEnd)}.`,
    "Tell me what is getting in the way, or ask for a shorter version.",
  ].join(" ");
}

export function sessionFromStore(store, requestedGrade) {
  const profile =
    !store.profile.grade && GRADES[requestedGrade]
      ? { ...store.profile, grade: requestedGrade }
      : store.profile;
  if (store.messages?.length) {
    return {
      profile,
      plan: profileReady(profile) ? buildPlan(profile) : null,
      messages: store.messages,
      suggestions: store.suggestions || [],
      seq: store.messages.length + 2,
    };
  }
  return createSession(profile);
}

export function createSession(profileInput) {
  const profile = sanitizeProfile(profileInput);
  const field = missingField(profile);
  if (!field) {
    const plan = buildPlan(profile);
    return {
      profile,
      plan,
      seq: 2,
      messages: [{ id: "m1", role: "coach", text: planIntro(profile, plan), showPlan: true }],
      suggestions: READY_SUGGESTIONS,
    };
  }
  const question = questionFor(field, profile);
  return {
    profile,
    plan: null,
    seq: 2,
    messages: [{ id: "m1", role: "coach", text: question.text }],
    suggestions: question.suggestions,
  };
}

function followupIntent(text) {
  const value = text.toLowerCase();
  if (/\bshorter\b|\btoo long\b|\btoo much\b|smaller plan|make it short/.test(value)) return "shorter";
  if (/\bweekend\b|\bsaturday\b|\bsunday\b/.test(value)) return "weekend";
  const worry = /\banxious|\banxiety|\bworr|\bstudied\b|\btests?\b/.test(value);
  const homework = /\bhomework\b|schoolwork|never ends|takes forever|can't finish|cant finish/.test(value);
  const games = /\bgames?\b|\bplaying\b|roblox|minecraft|console|can't stop|cant stop/.test(value);
  const screens = /\bscreens?\b|\bphone\b|\bscroll|\btiktok\b|\byoutube\b/.test(value);
  const hits = [worry, homework, games, screens].filter(Boolean);
  if (hits.length > 1) return "pick";
  if (worry) return "worry";
  if (homework) return "homework";
  if (games) return "games";
  if (screens) return "screens";
  return null;
}

function adviceFor(intent, profile, plan) {
  const info = GRADES[profile.grade];
  if (intent === "weekend") {
    return `On Saturday and Sunday, wake by ${formatClock(plan.wakeMinutes + 90)}, within 90 minutes of your school alarm. Do one 40-minute school block before noon, and put screens after it. Sunday lights out stays ${formatClock(plan.bedtime)}. A late weekend morning makes the next school night harder to land.`;
  }
  if (intent === "worry") {
    const older =
      profile.grade === 9
        ? "Among 15-year-olds, 66% worry about poor grades and 55% feel anxious about tests even when they have studied. Worry after you have studied does not mean you skipped the work."
        : "Worry can take an evening even in a grade where screens are the more common leak.";
    return `${older} Take ten minutes with the worry slip: what you are afraid will happen, what you already did, and the one first step for tomorrow. Then close it. The homework block still ends at ${formatClock(plan.homeworkEnd)}.`;
  }
  if (intent === "homework") {
    return `The homework block ends at ${formatClock(plan.homeworkEnd)} on purpose. When the timer rings, write the next first step and stop, even if a worksheet is open. An open-ended night is how older students lose sleep to homework, and it crowds out sleep in younger grades too. The full block for grade ${info.grade} is ${info.homeworkMinutes} minutes${plan.shortened ? ", and this plan is using the shorter one" : ""}.`;
  }
  if (intent === "games" || intent === "screens") {
    const noun = intent === "games" ? "The game" : "The screen";
    if (plan.screenWindow === 0) {
      return `${noun} is off this school-night plan because the evening is already claimed by homework or worry. Say "switch to games" if you want a short window back. Until then, the charger stays outside the room at ${formatClock(plan.screenEnd)}.`;
    }
    const gradeNote =
      profile.grade <= 7
        ? "In grades 6 and 7, this is the usual leak: games and other screens take the time schoolwork needed, and bedtime slips from about 9:24 p.m. toward 9:52 p.m."
        : profile.grade === 8
          ? "Grade 8 still has a group of students who give the evening to screens, even while others start finishing the work."
          : "By grade 9 the usual bedtime is already about 10:15 p.m. A match after the screen stop is how the night gets later than the plan.";
    return `${noun} fits only from ${formatClock(plan.screenStart)} to ${formatClock(plan.screenEnd)}, and only after homework is closed. Set a timer. When it ends, the charger goes outside your room. ${gradeNote}`;
  }
  return "Pick one thing for tonight: the game, the homework block, the worry, or the weekend. I will stay on that.";
}

function bedComparison(profile) {
  const info = GRADES[profile.grade];
  const slept = hoursBetween(profile.bedMinutes, profile.wakeMinutes);
  const gap = info.aimHours - slept;
  const measured = `From ${formatClock(profile.bedMinutes)} to ${formatClock(profile.wakeMinutes)} is ${formatDuration(slept)}.`;
  if (gap > 10 / 60) {
    return `${measured} That is about ${formatDuration(gap)} under the ${info.aimHours}-hour aim. The plan's lights out, ${formatClock(buildPlan(profile).bedtime)}, is the time that gets you there without an earlier alarm.`;
  }
  return `${measured} That meets the ${info.aimHours}-hour aim. Keep the end times anyway, so a busy night does not slide past them.`;
}

function applyIntake(profile, text) {
  const field = missingField(profile);
  const grade = detectGrade(text);
  const trap = detectTrap(text);
  const wake = firstClock(text, "morning");
  const wakeWords = mentions(text, /\b(wake|wakes|get up|got up|alarm|up at)\b/i);

  if (field === "grade" && !grade) {
    return {
      profile,
      reply: "Type a grade from 6 to 9, or tap one of the buttons.",
      suggestions: ["Grade 6", "Grade 7", "Grade 8", "Grade 9"],
    };
  }
  if (grade) profile.grade = grade;
  if (trap) profile.trap = trap;
  if (field === "trap" && !profile.trap) {
    return {
      profile,
      reply: "Which one takes most of the evening: games, other screens, homework, worry about school, or a mix?",
      suggestions: TRAP_SUGGESTIONS,
    };
  }
  if (wake != null && (field === "wake" || wakeWords)) {
    if (!isSchoolWake(wake)) {
      return {
        profile,
        reply: `${formatClock(wake)} is outside a school morning. What time do you have to be up for school?`,
        suggestions: ["6:00 a.m.", "6:30 a.m.", "7:00 a.m.", "7:30 a.m."],
      };
    }
    profile.wakeMinutes = wake;
  }
  if (field === "wake" && profile.wakeMinutes == null) {
    return {
      profile,
      reply: "Tell me the school wake-up time, like 6:30 a.m.",
      suggestions: ["6:00 a.m.", "6:30 a.m.", "7:00 a.m.", "7:30 a.m."],
    };
  }

  const next = missingField(profile);
  if (next) {
    const question = questionFor(next, profile);
    return { profile, reply: question.text, suggestions: question.suggestions };
  }
  const plan = buildPlan(profile);
  return {
    profile,
    plan,
    reply: planIntro(profile, plan),
    suggestions: READY_SUGGESTIONS,
    showPlan: true,
  };
}

function applyCoaching(profile, text) {
  const intent = followupIntent(text);
  const gradeMention = mentions(text, /\bgrade\b|\b(?:6|7|8|9)th\b|\b(?:sixth|seventh|eighth|ninth)\b/i);
  const grade = gradeMention ? detectGrade(text) : null;
  const wakeMention = mentions(text, /\b(wake|wakes|get up|got up|alarm)\b/i);
  const bedMention = mentions(text, /\b(fall asleep|fell asleep|asleep|bedtime|lights out|in bed)\b/i);

  if (grade) {
    profile.grade = grade;
    profile.shorten = false;
  }
  if (wakeMention) {
    const wake = firstClock(text, "morning");
    if (wake == null || !isSchoolWake(wake)) {
      return {
        profile,
        plan: buildPlan(profile),
        reply: "Use the time you have to be up for school, like 6:30 a.m.",
        suggestions: ["6:00 a.m.", "6:30 a.m.", "7:00 a.m.", "7:30 a.m."],
      };
    }
    profile.wakeMinutes = wake;
    profile.shorten = false;
  }
  if (intent === "shorter") profile.shorten = true;

  const explicitTrap = detectTrap(text);
  const switchingTrap =
    explicitTrap &&
    mentions(text, /\b(actually|instead|switch|it's|its|change)\b/i) &&
    intent !== "pick";
  if (switchingTrap) {
    profile.trap = explicitTrap;
    profile.shorten = false;
  }

  const plan = buildPlan(profile);
  const pieces = [];
  const changed = grade || wakeMention || intent === "shorter" || switchingTrap;
  if (changed) {
    pieces.push(
      `Updated. Grade ${profile.grade}, lights out ${formatClock(plan.bedtime)}, alarm ${formatClock(plan.wakeMinutes)}. Homework runs ${formatClock(plan.homeworkStart)} to ${formatClock(plan.homeworkEnd)}${plan.shortened ? ", on the shorter block" : ""}.`,
    );
  }
  if (intent && intent !== "shorter") pieces.push(adviceFor(intent, profile, plan));
  if (!intent && bedMention) {
    const bed = firstClock(text, "evening");
    if (bed == null) {
      pieces.push("What time do you usually fall asleep? You can say 10:30 p.m.");
    } else {
      profile.bedMinutes = bed;
      pieces.push(bedComparison(profile));
    }
  }
  if (!pieces.length) {
    pieces.push(
      "I can help with a game that will not stop, homework that never ends, worry after you have studied, weekends, or a shorter plan. Which one is in the way tonight?",
    );
  }
  return {
    profile,
    plan,
    reply: pieces.join(" "),
    suggestions: READY_SUGGESTIONS,
    showPlan: Boolean(changed),
  };
}

export function replyTo(session, raw) {
  const text = String(raw || "").trim().slice(0, 500);
  if (!text) return { ...session, ignored: true };
  const profile = sanitizeProfile(session.profile);
  const result = profileReady(profile) ? applyCoaching(profile, text) : applyIntake(profile, text);
  const seq = (session.seq || 1) + 2;
  const student = { id: `m${seq - 1}`, role: "student", text };
  const coach = {
    id: `m${seq}`,
    role: "coach",
    text: result.reply,
    showPlan: Boolean(result.showPlan),
  };
  return {
    profile: result.profile,
    plan: result.plan || (profileReady(result.profile) ? buildPlan(result.profile) : null),
    seq,
    messages: [...session.messages, student, coach].slice(-40),
    suggestions: result.suggestions,
  };
}
