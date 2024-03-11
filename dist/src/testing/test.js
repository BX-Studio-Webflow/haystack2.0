"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const data_1 = require("../data");
function getIds(insight, insightKey, dataArray) {
    return insight[insightKey].split("; ").map((item) => {
        return dataArray.find((sourceCatItem) => sourceCatItem.slug === item)?.id;
    });
}
function getTimeInMS(time) {
    return new Date(time).getTime();
}
function mutateEvents(events) {
    const mutatedEvents = events.map((singleEvent) => {
        const xanoStartDate = getTimeInMS(singleEvent['Event Start Date']);
        const xanoEndDate = getTimeInMS(singleEvent['Event End Date']);
        singleEvent.xanoStartDate = xanoStartDate;
        singleEvent.xanoEndDate = xanoEndDate;
        return singleEvent;
    });
    fs.writeFileSync("data/event.json", JSON.stringify(mutatedEvents, null, 2));
}
// mutateEvents(event)
function mutatePeople(people) {
    const mutatedPeople = people.map((person) => {
        const xanoCompany = data_1.company.find((singleCompany) => singleCompany.slug === person.Company)?.id;
        person.xanoCompany = xanoCompany;
        // console.log(person.Company,xanoCompany)
        return person;
    });
    // console.log("mutatedPeople",mutatedPeople)
    // const mutatedPeopleJSON = JSON.stringify(mutatedPeople)
    fs.writeFileSync("data/people.json", JSON.stringify(mutatedPeople, null, 2));
    return mutatedPeople;
}
// mutatePeople(peopleHaystack);
function mutateInsights(insights) {
    const mutatedInsights = insights.map((insight) => {
        const xanoCompanyId = getIds(insight, "Company", data_1.company)[0];
        const xanoCurated = getTimeInMS(insight.Curated);
        const xanoSourcePubDate = getTimeInMS(insight["Source Publication Date:"]);
        const xanoSourceCat = getIds(insight, "Source Categories", data_1.sourceCat);
        const xanoCompanyType = getIds(insight, "Company Type", data_1.companyType);
        const xanoInsightClass = getIds(insight, "Insight Classifications", data_1.insightClass);
        const xanoLineBus = getIds(insight, "Line of Businesses", data_1.lineOfBus);
        const xanoTechCat = getIds(insight, "Technology Categories", data_1.techCat);
        const xanoCompanyMentioned = getIds(insight, "Companies Mentioned", data_1.company);
        const xanoPeople = getIds(insight, "People", data_1.xanoPeopleJson);
        const xanoEvent = getIds(insight, "Event", data_1.xanoEvents)[0];
        insight.xanoCompanyId = xanoCompanyId;
        insight.xanoCurated = xanoCurated;
        insight.xanoSourcePubDate = xanoSourcePubDate;
        insight.xanoSourceCat = xanoSourceCat;
        insight.xanoCompanyType = xanoCompanyType;
        insight.xanoInsightClass = xanoInsightClass;
        insight.xanoLineBus = xanoLineBus;
        insight.xanoTechCat = xanoTechCat;
        insight.xanoCompanyMentioned = xanoCompanyMentioned;
        insight.xanoPeople = xanoPeople;
        insight.xanoEvent = xanoEvent ?? 0;
        // console.log(insight["Company"],xanoCompanyId)
        return insight;
    });
    fs.writeFileSync("data/insights.json", JSON.stringify(mutatedInsights, null, 2));
    return mutatedInsights;
}
mutateInsights(data_1.insights);
