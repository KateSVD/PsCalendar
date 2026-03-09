---
agent: browser-extension
---
# Task

Extend the existing Chrome extension by adding a new button that scans currently open browser tabs and checks if match timing information exists on those pages.

# Goal

Add a button in the popup called:

Scan PractiScore Tabs

When the user presses this button, the extension should:

1. Find all currently open tabs in the current window.
2. Filter tabs whose URL contains BOTH of the following words:

practiscore  
register

Example matching URL:

https://practiscore.com/register/SomeMatch

3. For each matching tab:

- run a content script
- search the page for text containing:

Match starts  
Match ends

4. If at least one occurrence of either phrase exists on the page:

return "Yes"

If neither phrase exists:

return "No"

# UI Requirement

The popup should display a list of scanned tabs.

For each tab display:

Tab title or URL  
Result

Example:

Spring Championship Match  
Found: Yes

Club Level Match  
Found: No

# Architecture Rules

Follow the extension architecture:

popup.js
- button UI
- display results

background.js
- find and filter tabs
- execute content script
- collect results

contentScript.js
- read DOM
- search for required text

Do NOT perform DOM scraping in popup.js.

# Content Script Logic

The content script should:

1. Read page text:

document.body.innerText

2. Convert to lowercase.

3. Check if it contains:

"match start"
or
"match end"

4. Return:

{
  found: true
}

or

{
  found: false
}

# Background Script Logic

1. Query tabs:

chrome.tabs.query({ currentWindow: true })

2. Filter tabs where:

tab.url.includes("practiscore")  
AND  
tab.url.includes("register")

3. For each matching tab:

execute contentScript.js using:

chrome.scripting.executeScript

4. Collect the results.

5. Send results back to popup.js.

# Popup UI

Add a second button:

Scan PractiScore Tabs

Below it display a list of results returned from the background script.

# Constraints

Follow these rules:

- Manifest V3
- plain JavaScript
- minimal dependencies
- async/await

Modify only necessary files:

popup.html  
popup.js  
background.js  
contentScript.js

Do not rewrite manifest.json unless new permissions are required.