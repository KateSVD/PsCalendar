chrome.runtime.onInstalled.addListener(() => {
  // Placeholder for future orchestration logic.
});

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
    matchEndISO: result?.matchEndISO || ""
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "scanPractiScoreTabs") {
    return false;
  }

  (async () => {
    const queryOptions = typeof message.windowId === "number"
      ? { windowId: message.windowId }
      : { currentWindow: true };
    const tabs = await chrome.tabs.query(queryOptions);
    const matchingTabs = tabs.filter((tab) => {
      const url = (tab.url || tab.pendingUrl || "").toLowerCase();
      return url.includes("practiscore") && url.includes("register");
    });

    const results = await Promise.all(
      matchingTabs.map(async (tab) => {
        try {
          const matchInfo = await checkTabForMatchTiming(tab.id);
          return {
            id: tab.id,
            title: tab.title || tab.url || tab.pendingUrl,
            url: tab.url || tab.pendingUrl,
            eventName: matchInfo.eventName || tab.title || "",
            matchStart: matchInfo.matchStart,
            matchEnd: matchInfo.matchEnd,
            matchStartISO: matchInfo.matchStartISO,
            matchEndISO: matchInfo.matchEndISO
          };
        } catch (error) {
          console.warn("PsCalendar scan failed for tab:", tab.id, error);
          return {
            id: tab.id,
            title: tab.title || tab.url || tab.pendingUrl,
            url: tab.url || tab.pendingUrl,
            eventName: tab.title || "",
            matchStart: "",
            matchEnd: "",
            matchStartISO: "",
            matchEndISO: ""
          };
        }
      })
    );

    sendResponse({ results });
  })().catch((error) => {
    console.error("PsCalendar tab scan failed:", error);
    sendResponse({ results: [] });
  });

  return true;
});
