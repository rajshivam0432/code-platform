// backend/service/compilerService.js

import axios from "axios";

export const sendToCompiler = async (code,input) => {
  try {
    if (typeof code !== "string") {
      console.error("❌ Invalid `code` type:", typeof code);
    }
    
    console.log()

    const response = await axios.post(
      "https://compiler-server-gtfyeme2evggbchf.centralindia-01.azurewebsites.net/api/code/run",
      {
        code,
        input,
      }
    );

    return response.data;
  } catch (err) {
    console.error("Compiler service error:");
    console.error("Message:", err?.message);
    console.error("Stack:", err?.stack);

    if (err?.response) {
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
    }

    return {
      output: "",
      error: err?.response?.data?.error || err?.message || "Compiler failed",
    };
  }
};
