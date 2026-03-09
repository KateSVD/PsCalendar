---
agent: browser-extension
description: Detect whether a table exists below the "Upcoming Events" section.
---

# Goal

Modify the existing **PsCalendar Chrome extension**.

Instead of checking only for the text **"Upcoming Events"**, the extension should now check whether a **table exists directly below the "Upcoming Events" section**.

# Functional Requirements

When the user clicks the button in the popup:

Check for Upcoming Events

the extension should:

1. Search the page for an element containing the text **"Upcoming Events"**.
2. From that element, locate the **first table that appears below it**.
3. Determine whether such a table exists.

# Result

Display in the popup:

Yes  
if a table is found below the **Upcoming Events** section.

No  
if no such table exists.

# Implementation Notes

Use the same mechanism as the current implementation:

- run code in the active tab using `chrome.scripting.executeScript`
- inspect the DOM
- return a boolean result to the popup

Keep the implementation **minimal**.

# Files To Modify

Modify only what is necessary:

popup.js  
(optional) popup.html

# Output Format

Show the full contents of any modified files.