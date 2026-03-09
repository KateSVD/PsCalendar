function normalizeDate(dateString) {
	if (!dateString) {
		return "";
	}

	const normalized = new Date(dateString.replace("@", "")).toISOString();
	return normalized.replace(/\.\d{3}Z$/, "");
}

function buildLocationAddress() {
	const paragraphs = Array.from(document.querySelectorAll("p"));
	const locationParagraph = paragraphs.find((paragraph) => {
		const text = paragraph.innerText || paragraph.textContent || "";
		return /location:/i.test(text);
	});

	if (!locationParagraph) {
		return "";
	}

	const text = locationParagraph.innerText || locationParagraph.textContent || "";
	const locationText = text.replace(/^[\s\S]*?location:\s*/i, "");
	let locationLines = locationText
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);

	locationLines = locationLines.filter(
		(line) => !/(maps\.google|maps\.app\.goo\.gl|google\.com\/maps)/i.test(line)
	);

	if (!locationLines.length) {
		return "";
	}

	const address = locationLines.join(" ");
	return address || "";
}

function psCalendarFindMatchTiming() {
	const paragraphs = Array.from(document.querySelectorAll("p"));
	const targetParagraph = paragraphs.find((paragraph) => {
		const text = paragraph.innerText || paragraph.textContent || "";
		return /match\s+starts/i.test(text);
	});

	const eventName = document.title || "";
	const locationAddress = buildLocationAddress();
	const registrationUrl = window.location?.href || "";

	if (!targetParagraph) {
		const emptyEvent = {
			eventName,
			matchStart: "",
			matchEnd: "",
			matchStartISO: "",
			matchEndISO: "",
			locationAddress,
			registrationUrl
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
		matchEndISO: normalizeDate(matchEnd),
		locationAddress,
		registrationUrl
	};

	chrome.runtime?.sendMessage?.({ type: "EVENT_FOUND", event });
	return event;
}

window.psCalendarFindMatchTiming = psCalendarFindMatchTiming;
