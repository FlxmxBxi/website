import { GRADES } from "./grades.js";
import { eveningOrder, hoursBetween, normalizeMinutes } from "./time.js";

export function buildPlan(profile) {
  const info = GRADES[profile.grade];
  if (!info || profile.wakeMinutes == null) return null;

  let homeworkMinutes = info.homeworkMinutes;
  let screenWindow = profile.trap === "homework" || profile.trap === "worry" ? 0 : 25;
  if (profile.shorten) {
    homeworkMinutes = Math.max(25, homeworkMinutes - 20);
    if (screenWindow > 0) screenWindow = 15;
  }

  const wakeMinutes = normalizeMinutes(profile.wakeMinutes);
  const bedtime = normalizeMinutes(wakeMinutes - info.aimHours * 60);
  const screenEnd = normalizeMinutes(bedtime - 30);
  const screenStart = normalizeMinutes(screenEnd - screenWindow);
  const homeworkEnd = screenStart;
  const homeworkStart = normalizeMinutes(homeworkEnd - homeworkMinutes);
  const worrySlip =
    profile.grade >= 8 ||
    profile.trap === "worry" ||
    profile.trap === "mix" ||
    profile.worryLevel === "loud";

  return {
    grade: profile.grade,
    trap: profile.trap,
    aimHours: info.aimHours,
    aimNote: info.aimNote,
    wakeMinutes,
    bedtime,
    screenEnd,
    screenStart,
    screenWindow,
    homeworkStart,
    homeworkEnd,
    homeworkMinutes,
    worrySlip,
    shortened: Boolean(profile.shorten),
    earlyHomework: eveningOrder(homeworkStart) < eveningOrder(15 * 60),
  };
}

export function planIsOrdered(plan) {
  if (!plan) return false;
  const marks = [
    plan.homeworkStart,
    plan.homeworkEnd,
    plan.screenStart,
    plan.screenEnd,
    plan.bedtime,
    plan.wakeMinutes,
  ].map(eveningOrder);
  for (let i = 1; i < marks.length; i += 1) {
    if (marks[i] < marks[i - 1]) return false;
  }
  return hoursBetween(plan.bedtime, plan.wakeMinutes) === plan.aimHours;
}
