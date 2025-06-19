import { writeFileSync, readFileSync, unlinkSync } from "fs";
import { execSync } from "child_process";
import { v4 as uuid } from "uuid";

const TEMP_DIR = "/tmp"; // ✅ writable in serverless environments

export const runCppCode = async (code, input) => {
  const jobId = uuid();
  const cppFile = `${TEMP_DIR}/${jobId}.cpp`;
  const inputFile = `${TEMP_DIR}/${jobId}.in`;
  const outputFile = `${TEMP_DIR}/${jobId}.out`;

  try {
    writeFileSync(cppFile, code);
    writeFileSync(inputFile, input);

    const command = `docker run --rm -v ${TEMP_DIR}:/app -w /app gcc:latest bash -c "g++ ${jobId}.cpp -o ${jobId}.out && ./${jobId}.out < ${jobId}.in"`;
    const output = execSync(command, { timeout: 5000 }).toString();

    return { output: output.trim(), error: null };
  } catch (error) {
    return { output: "", error: error.message };
  } finally {
    [cppFile, inputFile, outputFile].forEach((file) => {
      try {
        unlinkSync(file);
      } catch (_) {}
    });
  }
};
