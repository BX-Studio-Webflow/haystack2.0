"use strict";
document.addEventListener("DOMContentLoaded", () => {
    const lsInsightEditorFormData = localStorage.getItem("editor_insight_richtext");
    const richtextEditor = document.querySelector("[dev-target=rich-text]");
    if (lsInsightEditorFormData) {
        const insightEditorFormData = JSON.parse(lsInsightEditorFormData);
        richtextEditor.innerHTML = insightEditorFormData;
    }
    // Initialize table scroll
    initTableScroll();
});
function initTableScroll() {
    const figure = document.querySelector('figure.table');
    if (!figure)
        return;
    // Make sure the table can scroll horizontally
    figure.style.overflowX = 'auto';
    // Prevent double injection
    if (figure.previousElementSibling?.classList.contains('top-scroll'))
        return;
    // Create elements
    const topScroll = document.createElement('div');
    const topInner = document.createElement('div');
    topScroll.className = 'top-scroll';
    topInner.className = 'top-scroll-inner';
    topScroll.appendChild(topInner);
    // Required styles
    Object.assign(topScroll.style, {
        overflowX: 'auto',
        overflowY: 'hidden',
        width: `${figure.clientWidth}px`,
        height: 'auto',
    });
    Object.assign(topInner.style, {
        width: figure.scrollWidth + 'px',
        height: '10px',
    });
    const style = document.createElement('style');
    style.id = 'top-scrollbar-style';
    style.innerHTML = `
    .top-scroll::-webkit-scrollbar {
      height: 7px;
    }
    .top-scroll::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 8px;
    }
    .top-scroll::-webkit-scrollbar-track {
      background: #f0f0f0;
    }
  `;
    document.head.appendChild(style);
    // Inject ABOVE figure
    figure.parentNode?.insertBefore(topScroll, figure);
    // Sync sizes
    const sync = () => {
        topScroll.style.width = figure.clientWidth + 'px';
        topInner.style.width = figure.scrollWidth + 'px';
        // Hide if no overflow
        topScroll.style.display =
            figure.scrollWidth > figure.clientWidth ? 'block' : 'none';
    };
    // Sync scroll positions
    topScroll.addEventListener('scroll', () => {
        figure.scrollLeft = topScroll.scrollLeft;
    });
    figure.addEventListener('scroll', () => {
        topScroll.scrollLeft = figure.scrollLeft;
    });
    // Observe changes
    new ResizeObserver(sync).observe(figure);
    sync();
    // Also sync after images load
    window.addEventListener('load', sync);
}
