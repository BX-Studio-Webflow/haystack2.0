"use strict";
// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
// import Choices from "choices.js";
document.addEventListener("DOMContentLoaded", () => {
    const DATA_SOURCE = "live";
    const form = document.querySelector("[dev-target=form]");
    const nameInput = form.querySelector("[dev-target=name-input]");
    const slugInput = form.querySelector("[dev-target=slug-input]");
    const companyInput = form.querySelector("[dev-target=company]");
    const descriptionInput = form.querySelector("[dev-target=description-input]");
    const internalNoteInput = form.querySelector("[dev-target=internal-note]");
    const insightDetailsInput = form.querySelector("[dev-target=insight-details]");
    const insightDetailsHeightToggle = form.querySelector("[dev-target=rich-text-height-toggle]");
    const curatedInput = form.querySelector("[dev-target=curated-input]");
    const sourceInput = form.querySelector("[dev-target=source-input]");
    const sourceAuthorInput = form.querySelector("[dev-target=source-author-input]");
    const sourceUrlInput = form.querySelector("[dev-target=source-url-input]");
    const sourcePublicationInput = form.querySelector("[dev-target=source-publication-input]");
    const sourceCategoryInput = form.querySelector("[dev-target=source-category]");
    const companyTypeInput = form.querySelector("[dev-target=company-type]");
    const insightClassificationInput = form.querySelector("[dev-target=insight-classification]");
    const technologyCategoryInput = form.querySelector("[dev-target=technology-category]");
    const companiesMentionedInput = form.querySelector("[dev-target=companies-mentioned]");
    const peopleInput = form.querySelector("[dev-target=people]");
    const sourceDocumentsInput = form.querySelector("[dev-target=source-documents]");
    const eventInput = form.querySelector("[dev-target=event]");
    const publishedInput = form.querySelector("[dev-target=published-input]");
    flatpickr(curatedInput, {
        dateFormat: "m-d-Y",
        altFormat: "m-d-Y",
        altInput: true,
    });
    flatpickr(sourcePublicationInput, {
        dateFormat: "m-d-Y",
        altFormat: "m-d-Y",
        altInput: true,
    });
    const company = new Choices(companyInput);
    const event = new Choices(eventInput);
    const sourceCategory = new Choices(sourceCategoryInput, {
        removeItemButton: true,
        duplicateItemsAllowed: false,
    });
    const companyType = new Choices(companyTypeInput, {
        removeItemButton: true,
        duplicateItemsAllowed: false,
    });
    const insightClassification = new Choices(insightClassificationInput, {
        removeItemButton: true,
        duplicateItemsAllowed: false,
    });
    const technologyCategory = new Choices(technologyCategoryInput, {
        removeItemButton: true,
        duplicateItemsAllowed: false,
    });
    const companiesMentioned = new Choices(companiesMentionedInput, {
        removeItemButton: true,
        duplicateItemsAllowed: false,
    });
    const people = new Choices(peopleInput, {
        removeItemButton: true,
        duplicateItemsAllowed: false,
    });
    const sourceDocuments = new Choices(sourceDocumentsInput, {
        removeItemButton: true,
        duplicateItemsAllowed: false,
    });
    const insightDetails = ClassicEditor.create(insightDetailsInput, {
        extraPlugins: [MyCustomUploadAdapterPlugin],
    });
    insightDetailsHeightToggle.addEventListener("change", () => {
        const checked = insightDetailsHeightToggle.checked;
        const insightDetailContent = document.querySelector(".ck.ck-editor__main");
        insightDetailContent.style.overflow = "auto";
        insightDetailContent.style.maxHeight = checked ? "400px" : "none";
    });
    insightDetails.then((value) => {
        value.model.document.on("change:data", () => {
            const data = value.getData();
            localStorage.setItem("editor_insight_richtext", JSON.stringify(data));
        });
    });
    nameInput.addEventListener("input", () => {
        slugInput.value = slugify(nameInput.value);
        slugInput.dispatchEvent(new Event("input"));
    });
    slugInput.addEventListener("input", () => {
        console.log("logging");
        debounceSlugCheck(slugInput.value);
    });
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (slugInput.classList.contains("is-error")) {
            Toastify({
                text: "Slug Already in use",
                duration: 3000,
                destination: "https://github.com/apvarun/toastify-js",
                newWindow: true,
                close: true,
                gravity: "top", // `top` or `bottom`
                position: "left", // `left`, `center` or `right`
                stopOnFocus: true, // Prevents dismissing of toast on hover
                style: {
                    background: "linear-gradient(to right, #ff5f6d, #ffc371)",
                },
                onClick: function () { }, // Callback after click
            }).showToast();
        }
        else {
            const transformedData = await getFormData();
            console.log("transformedData", transformedData);
            fetch(`https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/add_to_insight?x-data-source=${DATA_SOURCE}`, {
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
                Toastify({
                    text: "Submitted",
                    duration: 3000,
                    destination: "https://github.com/apvarun/toastify-js",
                    newWindow: true,
                    close: true,
                    gravity: "top", // `top` or `bottom`
                    position: "left", // `left`, `center` or `right`
                    stopOnFocus: true, // Prevents dismissing of toast on hover
                    style: {
                        background: "linear-gradient(to right, #00b09b, #96c93d)",
                    },
                    onClick: function () { }, // Callback after click
                }).showToast();
                clearForm();
            })
                .catch((err) => console.log("err", err));
        }
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
        curatedInput.parentElement?.querySelectorAll("input").forEach((input) => {
            input.value = "";
        });
        sourceInput.value = "";
        sourceAuthorInput.value = "";
        sourceUrlInput.value = "";
        sourcePublicationInput.parentElement
            ?.querySelectorAll("input")
            .forEach((input) => {
            input.value = "";
        });
        internalNoteInput.value = "";
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
            internalNote: internalNoteInput.value,
            insightDetails: await insightDetails.then((val) => val.getData()),
            curated: curatedInput.value.trim() !== ""
                ? new Date(convert_MM_DD_YYYY_to_YYYY_MM_DD(curatedInput.value)).toISOString()
                : "",
            source: sourceInput.value,
            sourceAuthor: sourceAuthorInput.value,
            sourceUrl: sourceUrlInput.value,
            sourcePublication: sourcePublicationInput.value.trim() !== ""
                ? new Date(convert_MM_DD_YYYY_to_YYYY_MM_DD(sourcePublicationInput.value)).toISOString()
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
            published: publishedInput ? publishedInput.checked : false,
        };
    }
    const debounceSlugCheck = debounce(async (value) => {
        const res = await fetch(`https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/insight_slug_checker?slug=${value}&x-data-source=${DATA_SOURCE}`);
        const data = (await res.json());
        slugInput.classList[data ? "add" : "remove"]("is-error");
    }, 300);
    function fetchChoicesOnKeystroke(choicesInstance, endpoint, tableName) {
        const input = choicesInstance.input.element;
        const debounceDelay = 300;
        const debouncedFetch = debounce(async (userInput) => {
            try {
                // Fetch data from the endpoint
                const response = await fetch(`${endpoint}?table_name=${tableName}&search_query=${userInput}&x-data-source=${DATA_SOURCE}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }
                const data = await response.json();
                const currentSelectedID = choicesInstance.getValue(true);
                console.log("currentSelectedID", currentSelectedID);
                // Convert the data to the format required by Choices.js
                const choicesData = data
                    .filter((item) => typeof currentSelectedID === "number"
                    ? ![currentSelectedID].includes(item.id)
                    : typeof currentSelectedID === "object"
                        ? !currentSelectedID.includes(item.id)
                        : true)
                    .map((item) => ({
                    value: item.id,
                    label: item.title ? `${item.name} ${item.title}` : item.name,
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
    function convert_MM_DD_YYYY_to_YYYY_MM_DD(date) {
        const [month, day, year] = date.split("-");
        return `${year}-${month}-${day}`;
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
    class MyUploadAdapter {
        constructor(loader) {
            // The file loader instance to use during the upload.
            this.loader = loader;
        }
        // Starts the upload process.
        upload() {
            return this.loader.file.then((file) => new Promise((resolve, reject) => {
                this._initRequest();
                this._initListeners(resolve, reject, file);
                this._sendRequest(file);
            }));
        }
        // Aborts the upload process.
        abort() {
            if (this.xhr) {
                this.xhr.abort();
            }
        }
        // Initializes the XMLHttpRequest object using the URL passed to the constructor.
        _initRequest() {
            const xhr = (this.xhr = new XMLHttpRequest());
            xhr.open("POST", "https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/image_upload", true);
            xhr.responseType = "json";
        }
        // Initializes XMLHttpRequest listeners.
        _initListeners(resolve, reject, file) {
            const xhr = this.xhr;
            const loader = this.loader;
            const genericErrorText = `Couldn't upload file: ${file.name}.`;
            xhr.addEventListener("error", () => reject(genericErrorText));
            xhr.addEventListener("abort", () => reject());
            xhr.addEventListener("load", () => {
                const response = xhr.response;
                if (!response || response.error) {
                    return reject(response && response.error
                        ? response.error.message
                        : genericErrorText);
                }
                resolve({
                    default: response.url,
                });
            });
            if (xhr.upload) {
                xhr.upload.addEventListener("progress", (evt) => {
                    if (evt.lengthComputable) {
                        loader.uploadTotal = evt.total;
                        loader.uploaded = evt.loaded;
                    }
                });
            }
        }
        // Prepares the data and sends the request.
        _sendRequest(file) {
            // Prepare the form data.
            const data = new FormData();
            data.append("upload", file);
            // Send the request.
            this.xhr.send(data);
        }
    }
    function MyCustomUploadAdapterPlugin(editor) {
        editor.plugins.get("FileRepository").createUploadAdapter = (loader) => {
            // Configure the URL to the upload script in your back-end here!
            return new MyUploadAdapter(loader);
        };
    }
});
