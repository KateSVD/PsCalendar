---
agent: browser-extension
description: Extract match location from PractiScore event page and add it to Google Calendar link.
---

# Task

Extend the existing **contentScript.js logic that extracts event information**.

Add functionality to **extract the match location from the page**.

# Location Source

On PractiScore event pages the location appears in HTML like:

<p>
Location:<br>
Cekanice 266<br>
Tabor, Czech republic 39002
</p>

or

<p>
Location:<br>
Lithuania<br>
https://maps.app.goo.gl/xxxx<br>
Pamaraziai, Vilnius District Mun LT-13244
</p>

# Extraction Rules

1. Find a `<p>` element whose text contains **"Location:"**.

2. Read the text content after **Location:** and split it by line breaks.

3. Determine location type:

### Case 1 — Google Maps link exists

If any line contains:

- `maps.google`
- `maps.app.goo.gl`
- `google.com/maps`

Then:

- use that URL directly as the **location**.

### Case 2 — Address only

If no Google Maps link exists:

- join remaining lines into a single address string
- encode it using `encodeURIComponent`
- create a Google Maps search link: https://www.google.com/maps/search/?api=1&query=ADDRESS


Use this URL as the **location**.

# Result

Return the generated **location URL** together with the other extracted event data.

Ensure the location is included when building the **Google Calendar event link** as: &location=LOCATION_URL

# Constraints

- Modify only the necessary parts of **contentScript.js**.
- Use simple DOM methods.
- Keep the code minimal and readable.