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
const coverPath = resolve(root, "production", "covers", "output", "a-book-for-the-fragmented-cover-wrap.pdf");
const coverInput = resolve(root, "dist", "books", "fragmented-become-whole", "cover-print", "index.html");
const coverStylesheet = resolve(root, "public", "fragmented-cover.css");

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

await mkdir(dirname(coverPath), { recursive: true });

console.log("Building Astro cover route for A Book for the Fragmented...");
await run(nodeCommand, [astroCommand, "build"]);

console.log("Generating A Book for the Fragmented KDP paperback cover PDF...");
await run(nodeCommand, [
  vivliostyleCommand,
  "build",
  coverInput,
  "--style",
  coverStylesheet,
  "-s",
  "12.202in,8.75in",
  "-o",
  coverPath,
  "--title",
  "A Book for the Fragmented - Paperback Cover",
  "--author",
  "Kevin L. Michel"
]);

console.log(`Cover PDF written to ${coverPath}`);
