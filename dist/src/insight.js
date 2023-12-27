"use strict";
// import { XanoClient } from "@xano/js-sdk";
document.addEventListener("DOMContentLoaded", async () => {
    console.log("insight-dev");
    const xano_individual_pages = new XanoClient({
        apiGroupBaseUrl: "https://xhka-anc3-3fve.n7c.xano.io/api:CvEH0ZFk",
    });
    const xano_wmx = new XanoClient({
        apiGroupBaseUrl: "https://xhka-anc3-3fve.n7c.xano.io/api:6Ie7e140",
    });
    const xano_userFeed = new XanoClient({
        apiGroupBaseUrl: "https://xhka-anc3-3fve.n7c.xano.io/api:Hv8ldLVU",
    });
    const insightTagTemplate = qs(`[dev-template="insight-tag"]`);
    let userFollowingAndFavourite = null;
    let xanoToken = null;
    const insightTemplate = qs(`[dev-target="insight-template"]`);
    const companyCard = qs(`[dev-target="company-card"]`);
    const peopleCard = qs(`[dev-target="people-card"]`);
    const eventCard = qs(`[dev-target="event-card"]`);
    const searchParams = new URLSearchParams(window.location.search);
    const insightSlug = searchParams.get("name");
    const lsUserFollowingFavourite = localStorage.getItem("user-following-favourite");
    const lsXanoAuthToken = localStorage.getItem("AuthToken");
    if (lsXanoAuthToken) {
        xanoToken = lsXanoAuthToken;
    }
    if (lsUserFollowingFavourite) {
        userFollowingAndFavourite = JSON.parse(lsUserFollowingFavourite);
    }
    if (!insightSlug) {
        return console.error("add insight name in the url eg /insight/electric");
    }
    const memberStackUserToken = localStorage.getItem("_ms-mid");
    if (!memberStackUserToken) {
        return console.error("No memberstack token");
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
    insightPageInit(insightSlug);
    async function insightPageInit(insightSlug) {
        const insight = await getInsight(insightSlug);
        if (insight) {
            const companyItemTemplate = companyCard.querySelector(`[dev-target="company-template"]`);
            const peopleItemTemplate = peopleCard.querySelector(`[dev-target="people-template"]`);
            const eventItemTemplate = eventCard.querySelector(`[dev-target="event-link"]`);
            const tagsWrapperTarget = insightTemplate.querySelector(`[dev-target=tags-container]`);
            const insightName = insightTemplate.querySelector(`[dev-target="insight-name"]`);
            const insightRichtext = insightTemplate.querySelector(`[dev-target="rich-text"]`);
            const favouriteInput = insightTemplate.querySelector(`[dev-target=favourite-input]`);
            const companyInput = insightTemplate.querySelector(`[dev-target=company-input]`);
            const companyImage = insightTemplate.querySelector(`[dev-target=company-image]`);
            const companyLink = insightTemplate.querySelector(`[dev-target=company-link]`);
            const curatedDateTarget = insightTemplate.querySelector(`[dev-target="curated-date"]`);
            const publishedDateTarget = insightTemplate.querySelector(`[dev-target="published-date"]`);
            const sourceTarget = insightTemplate.querySelector(`[dev-target="source-name-link"]`);
            const sourceAuthorTarget = insightTemplate.querySelector(`[dev-target="source-author"]`);
            const curatedDate = insight.curated?.toLocaleString("en-US", {
                month: "short",
                year: "numeric",
            });
            const publishedDate = insight["source-publication-date"]?.toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            });
            fakeCheckboxToggle(companyInput);
            fakeCheckboxToggle(favouriteInput);
            favouriteInput?.setAttribute("dev-input-type", "favourite");
            favouriteInput?.setAttribute("dev-input-id", insight.id.toString());
            companyInput?.setAttribute("dev-input-type", "company_id");
            companyInput?.setAttribute("dev-input-id", insight.company_id.toString());
            favouriteInput && followFavouriteLogic(favouriteInput);
            companyInput && followFavouriteLogic(companyInput);
            favouriteInput &&
                setCheckboxesInitialState(favouriteInput, userFollowingAndFavourite.user_favourite.insight_id);
            companyInput &&
                setCheckboxesInitialState(companyInput, convertArrayOfObjToNumber(userFollowingAndFavourite.user_following.company_id));
            companyImage.src =
                "https://logo.clearbit.com/" +
                    insight.company_details["company-website"];
            fetch("https://logo.clearbit.com/" +
                insight.company_details["company-website"]).catch(() => (companyImage.src =
                "https://uploads-ssl.webflow.com/64a2a18ba276228b93b991d7/64c7c26d6639a8e16ee7797f_Frame%20427318722.webp"));
            curatedDateTarget.textContent = curatedDate ?? "";
            publishedDateTarget.textContent = publishedDate ?? "";
            sourceTarget.setAttribute("href", insight["source-url"]);
            sourceTarget.textContent = insight.source;
            sourceAuthorTarget.textContent = insight.source_author;
            insightName.textContent = insight.name;
            companyLink.textContent = insight.company_details.name;
            companyLink.href = "/company/" + insight.company_details.slug;
            insightRichtext.innerHTML = insight["insight-detail"];
            addTagsToInsight(insight.company_type_id, tagsWrapperTarget, false);
            addTagsToInsight(insight.source_category_id, tagsWrapperTarget, false);
            addTagsToInsight(insight.line_of_business_id, tagsWrapperTarget, false);
            addTagsToInsight(insight.insight_classification_id, tagsWrapperTarget, false);
            addTagsToInsight(insight.technology_category_id, tagsWrapperTarget, true, "technology_category_id");
            const companyWrapper = companyCard.querySelector(`[dev-target="company-wrapper"]`);
            if (insight["companies-mentioned"].length > 0) {
                insight["companies-mentioned"].forEach((item) => {
                    const companyItem = companyItemTemplate.cloneNode(true);
                    const companyPictureLink = companyItem.querySelector(`[dev-target="company-picture-link"]`);
                    const companyLink = companyItem.querySelector(`[dev-target="company-link"]`);
                    const companyInput = companyItem.querySelector(`[dev-target="company-input"]`);
                    const companyImage = companyItem.querySelector(`[dev-target="company-image"]`);
                    companyImage.src =
                        "https://logo.clearbit.com/" +
                            item["company-website"];
                    fetch("https://logo.clearbit.com/" +
                        insight.company_details["company-website"]).catch(() => (companyImage.src =
                        "https://uploads-ssl.webflow.com/64a2a18ba276228b93b991d7/64c7c26d6639a8e16ee7797f_Frame%20427318722.webp"));
                    companyPictureLink.href = "/company/" + item.slug;
                    companyLink.href = "/company/" + item.slug;
                    companyLink.textContent = item.name;
                    fakeCheckboxToggle(companyInput);
                    companyInput?.setAttribute("dev-input-type", "company_id");
                    companyInput?.setAttribute("dev-input-id", item.id.toString());
                    companyInput && followFavouriteLogic(companyInput);
                    companyInput &&
                        setCheckboxesInitialState(companyInput, convertArrayOfObjToNumber(userFollowingAndFavourite.user_following.company_id));
                    companyWrapper?.appendChild(companyItem);
                });
                companyCard
                    .querySelector(`[dev-target="empty-state"]`)
                    ?.classList.add("hide");
            }
            else {
                companyCard
                    .querySelector(`[dev-target="empty-state"]`)
                    ?.classList.remove("hide");
                companyWrapper?.classList.add("hide");
            }
            const peopleWrapper = peopleCard.querySelector(`[dev-target="people-wrapper"]`);
            if (insight.people_id.length > 0) {
                insight.people_id.forEach((person) => {
                    const peopleItem = peopleItemTemplate.cloneNode(true);
                    const personItemLink = peopleItem.querySelector(`[dev-target="people-link"]`);
                    const companyItemLink = peopleItem.querySelector(`[dev-target="company-link"]`);
                    const personName = person.name;
                    const personLink = "/person/" + person.slug;
                    const companyName = person._company.name;
                    const companyLink = "/company/" + person._company.slug;
                    personItemLink.textContent = personName;
                    personItemLink.href = personLink;
                    companyItemLink.textContent = companyName;
                    companyItemLink.href = companyLink;
                    peopleWrapper?.appendChild(peopleItem);
                });
                peopleCard
                    .querySelector(`[dev-target="empty-state"]`)
                    ?.classList.add("hide");
            }
            else {
                peopleCard
                    .querySelector(`[dev-target="empty-state"]`)
                    ?.classList.remove("hide");
                peopleWrapper?.classList.add("hide");
            }
            const eventWrapper = eventCard.querySelector(`[dev-target="event-wrapper"]`);
            if (insight.event_details) {
                const eventItem = eventItemTemplate.cloneNode(true);
                eventItem.textContent = insight.event_details.name;
                eventItem.href = "/event/" + insight.event_details.slug;
                eventWrapper?.append(eventItem);
            }
            else {
                eventCard
                    .querySelector(`[dev-target="empty-state"]`)
                    ?.classList.remove("hide");
                eventWrapper?.classList.add("hide");
            }
            insightTemplate.classList.remove("hide-template");
        }
    }
    async function getInsight(slug) {
        try {
            const res = await xano_individual_pages.get("/insight", {
                slug,
            });
            const insightResponse = res.getBody();
            console.log("insightResponse", insightResponse);
            return insightResponse;
        }
        catch (error) {
            console.log("getInsight_error", error);
            return null;
        }
    }
    async function getXanoAccessToken(memberstackToken) {
        try {
            const res = await xano_wmx.post("/auth-user", {
                memberstack_token: memberstackToken,
            });
            const xanoAuthToken = res.getBody().authToken;
            xano_individual_pages.setAuthToken(xanoAuthToken);
            xano_userFeed.setAuthToken(xanoAuthToken);
            return xanoAuthToken;
        }
        catch (error) {
            console.log("getXanoAccessToken_error", error);
            return null;
        }
    }
    function fakeCheckboxToggle(input) {
        input.addEventListener("change", () => {
            const inputWrapper = input.closest("[dev-fake-checkbox-wrapper]");
            inputWrapper.classList[input.checked ? "add" : "remove"]("checked");
        });
    }
    function addTagsToInsight(tagArray, targetWrapper, showCheckbox, type) {
        tagArray.forEach((item) => {
            if (typeof item === "object" && item !== null) {
                const newTag = insightTagTemplate.cloneNode(true);
                const tagCheckbox = newTag.querySelector(`[dev-target=fake-checkbox]`);
                const tagInput = newTag.querySelector(`[dev-target=tag-input]`);
                tagInput && fakeCheckboxToggle(tagInput);
                type && tagInput && tagInput.setAttribute("dev-input-type", type);
                tagInput && tagInput.setAttribute("dev-input-id", item.id.toString());
                tagInput && followFavouriteLogic(tagInput);
                newTag.querySelector(`[dev-target=tag-name]`).textContent =
                    item?.name;
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
    async function getUserFollowingAndFavourite() {
        try {
            const res = await xano_userFeed.get("/user-following-and-favourite");
            const followingAndFavourite = res.getBody();
            userFollowingAndFavourite = followingAndFavourite;
            localStorage.setItem("user-following-favourite", JSON.stringify(followingAndFavourite));
            return followingAndFavourite;
        }
        catch (error) {
            console.error(`getUserFollowingAndFavourite_error`, error);
            return null;
        }
    }
    const followFavouriteDebounce = debounce(followFavouriteListener, 500);
    async function followFavouriteListener(input) {
        const type = input.getAttribute("dev-input-type");
        const id = input.getAttribute("dev-input-id");
        const endPoint = type === "favourite" ? "/toggle-favourite" : "/toggle-follow";
        try {
            const res = await xano_userFeed.get(endPoint, {
                id: Number(id),
                target: type,
            });
            console.log("userFollowingAndFavourite-1", userFollowingAndFavourite);
            await getUserFollowingAndFavourite();
            // run function to updated all-tab inputs
            console.log("userFollowingAndFavourite-2", userFollowingAndFavourite);
        }
        catch (error) {
            console.error(`followFavouriteLogic${endPoint}_error`, error);
            return null;
        }
    }
    function followFavouriteLogic(input) {
        input.addEventListener("change", async () => followFavouriteDebounce(input));
    }
    function convertArrayOfObjToNumber(data) {
        return data.map((item) => item.id);
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
    function debounce(func, delay) {
        let debounceTimer;
        return function (...args) {
            const context = this;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    }
    // Function for querying a single element by selector
    function qs(selector) {
        return document.querySelector(selector);
    }
    // Function for querying multiple elements by selector
    function qsa(selector) {
        return document.querySelectorAll(selector);
    }
});
