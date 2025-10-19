import { describe, expect, it } from "vitest";

import { HomeMaster, type MasterParams } from "./index.js";

class FakeBroadcastChannel implements BroadcastChannel {
  readonly name: string;
  onmessage: ((this: BroadcastChannel, ev: MessageEvent<unknown>) => unknown) | null = null;
  onmessageerror: ((this: BroadcastChannel, ev: MessageEvent<unknown>) => unknown) | null = null;

  private readonly listeners = new Set<(event: MessageEvent<unknown>) => void>();
  private closed = false;
  private readonly registry: Map<string, Set<FakeBroadcastChannel>>;

  constructor(name: string, registry: Map<string, Set<FakeBroadcastChannel>>) {
    this.name = name;
    this.registry = registry;
    if (!this.registry.has(name)) {
      this.registry.set(name, new Set());
    }
    this.registry.get(name)!.add(this);
  }

  postMessage(message: unknown): void {
    if (this.closed) {
      throw new Error("Broadcast channel already closed");
    }
    const peers = this.registry.get(this.name);
    if (!peers) return;
    for (const peer of peers) {
      if (peer === this) continue;
      const event = createMessageEvent(message);
      peer.dispatch(event);
    }
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    const peers = this.registry.get(this.name);
    peers?.delete(this);
    if (peers && peers.size === 0) {
      this.registry.delete(this.name);
    }
    this.listeners.clear();
    this.onmessage = null;
    this.onmessageerror = null;
  }

  addEventListener(type: string, listener: EventListenerOrEventListenerObject | null): void {
    if (type !== "message" || !listener) return;
    if (typeof listener === "function") {
      this.listeners.add(listener as (event: MessageEvent<unknown>) => void);
    } else if (typeof listener === "object" && "handleEvent" in listener && typeof listener.handleEvent === "function") {
      const bound = (event: MessageEvent<unknown>) => listener.handleEvent(event);
      this.listeners.add(bound);
    }
  }

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null): void {
    if (type !== "message" || !listener) return;
    if (typeof listener === "function") {
      this.listeners.delete(listener as (event: MessageEvent<unknown>) => void);
    }
  }

  dispatchEvent(_event: Event): boolean {
    return true;
  }

  private dispatch(event: MessageEvent<unknown>): void {
    for (const listener of this.listeners) {
      listener(event);
    }
    this.onmessage?.call(this, event);
  }
}

function createMessageEvent(data: unknown): MessageEvent<unknown> {
  if (typeof MessageEvent === "function") {
    return new MessageEvent("message", { data });
  }
  return { data } as MessageEvent<unknown>;
}

function createBroadcastFactory() {
  const registry = new Map<string, Set<FakeBroadcastChannel>>();
  return (name: string) => new FakeBroadcastChannel(name, registry);
}

function waitForPropagation(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

describe("HomeMaster synchronization", () => {
  it("propagates parameter updates across broadcast listeners", async () => {
    const factory = createBroadcastFactory();
    const masterA = new HomeMaster({ baseScale: 10 }, { syncChannel: "sync", broadcastChannelFactory: factory });
    const masterB = new HomeMaster({}, { syncChannel: "sync", broadcastChannelFactory: factory });

    const received: MasterParams[] = [];
    masterB.onMasterChange((params) => {
      received.push(params);
    });

    masterA.setMasterParams({ baseScale: 24, luminance: 6 });
    await waitForPropagation();

    expect(received).toHaveLength(1);
    expect(received[0]).toEqual({ baseScale: 24, luminance: 6 });

    masterA.dispose();
    masterB.dispose();
  });

  it("ignores echoes from the originating instance", async () => {
    const factory = createBroadcastFactory();
    const masterA = new HomeMaster({ baseScale: 10 }, { syncChannel: "echo", broadcastChannelFactory: factory });
    const masterB = new HomeMaster({}, { syncChannel: "echo", broadcastChannelFactory: factory });

    let aUpdates = 0;
    masterA.onMasterChange(() => {
      aUpdates += 1;
    });

    masterB.setMasterParams({ baseScale: 32 });
    await waitForPropagation();

    expect(aUpdates).toBe(1);

    masterA.dispose();
    masterB.dispose();
  });

  it("stops reacting to broadcasts after disposal", async () => {
    const factory = createBroadcastFactory();
    const masterA = new HomeMaster({ baseScale: 10 }, { syncChannel: "dispose", broadcastChannelFactory: factory });
    const masterB = new HomeMaster({}, { syncChannel: "dispose", broadcastChannelFactory: factory });

    const received: MasterParams[] = [];
    masterA.onMasterChange((params) => {
      received.push(params);
    });

    masterA.dispose();
    masterB.setMasterParams({ baseScale: 48 });
    await waitForPropagation();

    expect(received).toHaveLength(0);

    masterB.dispose();
  });
});
