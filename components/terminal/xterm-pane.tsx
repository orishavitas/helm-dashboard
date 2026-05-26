"use client";

import { AttachAddon } from "@xterm/addon-attach";
import { FitAddon } from "@xterm/addon-fit";
import { XTerm } from "react-xtermjs";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

type ConnectionState = "connecting" | "connected" | "closed" | "error";

export function XtermPane({ sessionId }: { sessionId: string }) {
  const fitAddon = useMemo(() => new FitAddon(), []);
  const [attachAddon, setAttachAddon] = useState<AttachAddon | null>(null);
  const [state, setState] = useState<ConnectionState>("connecting");
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const socket = new WebSocket(`${protocol}://${window.location.host}/ws/terminal/${encodeURIComponent(sessionId)}`);
    socket.binaryType = "arraybuffer";
    const nextAttachAddon = new AttachAddon(socket);

    socketRef.current = socket;
    setAttachAddon(nextAttachAddon);
    setState("connecting");

    socket.addEventListener("open", () => setState("connected"));
    socket.addEventListener("close", () => setState("closed"));
    socket.addEventListener("error", () => setState("error"));

    return () => {
      nextAttachAddon.dispose();
      socket.close();
      socketRef.current = null;
    };
  }, [sessionId]);

  useEffect(() => {
    if (!attachAddon) {
      return;
    }

    const resize = () => {
      fitAddon.fit();
      const dimensions = fitAddon.proposeDimensions();
      if (dimensions && socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: "resize", cols: dimensions.cols, rows: dimensions.rows }));
      }
    };

    const timeout = window.setTimeout(resize, 80);
    window.addEventListener("resize", resize);

    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("resize", resize);
    };
  }, [attachAddon, fitAddon]);

  return (
    <section className="flex min-h-[520px] flex-col overflow-hidden rounded-lg border border-zinc-800 bg-black">
      <div className="flex h-11 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-3">
        <div className="flex items-center gap-2">
          <span className={statusClassName(state)} />
          <span className="text-sm font-medium text-zinc-200">PowerShell</span>
          <span className="text-xs text-zinc-500">{sessionId}</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          className="h-8 px-2"
          onClick={() => {
            socketRef.current?.close();
          }}
        >
          Disconnect
        </Button>
      </div>
      <div className="min-h-0 flex-1 p-3">
        {attachAddon ? (
          <XTerm
            className="h-full min-h-[470px] overflow-hidden rounded bg-black"
            addons={[attachAddon, fitAddon]}
            options={{
              cursorBlink: true,
              fontFamily: "Cascadia Mono, Consolas, ui-monospace, SFMono-Regular, monospace",
              fontSize: 13,
              letterSpacing: 0,
              theme: {
                background: "#050505",
                foreground: "#e4e4e7",
                cursor: "#10b981",
                selectionBackground: "#334155",
              },
            }}
          />
        ) : (
          <div className="grid min-h-[470px] place-items-center text-sm text-zinc-500">Connecting terminal</div>
        )}
      </div>
    </section>
  );
}

function statusClassName(state: ConnectionState) {
  const base = "h-2.5 w-2.5 rounded-full";
  if (state === "connected") {
    return `${base} bg-emerald-400`;
  }
  if (state === "error") {
    return `${base} bg-red-400`;
  }
  if (state === "closed") {
    return `${base} bg-zinc-600`;
  }
  return `${base} bg-amber-400`;
}
