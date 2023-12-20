// import { XanoClient } from "@xano/js-sdk";

document.addEventListener("DOMContentLoaded", async () => {
  console.log("insight-dev");
  const xano_insight = new XanoClient({
    apiGroupBaseUrl: "https://xhka-anc3-3fve.n7c.xano.io/api:CvEH0ZFk",
  });
  const xano_wmx = new XanoClient({
    apiGroupBaseUrl: "https://xhka-anc3-3fve.n7c.xano.io/api:6Ie7e140",
  });

  const searchParams = new URLSearchParams(window.location.search);
  const insightSlug = searchParams.get("name");

  if(!insightSlug){
    return console.error("add insight name in the url eg /insight/electric")
  }

  const memberStackUserToken = localStorage.getItem("_ms-mid");
  if (!memberStackUserToken) {
    return console.error("No memberstack token");
  }

  await getXanoAccessToken(memberStackUserToken);
  getInsight(insightSlug);

  async function getInsight(slug:string) {
    try {
      const res = await xano_insight.get("/insight", {
        slug,
      });
      const insightResponse = res.getBody() as string;
      console.log("insightResponse",insightResponse)
      return insightResponse;
    } catch (error) {
      console.log("getInsight_error", error);
      return null;
    }
  }

  async function getXanoAccessToken(memberstackToken: string) {
    try {
      const res = await xano_wmx.post("/auth-user", {
        memberstack_token: memberstackToken,
      });
      const xanoAuthToken = res.getBody().authToken as string;
      xano_insight.setAuthToken(xanoAuthToken);
      return xanoAuthToken;
    } catch (error) {
      console.log("getXanoAccessToken_error", error);
      return null;
    }
  }
});
