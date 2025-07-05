import React, { useEffect, useRef, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { io } from "socket.io-client";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import { WebsocketProvider } from "y-websocket";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const { roomId } = useParams();
  const [search] = useSearchParams();
  const isHost = search.get("host") === "1";
  const navigate = useNavigate();

  const [lang, setLang] = useState("cpp");
  const [notes, setNotes] = useState("");
  const [input, setInput] = useState("");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [participants, setParticipants] = useState([]);

  const sock = useRef(null);
  const editorRef = useRef(null);
  const notesRef = useRef(null);
  const monacoRef = useRef(null);
  const yProviderRef = useRef(null);

  if (!localStorage.getItem("userId")) {
    localStorage.setItem("userId", Math.random().toString(36).substring(2));
  }

  const currentUser = useMemo(() => {
    return {
      id: localStorage.getItem("userId"),
      name:
        JSON.parse(localStorage.getItem("user"))?.username ||
        JSON.parse(localStorage.getItem("user"))?.email ||
        "User",
    };
  }, []);

  useEffect(() => {
    const s = io(import.meta.env.VITE_SOCKET_SERVER_URL);
    sock.current = s;

    s.emit("join-room", { roomId, isHost, user: { name: currentUser.name } });

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
  }, [roomId, isHost, navigate, currentUser.name]);

  useEffect(() => {
    const ydoc = new Y.Doc();
    const provider = new WebsocketProvider(
      import.meta.env.VITE_YJS_SERVER_URL,
      roomId,
      ydoc
    );

    provider.awareness.setLocalStateField("user", {
      id: currentUser.id,
      name: currentUser.name,
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
    });

    yProviderRef.current = provider;

    return () => provider.destroy();
  }, [roomId, currentUser]);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    const yText = yProviderRef.current.doc.getText("monaco");
    const awareness = yProviderRef.current.awareness;
    const numberOfPeers = awareness.getStates().size;

    if (yText.length === 0 && numberOfPeers === 1) {
      yText.insert(0, tpl[lang]);
    }

    new MonacoBinding(yText, editor.getModel(), new Set([editor]), awareness);
  };

  const changeNotes = (v) => {
    setNotes(v);
    localStorage.setItem(`notes-${roomId}`, v);
    sock.current?.emit("notes-change", { roomId, notes: v });
  };

  const copyRoomLink = () => {
    const baseUrl = window.location.origin + "/room/" + roomId;
    navigator.clipboard.writeText(baseUrl).then(() => {
      toast.success("Room link copied to clipboard!");
    });
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
  const copyNotes = () =>
    navigator.clipboard.writeText(notesRef.current?.value || "");
  const endSession = () => sock.current?.emit("end-session", roomId);
  const leaveRoom = () => navigate("/landing");

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen flex flex-col gap-4">
      <ToastContainer />
      <header className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            Room: <span className="text-yellow-400">{roomId}</span>
          </h1>
          <div className="text-sm text-green-300 flex gap-3 mt-1">
            {participants.map((u, i) => (
              <span key={i}>👤 {u || "Guest"}</span>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="bg-gray-800 p-2 rounded text-white"
          >
            <option value="cpp">C++</option>
            <option value="py">Python</option>
          </select>
          <button
            onClick={copyRoomLink}
            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded"
          >
            🔗 Share Room Link
          </button>
        </div>
      </header>

      <main className="flex flex-col lg:flex-row gap-4 grow">
        <section className="lg:w-1/2 flex flex-col">
          <Editor
            height="60vh"
            language={lang === "cpp" ? "cpp" : "python"}
            theme="vs-dark"
            onMount={handleEditorDidMount}
          />
          <div className="flex gap-3 mt-3 flex-wrap">
            <button onClick={reset} className="bg-red-600 px-4 py-2 rounded">
              Reset
            </button>
            <button onClick={copy} className="bg-teal-600 px-4 py-2 rounded">
              Copy Code
            </button>
            <button
              onClick={endSession}
              className="bg-purple-700 px-4 py-2 rounded"
            >
              End Session
            </button>
            <button
              onClick={leaveRoom}
              className="bg-gray-700 px-4 py-2 rounded"
            >
              Leave Room
            </button>
          </div>
        </section>

        <section className="lg:w-1/2 flex flex-col gap-3">
          <textarea
            ref={notesRef}
            value={notes}
            onChange={(e) => changeNotes(e.target.value)}
            className="h-40 bg-gray-800 p-3 rounded border border-gray-700 resize-none"
            placeholder="Shared notes..."
          />
          <button
            onClick={copyNotes}
            className="bg-teal-600 px-4 py-2 rounded w-fit"
          >
            Copy Notes
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-24 bg-gray-800 p-3 rounded border border-gray-700 resize-none"
            placeholder="Custom input"
          />

          <button
            onClick={run}
            disabled={busy}
            className="bg-yellow-600 hover:bg-yellow-700 rounded py-2 px-4 w-fit disabled:opacity-60"
          >
            {busy ? "Running..." : "Run Code"}
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
