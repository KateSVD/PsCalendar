---
agent: browser-extension
description: Extend the existing Chrome extension by adding functionality to normalize extracted match start and end date/time into ISO 8601 format suitable for Google Calendar API usage.
---
Extend the existing Chrome extension so that each event displayed in the popup includes a clickable **Google Calendar link** that uses the **event name extracted from the tab title**.

Do NOT rewrite the extension. Modify only the necessary files.

--------------------------------------------------
Context
--------------------------------------------------

The extension already:

1. Opens PractiScore event pages
2. Extracts event information
3. Normalizes dates
4. Sends results to the background script
5. Displays collected events in the popup when the user clicks the button:

"Scan PractiScore Tabs"

Each event currently contains:

{
  matchStartISO: "2026-04-18T09:30:00",
  matchEndISO: "2026-04-18T15:00:00"
}

The tab title contains the **event name**.

Example:

tab.title = "April Practical Shooting Match"

--------------------------------------------------
Goal
--------------------------------------------------

Add the event name to the collected event data and use it as the **Google Calendar event title**.

Each displayed event should look like:

April Practical Shooting Match

Start: 2026-04-18T09:30:00  
End: 2026-04-18T15:00:00  

[Add to Google Calendar]

--------------------------------------------------
Step 1 — Include event name when sending data

Modify the logic that sends extracted data from the content script.

Use the tab title:

const eventName = document.title;

Send it with the event object:

chrome.runtime.sendMessage({
  type: "EVENT_FOUND",
  event: {
    eventName,
    matchStartISO,
    matchEndISO
  }
});

--------------------------------------------------
Step 2 — Store event name in background.js

Ensure the stored event object includes:

{
  eventName: "...",
  matchStartISO: "...",
  matchEndISO: "..."
}

--------------------------------------------------
Step 3 — Display event name in popup

Modify popup.js so each event block shows:

event.eventName

Example:

April Practical Shooting Match  
Start: 2026-04-18T09:30:00  
End: 2026-04-18T15:00:00  

--------------------------------------------------
Step 4 — Build Google Calendar link

Generate the link:

https://calendar.google.com/calendar/render?action=TEMPLATE

Parameters:

text = eventName  
dates = START/END

Example:

https://calendar.google.com/calendar/render?action=TEMPLATE&text=April%20Practical%20Shooting%20Match&dates=20260418T093000/20260418T150000

--------------------------------------------------
Step 5 — Convert ISO dates to Google format

Create helper function in popup.js:

function toGoogleDate(iso) {
  return iso.replace(/[-:]/g, "").split(".")[0];
}

Example conversion:

2026-04-18T09:30:00 → 20260418T093000

--------------------------------------------------
Step 6 — Create link element

For each event display:

<a href="CALENDAR_URL" target="_blank">
Add to Google Calendar
</a>

Use encodeURIComponent(eventName) for the title.

--------------------------------------------------
Example Result in Popup

April Practical Shooting Match

Start: 2026-04-18T09:30:00  
End:   2026-04-18T15:00:00  

Add to Google Calendar
