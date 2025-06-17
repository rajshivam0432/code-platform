import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import axios from "axios";

const CodeEditor = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState(`#include <iostream>
using namespace std;

int main() {
    // write your code here
    return 0;
}`);
  const [runCustom, setRunCustom] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [output, setOutput] = useState("");
  const [testcaseResults, setTestcaseResults] = useState([]);
  const [dbTestcases, setDbTestcases] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/problems/${id}`)
      .then((res) => {
        setProblem(res.data);
        setDbTestcases(res.data.testcases || []);
        setError(null);
      })
      .catch(() => {
        setError("Failed to load problem.");
      });
  }, [id]);

  const handleSubmit = async () => {
    try {
      if (runCustom) {
        const response = await axios.post("http://localhost:5000/api/submit", {
          source_code: code,
          language_id: 54,
          stdin: userInput,
        });

        const result = response.data;
        setTestcaseResults([]);
        setOutput(
          result.stdout
            ? `✅ Output:\n${result.stdout}`
            : `❌ Error:\n${
                result.stderr || result.compile_output || "Unknown error"
              }`
        );
      } else {
        const response = await axios.post("http://localhost:5000/api/submit", {
          problemId: id,
          source_code: code,
          language_id: 54,
        });

        const result = response.data;

        if (!result || !result.allResults) {
          setOutput("❌ No testcases were evaluated.");
          return;
        }

        setTestcaseResults(result.allResults);

        const allPassed = result.allResults.every((r) => r.passed);
        setOutput(allPassed ? "✅ Accepted" : "❌ Some testcases failed");
      }
    } catch (err) {
      console.error(err);
      setOutput("❌ Submission failed. Please try again.");
    }
  };

  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!problem) return <div className="text-white p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-2">{problem.title}</h1>
      <p className="mb-4 text-gray-300">{problem.description}</p>

      <Editor
        height="60vh"
        defaultLanguage="cpp"
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value || "")}
      />

      <label className="flex items-center mt-4 mb-2">
        <input
          type="checkbox"
          checked={runCustom}
          onChange={() => setRunCustom((prev) => !prev)}
          className="mr-2"
        />
        Run Custom Input
      </label>

      {runCustom && (
        <textarea
          className="w-full mt-2 p-2 bg-gray-800 text-white rounded"
          placeholder="Enter custom input (e.g., abcde ace)"
          rows={4}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
      )}

      <button
        onClick={handleSubmit}
        className="mt-4 bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-white"
      >
        Submit
      </button>

      {/* ✅ Output status */}
      {output && (
        <div
          className={`mt-6 p-4 rounded text-lg font-semibold ${
            output.includes("Accepted") ? "text-green-400" : "text-red-400"
          }`}
        >
          {output}
        </div>
      )}

      {/* ✅ Testcases from DB */}
      {dbTestcases.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2 text-white">
            Sample Testcases
          </h3>
          <div className="space-y-2">
            {dbTestcases.slice(0, 3).map((tc, idx) => (
              <div
                key={idx}
                className="bg-gray-800 p-3 rounded shadow-sm text-sm text-gray-300"
              >
                <p>
                  <strong>Input:</strong>{" "}
                  <pre className="whitespace-pre-wrap">{tc.input}</pre>
                </p>
                <p>
                  <strong>Expected Output:</strong>{" "}
                  <span className="text-green-400">{tc.expected_output}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ Results after submission */}
      {testcaseResults.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-2 text-white">
            Testcase Results
          </h3>
          <div className="space-y-2">
            {testcaseResults.slice(0, 3).map((tc, idx) => (
              <div
                key={idx}
                className="flex items-start bg-gray-800 p-3 rounded shadow-sm"
              >
                <div
                  className={`w-3 h-3 rounded-full mt-1 mr-3 ${
                    tc.passed ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <div className="text-sm text-gray-300">
                  <strong>Input:</strong>
                  <pre className="whitespace-pre-wrap">{tc.input}</pre>
                  <strong>Expected:</strong> {tc.expected} <br />
                  <strong>Received:</strong>{" "}
                  <span
                    className={tc.passed ? "text-green-400" : "text-red-400"}
                  >
                    {tc.received}
                  </span>
                </div>
              </div>
            ))}
            {testcaseResults.length > 3 && (
              <p className="text-gray-400 text-sm mt-2">
                ...and {testcaseResults.length - 3} more testcases
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
