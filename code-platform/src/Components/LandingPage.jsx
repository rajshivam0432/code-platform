import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function LandingPage() {
  const nav = useNavigate();
  const [room, setRoom] = useState("");

  const createSession = () => {
    const id = Math.random().toString(36).slice(2, 8); // e.g. "5f3k2a"
    nav(`/room/${id}?host=1`);
  };

  const joinSession = () => {
    const clean = room.trim();
    if (clean) nav(`/room/${clean}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold">Live Code Interview</h1>

      <button
        onClick={createSession}
        className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded text-lg"
      >
        ➕ Start New Session
      </button>

      <div className="flex gap-2 mt-6">
        <input
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          placeholder="Enter room id…"
          className="bg-gray-800 p-2 rounded border border-gray-700 w-48"
        />
        <button
          onClick={joinSession}
          className="bg-green-600 hover:bg-green-700 px-4 rounded"
        >
          Join
        </button>
      </div>
    </div>
  );
}
