// Unchanged imports
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";

// Markdown styles
const markdownComponents = {
  h1: (props) => (
    <h1 className="text-2xl font-bold text-purple-400 my-4" {...props} />
  ),
  h2: (props) => (
    <h2 className="text-xl font-bold text-purple-300 mt-4 mb-2" {...props} />
  ),
  h3: (props) => (
    <h3
      className="text-lg font-semibold text-purple-200 mt-3 mb-1"
      {...props}
    />
  ),
  p: ({ children }) => {
    const text = children[0];
    if (typeof text === "string") {
      const match = text.match(/^(.+?[.?!])(\s+|$)(.*)/);
      if (match) {
        return (
          <p className="text-white leading-relaxed my-2">
            <strong>{match[1]}</strong> {match[3]}
          </p>
        );
      }
    }
    return <p className="text-white leading-relaxed my-2">{children}</p>;
  },
  li: ({ children }) => (
    <li className="ml-6 list-disc text-white my-1">
      <strong>{children}</strong>
    </li>
  ),
  code: ({ children }) => (
    <pre className="bg-black border border-gray-700 text-green-400 text-sm p-3 rounded-md my-2 overflow-auto whitespace-pre-wrap">
      <code>{children}</code>
    </pre>
  ),
};

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
  const [aiReview, setAiReview] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [customOutput, setCustomOutput] = useState("");
  const [customRunLoading, setCustomRunLoading] = useState(false);

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
    setAiReview("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/submit`,
        { code, language: "cpp", problemId: id, isSubmit: submit },
        { withCredentials: true }
      );
      setResult(res.data.results);
      setScorePercent(res.data.scorePercent);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomRun = async () => {
    setCustomRunLoading(true);
    setCustomOutput("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/submit/custom`,
        { code, language: "cpp", problemId: id, input: customInput },
        { withCredentials: true }
      );
      setCustomOutput(res.data.output || "No output.");
    } catch (err) {
      console.error(err);
      setCustomOutput("Error occurred while executing code.");
    } finally {
      setCustomRunLoading(false);
    }
  };

  const handleAIReview = async () => {
    setAiLoading(true);
    setAiReview("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/ai-review`,
        { code, language: "cpp", problemId: id },
        { withCredentials: true }
      );
      setAiReview(res.data.review || "No review generated.");
    } catch (err) {
      console.error(err);
      setAiReview("Failed to get AI review.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleReset = () => {
    setCode(DEFAULT_CODE);
    localStorage.setItem(`code-${id}`, DEFAULT_CODE);
  };

  if (!problem) return <p className="text-white p-4">Loading...</p>;

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen space-y-6">
      <h1 className="text-2xl font-bold">{problem.title}</h1>
      <p className="text-gray-300 whitespace-pre-wrap">{problem.description}</p>

      {problem.constraints && (
        <div>
          <h2 className="text-lg font-semibold text-yellow-400 mb-1">
            Constraints
          </h2>
          <pre className="text-sm text-yellow-200 bg-gray-800 p-3 rounded whitespace-pre-wrap">
            {problem.constraints}
          </pre>
        </div>
      )}

      <MonacoEditor
        height="400px"
        defaultLanguage="cpp"
        theme="vs-dark"
        value={code}
        onChange={handleCodeChange}
      />

      <div className="flex flex-wrap gap-4">
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
        <button
          onClick={handleAIReview}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded disabled:opacity-50"
          disabled={aiLoading}
        >
          {aiLoading ? "Reviewing..." : "AI Review"}
        </button>
      </div>

      {/* Custom Run */}
      <div className="bg-gray-800 p-4 rounded space-y-4">
        <h2 className="text-lg font-semibold">Custom Input</h2>
        <textarea
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          className="w-full h-32 bg-gray-900 text-white p-3 rounded border border-gray-700 resize-none"
          placeholder="Enter custom input here..."
        />
        <button
          onClick={handleCustomRun}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded disabled:opacity-50"
          disabled={customRunLoading}
        >
          {customRunLoading ? "Running..." : "Run with Custom Input"}
        </button>
        {customOutput && (
          <div>
            <h3 className="text-md font-semibold mb-2">Output:</h3>
            <pre className="bg-black text-green-400 text-sm p-3 rounded border border-gray-700 whitespace-pre-wrap overflow-auto">
              {customOutput}
            </pre>
          </div>
        )}
      </div>

      {/* Score */}
      {!loading && isSubmitMode && (
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">
            {scorePercent === 100
              ? "✅ All test cases passed!"
              : `⚠️ Some test cases failed (${scorePercent}% passed)`}
          </h2>
          <div className="w-full bg-gray-700 h-3 rounded mb-2">
            <div
              className={`h-3 rounded ${
                scorePercent === 100 ? "bg-green-500" : "bg-red-500"
              }`}
              style={{ width: `${scorePercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Test Cases */}
      {!loading && problem.visibleTestCases?.length > 0 && (
        <div className="bg-gray-800 p-4 rounded space-y-4">
          <h2 className="text-lg font-semibold">Sample Test Cases</h2>
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
                  className={`w-full md:w-[48%] p-4 rounded border ${
                    passed === true
                      ? "border-green-500"
                      : passed === false
                      ? "border-red-500"
                      : "border-gray-600"
                  } bg-gray-700 space-y-2`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Test Case {idx + 1}</span>
                    {passed === true && (
                      <span className="bg-green-600 px-2 py-1 rounded text-sm">
                        Passed
                      </span>
                    )}
                    {passed === false && (
                      <span className="bg-red-600 px-2 py-1 rounded text-sm">
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
                  {actualOutput !== undefined && (
                    <pre className="text-sm text-blue-300">
                      <strong>Got:</strong> {actualOutput}
                    </pre>
                  )}
                  {error && (
                    <pre className="text-sm text-red-400 whitespace-pre-wrap overflow-auto">
                      <strong>Error:</strong> {error}
                    </pre>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Review */}
      {aiReview && (
        <div className="bg-gray-900 p-6 rounded-xl border border-purple-700 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-purple-400">
            💡 AI Code Review
          </h2>
          <div className="prose prose-invert max-w-none">
            <ReactMarkdown components={markdownComponents}>
              {aiReview}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorPage;
