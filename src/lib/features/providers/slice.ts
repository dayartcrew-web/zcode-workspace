import type { StateCreator } from "zustand";
import {
  seedProviders,
  type Provider,
  type ProviderEnvVar,
  type AccentColor,
} from "@/lib/providers";
import type { WorkspaceState } from "@/lib/store";

export interface ProvidersSlice {
  providers: Provider[];
  providersLastChecked: number; // epoch ms
  toggleProviderEnabled: (id: string) => void;
  toggleProviderExpanded: (id: string) => void;
  updateProvider: (id: string, patch: Partial<Provider>) => void;
  setProviderAccent: (id: string, accent: AccentColor) => void;
  addEnvVar: (id: string) => void;
  updateEnvVar: (
    id: string,
    envId: string,
    patch: Partial<ProviderEnvVar>,
  ) => void;
  removeEnvVar: (id: string, envId: string) => void;
  toggleFavoriteModel: (id: string, modelId: string) => void;
  moveModel: (id: string, modelId: string, dir: -1 | 1) => void;
  refreshProviders: () => void;
  addProvider: () => void;
}

export const createProvidersSlice: StateCreator<
  WorkspaceState,
  [],
  [],
  ProvidersSlice
> = (set) => ({
  providers: seedProviders,
  providersLastChecked: Date.now(),

  toggleProviderEnabled: (id) =>
    set((s) => ({
      providers: s.providers.map((p) =>
        p.id === id ? { ...p, enabled: !p.enabled } : p,
      ),
    })),

  toggleProviderExpanded: (id) =>
    set((s) => ({
      providers: s.providers.map((p) =>
        p.id === id ? { ...p, expanded: !p.expanded } : p,
      ),
    })),

  updateProvider: (id, patch) =>
    set((s) => ({
      providers: s.providers.map((p) =>
        p.id === id ? { ...p, ...patch } : p,
      ),
    })),

  setProviderAccent: (id, accent) =>
    set((s) => ({
      providers: s.providers.map((p) =>
        p.id === id ? { ...p, accent } : p,
      ),
    })),

  addEnvVar: (id) =>
    set((s) => ({
      providers: s.providers.map((p) =>
        p.id === id
          ? {
              ...p,
              envVars: [
                ...p.envVars,
                { id: `env-${Date.now()}`, key: "", value: "" },
              ],
            }
          : p,
      ),
    })),

  updateEnvVar: (id, envId, patch) =>
    set((s) => ({
      providers: s.providers.map((p) =>
        p.id === id
          ? {
              ...p,
              envVars: p.envVars.map((e) =>
                e.id === envId ? { ...e, ...patch } : e,
              ),
            }
          : p,
      ),
    })),

  removeEnvVar: (id, envId) =>
    set((s) => ({
      providers: s.providers.map((p) =>
        p.id === id
          ? { ...p, envVars: p.envVars.filter((e) => e.id !== envId) }
          : p,
      ),
    })),

  toggleFavoriteModel: (id, modelId) =>
    set((s) => ({
      providers: s.providers.map((p) =>
        p.id === id
          ? {
              ...p,
              models: p.models.map((m) =>
                m.id === modelId ? { ...m, favorite: !m.favorite } : m,
              ),
            }
          : p,
      ),
    })),

  moveModel: (id, modelId, dir) =>
    set((s) => ({
      providers: s.providers.map((p) => {
        if (p.id !== id) return p;
        const idx = p.models.findIndex((m) => m.id === modelId);
        if (idx === -1) return p;
        const next = idx + dir;
        if (next < 0 || next >= p.models.length) return p;
        const models = [...p.models];
        const [moved] = models.splice(idx, 1);
        models.splice(next, 0, moved);
        return { ...p, models };
      }),
    })),

  refreshProviders: () => set({ providersLastChecked: Date.now() }),

  addProvider: () =>
    set((s) => ({
      providers: [
        ...s.providers,
        {
          id: `prov-custom-${Date.now()}`,
          slug: "custom",
          name: "New Provider",
          version: undefined,
          earlyAccess: false,
          status: "disabled",
          statusDetail: "Not configured — set a binary path to begin.",
          enabled: false,
          expanded: true,
          accent: "blue",
          iconShape: "circle",
          iconBg: "bg-[oklch(0.62_0.18_255)]",
          iconText: "text-white",
          iconLabel: "N",
          displayName: "New Provider",
          binaryPath: "",
          homePath: "~/",
          homePathLabel: "HOME path",
          shadowHomePath: "~/",
          envVars: [],
          models: [],
        },
      ],
    })),
});
