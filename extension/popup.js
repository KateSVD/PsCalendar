const checkButton = document.getElementById("checkButton");
const scanTabsButton = document.getElementById("scanTabsButton");
const dashboardPrompt = document.getElementById("dashboardPrompt");

const REQUIRED_DASHBOARD_URL = "https://practiscore.com/dashboard/home";
const UPCOMING_EVENTS_TEXT = "Upcoming Events";

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

function isRequiredDashboardUrl(tab) {
  const rawUrl = tab?.url || tab?.pendingUrl;
  if (!rawUrl) {
    return false;
  }

  try {
    const parsedUrl = new URL(rawUrl);
    const normalizedPath = parsedUrl.pathname.replace(/\/+$/, "");
    const normalizedUrl = `${parsedUrl.origin}${normalizedPath}`;
    return normalizedUrl === REQUIRED_DASHBOARD_URL;
  } catch (error) {
    console.warn("PsCalendar unable to parse tab URL:", error);
    return false;
  }
}

async function pageHasUpcomingEventsText(tabId) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: (needle) => {
      const bodyText = document.body?.innerText || "";
      return bodyText.includes(needle);
    },
    args: [UPCOMING_EVENTS_TEXT]
  });

  return Boolean(result);
}

async function updateCheckButtonVisibility() {
  checkButton.style.display = "none";

  if (dashboardPrompt) {
    dashboardPrompt.style.display = "none";
  }

  try {
    const activeTab = await getActiveTab();
    if (!activeTab?.id) {
      if (dashboardPrompt) {
        dashboardPrompt.style.display = "";
      }
      return;
    }

    const activeUrl = activeTab?.url || activeTab?.pendingUrl;
    const onDashboard = isRequiredDashboardUrl(activeTab);
    const onRegisterPage = isPractiScoreRegisterUrl(activeUrl);

    if (!onDashboard && !onRegisterPage) {
      if (dashboardPrompt) {
        dashboardPrompt.style.display = "";
      }
      return;
    }

    if (onDashboard) {
      const hasUpcomingEvents = true;
      if (hasUpcomingEvents) {
        checkButton.style.display = "";
      }
    }
  } catch (error) {
    console.error("PsCalendar failed to update button visibility:", error);
  }
}

async function updateScanButtonVisibility() {
  scanTabsButton.style.display = "none";

  try {
    const activeTab = await getActiveTab();
    const activeUrl = activeTab?.url || activeTab?.pendingUrl;
    const onRegisterPage = Boolean(activeTab?.id && isPractiScoreRegisterUrl(activeUrl));
    if (!onRegisterPage) {
      return;
    }

    scanTabsButton.style.display = "";
  } catch (error) {
    console.error("PsCalendar failed to update scan button visibility:", error);
  }
}

async function getEventLinks(tabId) {
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => {
      const targetText = "Upcoming Events";
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_ELEMENT
      );

      let foundSection = false;
      let table = null;
      let node = walker.nextNode();

      while (node) {
        if (!foundSection) {
          if (node.innerText && node.innerText.includes(targetText)) {
            foundSection = true;
          }
        } else if (node.tagName === "TABLE") {
          table = node;
          break;
        }

        node = walker.nextNode();
      }

      if (!table) {
        return [];
      }

      const links = [];
      const rows = table.querySelectorAll("tr");

      rows.forEach((row) => {
        const cell = row.querySelector("td:first-child");
        if (!cell) {
          return;
        }

        const link = cell.querySelector("a");
        if (!link || !link.href) {
          return;
        }

        const text = link.textContent ? link.textContent.trim() : "";
        links.push({ text, href: link.href });
      });

      return links;
    }
  });

  return Array.isArray(result) ? result : [];
}

function normalizeEventLink(href) {
  if (!href) {
    return href;
  }

  return href.includes("/shooter/") ? href.replace(/\/shooter\/.*/i, "/register") : href;
}

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

async function openEventTabs(links, windowId) {
  const urls = links
    .map((link) => normalizeEventLink(link.href))
    .filter(Boolean);

  for (const url of urls) {
    await chrome.tabs.create({ windowId, url });
  }
}

async function checkForUpcomingEvents() {
  try {
    const activeTab = await getActiveTab();
    if (!activeTab?.id) {
      return;
    }

    const links = await getEventLinks(activeTab.id);
    await openEventTabs(links, activeTab.windowId);
  } catch (error) {
    console.error("PsCalendar check failed:", error);
  }
}

async function scanPractiScoreTabs() {
  try {
    const activeTab = await getActiveTab();
    const activeUrl = activeTab?.url || activeTab?.pendingUrl;

    if (!activeTab?.id || !isPractiScoreRegisterUrl(activeUrl)) {
      return;
    }

    const response = await chrome.runtime.sendMessage({
      type: "scanPractiScoreTabs",
      tabId: activeTab.id
    });

    if (!response?.result) {
      return;
    }

    const result = response.result;
    const eventName = result.eventName || result.title || result.url || "(Untitled tab)";
    const hasMatchInfo = Boolean(result.matchStartISO && result.matchEndISO);

    if (!hasMatchInfo) {
      return;
    }

    const toGoogleDate = (iso) => iso.replace(/[-:]/g, "").split(".")[0];
    const googleStart = toGoogleDate(result.matchStartISO);
    const googleEnd = toGoogleDate(result.matchEndISO);
    const locationParam = result.locationAddress
      ? `&location=${encodeURIComponent(result.locationAddress)}`
      : "";
    const detailsParam = result.registrationUrl
      ? `&details=${encodeURIComponent(result.registrationUrl)}`
      : "";
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      eventName
    )}&dates=${googleStart}/${googleEnd}${locationParam}${detailsParam}`;

    await chrome.tabs.create({ windowId: activeTab.windowId, url: calendarUrl });
  } catch (error) {
    console.error("PsCalendar tab scan failed:", error);
  }
}

checkButton.addEventListener("click", checkForUpcomingEvents);
scanTabsButton.addEventListener("click", scanPractiScoreTabs);
updateCheckButtonVisibility();
updateScanButtonVisibility();
