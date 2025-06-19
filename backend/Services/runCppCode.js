import { writeFileSync, unlinkSync, existsSync, mkdirSync } from "fs";
import { exec } from "child_process";
import { v4 as uuid } from "uuid";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { promisify } from "util";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Use system temp directory (safer for production)
const TEMP_DIR = path.join(os.tmpdir(), "cpp-runner");

// Ensure TEMP_DIR exists
if (!existsSync(TEMP_DIR)) {
  mkdirSync(TEMP_DIR, { recursive: true });
}

const execAsync = promisify(exec);

export const runCppCode = async (code, input) => {
  const jobId = uuid();
  const cppFile = path.join(TEMP_DIR, `${jobId}.cpp`);
  const inputFile = path.join(TEMP_DIR, `${jobId}.in`);
  const execFile = path.join(TEMP_DIR, `${jobId}`);

  try {
    // Write code and input
    writeFileSync(cppFile, code);
    writeFileSync(inputFile, input);

    // Compile the code
    await execAsync(`g++ ${cppFile} -o ${execFile}`);

    // Run the compiled binary with input
    const { stdout } = await execAsync(`${execFile} < ${inputFile}`, {
      timeout: 5000,
      maxBuffer: 1024 * 1024, // optional
    });

    return { output: stdout.trim(), error: null };
  } catch (error) {
    return {
      output: "",
      error: error.stderr || error.message,
    };
  } finally {
    // Clean up
    [cppFile, inputFile, execFile].forEach((file) => {
      try {
        unlinkSync(file);
      } catch (_) {
        // Ignore cleanup errors
      }
    });
  }
};
