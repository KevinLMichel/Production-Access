import { exec } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { PDFDocument, PDFName } from "pdf-lib";
import puppeteer from "puppeteer-core";

const root = resolve(import.meta.dirname, "..");
const nodeCommand = process.execPath;
const astroCommand = resolve(root, "node_modules", "astro", "bin", "astro.mjs");
const coverPath = resolve(root, "production", "covers", "output", "mental-toughness-cover-wrap.pdf");
const coverInput = resolve(root, "dist", "books", "mental-toughness-dreams", "cover-print", "index.html");
const coverStylesheet = resolve(root, "public", "mental-toughness-cover.css");

const sheetWidthIn = 11.680556;
const sheetHeightIn = 8.75;
const cssPixelsPerInch = 96;
const printDpi = 300;
const viewportWidth = Math.ceil(sheetWidthIn * cssPixelsPerInch);
const viewportHeight = Math.ceil(sheetHeightIn * cssPixelsPerInch);
const clipWidth = sheetWidthIn * cssPixelsPerInch;
const clipHeight = sheetHeightIn * cssPixelsPerInch;
const deviceScaleFactor = printDpi / cssPixelsPerInch;
const expectedRasterWidth = Math.round(sheetWidthIn * printDpi);
const expectedRasterHeight = Math.round(sheetHeightIn * printDpi);

function run(command, args) {
  return new Promise((resolveRun, reject) => {
    const commandLine =
      process.platform === "win32"
        ? quoteWindowsCommand(command, args)
        : [command, ...args].map(quotePosixArg).join(" ");

    const child = exec(commandLine, {
      cwd: root,
      maxBuffer: 1024 * 1024 * 20,
      windowsHide: true
    });

    child.stdout?.pipe(process.stdout);
    child.stderr?.pipe(process.stderr);

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolveRun();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} exited with ${code}`));
    });
  });
}

function quoteWindowsCommand(command, args) {
  return [command, ...args].map(quoteWindowsArg).join(" ");
}

function quoteWindowsArg(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function quotePosixArg(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

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
  if (!executable) {
    throw new Error("Could not find Chrome or Edge for the high-resolution cover export.");
  }
  return executable;
}

function cssWithAbsoluteAssetUrls(css) {
  return css.replace(/url\((["']?)\.\/([^)"']+)\1\)/g, (_match, _quote, relativePath) => {
    const absolutePath = resolve(root, "public", relativePath);
    return `url("${pathToFileURL(absolutePath).href}")`;
  });
}

function pageHtmlWithInlineCss(html, css) {
  return html.replace("</head>", `<style>${css}</style></head>`);
}

function readPngDimensions(pngBuffer) {
  const signature = pngBuffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") {
    throw new Error("Cover screenshot did not produce a PNG file.");
  }
  return {
    width: pngBuffer.readUInt32BE(16),
    height: pngBuffer.readUInt32BE(20)
  };
}

function assertApproximateRasterDimensions(dimensions) {
  const widthDelta = Math.abs(dimensions.width - expectedRasterWidth);
  const heightDelta = Math.abs(dimensions.height - expectedRasterHeight);
  if (widthDelta > 1 || heightDelta > 1) {
    throw new Error(
      `Expected approximately ${expectedRasterWidth}x${expectedRasterHeight}px cover raster, got ${dimensions.width}x${dimensions.height}px.`
    );
  }
}

async function renderCoverPng() {
  const [html, css] = await Promise.all([
    readFile(coverInput, "utf8"),
    readFile(coverStylesheet, "utf8")
  ]);
  const styledHtml = pageHtmlWithInlineCss(html, cssWithAbsoluteAssetUrls(css));

  const browser = await puppeteer.launch({
    executablePath: findBrowserExecutable(),
    headless: true,
    args: [
      "--allow-file-access-from-files",
      "--disable-gpu",
      "--force-color-profile=srgb",
      "--hide-scrollbars",
      "--no-sandbox"
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: viewportWidth,
      height: viewportHeight,
      deviceScaleFactor
    });
    await page.setContent(styledHtml, { waitUntil: ["load", "networkidle0"] });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(
        Array.from(document.images)
          .filter((image) => !image.complete)
          .map(
            (image) =>
              new Promise((resolveImage) => {
                image.addEventListener("load", resolveImage, { once: true });
                image.addEventListener("error", resolveImage, { once: true });
              })
          )
      );
    });

    const screenshot = await page.screenshot({
      type: "png",
      captureBeyondViewport: false,
      clip: {
        x: 0,
        y: 0,
        width: clipWidth,
        height: clipHeight
      }
    });

    const dimensions = readPngDimensions(screenshot);
    assertApproximateRasterDimensions(dimensions);
    console.log(`Rendered cover raster: ${dimensions.width}x${dimensions.height}px`);

    return screenshot;
  } finally {
    await browser.close();
  }
}

async function writeCoverPdf(pngBuffer) {
  const pdf = await PDFDocument.create();
  pdf.setTitle("Mental Toughness - Paperback Cover");
  pdf.setAuthor("Kevin L. Michel");
  pdf.setProducer("Book Access cover export");
  pdf.setCreator("Book Access cover export");

  const page = pdf.addPage([sheetWidthIn * 72, sheetHeightIn * 72]);
  page.node.delete(PDFName.of("Annots"));
  const coverImage = await pdf.embedPng(pngBuffer);
  page.drawImage(coverImage, {
    x: 0,
    y: 0,
    width: sheetWidthIn * 72,
    height: sheetHeightIn * 72
  });

  await writeFile(coverPath, await pdf.save({ useObjectStreams: false }));
}

await mkdir(dirname(coverPath), { recursive: true });

console.log("Building Astro cover route for Mental Toughness...");
await run(nodeCommand, [astroCommand, "build"]);

console.log(`Rendering high-resolution approximately ${expectedRasterWidth}x${expectedRasterHeight}px cover image...`);
const coverPng = await renderCoverPng();

console.log("Embedding high-resolution cover image into KDP-sized PDF...");
await writeCoverPdf(coverPng);

console.log(`Cover PDF written to ${coverPath}`);
