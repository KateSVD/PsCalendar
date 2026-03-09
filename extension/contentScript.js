function normalizeDate(dateString) {
	if (!dateString) {
		return "";
	}

	const normalized = new Date(dateString.replace("@", "")).toISOString();
	return normalized.replace(/\.\d{3}Z$/, "");
}

function psCalendarFindMatchTiming() {
	const paragraphs = Array.from(document.querySelectorAll("p"));
	const targetParagraph = paragraphs.find((paragraph) => {
		const text = paragraph.innerText || paragraph.textContent || "";
		return /match\s+starts/i.test(text);
	});

	const eventName = document.title || "";

	if (!targetParagraph) {
		const emptyEvent = {
			eventName,
			matchStart: "",
			matchEnd: "",
			matchStartISO: "",
			matchEndISO: ""
		};
		chrome.runtime?.sendMessage?.({ type: "EVENT_FOUND", event: emptyEvent });
		return emptyEvent;
	}

	const matchStart =
		targetParagraph.querySelector("strong")?.textContent?.trim() || "";

	const paragraphText = targetParagraph.innerText || targetParagraph.textContent || "";
	const matchEndMatch = paragraphText.match(/match\s+ends:\s*([^·\n]+)/i);
	const matchEnd = matchEndMatch?.[1]?.trim() || "";

	const event = {
		eventName,
		matchStart,
		matchEnd,
		matchStartISO: normalizeDate(matchStart),
		matchEndISO: normalizeDate(matchEnd)
	};

	chrome.runtime?.sendMessage?.({ type: "EVENT_FOUND", event });
	return event;
}

window.psCalendarFindMatchTiming = psCalendarFindMatchTiming;
