import puppeteer from "puppeteer";
import fs from "node:fs";
import fsPromises from "node:fs/promises";
import { exit } from "node:process";
import { styleText } from "node:util";

import ProgressBar from "progress";
import commandLineArgs from "command-line-args";
import commandLineUsage from "command-line-usage";

const options = commandLineArgs([
  { name: "directory", alias: "d", type: String },
  { name: "compact", type: Boolean },
  { name: "dry-run", type: Boolean },
  { name: "help", alias: "h", type: Boolean },
]);

const usage = commandLineUsage([
  {
    header: "BOTC PDF Generator",
    content:
      "Generates BOTC script PDFs using the official script tool from the terminal.\n\nWorks by converting script JSONs to script links, then visiting those URLs in headless chromium using puppeteer.",
  },
  {
    header: "Options",
    optionList: [
      {
        name: "directory",
        alias: "d",
        description:
          "A directory containing script JSON files. Make sure it doesn’t contain anything else.",
      },
      {
        name: "compact",
        description:
          "Produces a single PDF per JSON (which may be printed double-sided) with the meta sheet & compact night sheet on the second page.",
      },
      {
        name: "dry-run",
        description:
          "See what the tool would do without making any changes to the local filesystem. Will still send network requests to the script tool.",
      },
      {
        name: "help",
        alias: "h",
        description: "Display this guide.",
      },
    ],
  },
]);

if (options.help) {
  console.log(usage);
  exit(0);
}

if (!options.directory) {
  console.error("You need to pass a directory!");
  console.error(usage);
  exit(1);
}

if (!fs.existsSync(options.directory)) {
  console.error(`${options.directory} does not exist.`);
  exit(1);
}

const rootDir = options.directory;
const scriptTool = new URL("https://script.bloodontheclocktower.com");

console.log("Booting headless browser ...");
const browser = await puppeteer.launch();
const page = await browser.newPage();

await browser.defaultBrowserContext().setPermission(
  "*",
  {
    permission: { name: "clipboard-read" },
    state: "granted",
  },
  {
    permission: { name: "clipboard-write" },
    state: "granted",
  },
);

console.log("Loading script tool ...");
await page.goto(scriptTool, { waitUntil: "networkidle2" });

// Close the tour (will stay closed between reloads)
await page.keyboard.down("Escape");

// 1. Open settings
await page.locator("#settings-button").click();
// 2. Turn player count table off
await page.locator("#print-player-count-table").click();
// 2.1 In compact mode (simulating the old tool), enable the compact night sheet
if (options.compact) {
  await page.locator("#print-compact-night-sheet").click();
}

// 3. Close settings
await page.keyboard.down("Escape");

console.log("Reading script directory ...");
const nfiles = fs
  .readdirSync(rootDir, { withFileTypes: true })
  .filter((x) => x.name.endsWith(".json")).length;

const bar = new ProgressBar(
  "botc-pdf-gen: :bar :current/:total [≈ :etas remaining] (:script)",
  {
    total: nfiles,
    complete: "█",
    incomplete: "░",
  },
);

function name(json) {
  return json.find((o) => o?.id === "_meta")?.name;
}

function normalize(s) {
  return s.replace(/[^a-z0-9]/gi, "-").toLowerCase();
}

for await (const path of fsPromises.glob(`${options.directory}/*.json`)) {
  const raw = await fsPromises.readFile(path, { encoding: "utf8" });
  const script = JSON.parse(raw);

  if (!Array.isArray(script)) {
    bar.interrupt(`${path} wasn’t a script, continuing ...`);
    bar.tick({ script: name(script) });
    continue;
  }

  const filename = normalize(name(script));
  const cwd = `${rootDir}/${filename}`;

  if (!fs.existsSync(cwd)) {
    if (!options["dry-run"]) {
      fs.mkdirSync(cwd);
    } else {
      bar.interrupt(
        `${styleText("bold", "[DRY RUN]")} – Creating directory: ${cwd}`,
      );
    }
  } else {
    bar.interrupt(
      `${name(script)} already exists – if you want to regenerate the PDFs, delete the PDF directory`,
    );
    bar.tick({ script: name(script) });
    continue;
  }

  await page.evaluate((text) => {
    navigator.clipboard.writeText(text);
  }, JSON.stringify(script));

  await page.click("button[title='Import JSON']");
  await page.keyboard.down("Shift");
  await page.keyboard.down("Insert");
  await page.keyboard.up("Shift");

  if (!options["dry-run"]) {
    if (options.compact) {
      await page.pdf({
        path: `${cwd}/${filename}-player-sheet.pdf`,
        pageRanges: "1-2",
        format: "A4",
      });
    } else {
      await page.pdf({
        path: `${cwd}/${filename}-player-sheet.pdf`,
        pageRanges: "1",
        format: "A4",
      });
      await page.pdf({
        path: `${cwd}/${filename}-meta-sheet.pdf`,
        pageRanges: "2",
        format: "A4",
      });
      await page.pdf({
        path: `${cwd}/${filename}-night-sheet.pdf`,
        pageRanges: "3-4",
        format: "A4",
      });
    }
  } else {
    bar.interrupt(
      `${styleText("bold", "[DRY RUN]")} – Creating PDF: ${cwd}/${filename}-*-sheet.pdf`,
    );
  }
  bar.tick({ script: name(script) });
}

await browser.close();
