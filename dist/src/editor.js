"use strict";
// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
// import Choices from "choices.js";
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("[dev-target=form]");
    const nameInput = document.querySelector("[dev-target=name-input]");
    const slugInput = document.querySelector("[dev-target=slug-input]");
    const companyInput = document.querySelector("[dev-target=company]");
    const descriptionInput = document.querySelector("[dev-target=description-input]");
    const insightDetailsInput = document.querySelector("[dev-target=insight-details]");
    const curatedInput = document.querySelector("[dev-target=curated-input]");
    const sourceInput = document.querySelector("[dev-target=source-input]");
    const sourceAuthorInput = document.querySelector("[dev-target=source-author-input]");
    const sourceUrlInput = document.querySelector("[dev-target=source-url-input]");
    const sourcePublicationInput = document.querySelector("[dev-target=source-publication-input]");
    const sourceCategoryInput = document.querySelector("[dev-target=source-category]");
    const companyTypeInput = document.querySelector("[dev-target=company-type]");
    const insightClassificationInput = document.querySelector("[dev-target=insight-classification]");
    const technologyCategoryInput = document.querySelector("[dev-target=technology-category]");
    const companiesMentionedInput = document.querySelector("[dev-target=companies-mentioned]");
    const peopleInput = document.querySelector("[dev-target=people]");
    const sourceDocumentsInput = document.querySelector("[dev-target=source-documents]");
    const eventInput = document.querySelector("[dev-target=event]");
    const previewBtn = document.querySelector("[dev-target=preview-btn]");
    flatpickr(curatedInput, {});
    flatpickr(sourcePublicationInput, {});
    const company = new Choices(companyInput);
    const event = new Choices(eventInput);
    const sourceCategory = new Choices(sourceCategoryInput, {
        removeItemButton: true,
    });
    const companyType = new Choices(companyTypeInput, {
        removeItemButton: true,
    });
    const insightClassification = new Choices(insightClassificationInput, {
        removeItemButton: true,
    });
    const technologyCategory = new Choices(technologyCategoryInput, {
        removeItemButton: true,
    });
    const companiesMentioned = new Choices(companiesMentionedInput, {
        removeItemButton: true,
    });
    const people = new Choices(peopleInput, {
        removeItemButton: true,
    });
    const sourceDocuments = new Choices(sourceDocumentsInput, {
        removeItemButton: true,
    });
    const insightDetails = ClassicEditor.create(insightDetailsInput, {});
    nameInput.addEventListener("input", () => {
        slugInput.value = slugify(nameInput.value);
        slugInput.dispatchEvent(new Event("input"));
    });
    slugInput.addEventListener("input", () => {
        console.log("logging");
        debounceSlugCheck(slugInput.value);
    });
    previewBtn.addEventListener("click", async () => {
        const formData = await getFormData();
        localStorage.setItem("insight_editor_form_data", JSON.stringify(formData));
        // window.open('/content-upload/insight-preview', '_blank')
    });
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const transformedData = await getFormData();
        console.log("transformedData", transformedData);
        fetch("https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/add_to_insight", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                data: transformedData,
            }),
        })
            .then((res) => res.json())
            .then((dataRes) => {
            console.log("dataRes", dataRes);
            clearForm();
        })
            .catch((err) => console.log("err", err));
    });
    fetchChoicesOnKeystroke(company, "https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/table-item-search", "company");
    fetchChoicesOnKeystroke(companiesMentioned, "https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/table-item-search", "company");
    fetchChoicesOnKeystroke(companyType, "https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/table-item-search", "company-type");
    fetchChoicesOnKeystroke(technologyCategory, "https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/table-item-search", "technology-category");
    fetchChoicesOnKeystroke(sourceDocuments, "https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/table-item-search", "source-documents");
    fetchChoicesOnKeystroke(insightClassification, "https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/table-item-search", "insight-classification");
    fetchChoicesOnKeystroke(sourceCategory, "https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/table-item-search", "source-category");
    fetchChoicesOnKeystroke(event, "https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/table-item-search", "event");
    fetchChoicesOnKeystroke(people, "https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/table-item-search", "people");
    function debounce(func, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }
    function clearSelections(choicesInstance) {
        choicesInstance.removeActiveItems();
    }
    function clearForm() {
        nameInput.value = "";
        slugInput.value = "";
        clearSelections(company);
        descriptionInput.value = "";
        insightDetails.then((val) => {
            val.setData("");
        });
        curatedInput.value = "";
        sourceInput.value = "";
        sourceAuthorInput.value = "";
        sourceUrlInput.value = "";
        sourcePublicationInput.value = "";
        clearSelections(sourceCategory);
        clearSelections(companyType);
        clearSelections(insightClassification);
        clearSelections(technologyCategory);
        clearSelections(companiesMentioned);
        clearSelections(people);
        clearSelections(sourceDocuments);
        clearSelections(event);
    }
    async function getFormData() {
        return {
            name: nameInput.value,
            slug: slugInput.value,
            company: company.getValue() ? company.getValue().value : "",
            description: descriptionInput.value,
            insightDetails: await insightDetails.then((val) => val.getData()),
            curated: curatedInput.value.trim() !== ""
                ? new Date(curatedInput.value).toISOString()
                : "",
            source: sourceInput.value,
            sourceAuthor: sourceAuthorInput.value,
            sourceUrl: sourceUrlInput.value,
            sourcePublication: sourcePublicationInput.value.trim() !== ""
                ? new Date(sourcePublicationInput.value).toISOString()
                : "",
            sourceCategory: sourceCategory.getValue()
                ? sourceCategory.getValue().map(({ value }) => value)
                : [],
            companyType: companyType.getValue()
                ? companyType.getValue().map(({ value }) => value)
                : [],
            insightClassification: insightClassification.getValue()
                ? insightClassification.getValue().map(({ value }) => value)
                : [],
            technologyCategory: technologyCategory.getValue()
                ? technologyCategory.getValue().map(({ value }) => value)
                : [],
            companiesMentioned: companiesMentioned.getValue()
                ? companiesMentioned.getValue().map(({ value }) => value)
                : [],
            people: people.getValue()
                ? people.getValue().map(({ value }) => value)
                : [],
            sourceDocuments: sourceDocuments.getValue()
                ? sourceDocuments.getValue().map(({ value }) => value)
                : [],
            event: event.getValue() ? event.getValue().value : [],
        };
    }
    const debounceSlugCheck = debounce(async (value) => {
        const res = await fetch(`https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/insight_slug_checker?slug=${value}`);
        const data = (await res.json());
        slugInput.classList[data ? "add" : "remove"]("is-error");
    }, 300);
    function fetchChoicesOnKeystroke(choicesInstance, endpoint, tableName) {
        const input = choicesInstance.input.element;
        const debounceDelay = 300;
        const debouncedFetch = debounce(async (userInput) => {
            try {
                // Fetch data from the endpoint
                const response = await fetch(`${endpoint}?table_name=${tableName}&search_query=${userInput}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                const data = await response.json();
                // Convert the data to the format required by Choices.js
                const choicesData = data.map((item) => ({
                    value: item.id,
                    label: item.name,
                }));
                // Update Choices.js with new choices
                choicesInstance.setChoices(choicesData, "value", "label", true);
            }
            catch (error) {
                console.error("Error fetching or parsing data:", error);
            }
        }, debounceDelay);
        debouncedFetch("");
        // Attach input event listener to the input field
        input.addEventListener("input", () => {
            const userInput = input.value.trim();
            debouncedFetch(userInput);
        });
    }
    function slugify(text) {
        return text
            .toString()
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w\-]+/g, "")
            .replace(/\-\-+/g, "-")
            .replace(/^-+/, "")
            .replace(/-+$/, "");
    }
});
