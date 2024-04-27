document.addEventListener("DOMContentLoaded", async () => {
  const DATA_SOURCE = "dev";
  const statusTab = document.querySelector<HTMLButtonElement>(
    "[dev-target=status-tab]"
  );
  const editTab = document.querySelector<HTMLButtonElement>(
    "[dev-target=edit-tab]"
  );
  const editTableNameInput = document.querySelector<HTMLInputElement>(
    "[dev-target=edit-table-name]"
  );
  const editInsightNameInput = document.querySelector<HTMLInputElement>(
    "[dev-target=edit-insight-name]"
  );
  const adminTableBody = document.querySelector("[dev-target=table-body]");
  const adminTableRowTemplate = document.querySelector<HTMLElement>(
    "[dev-target=table-row-template]"
  );
  const editTableName = new Choices(editTableNameInput);
  const editInsightName = new Choices(editInsightNameInput);
  const insights = await getEditorInsights();

  let editTableNameValue = "editor_insights";

  fetchDataFromEndpoint(
    "",
    editInsightName,
    "https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/get_insights",
    editTableNameValue
  );

  editTableName.passedElement.element.addEventListener(
    "choice",
    (event) => {
      editTableNameValue = event.detail.choice.value;
      fetchDataFromEndpoint(
        "",
        editInsightName,
        "https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/get_insights",
        editTableNameValue
      );
    },
    false
  );

  editInsightName.passedElement.element.addEventListener(
    "search",
    (event) => {
      debouncedFetch(
        event.detail.value,
        editInsightName,
        "https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/get_insights",
        editTableNameValue
      );
      console.log("search", event);

      //   addDataToForm(event.detail.customProperties);
      //   console.log("event", event);
    },
    false
  );
  editInsightName.passedElement.element.addEventListener(
    "choice",
    (event) => {
        console.log("event",event)
        addDataToForm(event.detail.choice.customProperties)
    },
    false
  );

  const {
    companiesMentioned,
    company,
    companyType,
    curatedInput,
    descriptionInput,
    event,
    insightClassification,
    insightDetails,
    nameInput,
    idInput,
    people,
    publishedInput,
    slugInput,
    sourceAuthorInput,
    sourceCategory,
    sourceDocuments,
    sourceInput,
    sourcePublicationInput,
    sourceUrlInput,
    technologyCategory,
    form: insightForm,
  } = initForm();

  insightForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const transformedData = await getFormData();

    console.log("transformedData", transformedData);

    fetch(
      `https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/update_insight?table_name=${editTableNameValue}`,
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
  if (adminTableBody) adminTableBody.innerHTML = "";
  adminTableRowTemplate && displayRowsOnTable(insights, adminTableRowTemplate);

  //   fetchChoicesOnKeystroke(
  //     editInsightName,
  //     "https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/get_insights",
  //     editTableNameValue
  //   );

  function displayRowsOnTable(
    data: GetEditorInsightsResponse[],
    rowTemplate: HTMLElement
  ) {
    data.forEach((insight) => {
      const row = rowTemplate.cloneNode(true) as HTMLElement;
      const name = row.querySelector<HTMLElement>("[dev-target=name]");
      const status = row.querySelector<HTMLElement>("[dev-target=status]");
      const approve = row.querySelector<HTMLButtonElement>(
        "[dev-target=approve]"
      );
      const reject = row.querySelector<HTMLButtonElement>(
        "[dev-target=reject]"
      );
      const edit = row.querySelector<HTMLButtonElement>("[dev-target=edit]");

      if (name) name.textContent = insight.name;
      if (status) status.textContent = insight.status;
      approve?.addEventListener("click", () => {
        adminAction("approve", insight.id);
        row.remove();
        console.log("approve");
      });
      reject?.addEventListener("click", () => {
        adminAction("reject", insight.id);
        row.remove();
        console.log("reject");
      });
      edit?.addEventListener("click", () => {
        addDataToForm(insight);

        editTab?.click();
        console.log("edit");
      });

      adminTableBody?.appendChild(row);
    });
  }
  async function getEditorInsights() {
    const res = await fetch(
      "https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/get_editor_insights"
    );
    const data = (await res.json()) as GetEditorInsightsResponse[];
    return data;
  }

  function initForm() {
    const form = document.querySelector<HTMLFormElement>("[dev-target=form]")!;
    const idInput = form.querySelector<HTMLInputElement>(
      "[dev-target=id-input]"
    )!;
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

    return {
      idInput,
      nameInput,
      slugInput,
      company,
      descriptionInput,
      insightDetails,
      curatedInput,
      sourceInput,
      sourceAuthorInput,
      sourceUrlInput,
      sourcePublicationInput,
      sourceCategory,
      companyType,
      insightClassification,
      technologyCategory,
      companiesMentioned,
      people,
      sourceDocuments,
      event,
      publishedInput,
      form,
    };
  }
  function addDataToForm(insight: GetEditorInsightsResponse) {
    clearForm();
    idInput.value = insight.id.toString();
    nameInput.value = insight.name;
    slugInput.value = insight.slug;
    insight._company &&
      company.setValue([
        {
          value: insight._company.id,
          label: insight._company.name,
        },
      ]);
    descriptionInput.value = insight.description;
    insightDetails.then((value) => {
      value.setData(insight["insight-detail"]);
    });
    curatedInput.value = insight.curated
      ? new Date(insight.curated).toISOString().slice(0, 10)
      : "";

    sourceInput.value = insight.source;
    sourceAuthorInput.value = insight.source_author;
    sourceUrlInput.value = insight["source-url"];
    sourcePublicationInput.value = insight["source-publication-date"]
      ? new Date(insight["source-publication-date"]).toISOString().slice(0, 10)
      : "";

    sourceCategory.setValue(
      insight.source_category_id.map(({ id, name }) => ({
        label: name,
        value: id,
      }))
    );
    companyType.setValue(
      insight.company_type_id.map(({ id, name }) => ({
        label: name,
        value: id,
      }))
    );
    insightClassification.setValue(
      insight.insight_classification_id.map(({ id, name }) => ({
        label: name,
        value: id,
      }))
    );
    technologyCategory.setValue(
      insight.technology_category_id.map(({ id, name }) => ({
        label: name,
        value: id,
      }))
    );
    companiesMentioned.setValue(
      insight.companies_mentioned.map(({ id, name }) => ({
        label: name,
        value: id,
      }))
    );
    people.setValue(
      insight.people_id.map(({ id, name }) => ({
        label: name,
        value: id,
      }))
    );
    sourceDocuments.setValue(
      insight.source_document_id.map(({ id, name }) => ({
        label: name,
        value: id,
      }))
    );
    insight._event &&
      event.setValue([
        { label: insight._event.name, value: insight._event.id },
      ]);
    publishedInput.checked = insight.published;
    publishedInput.parentElement
      ?.querySelector(".w-checkbox-input")
      ?.classList[insight.published ? "add" : "remove"](
        "w--redirected-checked"
      );
  }
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
    publishedInput.checked = false;
    publishedInput.parentElement
      ?.querySelector(".w-checkbox-input")
      ?.classList.remove("w--redirected-checked");
  }

  async function getFormData() {
    return {
      id: idInput.value,
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
      `https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/insight_slug_checker?slug=${value}`
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

    fetchDataFromEndpoint("", choicesInstance, endpoint, tableName);

    // Attach input event listener to the input field
    input.addEventListener("input", () => {
      console.log("run");
      const userInput = input.value.trim();
      debouncedFetch(userInput, choicesInstance, endpoint, tableName);
    });
  }

  async function adminAction(action: "approve" | "reject", id: number) {
    const res = await fetch(
      `https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/admin_action?action=${action}&insight_id=${id}`
    );
    const data = await res.json();

    return data;
  }
  const debouncedFetch = debounce(fetchDataFromEndpoint, 300);
  async function fetchDataFromEndpoint(
    userInput: string,
    choicesInstance: Choices,
    endpoint: string,
    tableName: string
  ) {
    try {
      // Fetch data from the endpoint
      const response = await fetch(
        `${endpoint}?table_name=${tableName}&search_query=${userInput}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();

      // Convert the data to the format required by Choices.js
      const choicesData = data.map((item) => ({
        value: item.id,
        label: item.name,
        customProperties: item,
      }));

      // Update Choices.js with new choices
      choicesInstance.setChoices(choicesData, "value", "label", true);
    } catch (error) {
      console.error("Error fetching or parsing data:", error);
    }
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

interface GetEditorInsightsResponse {
  id: number;
  created_at: number;
  name: string;
  slug: string;
  company_id: number;
  description: string;
  "insight-detail": string;
  curated: Date | null;
  source_author: string;
  source: string;
  "source-url": string;
  "source-publication-date": Date | null;
  source_category_id: { name: string; id: number }[];
  company_type_id: { name: string; id: number }[];
  insight_classification_id: { name: string; id: number }[];
  technology_category_id: { name: string; id: number }[];
  companies_mentioned: { name: string; id: number }[];
  people_id: { name: string; id: number }[];
  event_id: number;
  source_document_id: { name: string; id: number }[];
  published: boolean;
  status: string;
  _company: {
    name: string;
    id: number;
  };
  _event: {
    name: string;
    id: number;
  };
}
