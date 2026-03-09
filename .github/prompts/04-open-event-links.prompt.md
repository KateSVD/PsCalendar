---
agent: browser-extension
---

# Goal

Extend the **PsCalendar Chrome extension**.

The extension already extracts all `<a>` links from the **first column of the table below the "Upcoming Events" section** and modifies them.

Now modify the extension so it **automatically opens those links in new tabs in the same browser window**.

# Functional Requirements

When the user clicks the popup button:

For every URL:

Open the link in a **new tab in the same browser window**.

Example:

If 5 links are found, the extension should open **5 new tabs**.

# Implementation Notes

Keep the implementation simple.

Use:

- `chrome.scripting.executeScript` to collect links from the page
- `chrome.tabs.create()` to open new tabs

Avoid unnecessary complexity.

# Files To Modify

Modify only what is necessary:

- popup.js