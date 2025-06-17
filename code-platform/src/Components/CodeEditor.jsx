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
  const [loading, setLoading] = useState(false);

  const API = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    axios
      .get(`${API}/api/problems/${id}`)
      .then((res) => {
        setProblem(res.data);
        setDbTestcases(res.data.testcases || []);
        setError(null);
      })
      .catch(() => {
        setError("Failed to load problem.");
      });
  }, [id, API]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (runCustom) {
        const response = await axios.post(`${API}/api/submit`, {
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
        const response = await axios.post(`${API}/api/submit`, {
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
    } finally {
      setLoading(false);
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

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-4 bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-white flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Running...
          </>
        ) : (
          "Submit"
        )}
      </button>

      {output && (
        <div
          className={`mt-6 p-4 rounded text-lg font-semibold ${
            output.includes("Accepted") ? "text-green-400" : "text-red-400"
          }`}
        >
          {output}
        </div>
      )}

      <div className="px-2 mt-6">
        <h2 className="text-2xl font-semibold text-white mb-4">
          Sample Testcases
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dbTestcases.slice(0, 3).map((tc, index) => (
            <div
              key={tc._id}
              className="bg-gray-800 rounded-md p-4 text-white flex flex-col gap-4 min-h-[240px]"
            >
              <div>
                <h3 className="text-lg font-semibold mb-2">Case {index + 1}</h3>

                <p className="text-sm text-gray-400 mb-1">Input:</p>
                <pre className="bg-gray-900 rounded px-3 py-2 whitespace-pre-wrap text-sm">
                  {tc.input}
                </pre>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-1">Expected Output:</p>
                <pre className="bg-gray-900 rounded px-3 py-2 text-green-400 whitespace-pre-wrap text-sm">
                  {tc.expected_output}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>

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
