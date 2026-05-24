import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import puppeteer from "puppeteer-core";

const root = resolve(import.meta.dirname, "..");
const sourceRoot =
  process.env.BOOK_ACCESS_NEW_PRINCE_ROOT ??
  "C:\\Users\\kevin\\Applications by KLMichel\\new-prince-hard-times";
const sourceCssPath = resolve(sourceRoot, "public", "book-cover.css");
const outputPath = resolve(root, "public", "covers", "new-prince-hard-times.png");

const sheetWidthIn = 11.795;
const sheetHeightIn = 8.75;
const frontLeftIn = 6.17;
const frontTopIn = 0.125;
const frontWidthIn = 5.5;
const frontHeightIn = 8.5;
const cssPixelsPerInch = 96;
const printDpi = 300;
const deviceScaleFactor = printDpi / cssPixelsPerInch;

const title = "The New Prince of Hard Times";
const subtitle = "How to survive inflation, job loss, war, inequality, and the collapse of easy answers.";
const author = "Kevin L. Michel";

function findBrowserExecutable() {
  const candidates =
    process.platform === "win32"
      ? [
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
          "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
          "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
          "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe"
        ]
      : [
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
          "/usr/bin/google-chrome",
          "/usr/bin/chromium",
          "/usr/bin/chromium-browser"
        ];

  const executable = candidates.find((candidate) => existsSync(candidate));
  if (!executable) throw new Error("Could not find Chrome or Edge for the New Prince cover export.");
  return executable;
}

function readPngDimensions(pngBuffer) {
  if (pngBuffer.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") {
    throw new Error("Cover screenshot did not produce a PNG file.");
  }
  return {
    width: pngBuffer.readUInt32BE(16),
    height: pngBuffer.readUInt32BE(20)
  };
}

function coverHtml(css) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <style>${css}</style>
  </head>
  <body>
    <main class="cover-sheet" aria-label="Full paperback cover for ${title}">
      <section class="back-cover" aria-label="Back cover"></section>
      <section class="spine" aria-label="Book spine"></section>
      <section class="front-cover" aria-label="Front cover">
        <div class="front-kicker">A field guide for hard times</div>
        <svg class="civic-seal" viewBox="0 0 160 160" role="img" aria-label="Broken crown civic seal">
          <circle cx="80" cy="80" r="73" />
          <path class="seal-ring" d="M32 102h96" />
          <path class="crown" d="M38 92l12-48 26 32 18-40 22 40 24-32 10 48z" />
          <path class="crack" d="M82 38l-8 28 12 8-14 32" />
          <path class="tool" d="M45 116h70" />
        </svg>
        <h1>
          <span>The New</span>
          <strong>Prince</strong>
          <span>of Hard</span>
          <span>Times</span>
        </h1>
        <p class="cover-subtitle">${subtitle}</p>
        <p class="author">${author}</p>
      </section>
    </main>
  </body>
</html>`;
}

await mkdir(dirname(outputPath), { recursive: true });

const css = await readFile(sourceCssPath, "utf8");
const browser = await puppeteer.launch({
  executablePath: findBrowserExecutable(),
  headless: true,
  args: ["--disable-gpu", "--force-color-profile=srgb", "--hide-scrollbars", "--no-sandbox"]
});

try {
  const page = await browser.newPage();
  await page.setViewport({
    width: Math.ceil(sheetWidthIn * cssPixelsPerInch),
    height: Math.ceil(sheetHeightIn * cssPixelsPerInch),
    deviceScaleFactor
  });
  await page.setContent(coverHtml(css), { waitUntil: ["load", "networkidle0"] });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  const screenshot = await page.screenshot({
    type: "png",
    captureBeyondViewport: false,
    clip: {
      x: frontLeftIn * cssPixelsPerInch,
      y: frontTopIn * cssPixelsPerInch,
      width: frontWidthIn * cssPixelsPerInch,
      height: frontHeightIn * cssPixelsPerInch
    }
  });

  const dimensions = readPngDimensions(screenshot);
  if (Math.abs(dimensions.width - Math.round(frontWidthIn * printDpi)) > 1) {
    throw new Error(`Unexpected cover width: ${dimensions.width}px.`);
  }
  if (Math.abs(dimensions.height - Math.round(frontHeightIn * printDpi)) > 1) {
    throw new Error(`Unexpected cover height: ${dimensions.height}px.`);
  }

  await writeFile(outputPath, screenshot);
  console.log(`Wrote New Prince cover asset ${dimensions.width}x${dimensions.height}px to ${outputPath}`);
} finally {
  await browser.close();
}
