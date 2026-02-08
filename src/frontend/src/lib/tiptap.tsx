import { Editor, type EditorOptions } from "@tiptap/core";
import {
  onCleanup,
  onMount,
  createSignal,
  type Accessor,
  type Component,
} from "solid-js";

/**
 * Minimal SolidJS wrapper for TipTap v3.
 * Replaces tiptap-solid (which only supports v2).
 */
export function createEditor(
  options: Partial<EditorOptions>,
): Accessor<Editor | null> {
  const [editor, setEditor] = createSignal<Editor | null>(null);

  // Defer creation to next microtask so SolidJS reactive scope is ready
  queueMicrotask(() => {
    const instance = new Editor({ ...options, element: document.createElement("div") });
    setEditor(instance as any);

    onCleanup(() => {
      instance.destroy();
    });
  });

  return editor;
}

/**
 * Renders the TipTap editor into a container div.
 */
export const EditorContent: Component<{
  editor: Editor | null;
  class?: string;
}> = (props) => {
  let container!: HTMLDivElement;

  onMount(() => {
    // Poll until the editor is ready, then mount its DOM
    const check = setInterval(() => {
      if (props.editor && container) {
        const dom = props.editor.view.dom;
        if (dom.parentElement !== container) {
          container.innerHTML = "";
          container.appendChild(dom);
        }
        clearInterval(check);
      }
    }, 30);

    onCleanup(() => clearInterval(check));
  });

  return <div ref={container} class={props.class} />;
};
