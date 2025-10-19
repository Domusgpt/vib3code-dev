import { defaultConfig } from "@vib34d/core";
import { HomeMaster, DEFAULT_HOME_MASTER_CHANNEL } from "@vib34d/home-master";
import { EditorBridge } from "@vib34d/editor";

const root = document.getElementById("app");
if (!root) throw new Error("Missing #app container");

const container = document.createElement("div");
container.className = "editor-shell";
root.appendChild(container);

const header = document.createElement("header");
header.innerHTML = `<h1>VIB34D Editor</h1>`;
container.appendChild(header);

const syncChannel = new URLSearchParams(window.location.search).get("syncChannel") ?? DEFAULT_HOME_MASTER_CHANNEL;
const master = new HomeMaster({ baseScale: 42, luminance: 12, velocity: 18 }, { syncChannel });
window.VIB34DSyncChannel = master.getSyncChannel();

const status = document.createElement("section");
status.className = "editor-status";
status.innerHTML = `
  <p>Broadcast channel: <code>${syncChannel}</code></p>
`;

const previewLink = document.createElement("a");
previewLink.className = "editor-preview-link";
previewLink.href = buildPreviewHref(syncChannel);
previewLink.target = "_blank";
previewLink.rel = "noopener noreferrer";
previewLink.textContent = "Launch synchronized demo";
status.appendChild(previewLink);

container.appendChild(status);

const fieldHost = document.createElement("section");
fieldHost.className = "editor-fields";
container.appendChild(fieldHost);

const bridge = new EditorBridge(master, { target: fieldHost });

Object.keys(master.getCurrentParams()).forEach((key) => {
  bridge.registerField(key, master.getCurrentParams()[key]);
});

const preview = document.createElement("section");
preview.className = "editor-preview";
preview.innerHTML = `
  <h2>Runtime Config</h2>
  <pre id="config-preview"></pre>
`;
container.appendChild(preview);

const configPreview = preview.querySelector<HTMLPreElement>("#config-preview");

master.onMasterChange((params) => {
  if (configPreview) {
    configPreview.textContent = JSON.stringify(
      {
        ...defaultConfig,
        sections: {
          home: { geometry: "hypercube", modifier: 1, snapPoint: 0, params }
        }
      },
      null,
      2
    );
  }
});

master.setMasterParams(master.getCurrentParams());

function buildPreviewHref(channel: string): string {
  try {
    const current = new URL(window.location.href);
    const preview = new URL(current.href);
    if (current.port === "5174") {
      preview.port = "5173";
    }
    if (!preview.port) {
      preview.port = "5173";
    }
    preview.pathname = "/";
    preview.hash = "";
    preview.search = "";
    preview.searchParams.set("syncChannel", channel);
    return preview.toString();
  } catch (error) {
    console.warn("Falling back to localhost preview URL", error);
    return `http://localhost:5173/?syncChannel=${encodeURIComponent(channel)}`;
  }
}

declare global {
  interface Window {
    VIB34DSyncChannel?: string;
  }
}
