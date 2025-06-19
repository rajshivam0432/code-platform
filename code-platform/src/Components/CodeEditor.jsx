import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";

const EditorPage = () => {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("// Write your C++ code here");
  const [result, setResult] = useState([]);
  const [scorePercent, setScorePercent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isSubmitMode, setIsSubmitMode] = useState(false); // 👈 tracks mode

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/problems/${id}`, {
        withCredentials: true,
      })
      .then((res) => setProblem(res.data))
      .catch((err) => console.error(err));
  }, [id]);

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

  return problem ? (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4">{problem.title}</h1>
      <p className="mb-4 text-gray-300">{problem.description}</p>

      {/* Editor */}
      <MonacoEditor
        height="400px"
        defaultLanguage="cpp"
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value)}
      />

      {/* Run & Submit Buttons */}
      <div className="flex space-x-4 mt-6">
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
      </div>

      {/* Loading Bar */}
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

      {/* Score Bar - Only on 100% Submit */}
      {!loading && isSubmitMode && scorePercent === 100 && (
        <div className="mt-6 bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">
            ✅ Score: {scorePercent}% of test cases passed
          </h2>
          <div className="w-full bg-gray-700 h-3 rounded mb-6">
            <div
              className="bg-green-500 h-3 rounded"
              style={{ width: `${scorePercent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Test Case Results */}
      {!loading && result.length > 0 && (
        <div className="mt-6 bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-4">Test Case Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.map((r, idx) => (
              <div
                key={idx}
                className="p-4 bg-gray-700 rounded flex flex-col space-y-2"
              >
                <div className="flex justify-between items-center">
                  <p className="font-semibold">Test Case #{idx + 1}</p>
                  <span
                    className={`text-sm font-semibold px-2 py-1 rounded ${
                      r.passed ? "bg-green-600" : "bg-red-600"
                    }`}
                  >
                    {r.passed ? "Passed ✅" : "Failed ❌"}
                  </span>
                </div>
                <pre className="text-sm text-gray-300 overflow-auto">
                  <strong>Input:</strong> {r.input}
                </pre>
                <pre className="text-sm text-green-300 overflow-auto">
                  <strong>Expected:</strong> {r.expectedOutput}
                </pre>
                <pre className="text-sm text-blue-300 overflow-auto">
                  <strong>Got:</strong> {r.actualOutput}
                </pre>
                {r.error && (
                  <pre className="text-sm text-red-400 overflow-auto">
                    <strong>Error:</strong> {r.error}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  ) : (
    <p className="text-white p-4">Loading...</p>
  );
};

export default EditorPage;
