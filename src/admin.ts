document.addEventListener("DOMContentLoaded", async () => {
  const DATA_SOURCE = "dev";
  const paginationNextBtn = document.querySelector<HTMLButtonElement>(
    "[dev-target=next-btn]"
  );
  const paginationPreviousBtn = document.querySelector<HTMLButtonElement>(
    "[dev-target=previous-btn]"
  );
  const statusTab = document.querySelector<HTMLButtonElement>(
    "[dev-target=status-tab]"
  );
  const editTab = document.querySelector<HTMLButtonElement>(
    "[dev-target=edit-tab]"
  );
  const moveToLiveBtn = document.querySelector<HTMLButtonElement>(
    "[dev-target=move-to-live]"
  );
  const deleteRejectedBtn = document.querySelector<HTMLButtonElement>(
    "[dev-target=delete-rejected]"
  );
  const editTableNameInput = document.querySelector<HTMLInputElement>(
    "[dev-target=edit-table-name]"
  );
  const editInsightNameInput = document.querySelector<HTMLInputElement>(
    "[dev-target=edit-insight-name]"
  );
  const insightSortInput = document.querySelector<HTMLInputElement>(
    "[dev-target=status-sort]"
  );
  const adminTableBody = document.querySelector("[dev-target=table-body]");
  const adminTableRowTemplate = document.querySelector<HTMLElement>(
    "[dev-target=table-row-template]"
  );
  const editTableName = new Choices(editTableNameInput);
  const editInsightName = new Choices(editInsightNameInput);
  const insightSort = new Choices(insightSortInput);
  let currentPage = 1;
  let perPage = 100;
  let insightSortStatus: "Pending" | "Approved" | "Rejected" | "" = "";
  let editTableNameValue = "editor_insights";
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
    internalNoteInput,
    form: insightForm,
  } = initForm();

  getEditorInsights(currentPage, perPage, insightSortStatus);

  fetchDataFromEndpoint(
    "",
    editInsightName,
    "https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/get_insights",
    editTableNameValue
  );

  deleteRejectedBtn?.addEventListener("click", () => {
    deleteAllRejectedInsights();
  });
  moveToLiveBtn?.addEventListener("click", () => {
    moveApprovedToLive();
  });

  insightSort.passedElement.element.addEventListener(
    "choice",
    async (event) => {
      insightSortStatus = event.detail.choice.value;
      const { items } = await getEditorInsights(
        currentPage,
        perPage,
        insightSortStatus
      );
      if (insightSortStatus === "Approved" && items.length > 0) {
        moveToLiveBtn?.setAttribute("dev-display", "flex");
        deleteRejectedBtn?.setAttribute("dev-display", "none");
      } else if (insightSortStatus === "Rejected" && items.length > 0) {
        deleteRejectedBtn?.setAttribute("dev-display", "flex");
        moveToLiveBtn?.setAttribute("dev-display", "none");
      } else {
        deleteRejectedBtn?.setAttribute("dev-display", "none");
        moveToLiveBtn?.setAttribute("dev-display", "none");
      }
    },
    false
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
    },
    false
  );
  editInsightName.passedElement.element.addEventListener(
    "choice",
    (event) => {
      addDataToForm(event.detail.choice.customProperties);
    },
    false
  );

  insightForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const transformedData = await getFormData();

    console.log("transformedData", transformedData);

    fetch(
      `https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/update_insight?table_name=${editTableNameValue}&x-data-source=${DATA_SOURCE}`,
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
          onClick: function(){} // Callback after click
        }).showToast();
        clearForm();
      })
      .catch((err) => console.log("err", err));
  });

  function displayRowsOnTable(
    data: GetEditorInsightsResponse,
    rowTemplate: HTMLElement
  ) {
    if (adminTableBody) adminTableBody.innerHTML = "";
    data.items.forEach((insight) => {
      const row = rowTemplate.cloneNode(true) as HTMLElement;
      const name = row.querySelector<HTMLLinkElement>("[dev-target=name]");
      const status = row.querySelector<HTMLElement>("[dev-target=status]");
      const createdOn = row.querySelector<HTMLElement>("[dev-target=created-on]");
      const company = row.querySelector<HTMLElement>("[dev-target=company]");
      const sourceListWrap = row.querySelector<HTMLElement>("[dev-target=source-list]");
      const sourceListItem = row.querySelector<HTMLElement>("[dev-target=source-list-item]");
      const approve = row.querySelector<HTMLButtonElement>(
        "[dev-target=approve]"
      )!;
      const reject = row.querySelector<HTMLButtonElement>(
        "[dev-target=reject]"
      )!;
      const edit = row.querySelector<HTMLButtonElement>("[dev-target=edit]")!;
      const deleteRejectedInsight = row.querySelector<HTMLButtonElement>("[dev-target=delete-rejected-insight]")!;
      const createdOnDate = new Date(insight.created_at)

      deleteRejectedInsight.style.display = "none"

      if (name) name.textContent = insight.name;
      if (createdOn) createdOn.textContent = `${String(createdOnDate.getMonth() + 1).padStart(2, '0')}-${String(createdOnDate.getDate()).padStart(2, '0')}-${createdOnDate.getFullYear()}`;;
      if (status) status.textContent = insight.status;
      if (company) company.textContent = insight._company ? `${insight._company?.name}(${insight._company?.id})`:"";
      if (sourceListWrap) {
        sourceListWrap.innerHTML = "";
        insight.source_category_id.forEach(({name,id})=>{
          const item = sourceListItem?.cloneNode(true) as HTMLElement;
          item.textContent = `${name}(${id})`;
          sourceListWrap.appendChild(item);
        })
      }
      if (insight.status === "Approved") {
        approve.textContent = "Approved";
        approve.classList.add("btn-disabled");
      } else if (insight.status === "Rejected") {
        reject.textContent = "Rejected";
        reject.classList.add("btn-disabled");
        deleteRejectedInsight.style.display = "flex"
      }
      approve?.addEventListener("click", () => {
        adminAction("approve", insight.id)
          .then(() => {
            approve.textContent = "Approved";
            approve.classList.add("btn-disabled");
            reject.textContent = "Reject";
            reject.classList.remove("btn-disabled");
            status!.textContent = "Approved";
            deleteRejectedInsight.style.display = "none"
          })
          .catch((err) => console.log("error"));
      });
      reject?.addEventListener("click", () => {
        adminAction("reject", insight.id)
          .then(() => {
            reject.textContent = "Rejected";
            reject.classList.add("btn-disabled");
            approve.textContent = "Approve";
            approve.classList.remove("btn-disabled");
            status!.textContent = "Rejected";
            deleteRejectedInsight.style.display = "flex"
          })
          .catch((err) => console.log("error"));
      });
      name?.addEventListener("click", () => {
        localStorage.setItem("editor_insight_richtext", JSON.stringify(insight["insight-detail"]));
      });
      deleteRejectedInsight?.addEventListener("click", () => {
        adminAction("delete", insight.id)
          .then(() => {
            deleteRejectedInsight.textContent = "Deleted";
            deleteRejectedInsight.classList.add("btn-disabled");
            approve.classList.add("btn-disabled");
            reject.classList.add("btn-disabled");
            edit.classList.add("btn-disabled");
            status!.textContent = "Deleted";
          })
          .catch((err) => console.log("error"));
      });
      edit?.addEventListener("click", () => {
        addDataToForm(insight);

        editTab?.click();
        console.log("edit");
        resetTableAndSearchInsightValue();
      });

      adminTableBody?.appendChild(row);
    });
  }
  async function getEditorInsights(
    page: number,
    perPage: number,
    status: "Pending" | "Approved" | "Rejected" | ""
  ) {
    const res = await fetch(
      `https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/get_editor_insights?x-data-source=${DATA_SOURCE}&page=${page}&per_page=${perPage}&status=${status}`
    );
    const data = (await res.json()) as GetEditorInsightsResponse;
    paginationNextBtn?.classList[data.nextPage ? "remove" : "add"](
      "btn-disabled"
    );
    paginationPreviousBtn?.classList[data.prevPage ? "remove" : "add"](
      "btn-disabled"
    );

    currentPage = data.curPage;
    adminTableRowTemplate && displayRowsOnTable(data, adminTableRowTemplate);
    return data;
  }
  paginationPreviousBtn?.addEventListener("click", () => {
    getEditorInsights(currentPage - 1, perPage, insightSortStatus);
  });
  paginationNextBtn?.addEventListener("click", () => {
    getEditorInsights(currentPage + 1, perPage, insightSortStatus);
  });

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
    const internalNoteInput = form.querySelector<HTMLInputElement>(
      "[dev-target=internal-note]"
    )!;
    const insightDetailsInput = form.querySelector<HTMLInputElement>(
      "[dev-target=insight-details]"
    )!;
    const insightDetailsHeightToggle = form.querySelector<HTMLInputElement>(
      "[dev-target=rich-text-height-toggle]"
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

    flatpickr(curatedInput, {
      dateFormat: "m-d-Y"
    });
    flatpickr(sourcePublicationInput, {
      dateFormat: "m-d-Y"
    });

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
    const insightDetails = ClassicEditor.create(insightDetailsInput, {
      extraPlugins: [ MyCustomUploadAdapterPlugin ]
    });

    insightDetailsHeightToggle.addEventListener("change",()=>{
      const checked = insightDetailsHeightToggle.checked;
      const insightDetailContent = document.querySelector<HTMLDivElement>(".ck.ck-editor__main")!
      insightDetailContent.style.overflow = "auto"
      insightDetailContent.style.maxHeight = checked ? "20vh" : "none"
    })

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
      internalNoteInput,
      form,
    };
  }
  function addDataToForm(insight: Insight) {
    clearForm();
    idInput.value = insight.id.toString();
    nameInput.value = insight.name;
    slugInput.value = insight.slug;
    internalNoteInput.value = insight.internal_note;
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
      ? new Date(insight.curated).toLocaleDateString("en-US",{
        month:"2-digit",
        day:"2-digit",
        year:"numeric"
      }).replace(/\//g, '-')
      : "";

    sourceInput.value = insight.source;
    sourceAuthorInput.value = insight.source_author;
    sourceUrlInput.value = insight["source-url"];
    sourcePublicationInput.value = insight["source-publication-date"]
      ? new Date(insight["source-publication-date"]).toLocaleDateString("en-US",{
        month:"2-digit",
        day:"2-digit",
        year:"numeric"
      }).replace(/\//g, '-')
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
    internalNoteInput.value = "";
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
      internalNote: internalNoteInput.value,
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

    fetchDataFromEndpoint("", choicesInstance, endpoint, tableName);

    // Attach input event listener to the input field
    input.addEventListener("input", () => {
      console.log("run");
      const userInput = input.value.trim();
      debouncedFetch(userInput, choicesInstance, endpoint, tableName);
    });
  }

  async function adminAction(action: "approve" | "reject" | "delete", id: number) {
    const res = await fetch(
      `https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/admin_action?action=${action}&insight_id=${id}&x-data-source=${DATA_SOURCE}`
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
        `${endpoint}?table_name=${tableName}&search_query=${userInput}&x-data-source=${DATA_SOURCE}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();

      // Convert the data to the format required by Choices.js
      const choicesData = data.map((item) => ({
        value: item.id,
        label: item.title ? `${item.name} ${item.title}` : item.name,
        customProperties: item,
      }));

      // Update Choices.js with new choices
      choicesInstance.setChoices(choicesData, "value", "label", true);
    } catch (error) {
      console.error("Error fetching or parsing data:", error);
    }
  }
  async function moveApprovedToLive() {
    const res = await fetch(
      `https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/move_all_approved_insights_to_live?x-data-source=${DATA_SOURCE}`
    );
    const data = await res.json();

    if (adminTableBody) {
      adminTableBody.innerHTML = "";
    }

    return data;
  }
  async function deleteAllRejectedInsights() {
    const res = await fetch(
      `https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/delete_all_rejected_insights?x-data-source=${DATA_SOURCE}`,
      {
        method: "DELETE",
      }
    );
    const data = await res.json();

    if (adminTableBody) {
      adminTableBody.innerHTML = "";
    }

    return data;
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
  function resetTableAndSearchInsightValue(){
    editTableName.destroy();
    editTableName.init();
    editInsightName.destroy();
    editInsightName.init();
    fetchDataFromEndpoint(
      "",
      editInsightName,
      "https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/get_insights",
      "editor_insights"
    );
  }
  class MyUploadAdapter {
    constructor( loader ) {
        // The file loader instance to use during the upload.
        this.loader = loader;
    }

    // Starts the upload process.
    upload() {
        return this.loader.file
            .then( file => new Promise( ( resolve, reject ) => {
                this._initRequest();
                this._initListeners( resolve, reject, file );
                this._sendRequest( file );
            } ) );
    }

    // Aborts the upload process.
    abort() {
        if ( this.xhr ) {
            this.xhr.abort();
        }
    }

    // Initializes the XMLHttpRequest object using the URL passed to the constructor.
    _initRequest() {
        const xhr = this.xhr = new XMLHttpRequest();

        xhr.open( 'POST', 'https://xhka-anc3-3fve.n7c.xano.io/api:OsMcE9hv/image_upload', true );
        xhr.responseType = 'json';
    }

    // Initializes XMLHttpRequest listeners.
    _initListeners( resolve, reject, file ) {
        const xhr = this.xhr;
        const loader = this.loader;
        const genericErrorText = `Couldn't upload file: ${ file.name }.`;

        xhr.addEventListener( 'error', () => reject( genericErrorText ) );
        xhr.addEventListener( 'abort', () => reject() );
        xhr.addEventListener( 'load', () => {
            const response = xhr.response;

            if ( !response || response.error ) {
                return reject( response && response.error ? response.error.message : genericErrorText );
            }

            resolve( {
                default: response.url
            } );
        } );

        if ( xhr.upload ) {
            xhr.upload.addEventListener( 'progress', evt => {
                if ( evt.lengthComputable ) {
                    loader.uploadTotal = evt.total;
                    loader.uploaded = evt.loaded;
                }
            } );
        }
    }

    // Prepares the data and sends the request.
    _sendRequest( file ) {
        // Prepare the form data.
        const data = new FormData();

        data.append( 'upload', file );

        // Send the request.
        this.xhr.send( data );
    }
}
function MyCustomUploadAdapterPlugin( editor ) {
  editor.plugins.get( 'FileRepository' ).createUploadAdapter = ( loader ) => {
      // Configure the URL to the upload script in your back-end here!
      return new MyUploadAdapter( loader );
  };
}
});

interface GetEditorInsightsResponse {
  itemsReceived: number;
  curPage: number;
  nextPage: null;
  prevPage: null;
  offset: number;
  items: Insight[];
}

interface Insight {
  id: number;
  created_at: number;
  name: string;
  slug: string;
  company_id: number;
  description: string;
  internal_note: string;
  "insight-detail": string;
  curated: Date;
  source_author: string;
  source: string;
  "source-url": string;
  "source-publication-date": Date;
  source_category_id: {
    id: number;
    name: string;
  }[];
  company_type_id: {
    id: number;
    name: string;
  }[];
  insight_classification_id: {
    id: number;
    name: string;
  }[];
  technology_category_id: {
    id: number;
    name: string;
  }[];
  companies_mentioned: {
    id: number;
    name: string;
  }[];
  people_id: {
    id: number;
    name: string;
  }[];
  event_id: number;
  source_document_id: {
    id: number;
    name: string;
  }[];
  published: boolean;
  status: string;
  _company?: {
    id: number;
    name: string;
  };
  _event?: {
    id: number;
    name: string;
  };
}
