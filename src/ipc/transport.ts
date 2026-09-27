import { ChildProcessWithoutNullStreams } from "child_process";
import { EventEmitter } from "events";
import { IpcMessage, IpcMessageType } from "./messages";

/**
 * Section 51 — IPC Rules.
 *
 * Wraps a spawned child process's stdio in the same newline-delimited
 * JSON protocol implemented on the companion side in
 * companion/ipc/protocol.js. The two files must be kept in sync; the
 * message shape is defined once, in messages.ts.
 *
 * Emits "message" with a parsed IpcMessage for each line received on
 * stdout, and "protocolError" for lines that fail to parse (logged and
 * skipped, never thrown — Section 34, Recovery).
 */
export class ChildProcessTransport extends EventEmitter {
  private buffer = "";

  constructor(private readonly child: ChildProcessWithoutNullStreams) {
    super();
    this.child.stdout.setEncoding("utf8");
    this.child.stdout.on("data", (chunk: string) => this.onData(chunk));
    this.child.stderr.setEncoding("utf8");
    this.child.stderr.on("data", (chunk: string) => this.emit("stderr", chunk));
  }

  private onData(chunk: string): void {
    this.buffer += chunk;
    let newlineIndex: number;
    while ((newlineIndex = this.buffer.indexOf("\n")) !== -1) {
      const line = this.buffer.slice(0, newlineIndex).trim();
      this.buffer = this.buffer.slice(newlineIndex + 1);
      if (!line) continue;
      try {
        const message = JSON.parse(line) as IpcMessage;
        this.emit("message", message);
      } catch (err) {
        this.emit("protocolError", line);
      }
    }
  }

  send<TPayload>(type: IpcMessageType, payload: TPayload): void {
    const message: IpcMessage<TPayload> = {
      version: "1.0",
      type,
      timestamp: Date.now(),
      payload,
    };
    this.child.stdin.write(JSON.stringify(message) + "\n");
  }

  /** Resolves with the first message of the given type, or rejects on timeout. */
  waitFor(type: IpcMessageType, timeoutMs: number): Promise<IpcMessage> {
    return new Promise((resolve, reject) => {
      const onMessage = (message: IpcMessage) => {
        if (message.type === type) {
          cleanup();
          resolve(message);
        }
      };
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error(`Timed out waiting for "${type}" after ${timeoutMs}ms`));
      }, timeoutMs);
      const cleanup = () => {
        clearTimeout(timer);
        this.off("message", onMessage);
      };
      this.on("message", onMessage);
    });
  }
}
