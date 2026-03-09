chrome.runtime.onInstalled.addListener(() => {
  // Placeholder for future orchestration logic.
});

function isPractiScoreRegisterUrl(rawUrl) {
  if (!rawUrl) {
    return false;
  }

  try {
    const parsedUrl = new URL(rawUrl);
    if (parsedUrl.origin !== "https://practiscore.com") {
      return false;
    }

    return /^\/[^/]+\/register\/?$/i.test(parsedUrl.pathname);
  } catch (error) {
    console.warn("PsCalendar unable to parse tab URL:", error);
    return false;
  }
}

async function checkTabForMatchTiming(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["contentScript.js"]
  });

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      if (typeof window.psCalendarFindMatchTiming === "function") {
        return window.psCalendarFindMatchTiming();
      }

      return { eventName: "", matchStart: "", matchEnd: "" };
    }
  });

  return {
    eventName: result?.eventName || "",
    matchStart: result?.matchStart || "",
    matchEnd: result?.matchEnd || "",
    matchStartISO: result?.matchStartISO || "",
    matchEndISO: result?.matchEndISO || "",
    locationAddress: result?.locationAddress || "",
    registrationUrl: result?.registrationUrl || ""
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "scanPractiScoreTabs") {
    return false;
  }

  (async () => {
    const tabId = typeof message.tabId === "number" ? message.tabId : null;
    const activeTab = tabId ? await chrome.tabs.get(tabId) : null;

    if (!activeTab?.id || !isPractiScoreRegisterUrl(activeTab.url || activeTab.pendingUrl)) {
      sendResponse({ result: null, error: "Active tab is not a PractiScore register page." });
      return;
    }

    try {
      const matchInfo = await checkTabForMatchTiming(activeTab.id);
      const result = {
        id: activeTab.id,
        title: activeTab.title || activeTab.url || activeTab.pendingUrl,
        url: activeTab.url || activeTab.pendingUrl,
        eventName: matchInfo.eventName || activeTab.title || "",
        matchStart: matchInfo.matchStart,
        matchEnd: matchInfo.matchEnd,
        matchStartISO: matchInfo.matchStartISO,
        matchEndISO: matchInfo.matchEndISO,
        locationAddress: matchInfo.locationAddress,
        registrationUrl: matchInfo.registrationUrl
      };

      sendResponse({ result });
    } catch (error) {
      console.warn("PsCalendar scan failed for tab:", activeTab.id, error);
      sendResponse({
        result: {
          id: activeTab.id,
          title: activeTab.title || activeTab.url || activeTab.pendingUrl,
          url: activeTab.url || activeTab.pendingUrl,
          eventName: activeTab.title || "",
          matchStart: "",
          matchEnd: "",
          matchStartISO: "",
          matchEndISO: "",
          locationAddress: "",
          registrationUrl: ""
        }
      });
    }
  })().catch((error) => {
    console.error("PsCalendar tab scan failed:", error);
    sendResponse({ result: null, error: "Unable to scan tab." });
  });

  return true;
});
