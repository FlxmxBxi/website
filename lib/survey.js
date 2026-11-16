import { CROSS_GRADE, GRADES } from "./grades.js";
import { buildPlan } from "./plan.js";
import { formatClock, formatDuration, hoursBetween } from "./time.js";

export const TRAPS = [
  { id: "games", label: "Games" },
  { id: "screens", label: "Other screens" },
  { id: "homework", label: "Homework" },
  { id: "worry", label: "Worry about school" },
  { id: "mix", label: "A mix of these" },
];

export const HOMEWORK_HABITS = [
  { id: "usually", label: "Usually" },
  { id: "sometimes", label: "Sometimes" },
  { id: "rarely", label: "Rarely" },
];

export const SCREEN_BLOCKS = [
  { id: "under-1", label: "Under an hour" },
  { id: "1-2", label: "1 to 2 hours" },
  { id: "over-2", label: "More than 2 hours" },
];

export const WORRY_LEVELS = [
  { id: "quiet", label: "Quiet" },
  { id: "there", label: "There, but I can close it" },
  { id: "loud", label: "Loud" },
];

export const CHECKIN_QUESTIONS = [
  {
    id: "screens",
    prompt: "Did screens stop at the time on your plan?",
  },
  {
    id: "homework",
    prompt: "Did schoolwork stay inside its block?",
  },
  {
    id: "lights",
    prompt: "Were lights out within 15 minutes of the plan?",
  },
];

export const CHECKIN_OPTIONS = ["Yes", "Almost", "No"];

export function trapLabel(id) {
  return TRAPS.find((item) => item.id === id)?.label || "your evening";
}

export function matchNotes(profile) {
  const notes = [];
  const { grade, trap, screenBlock, worryLevel, homeworkHabit } = profile;

  if ((grade === 6 || grade === 7) && (trap === "games" || trap === "screens" || trap === "mix")) {
    notes.push(
      "That lines up with grades 6 and 7, where a lot of the evening goes to games and other screens instead of schoolwork.",
    );
  } else if (grade === 8 && (trap === "games" || trap === "screens")) {
    notes.push(
      "Grade 8 is a split year. Your answers sit with the students who still give the evening to screens.",
    );
  } else if (grade === 8 && (trap === "homework" || trap === "worry")) {
    notes.push(
      "Grade 8 is a split year. Your answers sit with the students who have started finishing the work, which is also when school can fill the night.",
    );
  } else if (grade === 9 && (trap === "homework" || trap === "worry" || trap === "mix")) {
    notes.push(
      "That lines up with grade 9, when school is harder to ignore and the evening goes to homework and worry.",
    );
  } else if ((grade === 6 || grade === 7) && (trap === "homework" || trap === "worry")) {
    notes.push(
      "Screens are the more common leak in your grade. Homework or worry can still take the night, so the plan caps that first.",
    );
  } else if (grade === 9 && (trap === "games" || trap === "screens")) {
    notes.push(
      "By grade 9, more students lose the evening to homework and worry. Screens can still do it, so the plan puts a hard stop on them.",
    );
  }

  if (screenBlock === "over-2" && (grade === 6 || grade === 7)) {
    notes.push(
      "More than two hours after dinner is a long screen stretch on a night that already tends to miss 9 hours of sleep.",
    );
  }

  if (worryLevel === "loud" && grade === 9) {
    notes.push(
      "Among 15-year-olds, 66% worry about poor grades and 55% feel anxious about tests even when they have studied. A loud worry fits that picture. The plan gives it ten minutes, then stops.",
    );
  } else if (worryLevel === "loud") {
    notes.push(
      "A loud worry gets ten minutes on paper, then the paper closes. Leaving it open is how a short worry becomes a late night.",
    );
  }

  if (homeworkHabit === "rarely") {
    notes.push(
      "Schoolwork rarely finishing before screens is the habit the homework block is meant to flip. The block happens first, and it has an end.",
    );
  }

  return notes;
}

export function describeSurvey(profile) {
  const info = GRADES[profile.grade];
  if (!info) return [];
  const paragraphs = [info.body];

  if (profile.wakeMinutes != null && profile.bedMinutes != null) {
    const slept = hoursBetween(profile.bedMinutes, profile.wakeMinutes);
    const gap = info.aimHours - slept;
    paragraphs.push(
      `From ${formatClock(profile.bedMinutes)} to ${formatClock(profile.wakeMinutes)} is ${formatDuration(slept)}. The school-night aim for grade ${profile.grade} on this site is ${info.aimNote}.`,
    );
    if (gap > 10 / 60) {
      paragraphs.push(
        `That is about ${formatDuration(gap)} shorter than the aim. The plan moves lights out earlier instead of asking you to wake up earlier.`,
      );
    } else if (gap < -10 / 60) {
      paragraphs.push(
        "That already meets the aim. The plan still gives the evening an end time, so it does not slide later on a busy night.",
      );
    } else {
      paragraphs.push("That is about on the aim. The plan keeps the same length and puts a fence around the evening.");
    }
  }

  paragraphs.push(...matchNotes(profile));
  paragraphs.push(CROSS_GRADE);
  return paragraphs;
}

export function surveyPlan(profile) {
  return buildPlan(profile);
}

export function describeCheckin(checkin) {
  if (!checkin) return "";
  const values = CHECKIN_QUESTIONS.map((question) => checkin[question.id]);
  if (values.some((value) => !value)) return "";
  const yes = values.filter((value) => value === "Yes").length;
  const no = values.filter((value) => value === "No").length;
  if (yes === 3) return "All three held. Keep the same times tomorrow night.";
  if (no >= 2) {
    return "Two or more slipped. Tomorrow, fix only the first one that broke: screens, then the homework block, then lights out.";
  }
  if (checkin.screens === "No") {
    return "Screens ran past the stop. Tomorrow the charger goes outside the room when that time hits.";
  }
  if (checkin.homework === "No") {
    return "Homework ran past the block. Tomorrow, when the timer ends, write the next first step and stop anyway.";
  }
  if (checkin.lights === "No") {
    return "Lights out slipped. Tomorrow, start the wind-down when the plan says, even if the day feels unfinished.";
  }
  return "Close. Keep the times, and treat Almost as a stop you still make.";
}
