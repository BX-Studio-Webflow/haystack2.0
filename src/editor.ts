// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
// import Choices from "choices.js";

document.addEventListener("DOMContentLoaded", () => {
  const DATA_SOURCE = "dev";
  const form = document.querySelector<HTMLFormElement>("[dev-target=form]")!;
  const nameInput = form.querySelector<HTMLInputElement>(
    "[dev-target=name-input]"
  )!;
  const slugInput = form.querySelector<HTMLInputElement>(
    "[dev-target=slug-input]"
  )!;
  const companyInput = form.querySelector<HTMLInputElement>(
    "[dev-target=company]"
  )!;
  const descriptionInput = form.querySelector<HTMLInputElement>(
    "[dev-target=description-input]"
  )!;
  const insightDetailsInput = form.querySelector<HTMLInputElement>(
    "[dev-target=insight-details]"
  )!;
  const curatedInput = form.querySelector<HTMLInputElement>(
    "[dev-target=curated-input]"
  )!;
  const sourceInput = form.querySelector<HTMLInputElement>(
    "[dev-target=source-input]"
  )!;
  const sourceAuthorInput = form.querySelector<HTMLInputElement>(
    "[dev-target=source-author-input]"
  )!;
  const sourceUrlInput = form.querySelector<HTMLInputElement>(
    "[dev-target=source-url-input]"
  )!;
  const sourcePublicationInput = form.querySelector<HTMLInputElement>(
    "[dev-target=source-publication-input]"
  )!;
  const sourceCategoryInput = form.querySelector<HTMLInputElement>(
    "[dev-target=source-category]"
  )!;
  const companyTypeInput = form.querySelector<HTMLInputElement>(
    "[dev-target=company-type]"
  )!;
  const insightClassificationInput = form.querySelector<HTMLInputElement>(
    "[dev-target=insight-classification]"
  )!;
  const technologyCategoryInput = form.querySelector<HTMLInputElement>(
    "[dev-target=technology-category]"
  )!;
  const companiesMentionedInput = form.querySelector<HTMLInputElement>(
    "[dev-target=companies-mentioned]"
  )!;
  const peopleInput = form.querySelector<HTMLInputElement>(
    "[dev-target=people]"
  )!;
  const sourceDocumentsInput = form.querySelector<HTMLInputElement>(
    "[dev-target=source-documents]"
  )!;
  const eventInput =
    form.querySelector<HTMLInputElement>("[dev-target=event]")!;
  const publishedInput = form.querySelector<HTMLInputElement>(
    "[dev-target=published-input]"
  )!;

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

    const transformedData = await getFormData();

    console.log("transformedData", transformedData);

    fetch(
      `https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/add_to_insight?x-data-source=${DATA_SOURCE}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: transformedData,
        }),
      }
    )
      .then((res) => res.json())
      .then((dataRes) => {
        console.log("dataRes", dataRes);
        clearForm();
      })
      .catch((err) => console.log("err", err));
  });

  fetchChoicesOnKeystroke(
    company,
    "https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/table-item-search",
    "company"
  );
  fetchChoicesOnKeystroke(
    companiesMentioned,
    "https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/table-item-search",
    "company"
  );
  fetchChoicesOnKeystroke(
    companyType,
    "https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/table-item-search",
    "company-type"
  );
  fetchChoicesOnKeystroke(
    technologyCategory,
    "https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/table-item-search",
    "technology-category"
  );
  fetchChoicesOnKeystroke(
    sourceDocuments,
    "https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/table-item-search",
    "source-documents"
  );
  fetchChoicesOnKeystroke(
    insightClassification,
    "https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/table-item-search",
    "insight-classification"
  );
  fetchChoicesOnKeystroke(
    sourceCategory,
    "https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/table-item-search",
    "source-category"
  );
  fetchChoicesOnKeystroke(
    event,
    "https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/table-item-search",
    "event"
  );
  fetchChoicesOnKeystroke(
    people,
    "https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/table-item-search",
    "people"
  );

  function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
      }, delay);
    };
  }

  function clearSelections(choicesInstance: Choices) {
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
      curated:
        curatedInput.value.trim() !== ""
          ? new Date(curatedInput.value).toISOString()
          : "",
      source: sourceInput.value,
      sourceAuthor: sourceAuthorInput.value,
      sourceUrl: sourceUrlInput.value,
      sourcePublication:
        sourcePublicationInput.value.trim() !== ""
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
      published: publishedInput ? publishedInput.checked : false,
    };
  }

  const debounceSlugCheck = debounce(async (value: string) => {
    const res = await fetch(
      `https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/insight_slug_checker?slug=${value}&x-data-source=${DATA_SOURCE}`
    );
    const data = (await res.json()) as boolean;

    slugInput.classList[data ? "add" : "remove"]("is-error");
  }, 300);
  function fetchChoicesOnKeystroke(
    choicesInstance: Choices,
    endpoint: string,
    tableName: string
  ) {
    const input = choicesInstance.input.element;
    const debounceDelay = 300;

    const debouncedFetch = debounce(async (userInput) => {
      try {
        // Fetch data from the endpoint
        const response = await fetch(
          `${endpoint}?table_name=${tableName}&search_query=${userInput}&x-data-source=${DATA_SOURCE}`
        );

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
      } catch (error) {
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
  function slugify(text: string) {
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
