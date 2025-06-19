import { writeFileSync, unlinkSync } from "fs";
import { exec } from "child_process";
import { v4 as uuid } from "uuid";
import path from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = path.join(__dirname, "../temp");

const execAsync = promisify(exec);

export const runCppCode = async (code, input) => {
  const jobId = uuid();
  const cppFile = path.join(TEMP_DIR, `${jobId}.cpp`);
  const inputFile = path.join(TEMP_DIR, `${jobId}.in`);
  const execFile = path.join(TEMP_DIR, `${jobId}`);

  try {
    // Write code and input to temp files
    writeFileSync(cppFile, code);
    writeFileSync(inputFile, input);

    // Compile the code asynchronously
    await execAsync(`g++ ${cppFile} -o ${execFile}`);

    // Run the binary with input redirection
    const { stdout } = await execAsync(`${execFile} < ${inputFile}`, {
      timeout: 5000, // timeout in milliseconds
      maxBuffer: 1024 * 1024, // optional: handle larger outputs
    });

    return { output: stdout.trim(), error: null };
  } catch (error) {
    return { output: "", error: error.stderr || error.message };
  } finally {
    // Clean up temp files
    [cppFile, inputFile, execFile].forEach((file) => {
      try {
        unlinkSync(file);
      } catch (_) {}
    });
  }
};
