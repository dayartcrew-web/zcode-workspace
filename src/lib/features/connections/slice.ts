import type { StateCreator } from "zustand";
import type { WorkspaceState } from "@/lib/store";

export interface RemoteEnvironment {
  id: string;
  name: string;
  host: string;
  status: "online" | "offline" | "connecting";
}

export interface ConnectionsSlice {
  connections: {
    networkAccess: boolean;
    tailscaleHttps: boolean;
    t3Connect: boolean;
  };
  remoteEnvironments: RemoteEnvironment[];
  toggleConnection: (
    key: "networkAccess" | "tailscaleHttps" | "t3Connect",
  ) => void;
  addRemoteEnvironment: () => void;
  removeRemoteEnvironment: (id: string) => void;
}

export const createConnectionsSlice: StateCreator<
  WorkspaceState,
  [],
  [],
  ConnectionsSlice
> = (set) => ({
  connections: {
    networkAccess: false,
    tailscaleHttps: false,
    t3Connect: false,
  },
  remoteEnvironments: [],

  toggleConnection: (key) =>
    set((s) => ({
      connections: { ...s.connections, [key]: !s.connections[key] },
    })),

  addRemoteEnvironment: () =>
    set((s) => ({
      remoteEnvironments: [
        ...s.remoteEnvironments,
        {
          id: `env-${Date.now()}`,
          name: `Remote ${s.remoteEnvironments.length + 1}`,
          host: "user@host",
          status: "connecting" as const,
        },
      ],
    })),

  removeRemoteEnvironment: (id) =>
    set((s) => ({
      remoteEnvironments: s.remoteEnvironments.filter((e) => e.id !== id),
    })),
});
