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

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/api/problems/${id}`, {
        withCredentials: true, // ✅ Send cookies/session
      })
      .then((res) => setProblem(res.data))
      .catch((err) => console.error(err));
  }, [id]);

  const handleSubmit = async () => {
    setLoading(true);
    setResult([]);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/submit`,
        {
          code,
          language: "cpp",
          problemId: id,
        },
        {
          withCredentials: true, // ✅ Send credentials in POST
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

      <MonacoEditor
        height="400px"
        defaultLanguage="cpp"
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value)}
      />

      <button
        onClick={handleSubmit}
        className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Compiling..." : "Submit"}
      </button>

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

      {!loading && result.length > 0 && (
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

          <div className="space-y-4">
            {result.map((r, idx) => (
              <div
                key={idx}
                className="p-4 bg-gray-700 rounded flex flex-col space-y-1"
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
                <pre className="text-sm text-gray-300">
                  <strong>Input:</strong> {r.input}
                </pre>
                <pre className="text-sm text-green-300">
                  <strong>Expected:</strong> {r.expectedOutput}
                </pre>
                <pre className="text-sm text-blue-300">
                  <strong>Got:</strong> {r.actualOutput}
                </pre>
                {r.error && (
                  <pre className="text-sm text-red-400">
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
