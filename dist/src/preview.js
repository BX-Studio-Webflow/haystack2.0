"use strict";
document.addEventListener("DOMContentLoaded", () => {
    const lsInsightEditorFormData = localStorage.getItem("insight_editor_form_data");
    const richtextEditor = document.querySelector("[dev-target=rich-text]");
    if (lsInsightEditorFormData) {
        const insightEditorFormData = JSON.parse(lsInsightEditorFormData);
        console.log("insightEditorFormData.insightDetails", insightEditorFormData.insightDetails);
        richtextEditor.innerHTML = insightEditorFormData.insightDetails;
        localStorage.removeItem("insight_editor_form_data");
    }
});
