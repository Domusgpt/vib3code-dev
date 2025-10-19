export interface CrystalButtonProps {
  readonly label: string;
  readonly onHover?: () => void;
  readonly onBlur?: () => void;
  readonly onClick?: () => void;
  readonly reducedMotion?: boolean;
}

export interface CrystalButtonApi {
  readonly element: HTMLButtonElement;
  setLabel(label: string): void;
  setActive(active: boolean): void;
}

export function createCrystalButton(props: CrystalButtonProps): CrystalButtonApi {
  const element = document.createElement("button");
  element.className = "crystal-button";
  element.textContent = props.label;
  element.tabIndex = 0;
  element.type = "button";
  element.setAttribute("aria-pressed", "false");
  element.addEventListener("mouseenter", () => props.onHover?.());
  element.addEventListener("mouseleave", () => props.onBlur?.());
  element.addEventListener("focus", () => props.onHover?.());
  element.addEventListener("blur", () => props.onBlur?.());
  element.addEventListener("click", () => props.onClick?.());

  if (!props.reducedMotion) {
    element.dataset.motion = "crystal";
  }

  return {
    element,
    setLabel(label: string) {
      element.textContent = label;
    },
    setActive(active: boolean) {
      element.classList.toggle("is-active", active);
      element.setAttribute("aria-pressed", active ? "true" : "false");
    }
  };
}
