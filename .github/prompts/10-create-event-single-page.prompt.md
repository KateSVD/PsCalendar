---
agent: browser-extension
description: This prompt outlines the requirements for modifying a browser extension to create a Google Calendar event from a PractiScore registration page.
---

# Goal

Change the behavior of the **"Scan PractiScore Tabs"** button.

Instead of scanning multiple tabs, it should:

1.  Look only at the **currently active tab**.
2.  Check if the URL matches the pattern:
    https://practiscore.com/<event-name>/register

3.  If the pattern matches, extract (as it is already implemented):

-   **Event name** → from the browser tab title (`document.title`)
-   **Match start date and time**
-   **Match end date and time**

from the page content.

4.  Use the extracted data to construct a **Google Calendar event
    link** as it is already implemented

5.  Automatically **open the Google Calendar link in a new tab**.

# Implementation Details

Modify only the files required for this feature.