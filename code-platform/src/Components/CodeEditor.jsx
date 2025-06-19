import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";

const DEFAULT_CODE = `// Write your C++ code here
#include <iostream>
using namespace std;

int main() {
    // your code goes here
    return 0;
}`;

const EditorPage = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState([]);
  const [scorePercent, setScorePercent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isSubmitMode, setIsSubmitMode] = useState(false);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/problems/${id}`, {
        withCredentials: true,
      })
      .then((res) => setProblem(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  useEffect(() => {
    const saved = localStorage.getItem(`code-${id}`);
    setCode(saved || DEFAULT_CODE);
  }, [id]);

  const handleCodeChange = (value) => {
    setCode(value);
    localStorage.setItem(`code-${id}`, value);
  };

  const handleRunOrSubmit = async (submit) => {
    setIsSubmitMode(submit);
    setLoading(true);
    setResult([]);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/submit`,
        {
          code,
          language: "cpp",
          problemId: id,
          isSubmit: submit,
        },
        {
          withCredentials: true,
        }
      );
      setResult(res.data.results);
      setScorePercent(res.data.scorePercent);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCode(DEFAULT_CODE);
    localStorage.setItem(`code-${id}`, DEFAULT_CODE);
  };

  return problem ? (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">{problem.title}</h1>
      <p className="mb-4 text-gray-300">{problem.description}</p>

      <MonacoEditor
        height="400px"
        defaultLanguage="cpp"
        theme="vs-dark"
        value={code}
        onChange={handleCodeChange}
      />

      {/* Action Buttons */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={() => handleRunOrSubmit(false)}
          className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading && !isSubmitMode ? "Running..." : "Run"}
        </button>
        <button
          onClick={() => handleRunOrSubmit(true)}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
          disabled={loading}
        >
          {loading && isSubmitMode ? "Submitting..." : "Submit"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
        >
          Reset Code
        </button>
      </div>

      {/* Progress Bar */}
      {loading && (
        <div className="mt-4 w-full bg-gray-700 h-2 rounded">
          <div
            className="bg-yellow-400 h-2 animate-pulse rounded"
            style={{ width: "100%" }}
          ></div>
          <p className="text-sm text-yellow-400 mt-1">
            Compiling and running test cases...
          </p>
        </div>
      )}

     
      {!loading && isSubmitMode && (
        <div className="mt-6 bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">
            {scorePercent === 100
              ? "All test cases passed"
              : ` Some test cases failed (${scorePercent}% passed)`}
          </h2>
          <div className="w-full bg-gray-700 h-3 rounded mb-2">
            <div
              className={`h-3 rounded ${
                scorePercent === 100 ? "bg-green-500" : "bg-red-500"
              }`}
              style={{ width: `${scorePercent}%` }}
            ></div>
          </div>
        </div>
      )}

      
      {!loading &&
        problem.visibleTestCases &&
        problem.visibleTestCases.length > 0 && (
          <div className="mt-6 bg-gray-800 p-4 rounded">
            <h2 className="text-lg font-semibold mb-4">Sample Test Cases</h2>
            <div className="flex flex-wrap gap-4">
              {problem.visibleTestCases.map((tc, idx) => {
                const testResult = result.find(
                  (r) => r.input.trim() === tc.input.trim()
                );
                const passed = testResult?.passed;
                const actualOutput = testResult?.actualOutput;
                const error = testResult?.error;

                return (
                  <div
                    key={idx}
                    className={`w-full md:w-[48%] bg-gray-700 rounded p-4 space-y-2 border ${
                      passed === true
                        ? "border-green-500"
                        : passed === false
                        ? "border-red-500"
                        : "border-gray-600"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white">
                        Test Case #{idx + 1}
                      </span>
                      {passed === true && (
                        <span className="bg-green-600 px-2 py-1 rounded text-sm font-medium">
                          Passed 
                        </span>
                      )}
                      {passed === false && (
                        <span className="bg-red-600 px-2 py-1 rounded text-sm font-medium">
                          Failed 
                        </span>
                      )}
                    </div>
                    <pre className="text-sm text-gray-300">
                      <strong>Input:</strong> {tc.input}
                    </pre>
                    <pre className="text-sm text-green-300">
                      <strong>Expected:</strong> {tc.expectedOutput}
                    </pre>
                    {passed !== undefined && (
                      <pre className="text-sm text-blue-300">
                        <strong>Got:</strong> {actualOutput}
                      </pre>
                    )}
                    {error && (
                      <pre className="text-sm text-red-400">
                        <strong>Error:</strong> {error}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
    </div>
  ) : (
    <p className="text-white p-4">Loading...</p>
  );
};

export default EditorPage;
