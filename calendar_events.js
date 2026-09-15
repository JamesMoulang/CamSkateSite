// Calendar titles sometimes carry stray whitespace (e.g. "Girl Skate Night "),
// so both strategies trim before comparing.
const directAccessStrategy = (event, sessionConfig) => {
  const foundEvent = sessionConfig[event.summary.trim().toLowerCase()];
  return foundEvent ? foundEvent : null;
};

// This strategy allows us to define alternative titles for events in the SESSION_CONFIG.
// This is useful for events like "quads & blades" which might be entered in the calendar with
// a slightly different title but we still want to match it to the same session configuration.
const alternativeTitleStrategy = (event, sessionConfig) => {
  const result = Object.entries(sessionConfig).find(
    ([key, value]) =>
      value.altTitles &&
      value.altTitles.some(
        (t) => t.toLowerCase() === event.summary.trim().toLowerCase(),
      ),
  );

  return result ? result[1] : null;
};

const applyStrategies = (event, sessionConfig) => {
  const strategies = [directAccessStrategy, alternativeTitleStrategy];
  for (const strategy of strategies) {
    const result = strategy(event, sessionConfig);
    if (result) {
      return result;
    }
  }
  return null;
};

const getEventTime = (eventTime) => eventTime.dateTime || eventTime.date;

const mergeAdjacentEvent = (mergedEvents, event) => {
  const previousEvent = mergedEvents.at(-1);

  if (
    previousEvent &&
    previousEvent.title === event.title &&
    getEventTime(previousEvent.end) === getEventTime(event.start)
  ) {
    previousEvent.end = event.end;
  } else {
    mergedEvents.push(event);
  }

  return mergedEvents;
};

const calendarEvents = (function calendarEvents() {
  const CALENDAR_ID =
    "648a32abb0a80624c5f98e8e4bfd057578a6aed5110ba2addc6f9496fa9cabb4@group.calendar.google.com";
  const API_KEY = "AIzaSyAbxzGY7irnlqDnG9NwmLuzwVb2Q3tkr3I";

  function getCalendarEvents(
    params,
    fallbackEvents = [],
    sessionConfig = SESSION_CONFIG,
  ) {
    const defaultParams = { key: API_KEY, ...params };
    const queryParams = new URLSearchParams(defaultParams).toString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?${queryParams}`;

    return fetch(url)
      .then((response) => {
        if (!response.ok && !location.hostname.includes("cam-skate.co.uk")) {
          return { items: fallbackEvents };
        }
        return response.json();
      })
      .then((data) => data.items || [])
      .then((events) => {
        const defaultConfig = sessionConfig["default"] || {};
        return events.reduce((mergedEvents, event) => {
          const eventFromConfig = applyStrategies(event, sessionConfig);
          const normalisedEvent = {
            ...defaultConfig,
            ...(eventFromConfig || {}),
            summary: eventFromConfig?.title || event.summary,
            title: eventFromConfig?.title || event.summary,
            visibility: event.visibility,
            start: event.start,
            end: event.end,
          };

          return mergeAdjacentEvent(mergedEvents, normalisedEvent);
        }, []);
      })
      .catch((error) => {
        console.error("Error fetching calendar events:", error);
        throw error;
      });
  }

  return { getCalendarEvents };
})();

if (typeof exports === "object") {
  module.exports = {
    calendarEvents,
    applyStrategies,
    directAccessStrategy,
    alternativeTitleStrategy,
    mergeAdjacentEvent,
  };
}
