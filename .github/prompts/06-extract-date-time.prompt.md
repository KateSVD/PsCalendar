---
agent: browser-extension
description: Extend the existing Chrome extension so that it extracts **Match start and Match end date/time** from each opened event page and displays this information in the popup.
---
Modify only the necessary files.

--------------------------------------------------
Context
--------------------------------------------------

Each opened event page contains HTML like this:

<p>
Match starts:
<strong>April 18, 2026 @ 9:30 AM</strong>
· Match ends: April 18, 2026 @ 3:00 PM
</p>

The extension must extract:

matchStart: "April 18, 2026 @ 9:30 AM"
matchEnd:   "April 18, 2026 @ 3:00 PM"

--------------------------------------------------
Requirements
--------------------------------------------------

1. The extraction must be implemented in **contentScript.js**.

2. The content script should:

   - Search for a `<p>` element containing the text **"Match starts"**.
   - From that `<p>` element:
     - Read the `<strong>` element → this contains the **match start date/time**.
     - Extract the **match end date/time** from the text after **"Match ends:"**.

3. Trim whitespace from the extracted values.

4. Return the result as an object:

{
  matchStart: "...",
  matchEnd: "..."
}

--------------------------------------------------
Popup Behavior Change
--------------------------------------------------

Currently pressing button 'Scan PractiScore Tabs' shows **Yes** or **No** depending on whether "match start" or "match end" exists.

Modify this behavior:

Instead of showing Yes/No, the popup should display the extracted information.

Example popup result:

Match Start: April 18, 2026 @ 9:30 AM  
Match End: April 18, 2026 @ 3:00 PM

If the information cannot be found, display:

Match information not found.

--------------------------------------------------
Architecture Rules

Respect the project architecture