// executeCode.js
import { writeFile, mkdir } from "fs/promises";
import { exec } from "child_process";
import { v4 as uuid } from "uuid";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = path.join(__dirname, "temp");

// Convert Windows path to Docker-compatible path (for -v volume mount)
function toDockerPath(windowsPath) {
  return windowsPath
    .replace(/\\/g, "/")
    .replace(/^([A-Za-z]):/, "/$1")
    .toLowerCase();
}

export const executeCppCode = async (code) => {
  const jobId = uuid();
  const filename = `${jobId}.cpp`;
  const filePath = path.join(TEMP_DIR, filename);

  // Ensure temp directory exists
  await mkdir(TEMP_DIR, { recursive: true });

  // Write C++ code to file
  await writeFile(filePath, code);

  // Convert path for Docker mount
  const dockerFilePath = toDockerPath(filePath);
  const dockerDirPath = toDockerPath(TEMP_DIR);

  const dockerCommand = `docker run --rm -v ${dockerDirPath}:/app cpp-code-executor bash -c "g++ /app/${filename} -o /app/a.out && /app/a.out"`;

  return new Promise((resolve, reject) => {
    exec(dockerCommand, (err, stdout, stderr) => {
      if (err) {
        reject({ error: stderr || err.message });
      } else {
        resolve({ output: stdout });
      }
    });
  });
};
