import { writeFileSync, unlinkSync, existsSync, mkdirSync } from "fs";
import { exec } from "child_process";
import { v4 as uuid } from "uuid";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { promisify } from "util";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// System temp directory
const TEMP_DIR = path.join(os.tmpdir(), "cpp-runner");

// Ensure temp directory exists
if (!existsSync(TEMP_DIR)) {
  mkdirSync(TEMP_DIR, { recursive: true });
}

const execAsync = promisify(exec);

// 🛡️ Main C++ runner with timeout
export const runCppCode = async (code, input, timeout = 1000) => {
  const jobId = uuid();
  const cppFile = path.join(TEMP_DIR, `${jobId}.cpp`);
  const inputFile = path.join(TEMP_DIR, `${jobId}.in`);
  const execFile = path.join(TEMP_DIR, `${jobId}`);

  try {
    // Write code and input
    writeFileSync(cppFile, code);
    writeFileSync(inputFile, input);

    // Step 1: Compile the C++ code
    await execAsync(`g++ ${cppFile} -o ${execFile}`);

    // Step 2: Execute with timeout and input redirection
    const { stdout } = await execAsync(`${execFile} < ${inputFile}`, {
      timeout,
      maxBuffer: 1024 * 1024, // optional: limit to 1MB
    });

    return { output: stdout.trim(), error: null };
  } catch (error) {
    // 🛠️ Handle timeout or other exec errors
    if (error.killed || error.signal === "SIGTERM" || error.code === null) {
      return { output: "", error: "Execution timed out" };
    }

    return {
      output: "",
      error: error.stderr || error.message || "Unknown error occurred",
    };
  } finally {
    // 🧹 Clean up temp files
    [cppFile, inputFile, execFile].forEach((file) => {
      try {
        unlinkSync(file);
      } catch (_) {}
    });
  }
};
