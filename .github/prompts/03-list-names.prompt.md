---
agent: browser-extension
description: Extract links from the first column of the Upcoming Events table and display them in the popup.
model: GPT-5.2-Codex (copilot)
---

# Goal

Extend the **PsCalendar Chrome extension**.

The extension already detects whether a **table exists below the "Upcoming Events" section**.

Now modify the extension so it **extracts all `<a>` links from the first column of that table** and displays them in the popup.

# Functional Requirements

When the user clicks the popup button:

Check for Upcoming Events

the extension should:

1. Find the element containing the text **"Upcoming Events"**.
2. Locate the **first table below that element**.
3. Iterate through all rows of that table.
4. In each row, read the **first column (`td:first-child`)**.
5. Find any `<a>` tag inside that cell.
6. Extract the **link text** and **URL (`href`)**.
7. modify code so that extension displays found items as links
8. change code so that links that references .../shooter/... are replaced by .../register

# Result

Display the results in the popup as a list.

Example:

Event Links Found:

• Match A — https://example.com/event/123  
• Match B — https://example.com/event/456  
• Match C — https://example.com/event/789  

If no table or links are found, display:

No event links found.

# Implementation Notes

Keep the implementation simple.

Use the same approach as before:

- run the DOM query using `chrome.scripting.executeScript`
- return the extracted links to the popup
- render the list in the popup UI

# Files To Modify

Modify only what is necessary:

- popup.js
- popup.html

# Output Format

Show each modified file separately with full contents.