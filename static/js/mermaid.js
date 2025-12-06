// Taken from https://www.hahwul.com/dev/zola/mermaid-in-zola/
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
mermaid.initialize({ startOnLoad: false });
document.addEventListener('DOMContentLoaded', async () => {
  const mermaidElements = document.querySelectorAll('.mermaid');

  if (mermaidElements.length > 0) {
      await mermaid.run({
          nodes: mermaidElements
      });
  }
});
