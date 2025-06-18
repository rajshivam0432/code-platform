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

  // Safely extract all tags
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
    <div className="pt-8 min-h-screen bg-gray-900 text-white px-4 py-10 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-6">Problem Dashboard</h1>

      <div className="w-full max-w-6xl mb-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Search by title or description..."
            className="px-4 py-2 rounded w-full sm:w-1/3 text-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-4 py-2 rounded text-black"
          >
            <option value="">All Difficulty</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {allTags.map((tag, idx) => (
            <button
              key={idx}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-sm border 
                ${
                  selectedTags.includes(tag)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-800 border-gray-300"
                }
              `}
            >
              {tag}
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
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="w-full max-w-6xl overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full text-sm text-left text-black">
          <thead className="bg-gray-100 text-xs uppercase text-gray-700">
            <tr>
              <th className="px-6 py-4 font-semibold">Title</th>
              <th className="px-6 py-4 font-semibold">Description</th>
              <th className="px-6 py-4 font-semibold">Difficulty</th>
              <th className="px-6 py-4 font-semibold">Tags</th>
              <th className="px-6 py-4 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProblems.length > 0 ? (
              filteredProblems.map((problem) => (
                <tr key={problem._id} className="border-b">
                  <td className="px-6 py-4 text-blue-600 font-semibold hover:underline">
                    {problem.title}
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {problem.description?.length > 100
                      ? problem.description.slice(0, 100) + "..."
                      : problem.description}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-white text-xs font-medium px-3 py-1 rounded-full
                      ${
                        problem.difficulty === "Easy"
                          ? "bg-green-500"
                          : problem.difficulty === "Medium"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }
                    `}
                    >
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex flex-wrap gap-1">
                    {(problem.tags || []).map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </td>
                  <td className="px-6 py-4">
                    <Link to={`/editor/${problem._id}`}>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Solve
                      </button>
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-6">
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
