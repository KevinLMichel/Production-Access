import { mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { exec } from "node:child_process";

const root = resolve(import.meta.dirname, "..");
const nodeCommand = process.execPath;
const astroCommand = resolve(root, "node_modules", "astro", "bin", "astro.mjs");
const vivliostyleCommand = resolve(
  root,
  "node_modules",
  "@vivliostyle",
  "cli",
  "dist",
  "cli.js"
);
const pdfPath = resolve(root, "public", "downloads", "city-with-a-heavy-heart-kevin-l-michel.pdf");
const printInput = resolve(root, "dist", "books", "city-with-a-heavy-heart", "print", "index.html");
const printStylesheet = resolve(root, "public", "city-with-a-heavy-heart-book-print.css");

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

await mkdir(dirname(pdfPath), { recursive: true });

console.log("Building Astro print route for The City with a Heavy Heart...");
await run(nodeCommand, [astroCommand, "build"]);

console.log("Generating The City with a Heavy Heart trade-book PDF...");
await run(nodeCommand, [
  vivliostyleCommand,
  "build",
  printInput,
  "--style",
  printStylesheet,
  "-s",
  "5.5in,8.5in",
  "-o",
  pdfPath,
  "--title",
  "The City with a Heavy Heart",
  "--author",
  "Kevin L. Michel"
]);

console.log("Rebuilding Astro site so dist includes the committed PDF asset...");
await run(nodeCommand, [astroCommand, "build"]);

console.log(`PDF written to ${pdfPath}`);
