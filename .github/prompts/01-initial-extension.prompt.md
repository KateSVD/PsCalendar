# Task: Initialize PsCalendar Chrome Extension (Step 1)

Create the minimal structure of a Chrome browser extension called **PsCalendar**.

This is the first step of a larger project where the extension will eventually:

* follow event links from search results
* extract event names and dates
* create Google Calendar events automatically

For now we are only implementing a **simple detection test**.

---

## Required Behavior

When the user clicks the extension icon:

1. A popup should open.
2. The popup must contain:

   * a button labeled **"Check for Upcoming Events"**
   * a result label below the button.

When the button is clicked:

1. Read the full text of the currently active tab.
2. Search the page text for the exact string:

```
Upcoming Events
```

3. If the string exists anywhere in the page text, display:

```
Yes
```

4. Otherwise display:

```
No
```

---

## Technical Constraints

* Use **Chrome Extension Manifest V3**
* Use `chrome.scripting.executeScript`
* Read page text using:

```javascript
document.body.innerText
```

* Use **plain JavaScript**
