document.addEventListener("DOMContentLoaded", () => {
  const lsInsightEditorFormData = localStorage.getItem(
    "editor_insight_richtext"
  );
  const richtextEditor = document.querySelector<HTMLElement>(
    "[dev-target=rich-text]"
  );

  if (lsInsightEditorFormData) {
    const insightEditorFormData = JSON.parse(lsInsightEditorFormData);

    richtextEditor!.innerHTML = insightEditorFormData;
  }

  // TABLE CODE
  const figure = document.querySelector("figure.table") as HTMLElement;
  const constant = 70; // px

  function setTableHeight() {
    if (!figure) return;

    // Distance from top of viewport (ignores page scroll)
    const rect = figure.getBoundingClientRect();
    const topOffsetFromViewport = rect.top;

    // Remaining height in viewport minus constant
    const height = `calc(100vh - ${topOffsetFromViewport}px - ${constant}px)`;

    Object.assign(figure.style, {
      height: height,
      marginBottom: "20px",
      overflow: "auto",
    });
    console.log("Setting table height:", height);
  }

  // Initial set
  setTableHeight();

  // Update on resize
  window.addEventListener("resize", setTableHeight);
});
