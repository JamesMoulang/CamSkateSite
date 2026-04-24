const makeTime = (date) =>
  date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const maxResults = 20; // Change this to get more or fewer events
const orderBy = "startTime";

const start = new Date();
start.setHours(0, 0, 0, 0); // Start of today

const end = new Date();
end.setHours(23, 59, 59, 999); // End of today

const timeMax = end.toISOString(); // Get only events until the end of today
const timeMin = start.toISOString(); // Get only upcoming events

calendarEvents
  .getCalendarEvents({
    maxResults,
    timeMin,
    timeMax,
    orderBy,
    singleEvents: true,
  })
  .then((events) => {
    let text = "The Warehouse is not open to the public today.";
    let found = false;

    const publicEvents = events.filter(
      (event) =>
        event.visibility !== "private" &&
        event.supports?.includes("openings_display"),
    );

    const next_opening = publicEvents.find(
      (event) => new Date(event.end.dateTime) > new Date(),
    );

    if (next_opening) {
      text = `The Warehouse is open today from ${makeTime(new Date(next_opening.start.dateTime))} to ${makeTime(new Date(next_opening.end.dateTime))} for ${next_opening.displayName || next_opening.title}!`;
    }

    if (!next_opening && publicEvents.length > 0) {
      const last_event = publicEvents[publicEvents.length - 1];
      text = `The Warehouse is shut for the day. It was open from ${makeTime(new Date(last_event.start.dateTime))} to ${makeTime(new Date(last_event.end.dateTime))} for ${last_event.displayName || last_event.title}.`;
    }

    document.getElementById("next_opening").innerText = text;
  })
  .catch((error) => {
    console.error("Error fetching calendar events:", error);
  });
