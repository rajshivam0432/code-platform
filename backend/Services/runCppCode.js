import { writeFileSync, unlinkSync, existsSync, mkdirSync } from "fs";
import { exec } from "child_process";
import { v4 as uuid } from "uuid";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { promisify } from "util";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const TEMP_DIR = path.join(os.tmpdir(), "cpp-runner");

if (!existsSync(TEMP_DIR)) {
  mkdirSync(TEMP_DIR, { recursive: true });
}

const execAsync = promisify(exec);

export const runCppCode = async (code, input, timeout = 500) => {
  const jobId = uuid();
  const cppFile = path.join(TEMP_DIR, `${jobId}.cpp`);
  const inputFile = path.join(TEMP_DIR, `${jobId}.in`);
  const execFile = path.join(TEMP_DIR, `${jobId}`);

  try {
    writeFileSync(cppFile, code);
    writeFileSync(inputFile, input);

    await execAsync(`g++ ${cppFile} -o ${execFile}`);

    const { stdout } = await execAsync(`${execFile} < ${inputFile}`, {
      timeout,
      maxBuffer: 1024 * 1024,
    });

    return { output: stdout.trim(), error: null };
  } catch (error) {
    if (error.killed || error.signal === "SIGTERM" || error.code === null) {
      return { output: "", error: "Execution timed out" };
    }

    return {
      output: "",
      error: error.stderr || error.message || "Unknown error occurred",
    };
  } finally {
    [cppFile, inputFile, execFile].forEach((file) => {
      try {
        unlinkSync(file);
      } catch (_) {}
    });
  }
};
