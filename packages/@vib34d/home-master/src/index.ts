export type MasterParams = Record<string, number>;
export type SectionParams = Record<string, number>;

export interface HomeMasterEvents {
  onMasterChange(listener: (params: MasterParams) => void): () => void;
}

export interface HomeMasterOptions {
  readonly syncChannel?: string;
  readonly broadcastChannelFactory?: (name: string) => BroadcastChannel;
}

interface BroadcastPayload {
  readonly type: typeof HOME_MASTER_MESSAGE_TYPE;
  readonly params: MasterParams;
  readonly sourceId: string;
  readonly timestamp: number;
}

const HOME_MASTER_MESSAGE_TYPE = "vib34d:home-master" as const;
const DEFAULT_CHANNEL_NAME = "vib34d-master";

const defaultBroadcastFactory =
  typeof globalThis.BroadcastChannel === "function"
    ? (name: string) => new globalThis.BroadcastChannel(name)
    : undefined;

function isBroadcastPayload(value: unknown): value is BroadcastPayload {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<BroadcastPayload>;
  return (
    candidate.type === HOME_MASTER_MESSAGE_TYPE &&
    typeof candidate.sourceId === "string" &&
    typeof candidate.timestamp === "number" &&
    typeof candidate.params === "object" &&
    candidate.params !== null
  );
}

export class HomeMaster implements HomeMasterEvents {
  private masterParams: MasterParams;
  private readonly listeners = new Set<(params: MasterParams) => void>();
  private readonly instanceId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  private readonly channel?: BroadcastChannel;
  private readonly channelHandler: ((event: MessageEvent<unknown>) => void) | null;
  private disposed = false;
  private readonly options: HomeMasterOptions;

  constructor(initialParams: MasterParams = {}, options: HomeMasterOptions = {}) {
    this.masterParams = { ...initialParams };
    this.options = options;

    const syncChannel = options.syncChannel ?? undefined;
    const factory = options.broadcastChannelFactory ?? defaultBroadcastFactory;

    if (syncChannel && factory) {
      try {
        this.channel = factory(syncChannel);
      } catch (error) {
        console.warn("[HomeMaster] Failed to create broadcast channel", error);
      }
    }

    if (this.channel) {
      this.channelHandler = (event: MessageEvent<unknown>) => {
        if (!isBroadcastPayload(event.data)) return;
        if (event.data.sourceId === this.instanceId) return;
        this.updateFromRemote(event.data.params);
      };
      this.channel.addEventListener("message", this.channelHandler as unknown as EventListener);
    } else {
      this.channelHandler = null;
    }
  }

  setMasterParams(params: MasterParams): void {
    this.updateParams(params, { broadcast: true });
  }

  derive(sectionKey: string, modifier: number): SectionParams {
    const derived: SectionParams = {};
    for (const [key, value] of Object.entries(this.masterParams)) {
      derived[key] = value * modifier;
    }
    derived[`${sectionKey}::modifier`] = modifier;
    return derived;
  }

  onMasterChange(listener: (params: MasterParams) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getCurrentParams(): MasterParams {
    return { ...this.masterParams };
  }

  getSyncChannel(): string | undefined {
    return this.channel?.name ?? this.options.syncChannel ?? undefined;
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.listeners.clear();
    if (this.channel && this.channelHandler) {
      this.channel.removeEventListener("message", this.channelHandler as unknown as EventListener);
      this.channel.close();
    }
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener({ ...this.masterParams });
    }
  }

  private updateParams(params: MasterParams, { broadcast }: { broadcast: boolean }): void {
    this.masterParams = { ...params };
    this.notify();
    if (broadcast) {
      this.broadcast();
    }
  }

  private updateFromRemote(params: MasterParams): void {
    this.updateParams(params, { broadcast: false });
  }

  private broadcast(): void {
    if (!this.channel) return;
    const payload: BroadcastPayload = {
      type: HOME_MASTER_MESSAGE_TYPE,
      params: { ...this.masterParams },
      sourceId: this.instanceId,
      timestamp: Date.now()
    };
    this.channel.postMessage(payload);
  }
}

export { DEFAULT_CHANNEL_NAME as DEFAULT_HOME_MASTER_CHANNEL };
