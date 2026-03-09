const checkButton = document.getElementById("checkButton");
const resultLabel = document.getElementById("result");
const scanTabsButton = document.getElementById("scanTabsButton");
const scanResults = document.getElementById("scanResults");

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

  try {
    const activeTab = await getActiveTab();
    if (!activeTab?.id || !isRequiredDashboardUrl(activeTab)) {
      return;
    }

    const hasUpcomingEvents = true;
    if (hasUpcomingEvents) {
      checkButton.style.display = "";
    }
  } catch (error) {
    console.error("PsCalendar failed to update button visibility:", error);
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

function renderResults(links) {
  resultLabel.innerHTML = "";

  if (!links.length) {
    resultLabel.textContent = "No event links found.";
    return;
  }

  const title = document.createElement("div");
  title.id = "resultTitle";
  title.textContent = "Event Links Found:";

  const list = document.createElement("ul");
  list.id = "resultList";

  links.forEach((link) => {
    const item = document.createElement("li");
    const anchor = document.createElement("a");
    const text = link.text ? link.text : link.href;

    const normalizedHref = normalizeEventLink(link.href);
    anchor.href = normalizedHref;
    anchor.textContent = text;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";

    item.appendChild(anchor);
    list.appendChild(item);
  });

  resultLabel.appendChild(title);
  resultLabel.appendChild(list);
}

function renderScanResults(results) {
  scanResults.innerHTML = "";

  if (!results.length) {
    scanResults.textContent = "No PractiScore register tabs found.";
    return;
  }

  const title = document.createElement("div");
  title.id = "scanResultsTitle";
  title.textContent = "Scan Results:";

  const list = document.createElement("ul");
  list.id = "scanResultsList";

  const toGoogleDate = (iso) => iso.replace(/[-:]/g, "").split(".")[0];

  results.forEach((item) => {
    const listItem = document.createElement("li");
    const eventName = item.eventName || item.title || item.url || "(Untitled tab)";
    const hasMatchInfo = Boolean(item.matchStartISO || item.matchEndISO);

    if (!hasMatchInfo) {
      listItem.textContent = `${eventName} — Match information not found.`;
      list.appendChild(listItem);
      return;
    }

    const nameLine = document.createElement("div");
    nameLine.textContent = eventName;

    const startLine = document.createElement("div");
    startLine.textContent = `Start: ${item.matchStartISO}`;

    const endLine = document.createElement("div");
    endLine.textContent = `End: ${item.matchEndISO}`;

    const googleStart = toGoogleDate(item.matchStartISO);
    const googleEnd = toGoogleDate(item.matchEndISO);
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      eventName
    )}&dates=${googleStart}/${googleEnd}`;

    const calendarLink = document.createElement("a");
    calendarLink.href = calendarUrl;
    calendarLink.target = "_blank";
    calendarLink.rel = "noopener noreferrer";
    calendarLink.textContent = "Add to Google Calendar";

    listItem.appendChild(nameLine);
    listItem.appendChild(startLine);
    listItem.appendChild(endLine);
    listItem.appendChild(calendarLink);
    list.appendChild(listItem);
  });

  scanResults.appendChild(title);
  scanResults.appendChild(list);
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
  resultLabel.textContent = "Checking...";

  try {
    const activeTab = await getActiveTab();
    if (!activeTab?.id) {
      resultLabel.textContent = "No";
      return;
    }

    const links = await getEventLinks(activeTab.id);
    renderResults(links);
    await openEventTabs(links, activeTab.windowId);
  } catch (error) {
    console.error("PsCalendar check failed:", error);
    resultLabel.textContent = "No event links found.";
  }
}

async function scanPractiScoreTabs() {
  scanResults.textContent = "Scanning...";

  try {
    const activeTab = await getActiveTab();
    const response = await chrome.runtime.sendMessage({
      type: "scanPractiScoreTabs",
      windowId: activeTab?.windowId
    });
    const results = Array.isArray(response?.results) ? response.results : [];
    renderScanResults(results);
  } catch (error) {
    console.error("PsCalendar tab scan failed:", error);
    scanResults.textContent = "Unable to scan tabs.";
  }
}

checkButton.addEventListener("click", checkForUpcomingEvents);
scanTabsButton.addEventListener("click", scanPractiScoreTabs);
updateCheckButtonVisibility();
