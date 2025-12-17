import puppeteer from "puppeteer";
import fs from "node:fs";

const arg = process.argv.slice(2)[0];

const browser = await puppeteer.launch();
const page = await browser.newPage();

await page.goto(arg, {
  waitUntil: "networkidle2",
});

// Close the tour
await page.keyboard.down("Escape");
const scriptName = await page.evaluate(
  (el) => el.textContent,
  await page.$(".script-name"),
);

const n = (s) => s.replace(/[^a-z0-9]/gi, "-").toLowerCase();

const dir = n(scriptName);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

await page.pdf({
  path: `${dir}/${n(scriptName)}-player-sheet.pdf`,
  pageRanges: "1",
  format: "A4",
});
await page.pdf({
  path: `${dir}/${n(scriptName)}-meta-sheet.pdf`,
  pageRanges: "2",
  format: "A4",
});
await page.pdf({
  path: `${dir}/${n(scriptName)}-night-sheet.pdf`,
  pageRanges: "3-4",
  format: "A4",
});

await browser.close();
