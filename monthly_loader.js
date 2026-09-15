// Shows the next upcoming instance of our monthly sessions on their cards on
// /sessions. Scans the Google Calendar two months ahead and writes a
// "Next session: ..." line into each matching card, so monthly sessions stay
// visible beyond the current week without anyone updating dates by hand.
document.addEventListener("DOMContentLoaded", () => {
  // Maps SESSION_CONFIG titles (as returned by calendarEvents) to the id of
  // the session card on /sessions. Multiple titles can share one card
  // (e.g. both 30+ variants land on Pipe & Slippers).
  const CARD_MAPPING = {
    "Girl skate night": "girl_skate_night",
    "Queer skate night": "queer_skate_night",
    "Quads & Blades": "quads_and_blades",
    "30+ (beginners)": "pipe_and_slippers",
    "30+ (all abilities)": "pipe_and_slippers",
    "Surf skate session": "surfskate_session",
  };

  function formatNextSession(startStr, endStr) {
    const start = new Date(startStr);
    const end = new Date(endStr);

    const suffix = (date) => {
      if (date > 3 && date < 21) return "th";
      switch (date % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    const day = start.toLocaleDateString("en-GB", { weekday: "short" });
    const date = start.getDate();
    const month = start.toLocaleDateString("en-GB", { month: "short" });

    const formatTime = (d) =>
      d
        .toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
        .replace(" ", "")
        .toLowerCase();

    return `${day} ${date}${suffix(date)} ${month}, ${formatTime(start)}-${formatTime(end)}`;
  }

  const timeMin = new Date();
  const timeMax = new Date(timeMin);
  timeMax.setMonth(timeMax.getMonth() + 2);

  calendarEvents
    .getCalendarEvents({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      maxResults: 250,
      singleEvents: true,
      orderBy: "startTime",
    })
    .then((events) => {
      // Events arrive ordered by start time, so the first match per card is
      // the next upcoming instance.
      const nextByCard = {};
      for (const event of events) {
        const cardId = CARD_MAPPING[event.title];
        if (!cardId || event.visibility === "private") continue;
        if (!event.start.dateTime) continue; // Skip all-day events
        if (!nextByCard[cardId]) nextByCard[cardId] = event;
      }

      for (const cardId in nextByCard) {
        const card = document.getElementById(cardId);
        if (!card) continue;

        const event = nextByCard[cardId];
        const el = document.createElement("p");
        el.className = "grid-item-next";
        el.textContent = `Next session: ${formatNextSession(
          event.start.dateTime,
          event.end.dateTime,
        )}`;

        const subtitle = card.querySelector(".grid-item-subtitle");
        if (subtitle) {
          subtitle.insertAdjacentElement("afterend", el);
        } else {
          card.appendChild(el);
        }
      }
    })
    .catch((error) => {
      console.error("Error loading next monthly sessions:", error);
    });
});
