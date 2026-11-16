export const GRADE_IDS = [6, 7, 8, 9];

export const CROSS_GRADE =
  "Across these grades, younger students more often lose the evening to games and screens, while older students lose it to homework and worry, and both groups end up sleeping less than they should.";

export const GRADES = {
  6: {
    grade: 6,
    headline: "The middle-school year most likely to come up short on sleep.",
    body: "Students in grade 6 are the most likely in middle school to be short on sleep, with 61.3% under the 9 to 12 hours children their age need. A lot of their evening goes to games and other screens instead of schoolwork.",
    aside:
      "The grade 7 notes describe a slip from about 9:24 p.m. and 8.4 hours, so those two figures are the grade 6 side of that change.",
    shortSleep: "61.3%",
    shortSleepLabel: "Under the 9 to 12 hours they need",
    typicalSleep: "about 8.4 hours",
    bedtime: "about 9:24 p.m.",
    aimHours: 9,
    aimNote: "9 hours, the floor of the 9 to 12 hours this age needs",
    homeworkMinutes: 45,
    cardStat: "61.3% short on sleep",
  },
  7: {
    grade: 7,
    headline: "Same habits, a later bedtime, a shorter night.",
    body: "Grade 7 keeps most of those habits, but bedtime slips from about 9:24 p.m. to 9:52 p.m. and sleep drops from 8.4 hours to 8.1.",
    aside: "The evening still tends to go to games and screens, the way it did in grade 6.",
    shortSleep: null,
    shortSleepLabel: null,
    typicalSleep: "8.1 hours",
    bedtime: "about 9:52 p.m.",
    aimHours: 9,
    aimNote: "9 hours, the floor of the 9 to 12 hours this age needs",
    homeworkMinutes: 45,
    cardStat: "Bedtime about 9:52 p.m.",
  },
  8: {
    grade: 8,
    headline: "Better on paper, about the same night of sleep.",
    body: "Grade 8 looks better on paper, with short sleep falling to 53.1%, but that is mostly because the cutoff drops to 8 hours at age 13. Actual sleep stays around 8.1 hours. It is a split year: some students start finishing their work, and others still give the evening to screens.",
    aside: "A lower percentage here does not mean the night got longer.",
    shortSleep: "53.1%",
    shortSleepLabel: "Counted as short sleep, with an 8-hour cutoff",
    typicalSleep: "around 8.1 hours",
    bedtime: null,
    aimHours: 8,
    aimNote: "8 hours, the short-sleep cutoff at age 13",
    homeworkMinutes: 70,
    cardStat: "53.1% short on paper",
  },
  9: {
    grade: 9,
    headline: "School gets harder to ignore, and the night gets shorter.",
    body: "By grade 9, school is harder to ignore: sleep falls to about 7.6 hours with a 10:15 p.m. bedtime, and 65.6% get too little sleep. Among 15-year-olds, 66% worry about poor grades and 55% feel anxious about tests even when they have studied.",
    aside: "The leak shifts from games toward homework and worry.",
    shortSleep: "65.6%",
    shortSleepLabel: "Getting too little sleep",
    typicalSleep: "about 7.6 hours",
    bedtime: "about 10:15 p.m.",
    aimHours: 8,
    aimNote: "8 hours, the short-sleep cutoff at age 13",
    homeworkMinutes: 70,
    cardStat: "About 7.6 hours of sleep",
  },
};

export function getGrade(grade) {
  return GRADES[grade] || null;
}
