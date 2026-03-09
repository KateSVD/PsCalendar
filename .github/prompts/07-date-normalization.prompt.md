---
agent: browser-extension
description: Extend the existing Chrome extension by adding functionality to normalize extracted match start and end date/time into ISO 8601 format suitable for Google Calendar API usage.
---
Modify only the necessary files.

--------------------------------------------------
Context
--------------------------------------------------

The extension already extracts values like:

matchStart: "April 18, 2026 @ 9:30 AM"
matchEnd:   "April 18, 2026 @ 3:00 PM"

These values must now be converted to ISO 8601 format suitable for
Google Calendar API usage.

Example expected output:

matchStartISO: "2026-04-18T09:30:00"
matchEndISO:   "2026-04-18T15:00:00"

--------------------------------------------------
Requirements
--------------------------------------------------

1. Implement a helper function in **contentScript.js**:

normalizeDate(dateString)

2. The function should:

- accept strings like:

April 18, 2026 @ 9:30 AM

- convert them into:

YYYY-MM-DDTHH:mm:ss

3. Use JavaScript Date parsing:

Example approach:

const normalized = new Date(dateString.replace("@","")).toISOString();

Then trim milliseconds and "Z".

Example final format:

2026-04-18T09:30:00

--------------------------------------------------
Expected Returned Object

The content script should now return:

{
  matchStart: "April 18, 2026 @ 9:30 AM",
  matchEnd: "April 18, 2026 @ 3:00 PM",
  matchStartISO: "2026-04-18T09:30:00",
  matchEndISO: "2026-04-18T15:00:00"
}

--------------------------------------------------
Popup Display

Update the popup to display both formats:

Match Start: April 18, 2026 @ 9:30 AM  
Match End: April 18, 2026 @ 3:00 PM  

Normalized Start: 2026-04-18T09:30:00  
Normalized End: 2026-04-18T15:00:00