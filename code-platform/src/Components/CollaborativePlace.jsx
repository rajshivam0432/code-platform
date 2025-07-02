import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { io } from "socket.io-client";

import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import { WebsocketProvider } from "y-websocket";

const tpl = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
  // write your code here
  return 0;
}`,
  py: `def main():
    pass
if __name__ == "__main__":
    main()`,
};

export default function CollaborativeRoom() {
  /* ───────────────────────── routing & room meta ──────────────────────── */
  const { roomId } = useParams();
  const [search] = useSearchParams();
  const isHost = search.get("host") === "1";
  const navigate = useNavigate();

  /* ───────────────────────── app‑level state ─────────────────────────── */
  const [lang, setLang] = useState("cpp");
  const [notes, setNotes] = useState("");
  const [input, setInput] = useState("");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [participants, setParticipants] = useState([]);

  /* ───────────────────────── refs ────────────────────────────────────── */
  const sock = useRef(null);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const yProviderRef = useRef(null);

  const currentUser =
    JSON.parse(localStorage.getItem("user"))?.username ||
    JSON.parse(localStorage.getItem("user"))?.email ||
    "User";

  /* ───────────────────────── socket.io join / leave ──────────────────── */
  useEffect(() => {
    const s = io(import.meta.env.VITE_SOCKET_SERVER_URL);
    sock.current = s;

    s.emit("join-room", { roomId, isHost, user: { name: currentUser } });

    s.on("room-full", () => {
      alert("Room already has 2 participants.");
      navigate("/");
    });
    s.on("session-ended", () => {
      alert("Session has ended.");
      navigate("/landing");
    });
    s.on("host-left", () => alert("Host disconnected."));
    s.on("room-info", ({ users }) => setParticipants(users));

    s.on("notes-update", (v) => setNotes(v));

    return () => s.disconnect();
  }, [roomId, isHost, navigate, currentUser]);

  /* ───────────────────────── Yjs provider (CRDT) ─────────────────────── */
  useEffect(() => {
    const ydoc = new Y.Doc();

    // <── change this URL when you deploy your own server
    const provider = new WebsocketProvider(
      "https://y-serverweb-bwckf8chd5edf7e8.centralindia-01.azurewebsites.net",
      roomId,
      ydoc
    );

    provider.awareness.setLocalStateField("user", {
      name: currentUser,
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
    });

    yProviderRef.current = provider;

    return () => provider.destroy();
  }, [roomId, currentUser]);

  /* ───────────────────────── editor mount ────────────────────────────── */
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    const yText = yProviderRef.current.doc.getText("monaco");
    if (yText.length === 0) yText.insert(0, tpl[lang]); // first user gets template

    new MonacoBinding(
      yText,
      editor.getModel(),
      new Set([editor]),
      yProviderRef.current.awareness
    );
  };

  /* ───────────────────────── misc handlers ───────────────────────────── */
  const changeNotes = (v) => {
    setNotes(v);
    localStorage.setItem(`notes-${roomId}`, v);
    sock.current?.emit("notes-change", { roomId, notes: v });
  };

  const run = async () => {
    setBusy(true);
    setOut("");
    const code = editorRef.current?.getValue() || "";
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/submit/custom`,
        { code, lang, input }
      );
      setOut(res.data.output || res.data.err || "No output");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    const yText = yProviderRef.current?.doc.getText("monaco");
    yText.delete(0, yText.length);
    yText.insert(0, tpl[lang]);
  };

  const copy = () =>
    navigator.clipboard.writeText(editorRef.current?.getValue() || "");
  const endSession = () => sock.current?.emit("end-session", roomId);
  const leaveRoom = () => navigate("/landing");

  /* ───────────────────────── render ──────────────────────────────────── */
  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen flex flex-col gap-4">
      <header className="flex justify-between">
        <h1 className="text-2xl font-bold">
          Room: <span className="text-yellow-400">{roomId}</span>
        </h1>
        <div className="flex gap-4">
          {participants.map((u, i) => (
            <span key={i} className="text-sm text-green-200">
              👤 {u || "Guest"}
            </span>
          ))}
        </div>
      </header>

      <select
        value={lang}
        onChange={(e) => setLang(e.target.value)}
        className="bg-gray-800 w-max p-1 rounded mb-2"
      >
        <option value="cpp">C++</option>
        <option value="py">Python</option>
      </select>

      <main className="flex gap-4 grow">
        {/* ── CODE ───────────────────────────── */}
        <section className="w-1/2 flex flex-col">
          <Editor
            height="100%"
            language={lang === "cpp" ? "cpp" : "python"}
            theme="vs-dark"
            onMount={handleEditorDidMount}
          />
          <div className="mt-3 flex gap-3">
            <button onClick={reset} className="bg-red-600    px-4 py-1 rounded">
              Reset
            </button>
            <button onClick={copy} className="bg-teal-600   px-4 py-1 rounded">
              Copy
            </button>
            <button
              onClick={endSession}
              className="bg-purple-700 px-4 py-1 rounded"
            >
              End
            </button>
            <button
              onClick={leaveRoom}
              className="bg-gray-600   px-4 py-1 rounded"
            >
              Leave
            </button>
          </div>
        </section>

        {/* ── NOTES / INPUT / OUTPUT ─────────── */}
        <section className="w-1/2 flex flex-col gap-3">
          <textarea
            value={notes}
            onChange={(e) => changeNotes(e.target.value)}
            className="flex-grow bg-gray-800 p-3 rounded border border-gray-700 resize-none"
            placeholder="Shared notes…"
          />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-24 bg-gray-800 p-3 rounded border border-gray-700 resize-none"
            placeholder="Custom input"
          />
          <button
            onClick={run}
            disabled={busy}
            className="bg-yellow-600 hover:bg-yellow-700 rounded py-2 disabled:opacity-50"
          >
            {busy ? "Running…" : "Run"}
          </button>
          {out && (
            <pre className="bg-black text-green-400 text-sm p-3 rounded border border-gray-700 whitespace-pre-wrap overflow-auto">
              {out}
            </pre>
          )}
        </section>
      </main>
    </div>
  );
}
