import assert from "node:assert/strict";
import test from "node:test";
import { createSession, detectGrade, replyTo } from "./coach.js";
import { buildPlan, planIsOrdered } from "./plan.js";
import { describeCheckin, describeSurvey } from "./survey.js";
import { buildTemplates } from "./templates.js";
import { formatClock, hoursBetween, parseClock } from "./time.js";

test("parseClock reads school-morning and evening times", () => {
  assert.equal(parseClock("6:30 a.m."), 6 * 60 + 30);
  assert.equal(parseClock("9:52 p.m."), 21 * 60 + 52);
  assert.equal(parseClock("06:30"), 6 * 60 + 30);
  assert.equal(parseClock("nope"), null);
});

test("a grade 6 night aims for 9 hours and stays in order", () => {
  const plan = buildPlan({ grade: 6, trap: "games", wakeMinutes: 6 * 60 + 30 });
  assert.equal(plan.aimHours, 9);
  assert.equal(formatClock(plan.bedtime), "9:30 p.m.");
  assert.equal(formatClock(plan.wakeMinutes), "6:30 a.m.");
  assert.equal(plan.screenWindow, 25);
  assert.ok(plan.homeworkEnd <= plan.screenStart || plan.homeworkEnd === plan.screenStart);
  assert.ok(planIsOrdered(plan));
  assert.equal(hoursBetween(plan.bedtime, plan.wakeMinutes), 9);
});

test("worry on a grade 9 night keeps screens off the plan", () => {
  const plan = buildPlan({ grade: 9, trap: "worry", wakeMinutes: 6 * 60 });
  assert.equal(plan.aimHours, 8);
  assert.equal(plan.screenWindow, 0);
  assert.equal(formatClock(plan.bedtime), "10:00 p.m.");
  assert.equal(plan.worrySlip, true);
  assert.ok(planIsOrdered(plan));
});

test("a shorter plan trims the homework block and still reaches the aim", () => {
  const full = buildPlan({ grade: 8, trap: "homework", wakeMinutes: 6 * 60 + 15 });
  const short = buildPlan({
    grade: 8,
    trap: "homework",
    wakeMinutes: 6 * 60 + 15,
    shorten: true,
  });
  assert.ok(short.homeworkMinutes < full.homeworkMinutes);
  assert.equal(hoursBetween(short.bedtime, short.wakeMinutes), 8);
  assert.ok(planIsOrdered(short));
});

test("a missing wake-up time stays missing", () => {
  const session = createSession({ grade: 7, trap: "games", wakeMinutes: null });
  assert.equal(session.profile.wakeMinutes, null);
  assert.equal(session.plan, null);
  assert.match(session.messages[0].text, /get up/i);
});

test("a clock does not get read as a grade", () => {
  assert.equal(detectGrade("I wake up at 6:30"), null);
  assert.equal(detectGrade("6:30 a.m."), null);
  assert.equal(detectGrade("6"), 6);
  assert.equal(detectGrade("I'm in eighth"), 8);
});

test("the coach walks grade, trap, and wake time into a plan", () => {
  let session = createSession(null);
  assert.match(session.messages[0].text, /grade/i);
  session = replyTo(session, "Grade 7");
  assert.match(session.messages.at(-1).text, /evening/i);
  session = replyTo(session, "Games");
  session = replyTo(session, "6:30 a.m.");
  const last = session.messages.at(-1).text;
  assert.match(last, /9:52 p\.m\./);
  assert.match(last, /8\.1/);
  assert.equal(session.plan.grade, 7);
  assert.ok(session.messages.at(-1).showPlan);
});

test("one sentence can set grade, trap, and wake-up", () => {
  const session = replyTo(createSession(null), "I'm in 7th, games, up at 6:30");
  assert.equal(session.profile.grade, 7);
  assert.equal(session.profile.trap, "games");
  assert.equal(session.profile.wakeMinutes, 6 * 60 + 30);
  assert.ok(session.plan);
});

test("grade 9 worry follow-up uses the 15-year-old figures", () => {
  const session = replyTo(
    createSession({ grade: 9, trap: "worry", wakeMinutes: 6 * 60 + 15 }),
    "I studied but I'm still anxious",
  );
  const last = session.messages.at(-1).text;
  assert.match(last, /66%/);
  assert.match(last, /55%/);
});

test("grade 6 worry follow-up does not call the student a 15-year-old", () => {
  const session = replyTo(
    createSession({ grade: 6, trap: "games", wakeMinutes: 6 * 60 + 30 }),
    "I studied but I'm still anxious",
  );
  const last = session.messages.at(-1).text;
  assert.doesNotMatch(last, /66%/);
  assert.match(last, /ten minutes/i);
});

test("an off-topic message asks for a time-management topic", () => {
  const session = replyTo(
    createSession({ grade: 8, trap: "mix", wakeMinutes: 7 * 60 }),
    "What's your favorite movie?",
  );
  assert.match(session.messages.at(-1).text, /tonight/);
});

test("survey copy compares a real night with the grade 6 aim", () => {
  const paragraphs = describeSurvey({
    grade: 6,
    trap: "screens",
    wakeMinutes: 6 * 60 + 30,
    bedMinutes: 22 * 60 + 30,
    homeworkHabit: "rarely",
    screenBlock: "over-2",
    worryLevel: "quiet",
  });
  const text = paragraphs.join(" ");
  assert.match(text, /61\.3%/);
  assert.match(text, /9 to 12 hours/);
  assert.match(text, /shorter than the aim/);
  assert.match(text, /rarely/i);
});

test("check-in names the first habit that broke", () => {
  assert.match(
    describeCheckin({ screens: "No", homework: "Yes", lights: "Yes" }),
    /charger/,
  );
  assert.match(
    describeCheckin({ screens: "Yes", homework: "Yes", lights: "Yes" }),
    /same times/,
  );
});

test("templates fill lights-out from the plan and stay blank without one", () => {
  const plan = buildPlan({ grade: 9, trap: "homework", wakeMinutes: 6 * 60 });
  const templates = buildTemplates(plan);
  const filled = templates.find((item) => item.id === "tonight").text;
  assert.match(filled, /10:00 p\.m\./);
  assert.match(templates.find((item) => item.id === "worry").text, /66%/);
  const blank = buildTemplates(null).find((item) => item.id === "tonight").text;
  assert.match(blank, /____/);
});
