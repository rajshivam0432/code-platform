import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ProblemDashboard = () => {
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axios
      .get(import.meta.env.VITE_API_BASE_URL + "/api/problems")
      .then((res) => {
        setProblems(res.data);
        setFilteredProblems(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    filterProblems();
  }, [selectedTags, difficultyFilter, searchTerm, problems]);

  const allTags = Array.from(new Set(problems.flatMap((p) => p.tags || [])));

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filterProblems = () => {
    let filtered = [...problems];

    if (selectedTags.length > 0) {
      filtered = filtered.filter((problem) =>
        selectedTags.every((tag) => (problem.tags || []).includes(tag))
      );
    }

    if (difficultyFilter) {
      filtered = filtered.filter(
        (problem) =>
          (problem.difficulty || "").toLowerCase() ===
          difficultyFilter.toLowerCase()
      );
    }

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter(
        (problem) =>
          (problem.title || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (problem.description || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProblems(filtered);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white px-4 py-10 flex flex-col items-center font-sans">
      <h1 className="text-5xl font-extrabold mb-10 text-cyan-400 drop-shadow-lg tracking-wide">
        🧠 ByteBattle Problem Dashboard
      </h1>

      {/* Filters */}
      <div className="w-full max-w-6xl mb-6 space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="text"
            placeholder="🔍 Search problems..."
            className="px-5 py-3 rounded-lg w-full sm:w-1/3 text-black font-medium shadow-lg focus:outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-4 py-3 rounded-lg text-black font-medium shadow-lg"
          >
            <option value="">🎯 All Difficulty</option>
            <option value="Easy">🟢 Easy</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Hard">🔴 Hard</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          {allTags.map((tag, idx) => (
            <button
              key={idx}
              onClick={() => toggleTag(tag)}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition-all duration-200 
                ${
                  selectedTags.includes(tag)
                    ? "bg-cyan-600 text-white border-cyan-600"
                    : "bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-200"
                }`}
            >
              #{tag}
            </button>
          ))}
        </div>

        {(selectedTags.length > 0 || difficultyFilter || searchTerm.trim()) && (
          <button
            onClick={() => {
              setSelectedTags([]);
              setDifficultyFilter("");
              setSearchTerm("");
            }}
            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow"
          >
            ❌ Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      <div className="w-full max-w-6xl overflow-x-auto bg-[#1e293b] rounded-lg shadow-xl border border-[#334155]">
        <table className="min-w-full text-sm text-left text-white">
          <thead className="bg-[#0f172a] text-xs uppercase text-gray-400 tracking-wider">
            <tr>
              <th className="px-6 py-4 font-bold">Title</th>
              <th className="px-6 py-4 font-bold">Description</th>
              <th className="px-6 py-4 font-bold">Difficulty</th>
              <th className="px-6 py-4 font-bold">Tags</th>
              <th className="px-6 py-4 font-bold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProblems.length > 0 ? (
              filteredProblems.map((problem) => (
                <tr
                  key={problem._id}
                  className="border-b border-[#334155] hover:bg-[#0f172a] transition"
                >
                  <td className="px-6 py-4 text-cyan-400 font-semibold hover:underline">
                    {problem.title}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {problem.description?.length > 90
                      ? problem.description.slice(0, 90) + "..."
                      : problem.description}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-white text-xs font-bold px-3 py-1 rounded-full shadow
                      ${
                        problem.difficulty === "Easy"
                          ? "bg-green-600"
                          : problem.difficulty === "Medium"
                          ? "bg-yellow-500 text-black"
                          : "bg-red-600"
                      }
                    `}
                    >
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex flex-wrap gap-2">
                    {(problem.tags || []).map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/editor/${problem._id}`}>
                      <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-4 py-2 rounded-lg shadow">
                        🚀 Solve
                      </button>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-400">
                  No problems found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProblemDashboard;
