// import { XanoClient } from "@xano/js-sdk";

document.addEventListener("DOMContentLoaded", async () => {
  const xano_individual_pages = new XanoClient({
    apiGroupBaseUrl: "https://xhka-anc3-3fve.n7c.xano.io/api:CvEH0ZFk",
  });
  const xano_wmx = new XanoClient({
    apiGroupBaseUrl: "https://xhka-anc3-3fve.n7c.xano.io/api:6Ie7e140",
  });
  const xano_userFeed = new XanoClient({
    apiGroupBaseUrl: "https://xhka-anc3-3fve.n7c.xano.io/api:Hv8ldLVU",
  });

  const searchObject: SearchObject = {
    search: "",
    checkboxes: {
      companyType: [],
      sourceCat: [],
      techCat: [],
      lineOfBus: [],
      insightClass: [],
    },
  };
  const sortObject = {
    sortBy: "created_at",
    orderBy: "desc",
  };

  const searchParams = new URLSearchParams(window.location.search);
  const technologySlug = searchParams.get("name");

  let userFollowingAndFavourite: UserFollowingAndFavourite | null = null;
  let xanoToken: string | null = null;

  const techCatCard = qs("[dev-target=tech-cat-card]");
  const cardSkeleton = qs("[dev-target=card-skeleton]");
  const insightsSkeleton = qs("[dev-target=skeleton-insights]");
  const eventDetails = qsa("[dev-event-details]");

  const insightSearchInput = qs<HTMLInputElement>("[dev-search-target]");
  const insightFilterForm = qs<HTMLFormElement>("[dev-target=filter-form]");
  const insightClearFilters = qs<HTMLFormElement>("[dev-target=clear-filters]");
  const inputEvent = new Event("input", { bubbles: true, cancelable: true });

  const insightTemplate = qs(`[dev-template="insight-item"]`);
  const insightTagTemplate = qs(`[dev-template="insight-tag"]`);
  const checkboxItemTemplate = qs(`[dev-template="checkbox-item"]`);

  const allTabsTarget = qs(`[dev-target="insight-all"]`);

  const filterCompanyTypeTarget = qs(`[dev-target="filter-company-type"]`);
  const filterSourceCatTarget = qs(`[dev-target="filter-source-cat"]`);
  const filterTechCatTarget = qs(`[dev-target="filter-tech-cat"]`);
  const filterLineOfBusTarget = qs(`[dev-target="filter-line-of-business"]`);
  const filterInsightClassTarget = qs(`[dev-target="filter-insight-class"]`);

  const paginationTemplate = qs(`[dev-target=pagination-wrapper]`);

  const memberStackUserToken = localStorage.getItem("_ms-mid");
  if (!memberStackUserToken) {
    return console.error("No memberstack token");
  }

  const lsUserFollowingFavourite = localStorage.getItem(
    "user-following-favourite"
  );
  const lsXanoAuthToken = localStorage.getItem("AuthToken");
  if (lsXanoAuthToken) {
    xanoToken = lsXanoAuthToken;
  }
  if (lsUserFollowingFavourite) {
    userFollowingAndFavourite = JSON.parse(lsUserFollowingFavourite);
  }

  if (!technologySlug) {
    return console.error("add event name in the url eg /technology/analytics");
  }

  if (xanoToken) {
    xano_userFeed.setAuthToken(xanoToken);
    xano_individual_pages.setAuthToken(xanoToken);
    getXanoAccessToken(memberStackUserToken);
  } else {
    await getXanoAccessToken(memberStackUserToken);
  }
  lsUserFollowingFavourite
    ? getUserFollowingAndFavourite()
    : await getUserFollowingAndFavourite();
  technologyCatPageInit(technologySlug);

  async function getXanoAccessToken(memberstackToken: string) {
    try {
      const res = await xano_wmx.post("/auth-user", {
        memberstack_token: memberstackToken,
      });
      const xanoAuthToken = res.getBody().authToken as string;
      xano_userFeed.setAuthToken(xanoAuthToken);
      xano_individual_pages.setAuthToken(xanoAuthToken);
      return xanoAuthToken;
    } catch (error) {
      console.log("getXanoAccessToken_error", error);
      return null;
    }
  }

  async function getUserFollowingAndFavourite() {
    try {
      const res = await xano_userFeed.get("/user-following-and-favourite");
      const followingAndFavourite = res.getBody() as UserFollowingAndFavourite;
      const { user_following } = followingAndFavourite;
      userFollowingAndFavourite = followingAndFavourite;
      localStorage.setItem(
        "user-following-favourite",
        JSON.stringify(followingAndFavourite)
      );

      return followingAndFavourite;
    } catch (error) {
      console.error(`getUserFollowingAndFavourite_error`, error);
      return null;
    }
  }

  async function technologyCatPageInit(technologySlug: string) {
    getTechnologyCatInsights(technologySlug, {});
    getTechnologyCat(technologySlug);
    insightFilterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
    insightSearchInput.addEventListener("input", (e) => {
      searchObject.search = insightSearchInput.value;
      searchDebounce(technologySlug);
    });
    insightClearFilters.addEventListener("click", () => {
      const checkedFilters = qsa<HTMLInputElement>(
        "[dev-input-checkbox]:checked"
      );

      insightSearchInput.value = "";
      insightSearchInput.dispatchEvent(inputEvent);
      checkedFilters.forEach((input) => {
        input.click();
      });
    });
    getFilters(
      "/company_type",
      {},
      "companyType",
      filterCompanyTypeTarget,
      technologySlug
    );
    getFilters(
      "/source_category",
      {},
      "sourceCat",
      filterSourceCatTarget,
      technologySlug
    );
    getFilters(
      "/technology_category",
      {},
      "techCat",
      filterTechCatTarget,
      technologySlug
    );
    // getFilters(
    //   "/line_of_business",
    //   {},
    //   "lineOfBus",
    //   filterLineOfBusTarget,
    //   technologySlug
    // );
    getFilters(
      "/insight_classification",
      {},
      "insightClass",
      filterInsightClassTarget,
      technologySlug
    );
    sortLogicInit(technologySlug);
  }

  async function getTechnologyCatInsights(slug: string, payload: InsightPayload) {
    const {
      page = 0,
      perPage = 0,
      offset = 0,
    } = payload;
    try {
      const res = await xano_individual_pages.get("/technology_category_insights", {
        slug,
        page,
        perPage,
        offset,
        sortBy: sortObject.sortBy,
        orderBy: sortObject.orderBy,
        filtering:searchObject,
      });
      const eventInsightResponse = res.getBody() as PersonInsightResponse;
      allTabsTarget.innerHTML = "";

      paginationLogic(eventInsightResponse, slug);

      userFollowingAndFavourite &&
        initInsights(
          eventInsightResponse,
          allTabsTarget,
          userFollowingAndFavourite
        );
      insightsSkeleton.remove()
      console.log("eventInsightResponse", eventInsightResponse);
      return eventInsightResponse;
    } catch (error) {
      console.log("getTechnologyCatInsights_error", error);
      return null;
    }
  }

  function paginationLogic(insight: PersonInsightResponse, technologySlug: string) {
    const paginationTarget = qs(`[dev-target="all-tab-pagination_wrapper"]`);

    const { curPage, nextPage, prevPage, pageTotal, itemsReceived } = insight;
    const paginationWrapper = paginationTarget.closest(
      `[dev-target="insight-pagination-wrapper"]`
    );
    const pagination = paginationTemplate.cloneNode(true) as HTMLDivElement;
    const prevBtn = pagination.querySelector(
      `[dev-target=pagination-previous]`
    ) as HTMLButtonElement;
    const nextBtn = pagination.querySelector(
      `[dev-target=pagination-next]`
    ) as HTMLButtonElement;
    const pageItemWrapper = pagination.querySelector(
      `[dev-target=pagination-number-wrapper]`
    ) as HTMLDivElement;
    const pageItem = pagination
      .querySelector(`[dev-target=page-number-temp]`)
      ?.cloneNode(true) as HTMLButtonElement;

    paginationTarget.innerHTML = "";
    pageItemWrapper.innerHTML = "";

    if (itemsReceived === 0) {
      paginationTarget?.classList.add("hide");
      paginationWrapper
        ?.querySelector(`[dev-tab-empty-state]`)
        ?.classList.remove("hide");
    } else {
      paginationTarget?.classList.remove("hide");
      paginationWrapper
        ?.querySelector(`[dev-tab-empty-state]`)
        ?.classList.add("hide");
    }

    if (pageTotal <= 6) {
      for (let i = 1; i <= pageTotal; i++) {
        const pageNumItem = pageItem.cloneNode(true) as HTMLDivElement;
        pageNumItem.textContent = i.toString();
        pageNumItem.classList[curPage === i ? "add" : "remove"]("active");
        pageNumItem.addEventListener("click", () => {
          paginationWrapper?.scrollTo({
            top: 0,
            behavior: "smooth",
          });
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
          getTechnologyCatInsights(technologySlug, { page: i });
          //   getInsights(endPoint, { page: i }, tagTarget);
        });
        pageItemWrapper.appendChild(pageNumItem);
      }
    } else {
      const firstPageNumItem = pageItem.cloneNode(true) as HTMLButtonElement;
      firstPageNumItem.textContent = "1";
      firstPageNumItem.classList[curPage === 1 ? "add" : "remove"]("active");
      firstPageNumItem.addEventListener("click", () => {
        paginationWrapper?.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        getTechnologyCatInsights(technologySlug, { page: 1 });
        // getInsights(endPoint, { page: 1 }, tagTarget);
      });
      pageItemWrapper.appendChild(firstPageNumItem);

      if (curPage > 3) {
        const pagItemDots = pageItem.cloneNode(true) as HTMLButtonElement;
        pagItemDots.textContent = "...";
        pagItemDots.classList["add"]("not-allowed");
        pageItemWrapper.appendChild(pagItemDots);
      }

      for (
        let i = Math.max(2, curPage - 1);
        i <= Math.min(curPage + 1, pageTotal - 1);
        i++
      ) {
        const pageNumItem = pageItem.cloneNode(true) as HTMLButtonElement;
        pageNumItem.classList[curPage === i ? "add" : "remove"]("active");
        pageNumItem.textContent = i.toString();
        pageNumItem.addEventListener("click", () => {
          paginationWrapper?.scrollTo({
            top: 0,
            behavior: "smooth",
          });
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
          getTechnologyCatInsights(technologySlug, { page: i });
          //   getInsights(endPoint, { page: i }, tagTarget);
        });
        pageItemWrapper.appendChild(pageNumItem);
      }

      if (curPage < pageTotal - 2) {
        const pagItemDots = pageItem.cloneNode(true) as HTMLButtonElement;
        pagItemDots.textContent = "...";
        pagItemDots.classList["add"]("not-allowed");
        pageItemWrapper.appendChild(pagItemDots);
      }

      const pageNumItem = pageItem.cloneNode(true) as HTMLButtonElement;
      pageNumItem.textContent = pageTotal.toString();
      pageNumItem.classList[curPage === pageTotal ? "add" : "remove"]("active");
      pageNumItem.addEventListener("click", () => {
        paginationWrapper?.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        getTechnologyCatInsights(technologySlug, { page: 1 });
      });
      pageItemWrapper.appendChild(pageNumItem);
    }

    prevBtn.classList[prevPage ? "remove" : "add"]("disabled");
    nextBtn.classList[nextPage ? "remove" : "add"]("disabled");

    nextPage &&
      nextBtn.addEventListener("click", () => {
        paginationWrapper?.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        getTechnologyCatInsights(technologySlug, { page: curPage + 1 });
      });
    prevPage &&
      prevBtn.addEventListener("click", () => {
        paginationWrapper?.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        getTechnologyCatInsights(technologySlug, { page: curPage - 1 });
        // getInsights(endPoint, { page: curPage - 1 }, tagTarget);
      });
    pagination.style.display = pageTotal === 1 ? "none" : "flex";
    paginationTarget.appendChild(pagination);
  }

  function initInsights(
    insights: PersonInsightResponse,
    target: HTMLDivElement,
    userFollowingAndFavourite: UserFollowingAndFavourite
  ) {
    insights.items.forEach((insight) => {
      const newInsight = insightTemplate.cloneNode(true) as HTMLDivElement;

      const tagsWrapperTarget = newInsight.querySelector<HTMLDivElement>(
        `[dev-target=tags-container]`
      );

      const companyLink = newInsight.querySelector(`[dev-target=company-link]`);
      const companyImage = newInsight.querySelector<HTMLImageElement>(
        `[dev-target=company-image]`
      );
      const insightNameTarget = newInsight.querySelector(
        `[dev-target=insight-name]`
      );
      const insightLink = newInsight.querySelector(`[dev-target=insight-link]`);
      const curatedDateTargetWrapper = newInsight.querySelector(
        `[dev-target="curated-date-wrapper"]`
      );
      const curatedDateTarget = newInsight.querySelector(
        `[dev-target="curated-date"]`
      );
      const publishedDateTargetWrapper = newInsight.querySelectorAll(
        `[dev-target="published-date-wrapper"]`
      );
      const publishedDateTarget = newInsight.querySelector(
        `[dev-target="published-date"]`
      );
      const sourceTargetWrapper = newInsight.querySelector(
        `[dev-target="source-name-link-wrapper"]`
      );
      const sourceTarget = newInsight.querySelector(
        `[dev-target="source-name-link"]`
      );
      const sourceAuthorTargetWrapper = newInsight.querySelectorAll(
        `[dev-target="source-author-wrapper"]`
      );
      const sourceAuthorTarget = newInsight.querySelector(
        `[dev-target="source-author"]`
      );
      const favouriteInput = newInsight.querySelector<HTMLInputElement>(
        `[dev-target=favourite-input]`
      );
      const companyInput = newInsight.querySelector<HTMLInputElement>(
        `[dev-target=company-input]`
      );

      const curatedDate = insight.curated ? formatCuratedDate(insight.curated):"";
      const publishedDate = insight["source-publication-date"]?formatPublishedDate(insight["source-publication-date"]):"";
      const sourceCatArray = insight.source_category_id;
      const companyTypeArray = insight.company_type_id;
      const insightClassArray = insight.insight_classification_id;
      const lineOfBusArray = insight.line_of_business_id;
      const techCatArray = insight.technology_category_id;

      fakeCheckboxToggle(companyInput!);
      fakeCheckboxToggle(favouriteInput!);

      favouriteInput?.setAttribute("dev-input-type", "favourite");
      favouriteInput?.setAttribute("dev-input-id", insight.id.toString());
      companyInput?.setAttribute("dev-input-type", "company_id");
      companyInput?.setAttribute("dev-input-id", insight.company_id.toString());

      favouriteInput && followFavouriteLogic(favouriteInput);
      companyInput && followFavouriteLogic(companyInput);

      favouriteInput &&
        setCheckboxesInitialState(
          favouriteInput,
          userFollowingAndFavourite.user_favourite.insight_id
        );
      companyInput &&
        setCheckboxesInitialState(
          companyInput,
          convertArrayOfObjToNumber(
            userFollowingAndFavourite.user_following.company_id
          )
        );

      addTagsToInsight(sourceCatArray, tagsWrapperTarget!, false);
      addTagsToInsight(companyTypeArray, tagsWrapperTarget!, false);
      addTagsToInsight(insightClassArray, tagsWrapperTarget!, false);
      // addTagsToInsight(lineOfBusArray, tagsWrapperTarget!, false);
      addTagsToInsight(
        techCatArray,
        tagsWrapperTarget!,
        true,
        "technology_category_id"
      );

      if(insight.company_details.company_logo){
        companyImage!.src = insight.company_details.company_logo.url
      }else{
        companyImage!.src =
          "https://logo.clearbit.com/" +
          insight.company_details["company-website"];
        fetch(
          "https://logo.clearbit.com/" +
            insight.company_details["company-website"]
        ).catch(
          () =>
            (companyImage!.src =
              "https://uploads-ssl.webflow.com/64a2a18ba276228b93b991d7/64c7c26d6639a8e16ee7797f_Frame%20427318722.webp")
        );
      }
      insightNameTarget!.textContent = insight.name;
      curatedDateTargetWrapper?.classList[curatedDate ? "remove":"add"]("hide")
      curatedDateTarget!.textContent = curatedDate ?? "";
      publishedDateTarget!.textContent = publishedDate ?? "";
      publishedDateTargetWrapper.forEach((item)=>item.classList[publishedDate ? "remove":"add"]("hide"))
      insightLink!.setAttribute("href", "/insight/" + insight.slug);
      sourceTarget!.setAttribute("href", insight["source-url"]);
      sourceTargetWrapper?.classList[insight["source-url"] ? "remove":"add"]("hide")
      companyLink!.setAttribute(
        "href",
        "/company/" + insight.company_details.slug
      );
      sourceTarget!.textContent = insight.source;
      sourceAuthorTargetWrapper.forEach((item)=>item.classList[insight.source_author ? "remove":"add"]("hide"))
      sourceAuthorTarget!.textContent = insight.source_author;
      target.appendChild(newInsight);
    });
  }

  const searchDebounce = debounce(insightSearch, 500);

  function insightSearch(technologySlug: string) {
    getTechnologyCatInsights(technologySlug, {
      orderBy: sortObject.orderBy,
      sortBy: sortObject.sortBy,
    });
  }

  function followFavouriteLogic(input: HTMLInputElement) {
    input.addEventListener("change", async () =>
      followFavouriteDebounce(input)
    );
  }

  const followFavouriteDebounce = debounce(followFavouriteListener, 300);

  async function followFavouriteListener(input: HTMLInputElement) {
    const type = input.getAttribute("dev-input-type")!;
    const id = input.getAttribute("dev-input-id")!;
    const endPoint =
      type === "favourite" ? "/toggle-favourite" : "/toggle-follow";
    try {
      const res = await xano_userFeed.get(endPoint, {
        id: Number(id),
        target: type,
      });
      await getUserFollowingAndFavourite();
      // run function to updated all-tab inputs

      allTabsTarget.childNodes.forEach((insight) => {
        updateInsightsInputs(insight as HTMLDivElement);
      });
    } catch (error) {
      console.error(`followFavouriteLogic${endPoint}_error`, error);
      return null;
    }
  }

  function sortLogicInit(technologySlug: string) {
    const sortItems = qsa<HTMLLinkElement>(`[dev-target="sort"]`);
    sortItems.forEach((item) => {
      item.addEventListener("click", () => {
        sortItems.forEach((sortItem)=>{
          sortItem.classList.remove("active")
        })
        item.classList.add("active")
        const value = item.textContent;
        qs(`[dev-target=sorted-item-name]`).textContent = value
        const orderBy = item.getAttribute("dev-orderby");
        const sortBy = item.getAttribute("dev-sortby");

        if (sortBy && orderBy) {
          sortObject.sortBy = sortBy;
          sortObject.orderBy = orderBy;
        }

        getTechnologyCatInsights(technologySlug, {});
      });
    });
  }

  async function getFilters(
    endPoint:
      | "/company_type"
      | "/insight_classification"
      | "/line_of_business"
      | "/source_category"
      | "/technology_category",
    payload: { page?: number; perPage?: number; offset?: number },
    type:
      | "companyType"
      | "sourceCat"
      | "techCat"
      | "lineOfBus"
      | "insightClass",
    targetWrapper: HTMLDivElement,
    technologySlug: string
  ) {
    const { page = 0, perPage = 0, offset = 0 } = payload;
    try {
      const res = await xano_individual_pages.get(endPoint, {
        page,
        perPage,
        offset,
        type: {
          technology: {
            slug: technologySlug,
            value: true,
          },
        },
      });
      const filters = res.getBody() as FilterResponse;
      filters.items.forEach((filter) => {
        const newFilter = checkboxItemTemplate.cloneNode(
          true
        ) as HTMLDivElement;
        const input =
          newFilter.querySelector<HTMLInputElement>("[dev-target=input]");
        input && fakeCheckboxToggle(input);
        input?.addEventListener("change", () => {
          if (input.checked) {
            searchObject.checkboxes[type].push(filter.id);
          } else {
            searchObject.checkboxes[type] = searchObject.checkboxes[
              type
            ].filter((item) => item != filter.id);
          }
          searchDebounce(technologySlug);
        });
        newFilter.querySelector("[dev-target=name]")!.textContent = filter.name;
        targetWrapper.appendChild(newFilter);
      });
      return filters;
    } catch (error) {
      console.error(`getFilters_${endPoint}_error`, error);
      return null;
    }
  }

  function updateInsightsInputs(insight: HTMLDivElement) {
    const companyInput = insight.querySelector<HTMLInputElement>(
      `[dev-input-type="company_id"]`
    );
    const favourite = insight.querySelector<HTMLInputElement>(
      `[dev-input="fav-insight"]`
    );
    const tagInputs = insight.querySelectorAll<HTMLInputElement>(
      `[dev-input-type="technology_category_id"]`
    );

    companyInput &&
      setCheckboxesInitialState(
        companyInput,
        convertArrayOfObjToNumber(
          userFollowingAndFavourite?.user_following.company_id!
        )
      );
    favourite &&
      setCheckboxesInitialState(
        favourite,
        userFollowingAndFavourite?.user_favourite.insight_id!
      );

    tagInputs?.forEach((tag) => {
      setCheckboxesInitialState(
        tag,
        convertArrayOfObjToNumber(
          userFollowingAndFavourite?.user_following.technology_category_id!
        )
      );
    });
  }

  async function getTechnologyCat(slug: string) {
    try {
      const res = await xano_individual_pages.get("/technology_category_item", {
        slug,
      });
      const event = res.getBody() as Event;
      qs("title").textContent = event.name
      console.log("event", event);

      const techCatName = techCatCard.querySelector<HTMLHeadingElement>(
        `[dev-target=event-name]`
      );
      
      const eventImageWrapper = techCatCard.querySelector(
        `[dev-target=event-image-wrapper]`
      );
      const eventImageLink =
        eventImageWrapper?.querySelector<HTMLLinkElement>(
          `[dev-target=event-picture-link]`
        );
      const eventImage = eventImageWrapper?.querySelector(
        `[dev-target=event-image]`
      );
      const eventInput = eventImageWrapper?.querySelector<HTMLInputElement>(
        `[dev-target=event-input]`
      );

      techCatName!.textContent = event.name;

      cardSkeleton.remove()
      techCatCard.classList.remove("dev-hide")

      fakeCheckboxToggle(eventInput!);
      eventInput?.setAttribute("dev-input-type", "technology_category_id");
      eventInput?.setAttribute("dev-input-id", event.id.toString());
      eventInput && followFavouriteLogic(eventInput);
      eventInput &&
        setCheckboxesInitialState(
          eventInput,
          convertArrayOfObjToNumber(
            userFollowingAndFavourite!.user_following.technology_category_id
          )
        );

      eventDetails.forEach((item) => {
        item.classList.remove("opacity-hide");
      });

      return event;
    } catch (error) {
      console.log("getTechnologyCat_error", error);
      return null;
    }
  }

  function setCheckboxesInitialState(
    input: HTMLInputElement,
    slugArray: number[]
  ) {
    const inputId = input.getAttribute("dev-input-id");

    if (slugArray.includes(Number(inputId))) {
      input.checked = true;
      input
        .closest<HTMLDivElement>("[dev-fake-checkbox-wrapper]")
        ?.classList.add("checked");
    } else {
      input.checked = false;
      input
        .closest<HTMLDivElement>("[dev-fake-checkbox-wrapper]")
        ?.classList.remove("checked");
    }
  }

  function addTagsToInsight(
    tagArray: (
      | 0
      | {
          id: number;
          name: string;
          slug: string;
        }
      | null
    )[],
    targetWrapper: HTMLDivElement,
    showCheckbox: boolean,
    type?: "technology_category_id"
  ) {
    tagArray.forEach((item) => {
      if (typeof item === "object" && item !== null) {
        const newTag = insightTagTemplate.cloneNode(true) as HTMLDivElement;
        const tagCheckbox = newTag.querySelector<HTMLDivElement>(
          `[dev-target=fake-checkbox]`
        );
        const tagInput = newTag.querySelector<HTMLInputElement>(
          `[dev-target=tag-input]`
        );
        showCheckbox && tagInput && fakeCheckboxToggle(tagInput);
        showCheckbox && type && tagInput && tagInput.setAttribute("dev-input-type", type);
        showCheckbox && tagInput && tagInput.setAttribute("dev-input-id", item.id.toString());
        showCheckbox && tagInput && followFavouriteLogic(tagInput);
        newTag.querySelector(`[dev-target=tag-name]`)!.textContent =
          item?.name!;

        if(showCheckbox){
          const tagSpan = newTag.querySelector<HTMLSpanElement>(`[dev-target="tag-name"]`)
          newTag.style.cursor = "pointer"
          newTag.querySelector<HTMLLabelElement>(`[dev-fake-checkbox-wrapper]`)!.style.cursor = "pointer"
          const anchor = document.createElement('a');
          anchor.href = `/technology/${item.slug}`
          anchor.textContent = tagSpan!.textContent
          anchor.style.cursor = "pointer"
          anchor.classList.add("tag-span-name")
          tagSpan?.replaceWith(anchor)
        }

        if (tagCheckbox && !showCheckbox) {
          tagCheckbox.style.display = "none";
        }
        if (showCheckbox && tagInput && userFollowingAndFavourite) {
          setCheckboxesInitialState(
            tagInput,
            convertArrayOfObjToNumber(
              userFollowingAndFavourite?.user_following.technology_category_id
            )
          );
        }

        targetWrapper?.appendChild(newTag);
      }
    });
  }

  function formatCuratedDate(inputDate:Date) {
    const date = new Date(inputDate);
    return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
  }

  function formatPublishedDate(inputDate:Date) {
    const date = new Date(inputDate);
    return `${date.toLocaleString('default', { month: 'long' })} ${date.getDate()}, ${date.getFullYear()}`;
  }


  // Function to debounce a given function
  function debounce(func: (...args: any[]) => void, delay: number) {
    let debounceTimer: ReturnType<typeof setTimeout>;
    return function (this: any, ...args: any[]) {
      const context = this;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
  }

  // Function for querying a single element by selector
  function qs<T extends HTMLElement = HTMLDivElement>(selector: string): T {
    return document.querySelector(selector) as T;
  }

  // Function to toggle fake checkboxes
  function fakeCheckboxToggle(input: HTMLInputElement) {
    input.addEventListener("change", () => {
      const inputWrapper = input.closest(
        "[dev-fake-checkbox-wrapper]"
      ) as HTMLDivElement;
      inputWrapper.classList[input.checked ? "add" : "remove"]("checked");
    });
  }

  function convertArrayOfObjToNumber(data: { id: number }[]) {
    return data.map((item) => item.id);
  }

  // Function for querying multiple elements by selector
  function qsa<T extends HTMLElement = HTMLDivElement>(
    selector: string
  ): NodeListOf<T> {
    return document.querySelectorAll(selector) as NodeListOf<T>;
  }
});

interface Event {
  id: number;
  created_at: string;
  name: string;
  slug: string;
  "event-start-date": string;
  "event-end-date": string;
  "event-city-state": string;
  "event-venue-name": string;
  people_id: number[];
  "event-description": string;
  image: null;
}