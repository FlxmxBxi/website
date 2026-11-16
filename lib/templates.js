import { GRADES } from "./grades.js";
import { formatClock } from "./time.js";

function clock(minutes, fallback) {
  return minutes == null ? fallback : formatClock(minutes);
}

export function buildTemplates(plan) {
  const info = plan ? GRADES[plan.grade] : null;
  const homeworkLength = plan ? plan.homeworkMinutes : 45;
  const homeworkWhen = plan
    ? ` (${formatClock(plan.homeworkStart)} to ${formatClock(plan.homeworkEnd)})`
    : "";
  const screenStop = plan ? formatClock(plan.screenEnd) : "____";
  const lights = plan ? formatClock(plan.bedtime) : "____";
  const alarm = plan ? formatClock(plan.wakeMinutes) : "____";
  const weekendWake = plan ? formatClock(plan.wakeMinutes + 90) : "____";

  let screenLine;
  if (!plan) {
    screenLine = "____–____  Screens, only if homework is already closed.";
  } else if (plan.screenWindow > 0) {
    screenLine = `${formatClock(plan.screenStart)}–${formatClock(plan.screenEnd)}  Screens, only if homework is already closed.`;
  } else {
    screenLine = "Screens stay off on this school night. The evening is homework, then wind-down.";
  }

  const worryLine = !plan
    ? "If worry is loud, give it 10 minutes on paper, then close the paper."
    : plan.worrySlip
      ? "Worry slip, 10 minutes, then close it."
      : "If worry shows up anyway, give it 10 minutes on paper, then close the paper.";

  const tonight = [
    plan ? `Grade ${plan.grade} school night` : "Grade ____ school night",
    plan ? `Aim: ${plan.aimNote}.` : "Aim: ____ hours.",
    plan
      ? `${formatClock(plan.homeworkStart)}–${formatClock(plan.homeworkEnd)}  Homework. Stop when the time is up. Write the next first step.`
      : "____–____  Homework. Stop when the time is up. Write the next first step.",
    screenLine,
    plan
      ? `${formatClock(plan.screenEnd)}–${formatClock(plan.bedtime)}  Wind-down. Lights lower, no new game.`
      : "____–____  Wind-down. Lights lower, no new game.",
    `${lights}  Lights out.`,
    `${alarm}  Alarm.`,
    worryLine,
  ].join("\n");

  const homework = [
    "Homework block",
    "1. Put the phone in another room.",
    "2. Write the one assignment you will touch first.",
    `3. Set a timer for ${homeworkLength} minutes${homeworkWhen}.`,
    "4. Work until it rings.",
    "5. When it rings, write the next first step on paper.",
    "6. Stop, even if the work is not finished.",
  ].join("\n");

  const screens = [
    "Screen gate",
    "Screens start only after the homework block is closed.",
    `They end at ${screenStop}, which is 30 minutes before lights out.`,
    "The charger stays outside the bedroom.",
    "If you want one more game, the answer is the end time on this card.",
    plan && plan.grade <= 7
      ? "In grades 6 and 7, this is the leak: games and other screens take the evening that schoolwork needed."
      : "A screen that runs past this time is how bedtime slips.",
  ].join("\n");

  const worry = [
    "Worry slip — 10 minutes",
    plan && plan.grade === 9
      ? "Among 15-year-olds, 66% worry about poor grades and 55% feel anxious about tests even when they have studied. Feeling this after you studied does not mean you skipped the work."
      : "Write it down so it does not have to stay open in your head all night.",
    "1. What I am afraid will happen:",
    "2. What I already did:",
    "3. The first step tomorrow:",
    "Close the paper. Do not reopen it tonight.",
  ].join("\n");

  const weekend = [
    "Weekend hold",
    `Wake by ${weekendWake}, within 90 minutes of your school alarm${plan ? ` (${alarm})` : ""}.`,
    "Do one 40-minute school block before noon.",
    "Screens come after that block, not before.",
    `Sunday wind-down uses the same lights-out as a school night: ${lights}.`,
  ].join("\n");

  return [
    {
      id: "tonight",
      title: "Tonight's card",
      blurb: info
        ? `A school night for grade ${info.grade}, with your times filled in.`
        : "A school night on one card. Take the survey and the blanks fill in.",
      text: tonight,
    },
    {
      id: "homework",
      title: "Homework block",
      blurb: "A timed block with an ending, so homework does not take the whole night.",
      text: homework,
    },
    {
      id: "screens",
      title: "Screen gate",
      blurb: "Games and other screens wait until the work block is closed, then they stop.",
      text: screens,
    },
    {
      id: "worry",
      title: "Worry slip",
      blurb: "Ten minutes for the thought that keeps the light on, then it closes.",
      text: worry,
    },
    {
      id: "weekend",
      title: "Weekend hold",
      blurb: "Keep Saturday and Sunday from pushing Sunday night even later.",
      text: weekend,
    },
  ];
}

export function blankClock(minutes) {
  return clock(minutes, "____");
}
