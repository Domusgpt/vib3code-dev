import type { HomeMaster, MasterParams } from "@vib34d/home-master";

export interface EditorBridgeOptions {
  readonly target: HTMLElement;
}

export type EditorChangeHandler = (params: MasterParams) => void;

export class EditorBridge {
  private readonly homeMaster: HomeMaster;
  private readonly target: HTMLElement;
  private readonly inputs = new Map<string, HTMLInputElement>();

  constructor(homeMaster: HomeMaster, options: EditorBridgeOptions) {
    this.homeMaster = homeMaster;
    this.target = options.target;
    this.homeMaster.onMasterChange((params) => this.updateInputs(params));
    this.render(homeMaster.getCurrentParams());
  }

  registerField(key: string, initialValue: number, onChange?: EditorChangeHandler): void {
    if (this.inputs.has(key)) return;
    const label = document.createElement("label");
    label.textContent = key;
    label.className = "editor-field";

    const input = document.createElement("input");
    input.type = "range";
    input.min = "0";
    input.max = "100";
    input.step = "1";
    input.value = initialValue.toString();
    input.addEventListener("input", () => {
      const params = { ...this.homeMaster.getCurrentParams(), [key]: Number(input.value) };
      this.homeMaster.setMasterParams(params);
      onChange?.(params);
    });

    label.appendChild(input);
    this.target.appendChild(label);
    this.inputs.set(key, input);
  }

  private render(params: MasterParams): void {
    Object.entries(params).forEach(([key, value]) => {
      this.registerField(key, value);
    });
  }

  private updateInputs(params: MasterParams): void {
    for (const [key, input] of this.inputs) {
      const value = params[key];
      if (typeof value === "number") {
        input.value = value.toString();
      }
    }
  }
}
