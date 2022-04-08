const fs = require("fs/promises");
const util = require("util");
const exec = util.promisify(require("child_process").exec);

const DATA = [
  "                             ", //Sunday
  "  XXX  XXXX  X   X X   X     ", //
  " X   X X   X XX XX  X X      ", //
  " XXXXX XXXX  X X X   X       ", //
  " X   X X   X X   X   X       ", //
  " X   X X   X X   X   X       ", //
  "                             ", //
];

const WEEK_OFFSET = 14; // Start at 14th week of the year
const ONE_DAY = 1000 * 60 * 60 * 24;

function shouldCommit(today) {
  function getDayOfWeek() {
    return today.getUTCDay();
  }

  /**
   *
   * @returns zero-based (full) week of year
   */
  function getWeekOfYear() {
    const firstDay = Date.UTC(today.getUTCFullYear(), 0, 0);
    let firstSunday = new Date(firstDay);
    if (firstSunday.getUTCDay() !== 0) {
      firstSunday = +firstSunday + (7 - firstSunday.getUTCDay()) * ONE_DAY;
    }
    return Math.floor((today - firstSunday) / ONE_DAY / 7);
  }

  const dayOfWeek = getDayOfWeek();
  const weekOfYear = getWeekOfYear();

  const y = dayOfWeek;
  const x = weekOfYear - WEEK_OFFSET;

  const row = DATA[y];
  if (!row) return false;
  const value = row.charAt(x);
  if (!value) return false;
  return value !== " ";
}

function simulation() {
  const today = new Date();
  const FIRST_SUNDAY = Date.UTC(2022, 0, 2);
  let output = "";
  for (let j = 0; j < 7; j++) {
    for (let i = 0; i < 52; i++) {
      const day = new Date(FIRST_SUNDAY + (i * 7 + j) * ONE_DAY);
      const v = shouldCommit(day);
      if (
        day.getUTCMonth() === today.getUTCMonth() &&
        day.getUTCDate() === today.getUTCDate()
      ) {
        output += "◻︎";
      } else {
        if (v) {
          output += "▤";
        } else {
          output += " ";
        }
      }
    }
    output += "\n";
  }
  console.log(output);
}

async function main() {
  simulation();

  if (shouldCommit(new Date()) || true) {
    console.log("Today is commit day!");
    fs.writeFile("./log.txt", new Date().toISOString());
    await exec("git add .");
    await exec('git commit -m "Auto commit"');
  }
}

main();
