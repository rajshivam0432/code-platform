import { writeFileSync, readFileSync, unlinkSync } from "fs";
import { execSync } from "child_process";
import { v4 as uuid } from "uuid";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_DIR = path.join(__dirname, "../temp");

export const runCppCode = async (code, input) => {
  const jobId = uuid();
  const cppFile = path.join(TEMP_DIR, `${jobId}.cpp`);
  const inputFile = path.join(TEMP_DIR, `${jobId}.in`);
  const outputFile = path.join(TEMP_DIR, `${jobId}.out`);
  const execFile = path.join(TEMP_DIR, `${jobId}`);

  try {
    writeFileSync(cppFile, code);
    writeFileSync(inputFile, input);

    // Compile the C++ code
    execSync(`g++ ${cppFile} -o ${execFile}`);

    // Execute the compiled binary with input redirection
    const output = execSync(`${execFile} < ${inputFile}`, {
      timeout: 5000,
    }).toString();

    return { output: output.trim(), error: null };
  } catch (error) {
    return { output: "", error: error.message };
  } finally {
    // Clean up files
    [cppFile, inputFile, execFile].forEach((file) => {
      try {
        unlinkSync(file);
      } catch (_) {}
    });
  }
};
