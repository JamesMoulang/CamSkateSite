const calendarEvents = (function calendarEvents() {
  const CALENDAR_ID =
    "648a32abb0a80624c5f98e8e4bfd057578a6aed5110ba2addc6f9496fa9cabb4@group.calendar.google.com";
  const API_KEY = "AIzaSyAbxzGY7irnlqDnG9NwmLuzwVb2Q3tkr3I";

  function getCalendarEvents(params, fallbackEvents = []) {
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
      .catch((error) => {
        console.error("Error fetching calendar events:", error);
        return [];
      });
  }

  return { getCalendarEvents };
})();
