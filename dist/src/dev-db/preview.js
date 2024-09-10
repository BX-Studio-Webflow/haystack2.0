"use strict";
document.addEventListener("DOMContentLoaded", () => {
    const lsInsightEditorFormData = localStorage.getItem("editor_insight_richtext");
    const richtextEditor = document.querySelector("[dev-target=rich-text]");
    if (lsInsightEditorFormData) {
        const insightEditorFormData = JSON.parse(lsInsightEditorFormData);
        richtextEditor.innerHTML = insightEditorFormData;
    }
    window.addEventListener("storage", function (event) {
        if (richtextEditor &&
            event.newValue &&
            event.storageArea === localStorage &&
            event.key === "editor_insight_richtext") {
            richtextEditor.innerHTML = JSON.parse(event.newValue);
        }
    });
});
