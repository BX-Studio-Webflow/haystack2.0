"use strict";
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
    const searchObject = {
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
    const personSlug = searchParams.get("name");
    let userFollowingAndFavourite = null;
    let xanoToken = null;
    const personCards = qsa("[dev-target=person-card]");
    const cardSkeletons = qsa("[dev-target=card-skeleton]");
    const insightsSkeleton = qs("[dev-target=skeleton-insights]");
    const personDetails = qsa("[dev-target=person-details]");
    const insightSearchInput = qs("[dev-search-target]");
    const insightFilterForm = qs("[dev-target=filter-form]");
    const insightClearFilters = qs("[dev-target=clear-filters]");
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
    const lsUserFollowingFavourite = localStorage.getItem("user-following-favourite");
    const lsXanoAuthToken = localStorage.getItem("AuthToken");
    if (lsXanoAuthToken) {
        xanoToken = lsXanoAuthToken;
    }
    if (lsUserFollowingFavourite) {
        userFollowingAndFavourite = JSON.parse(lsUserFollowingFavourite);
    }
    if (!personSlug) {
        return console.error("add person name in the url eg /person/andre-gouin");
    }
    if (xanoToken) {
        xano_userFeed.setAuthToken(xanoToken);
        xano_individual_pages.setAuthToken(xanoToken);
        getXanoAccessToken(memberStackUserToken);
    }
    else {
        await getXanoAccessToken(memberStackUserToken);
    }
    lsUserFollowingFavourite
        ? getUserFollowingAndFavourite()
        : await getUserFollowingAndFavourite();
    peoplePageInit(personSlug);
    async function getXanoAccessToken(memberstackToken) {
        try {
            const res = await xano_wmx.post("/auth-user", {
                memberstack_token: memberstackToken,
            });
            const xanoAuthToken = res.getBody().authToken;
            xano_userFeed.setAuthToken(xanoAuthToken);
            xano_individual_pages.setAuthToken(xanoAuthToken);
            return xanoAuthToken;
        }
        catch (error) {
            console.log("getXanoAccessToken_error", error);
            return null;
        }
    }
    async function getUserFollowingAndFavourite() {
        try {
            const res = await xano_userFeed.get("/user-following-and-favourite");
            const followingAndFavourite = res.getBody();
            const { user_following } = followingAndFavourite;
            userFollowingAndFavourite = followingAndFavourite;
            localStorage.setItem("user-following-favourite", JSON.stringify(followingAndFavourite));
            return followingAndFavourite;
        }
        catch (error) {
            console.error(`getUserFollowingAndFavourite_error`, error);
            return null;
        }
    }
    async function peoplePageInit(personSlug) {
        getPersonInsights(personSlug, {});
        getPerson(personSlug);
        insightFilterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        insightSearchInput.addEventListener("input", (e) => {
            searchObject.search = insightSearchInput.value;
            searchDebounce(personSlug);
        });
        insightClearFilters.addEventListener("click", () => {
            const checkedFilters = qsa("[dev-input-checkbox]:checked");
            insightSearchInput.value = "";
            insightSearchInput.dispatchEvent(inputEvent);
            checkedFilters.forEach((input) => {
                input.click();
            });
        });
        getFilters("/company_type", {}, "companyType", filterCompanyTypeTarget, personSlug);
        getFilters("/source_category", {}, "sourceCat", filterSourceCatTarget, personSlug);
        getFilters("/technology_category", {}, "techCat", filterTechCatTarget, personSlug);
        // getFilters(
        //   "/line_of_business",
        //   {},
        //   "lineOfBus",
        //   filterLineOfBusTarget,
        //   personSlug
        // );
        getFilters("/insight_classification", {}, "insightClass", filterInsightClassTarget, personSlug);
        sortLogicInit(personSlug);
    }
    async function getPerson(slug) {
        try {
            const res = await xano_individual_pages.get("/person", {
                slug,
            });
            const person = res.getBody();
            if (person === null) {
                return window.location.href = "/404";
            }
            qs("title").textContent = person.name;
            console.log("person", person);
            personCards.forEach((personCard) => {
                const personName = personCard.querySelector(`[dev-target=person-name]`);
                const personEmail = personCard.querySelector(`[dev-target=email-link]`);
                const personTitle = personCard.querySelector(`[dev-target=person-title]`);
                const personBio = personCard.querySelector(`[dev-target=person-bio]`);
                const personCompanyLink = personCard.querySelector(`[dev-target=person-company-link]`);
                const personLinkedinLink = personCard.querySelector(`[dev-target=linkedin-link]`);
                const personImageWrapper = personCard.querySelector(`[dev-target=person-image-wrapper]`);
                const personImageLink = personImageWrapper?.querySelector(`[dev-target=person-picture-link]`);
                const PersonImage = personImageWrapper?.querySelector(`[dev-target=person-image]`);
                const personInput = personImageWrapper?.querySelector(`[dev-target=person-input]`);
                personName.textContent = person.name;
                personTitle.textContent = person.title;
                personBio.textContent = person.bio;
                personCompanyLink.textContent = person.company_details.name;
                personCompanyLink.href = "company/" + person.company_details.slug;
                personLinkedinLink.href = person.linkedin;
                personLinkedinLink?.classList[person.linkedin ? "remove" : "add"]("hide");
                personEmail.href = person.email ? "mailto:" + person.email : "#";
                personEmail?.classList[person.email ? "remove" : "add"]("hide");
                cardSkeletons.forEach((cardSkeleton) => cardSkeleton.remove());
                personCard.classList.remove("dev-hide");
                fakeCheckboxToggle(personInput);
                personInput?.setAttribute("dev-input-type", "people_id");
                personInput?.setAttribute("dev-input-id", person.id.toString());
                personInput && followFavouriteLogic(personInput);
                personInput &&
                    setCheckboxesInitialState(personInput, convertArrayOfObjToNumber(userFollowingAndFavourite.user_following.people_id));
            });
            personDetails.forEach((personDetail) => personDetail.classList.remove("opacity-hide"));
            return person;
        }
        catch (error) {
            console.log("getPerson_error", error);
            return null;
        }
    }
    async function getPersonInsights(slug, payload) {
        const { page = 0, perPage = 0, offset = 0, } = payload;
        try {
            const res = await xano_individual_pages.get("/person_insights", {
                slug,
                page,
                perPage,
                offset,
                sortBy: sortObject.sortBy,
                orderBy: sortObject.orderBy,
                filtering: searchObject,
            });
            const personInsightResponse = res.getBody();
            allTabsTarget.innerHTML = "";
            paginationLogic(personInsightResponse, slug);
            userFollowingAndFavourite &&
                initInsights(personInsightResponse, allTabsTarget, userFollowingAndFavourite);
            insightsSkeleton.remove();
            console.log("personInsightResponse", personInsightResponse);
            return personInsightResponse;
        }
        catch (error) {
            console.log("getPersonInsights_error", error);
            return null;
        }
    }
    async function getFilters(endPoint, payload, type, targetWrapper, personSlug) {
        const { page = 0, perPage = 0, offset = 0 } = payload;
        try {
            const res = await xano_individual_pages.get(endPoint, {
                page,
                perPage,
                offset,
                type: {
                    people: {
                        slug: personSlug,
                        value: true,
                    },
                },
            });
            const filters = res.getBody();
            filters.forEach((filter) => {
                const newFilter = checkboxItemTemplate.cloneNode(true);
                const input = newFilter.querySelector("[dev-target=input]");
                input && fakeCheckboxToggle(input);
                input?.addEventListener("change", () => {
                    if (input.checked) {
                        searchObject.checkboxes[type].push(filter.id);
                    }
                    else {
                        searchObject.checkboxes[type] = searchObject.checkboxes[type].filter((item) => item != filter.id);
                    }
                    searchDebounce(personSlug);
                });
                newFilter.querySelector("[dev-target=name]").textContent = filter.name;
                targetWrapper.appendChild(newFilter);
            });
            return filters;
        }
        catch (error) {
            console.error(`getFilters_${endPoint}_error`, error);
            return null;
        }
    }
    function initInsights(insights, target, userFollowingAndFavourite) {
        insights.items.forEach((insight) => {
            const newInsight = insightTemplate.cloneNode(true);
            const tagsWrapperTarget = newInsight.querySelector(`[dev-target=tags-container]`);
            const companyLink = newInsight.querySelector(`[dev-target=company-link]`);
            const companyImage = newInsight.querySelector(`[dev-target=company-image]`);
            const insightNameTarget = newInsight.querySelector(`[dev-target=insight-name]`);
            const insightLink = newInsight.querySelector(`[dev-target=insight-link]`);
            const curatedDateTargetWrapper = newInsight.querySelector(`[dev-target="curated-date-wrapper"]`);
            const curatedDateTarget = newInsight.querySelector(`[dev-target="curated-date"]`);
            const publishedDateTargetWrapper = newInsight.querySelectorAll(`[dev-target="published-date-wrapper"]`);
            const publishedDateTarget = newInsight.querySelector(`[dev-target="published-date"]`);
            const sourceTargetWrapper = newInsight.querySelector(`[dev-target="source-name-link-wrapper"]`);
            const sourceTarget = newInsight.querySelector(`[dev-target="source-name-link"]`);
            const sourceAuthorTargetWrapper = newInsight.querySelectorAll(`[dev-target="source-author-wrapper"]`);
            const sourceAuthorTarget = newInsight.querySelector(`[dev-target="source-author"]`);
            const curatedDate = insight.curated ? formatCuratedDate(insight.curated) : "";
            const publishedDate = insight["source-publication-date"] ? formatPublishedDate(insight["source-publication-date"]) : "";
            const sourceCatArray = insight.source_category_id;
            const companyTypeArray = insight.company_type_id;
            const insightClassArray = insight.insight_classification_id;
            const lineOfBusArray = insight.line_of_business_id;
            const techCatArray = insight.technology_category_id;
            const companyInputs = newInsight.querySelectorAll(`[dev-target=company-input]`);
            companyInputs.forEach((companyInput) => {
                fakeCheckboxToggle(companyInput);
                companyInput?.setAttribute("dev-input-type", "company_id");
                companyInput?.setAttribute("dev-input-id", insight.company_id.toString());
                companyInput && followFavouriteLogic(companyInput);
                companyInput &&
                    setCheckboxesInitialState(companyInput, convertArrayOfObjToNumber(userFollowingAndFavourite.user_following.company_id));
            });
            const favouriteInputs = newInsight.querySelectorAll(`[dev-target=favourite-input]`);
            favouriteInputs.forEach((favouriteInput) => {
                fakeCheckboxToggle(favouriteInput);
                favouriteInput?.setAttribute("dev-input-type", "favourite");
                favouriteInput?.setAttribute("dev-input-id", insight.id.toString());
                favouriteInput && followFavouriteLogic(favouriteInput);
                favouriteInput &&
                    setCheckboxesInitialState(favouriteInput, userFollowingAndFavourite.user_favourite.insight_id);
            });
            addTagsToInsight(sourceCatArray, tagsWrapperTarget, false);
            addTagsToInsight(companyTypeArray, tagsWrapperTarget, false);
            addTagsToInsight(insightClassArray, tagsWrapperTarget, false);
            // addTagsToInsight(lineOfBusArray, tagsWrapperTarget!, false);
            addTagsToInsight(techCatArray, tagsWrapperTarget, true, "technology_category_id");
            if (insight.company_details.company_logo) {
                companyImage.src = insight.company_details.company_logo.url;
            }
            else {
                companyImage.src = "https://logo.clearbit.com/" + insight.company_details["company-website"];
                fetch("https://logo.clearbit.com/" +
                    insight.company_details["company-website"]).catch(() => (companyImage.src =
                    "https://uploads-ssl.webflow.com/64a2a18ba276228b93b991d7/64c7c26d6639a8e16ee7797f_Frame%20427318722.webp"));
            }
            insightNameTarget.textContent = insight.name;
            curatedDateTargetWrapper?.classList[curatedDate ? "remove" : "add"]("hide");
            curatedDateTarget.textContent = curatedDate ?? "";
            publishedDateTarget.textContent = publishedDate ?? "";
            publishedDateTargetWrapper.forEach((item) => item.classList[publishedDate ? "remove" : "add"]("hide"));
            insightLink.setAttribute("href", "/insight/" + insight.slug);
            sourceTarget.setAttribute("href", insight["source-url"]);
            sourceTargetWrapper?.classList[insight["source-url"] ? "remove" : "add"]("hide");
            companyLink.setAttribute("href", "/company/" + insight.company_details.slug);
            sourceTarget.textContent = insight.source;
            sourceAuthorTargetWrapper.forEach((item) => item.classList[insight.source_author ? "remove" : "add"]("hide"));
            sourceAuthorTarget.textContent = insight.source_author;
            target.appendChild(newInsight);
        });
    }
    const searchDebounce = debounce(insightSearch, 500);
    function insightSearch(personSlug) {
        getPersonInsights(personSlug, {
            orderBy: sortObject.orderBy,
            sortBy: sortObject.sortBy,
        });
    }
    function sortLogicInit(personSlug) {
        const sortItems = qsa(`[dev-target="sort"]`);
        sortItems.forEach((item) => {
            item.addEventListener("click", () => {
                sortItems.forEach((sortItem) => {
                    sortItem.classList.remove("active");
                });
                item.classList.add("active");
                const value = item.textContent;
                qs(`[dev-target=sorted-item-name]`).textContent = value;
                const orderBy = item.getAttribute("dev-orderby");
                const sortBy = item.getAttribute("dev-sortby");
                if (sortBy && orderBy) {
                    sortObject.sortBy = sortBy;
                    sortObject.orderBy = orderBy;
                }
                getPersonInsights(personSlug, {});
                // getInsights("/insight-all-tab", {}, allTabsTarget);
                // getInsights("/insight-following-tab", {}, followingTabsTarget);
                // getInsights("/insight-favourite-tab", {}, favouriteTabsTarget);
            });
        });
    }
    function followFavouriteLogic(input) {
        input.addEventListener("change", async () => followFavouriteDebounce(input));
    }
    const followFavouriteDebounce = debounce(followFavouriteListener, 300);
    async function followFavouriteListener(input) {
        const type = input.getAttribute("dev-input-type");
        const id = input.getAttribute("dev-input-id");
        const endPoint = type === "favourite" ? "/toggle-favourite" : "/toggle-follow";
        try {
            const res = await xano_userFeed.get(endPoint, {
                id: Number(id),
                target: type,
            });
            await getUserFollowingAndFavourite();
            // run function to updated all-tab inputs
            allTabsTarget.childNodes.forEach((insight) => {
                updateInsightsInputs(insight);
            });
        }
        catch (error) {
            console.error(`followFavouriteLogic${endPoint}_error`, error);
            return null;
        }
    }
    function updateInsightsInputs(insight) {
        const companyInputs = insight.querySelectorAll(`[dev-input-type="company_id"]`);
        companyInputs.forEach((companyInput) => {
            companyInput &&
                setCheckboxesInitialState(companyInput, convertArrayOfObjToNumber(userFollowingAndFavourite?.user_following.company_id));
        });
        const favorites = insight.querySelectorAll(`[dev-input="fav-insight"]`);
        favorites.forEach((favourite) => {
            favourite &&
                setCheckboxesInitialState(favourite, userFollowingAndFavourite?.user_favourite.insight_id);
        });
        const tagInputs = insight.querySelectorAll(`[dev-input-type="technology_category_id"]`);
        tagInputs?.forEach((tag) => {
            setCheckboxesInitialState(tag, convertArrayOfObjToNumber(userFollowingAndFavourite?.user_following.technology_category_id));
        });
    }
    function setCheckboxesInitialState(input, slugArray) {
        const inputId = input.getAttribute("dev-input-id");
        if (slugArray.includes(Number(inputId))) {
            input.checked = true;
            input
                .closest("[dev-fake-checkbox-wrapper]")
                ?.classList.add("checked");
        }
        else {
            input.checked = false;
            input
                .closest("[dev-fake-checkbox-wrapper]")
                ?.classList.remove("checked");
        }
    }
    function addTagsToInsight(tagArray, targetWrapper, showCheckbox, type) {
        tagArray.forEach((item) => {
            if (typeof item === "object" && item !== null) {
                const newTag = insightTagTemplate.cloneNode(true);
                const tagCheckbox = newTag.querySelector(`[dev-target=fake-checkbox]`);
                const tagInput = newTag.querySelector(`[dev-target=tag-input]`);
                showCheckbox && tagInput && fakeCheckboxToggle(tagInput);
                showCheckbox && type && tagInput && tagInput.setAttribute("dev-input-type", type);
                showCheckbox && tagInput && tagInput.setAttribute("dev-input-id", item.id.toString());
                showCheckbox && tagInput && followFavouriteLogic(tagInput);
                newTag.querySelector(`[dev-target=tag-name]`).textContent =
                    item?.name;
                if (showCheckbox) {
                    const tagSpan = newTag.querySelector(`[dev-target="tag-name"]`);
                    newTag.style.cursor = "pointer";
                    newTag.querySelector(`[dev-fake-checkbox-wrapper]`).style.cursor = "pointer";
                    const anchor = document.createElement('a');
                    anchor.href = `/technology/${item.slug}`;
                    anchor.textContent = tagSpan.textContent;
                    anchor.style.cursor = "pointer";
                    anchor.classList.add("tag-span-name");
                    tagSpan?.replaceWith(anchor);
                }
                if (tagCheckbox && !showCheckbox) {
                    tagCheckbox.style.display = "none";
                }
                if (showCheckbox && tagInput && userFollowingAndFavourite) {
                    setCheckboxesInitialState(tagInput, convertArrayOfObjToNumber(userFollowingAndFavourite?.user_following.technology_category_id));
                }
                targetWrapper?.appendChild(newTag);
            }
        });
    }
    function paginationLogic(insight, personSlug) {
        const paginationTarget = qs(`[dev-target="all-tab-pagination_wrapper"]`);
        const { curPage, nextPage, prevPage, pageTotal, itemsReceived } = insight;
        const paginationWrapper = paginationTarget.closest(`[dev-target="insight-pagination-wrapper"]`);
        const pagination = paginationTemplate.cloneNode(true);
        const prevBtn = pagination.querySelector(`[dev-target=pagination-previous]`);
        const nextBtn = pagination.querySelector(`[dev-target=pagination-next]`);
        const pageItemWrapper = pagination.querySelector(`[dev-target=pagination-number-wrapper]`);
        const pageItem = pagination
            .querySelector(`[dev-target=page-number-temp]`)
            ?.cloneNode(true);
        paginationTarget.innerHTML = "";
        pageItemWrapper.innerHTML = "";
        if (itemsReceived === 0) {
            paginationTarget?.classList.add("hide");
            paginationWrapper
                ?.querySelector(`[dev-tab-empty-state]`)
                ?.classList.remove("hide");
        }
        else {
            paginationTarget?.classList.remove("hide");
            paginationWrapper
                ?.querySelector(`[dev-tab-empty-state]`)
                ?.classList.add("hide");
        }
        // if (pageTotal <= 6) {
        //   for (let i = 1; i <= pageTotal; i++) {
        //     const pageNumItem = pageItem.cloneNode(true) as HTMLDivElement;
        //     pageNumItem.textContent = i.toString();
        //     pageNumItem.classList[curPage === i ? "add" : "remove"]("active");
        //     pageNumItem.addEventListener("click", () => {
        //       paginationWrapper?.scrollTo({
        //         top: 0,
        //         behavior: "smooth",
        //       });
        //       window.scrollTo({
        //         top: 0,
        //         behavior: "smooth",
        //       });
        //       getPersonInsights(personSlug, { page: i });
        //       //   getInsights(endPoint, { page: i }, tagTarget);
        //     });
        //     pageItemWrapper.appendChild(pageNumItem);
        //   }
        // } else {
        //   const firstPageNumItem = pageItem.cloneNode(true) as HTMLButtonElement;
        //   firstPageNumItem.textContent = "1";
        //   firstPageNumItem.classList[curPage === 1 ? "add" : "remove"]("active");
        //   firstPageNumItem.addEventListener("click", () => {
        //     paginationWrapper?.scrollTo({
        //       top: 0,
        //       behavior: "smooth",
        //     });
        //     window.scrollTo({
        //       top: 0,
        //       behavior: "smooth",
        //     });
        //     getPersonInsights(personSlug, { page: 1 });
        //     // getInsights(endPoint, { page: 1 }, tagTarget);
        //   });
        //   pageItemWrapper.appendChild(firstPageNumItem);
        //   if (curPage > 3) {
        //     const pagItemDots = pageItem.cloneNode(true) as HTMLButtonElement;
        //     pagItemDots.textContent = "...";
        //     pagItemDots.classList["add"]("not-allowed");
        //     pageItemWrapper.appendChild(pagItemDots);
        //   }
        //   for (
        //     let i = Math.max(2, curPage - 1);
        //     i <= Math.min(curPage + 1, pageTotal - 1);
        //     i++
        //   ) {
        //     const pageNumItem = pageItem.cloneNode(true) as HTMLButtonElement;
        //     pageNumItem.classList[curPage === i ? "add" : "remove"]("active");
        //     pageNumItem.textContent = i.toString();
        //     pageNumItem.addEventListener("click", () => {
        //       paginationWrapper?.scrollTo({
        //         top: 0,
        //         behavior: "smooth",
        //       });
        //       window.scrollTo({
        //         top: 0,
        //         behavior: "smooth",
        //       });
        //       getPersonInsights(personSlug, { page: i });
        //       //   getInsights(endPoint, { page: i }, tagTarget);
        //     });
        //     pageItemWrapper.appendChild(pageNumItem);
        //   }
        //   if (curPage < pageTotal - 2) {
        //     const pagItemDots = pageItem.cloneNode(true) as HTMLButtonElement;
        //     pagItemDots.textContent = "...";
        //     pagItemDots.classList["add"]("not-allowed");
        //     pageItemWrapper.appendChild(pagItemDots);
        //   }
        //   const pageNumItem = pageItem.cloneNode(true) as HTMLButtonElement;
        //   pageNumItem.textContent = pageTotal.toString();
        //   pageNumItem.classList[curPage === pageTotal ? "add" : "remove"]("active");
        //   pageNumItem.addEventListener("click", () => {
        //     paginationWrapper?.scrollTo({
        //       top: 0,
        //       behavior: "smooth",
        //     });
        //     window.scrollTo({
        //       top: 0,
        //       behavior: "smooth",
        //     });
        //     getPersonInsights(personSlug, { page: 1 });
        //     // getInsights(endPoint, { page: pageTotal }, tagTarget);
        //   });
        //   pageItemWrapper.appendChild(pageNumItem);
        // }
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
                getPersonInsights(personSlug, { page: curPage + 1 });
                // getInsights(endPoint, { page: curPage + 1 }, tagTarget);
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
                getPersonInsights(personSlug, { page: curPage - 1 });
                // getInsights(endPoint, { page: curPage - 1 }, tagTarget);
            });
        // pagination.style.display = pageTotal === 1 ? "none" : "flex";
        if (nextPage === null && prevPage === null) {
            paginationTarget?.classList.add("hide");
        }
        ;
        paginationTarget.appendChild(pagination);
    }
    // Function to debounce a given function
    function debounce(func, delay) {
        let debounceTimer;
        return function (...args) {
            const context = this;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    }
    function formatCuratedDate(inputDate) {
        const date = new Date(inputDate);
        return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    }
    function formatPublishedDate(inputDate) {
        const date = new Date(inputDate);
        return `${date.toLocaleString('default', { month: 'long' })} ${date.getUTCDate()}, ${date.getFullYear()}`;
    }
    // Function for querying a single element by selector
    function qs(selector) {
        return document.querySelector(selector);
    }
    // Function to toggle fake checkboxes
    function fakeCheckboxToggle(input) {
        input.addEventListener("change", () => {
            const inputWrapper = input.closest("[dev-fake-checkbox-wrapper]");
            inputWrapper.classList[input.checked ? "add" : "remove"]("checked");
        });
    }
    function convertArrayOfObjToNumber(data) {
        return data.map((item) => item.id);
    }
    // Function for querying multiple elements by selector
    function qsa(selector) {
        return document.querySelectorAll(selector);
    }
});
