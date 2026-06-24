// Keybinding definitions + seed data for the Keybindings settings page

export type BindingStatus = "ok" | "warning";

export interface Keybinding {
  id: string;
  command: string;
  keys: string; // e.g. "Ctrl N", "Ctrl ⇧ O"
  when: string; // context expression, e.g. "!terminalFocus", "Always"
  status: BindingStatus;
}

export const seedKeybindings: Keybinding[] = [
  { id: "kb-1", command: "Chat: New", keys: "Ctrl N", when: "!terminalFocus", status: "ok" },
  { id: "kb-2", command: "Chat: New", keys: "Ctrl ⇧ O", when: "!terminalFocus", status: "ok" },
  { id: "kb-3", command: "Chat: New Local", keys: "Ctrl ⇧ N", when: "!terminalFocus", status: "ok" },
  { id: "kb-4", command: "Command Palette: Toggle", keys: "Ctrl K", when: "!terminalFocus", status: "ok" },
  { id: "kb-5", command: "Diff: Toggle", keys: "Ctrl D", when: "!terminalFocus", status: "ok" },
  { id: "kb-6", command: "Editor: Open Favorite", keys: "Ctrl O", when: "Always", status: "ok" },
  { id: "kb-7", command: "Model Picker: Jump: 1", keys: "Ctrl 1", when: "modelPickerOpen", status: "warning" },
  { id: "kb-8", command: "Model Picker: Jump: 2", keys: "Ctrl 2", when: "modelPickerOpen", status: "warning" },
  { id: "kb-9", command: "Model Picker: Jump: 3", keys: "Ctrl 3", when: "modelPickerOpen", status: "warning" },
  { id: "kb-10", command: "Model Picker: Jump: 4", keys: "Ctrl 4", when: "modelPickerOpen", status: "warning" },
  { id: "kb-11", command: "Model Picker: Jump: 5", keys: "Ctrl 5", when: "modelPickerOpen", status: "warning" },
  { id: "kb-12", command: "Model Picker: Jump: 6", keys: "Ctrl 6", when: "modelPickerOpen", status: "warning" },
  { id: "kb-13", command: "Model Picker: Jump: 7", keys: "Ctrl 7", when: "modelPickerOpen", status: "warning" },
  { id: "kb-14", command: "Model Picker: Jump: 8", keys: "Ctrl 8", when: "modelPickerOpen", status: "warning" },
  { id: "kb-15", command: "Model Picker: Jump: 9", keys: "Ctrl 9", when: "modelPickerOpen", status: "warning" },
  { id: "kb-16", command: "Model Picker: Toggle", keys: "Ctrl ⇧ M", when: "!terminalFocus", status: "ok" },
  { id: "kb-17", command: "Terminal: Close", keys: "Ctrl W", when: "terminalFocus", status: "ok" },
  { id: "kb-18", command: "Terminal: New", keys: "Ctrl N", when: "terminalFocus", status: "ok" },
  { id: "kb-19", command: "Terminal: Split", keys: "Ctrl D", when: "terminalFocus", status: "ok" },
];
