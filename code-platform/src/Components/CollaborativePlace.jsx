// CollaborativeRoom.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import axios from "axios";
import { io } from "socket.io-client";

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
  const [code, setCode] = useState(tpl.cpp);
  const [notes, setNotes] = useState("");
  const [input, setInput] = useState("");
  const [out, setOut] = useState("");
  const [busy, setBusy] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [remoteCursors, setRemoteCursors] = useState({});

  const sock = useRef(null);
  const muteCode = useRef(false);
  const muteNotes = useRef(false);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const cursorTimeouts = useRef({});

  useEffect(() => {
    setCode(localStorage.getItem(`code-${roomId}-${lang}`) || tpl[lang]);
    setNotes(localStorage.getItem(`notes-${roomId}`) || "");
  }, [roomId, lang]);

  useEffect(() => {
    const s = io(import.meta.env.VITE_SOCKET_SERVER_URL);
    const currentUser = JSON.parse(localStorage.getItem("user"));

    sock.current = s;
    s.emit("join-room", {
      roomId,
      isHost,
      user: {
        name: currentUser?.username || currentUser?.email,
      },
    });

    s.on("room-full", () => {
      alert("Room already has 2 participants.");
      s.disconnect();
      navigate("/");
    });

    s.on("session-ended", () => {
      alert("Session has ended.");
      s.disconnect();
      navigate("/landing");
    });

    s.on("host-left", () => alert("Host disconnected."));

    s.on("room-info", ({ users }) => setParticipants(users));

    s.on("code-update", (v) => {
      if (v !== code) {
        muteCode.current = true;
        setCode(v);
        setTimeout(() => (muteCode.current = false), 20);
      }
    });

    s.on("notes-update", (v) => {
      if (v !== notes) {
        muteNotes.current = true;
        setNotes(v);
        setTimeout(() => (muteNotes.current = false), 20);
      }
    });

    s.on("cursor-update", ({ user, position }) => {
      setRemoteCursors((prev) => {
        const next = { ...prev, [user]: position };

        if (cursorTimeouts.current[user])
          clearTimeout(cursorTimeouts.current[user]);
        cursorTimeouts.current[user] = setTimeout(() => {
          setRemoteCursors((p) => {
            const copy = { ...p };
            delete copy[user];
            return copy;
          });
        }, 1500);

        return next;
      });
    });

    return () => s.disconnect();
  }, [roomId, code, notes, isHost, navigate]);

  const changeCode = (v) => {
    setCode(v);
    localStorage.setItem(`code-${roomId}-${lang}`, v);
    if (sock.current && !muteCode.current)
      sock.current.emit("code-change", { roomId, code: v });
  };

  const changeNotes = (v) => {
    setNotes(v);
    localStorage.setItem(`notes-${roomId}`, v);
    if (sock.current && !muteNotes.current)
      sock.current.emit("notes-change", { roomId, notes: v });
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    const user = JSON.parse(localStorage.getItem("user"))?.username || "User";

    editor.onDidChangeCursorPosition((e) => {
      sock.current.emit("cursor-move", {
        roomId,
        user,
        position: e.position,
      });
    });

    editor.onDidChangeModelContent(() => {
      const position = editor.getPosition();
      sock.current.emit("cursor-move", {
        roomId,
        user,
        position,
      });
    });
  };

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const editor = editorRef.current;
    const monaco = monacoRef.current;

    const decorations = Object.entries(remoteCursors).map(([user, pos]) => ({
      range: new monaco.Range(
        pos.lineNumber,
        pos.column,
        pos.lineNumber,
        pos.column
      ),
      options: {
        className: "remote-cursor",
        hoverMessage: { value: `👤 ${user}` },
      },
    }));

    editor.deltaDecorations([], decorations);
  }, [remoteCursors]);

  const run = async () => {
    setBusy(true);
    setOut("");
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

  const reset = () => changeCode(tpl[lang]);
  const copy = () => navigator.clipboard.writeText(code);
  const endSession = () => sock.current?.emit("end-session", roomId);
  const leaveRoom = () => navigate("/landing");

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Room: <span className="text-yellow-400">{roomId}</span>
        </h1>
        <div className="flex gap-4">
          {participants.map((user, idx) => (
            <span key={idx} className="text-sm text-green-200">
              👤 {user || "Guest"}
            </span>
          ))}
        </div>
      </div>
      <div className="mb-2 flex gap-2">
        <select
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          className="bg-gray-800 p-1 rounded"
        >
          <option value="cpp">C++</option>
          <option value="py">Python</option>
        </select>
      </div>

      <div className="flex gap-4 grow">
        <div className="w-1/2 flex flex-col">
          <Editor
            height="100%"
            language={lang === "cpp" ? "cpp" : "python"}
            theme="vs-dark"
            value={code}
            onChange={changeCode}
            onMount={handleEditorDidMount}
          />

          <div className="mt-3 flex gap-3">
            <button onClick={reset} className="bg-red-600 px-4 py-1 rounded">
              Reset
            </button>
            <button onClick={copy} className="bg-teal-600 px-4 py-1 rounded">
              Copy
            </button>
            <button
              onClick={endSession}
              className="bg-purple-700 px-4 py-1 rounded"
            >
              End Session
            </button>
            <button
              onClick={leaveRoom}
              className="bg-gray-600 px-4 py-1 rounded"
            >
              Leave
            </button>
          </div>
        </div>

        <div className="w-1/2 flex flex-col gap-3">
          <textarea
            value={notes}
            onChange={(e) => changeNotes(e.target.value)}
            className="flex-grow bg-gray-800 p-3 rounded border border-gray-700 resize-none"
            placeholder="Shared notes / question…"
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
        </div>
      </div>
    </div>
  );
}
