document.addEventListener("DOMContentLoaded", () => {
  // --- Configuration ---
  const CALENDAR_ID =
    "648a32abb0a80624c5f98e8e4bfd057578a6aed5110ba2addc6f9496fa9cabb4@group.calendar.google.com";
  const API_KEY = "AIzaSyAbxzGY7irnlqDnG9NwmLuzwVb2Q3tkr3I";

  let UNIQUE_EVENTS_ONLY = true; // Set to false to show all upcoming events
  if (window.carousel_load_today) {
    UNIQUE_EVENTS_ONLY = false;
  }

  const makeSampleEvent = (summary, startHour, endHour) => ({
    visibility: "public",
    summary,
    start: {
      dateTime: new Date(new Date().setHours(startHour, 0, 0)).toISOString(),
    },
    end: {
      dateTime: new Date(new Date().setHours(endHour, 0, 0)).toISOString(),
    },
  });

  // Set to true to group all instances of each event type and show all their dates
  let GROUP_ALL_INSTANCES = false;
  if (window.carousel_group_instances) {
    GROUP_ALL_INSTANCES = true;
  }

  const carousel = document.getElementById("schedule_carousel");

  let assetRoot = "";
  if (window.carousel_asset_root) assetRoot = window.carousel_asset_root;

  // Default image to use for carousel items if no specific image is found
  const DEFAULT_IMAGE = "img/advanced.jpg";
  // Mapping of event titles (keywords) to specific images
  // const IMAGE_MAPPING = {
  //     'open session': 'img/advanced.jpg',
  //     'after work club': 'img/party.jpg',
  //     'beginner': 'img/beginners.jpg',
  //     'coaching': 'img/coaching.jpg',
  //     'kids': 'img/kids_and_coaching.jpg',
  //     'women': 'img/girl_skate_night.jpg',
  //     'lgbtq+': 'img/girl_skate_night.jpg',
  //     '30+': 'img/pipe_and_slippers.jpg',
  //     'quads': 'img/quads_and_blades.jpg',
  //     'blades': 'img/quads_and_blades.jpg',
  // };

  const IMAGE_MAPPING = {
    "beginners session": "img/beginners.jpg",
    "beginners evening": "img/beginners.jpg",
    "open session": [
      "img/advanced.jpg",
      "img/open session 1.jpg",
      "img/open session 2.jpg",
    ],
    "☕ open session": "img/advanced.jpg",
    "after school club": "img/after_school.jpeg",
    "after work club": "img/reception group.png",
    "☕ under 10s": "img/junior jam 2.png",
    "under 10s": "img/junior jam 2.png",
    "girl skate night": "img/girl_skate_night.jpg",
    "quads & blades": ["img/q&b 1.jpeg", "img/q&b 2.jpeg", "img/q&b 3.jpeg"],
    "quads and blades": ["img/q&b 1.jpeg", "img/q&b 2.jpeg", "img/q&b 3.jpeg"],
    "queer skate night": "img/q&b 3.jpeg",
    "30+ (beginners)": "img/pipe_and_slippers.jpg",
    "30+ (all abilities)": "img/pipe_and_slippers.jpg",
    "surf skate session": "img/surf_skate.jpg",
    "christmas party": "img/xmas jam poster minimal.jpg",
    "scooter session": [
      "img/scooter 1.jpg",
      "img/scooter 2.jpg",
      "img/scooter 3.jpg",
      "img/scooter 4.jpg",
      "img/scooter 5.jpg",
      "img/scooter 6.jpg",
    ],
    "scooters only": [
      "img/scooter 1.jpg",
      "img/scooter 2.jpg",
      "img/scooter 3.jpg",
      "img/scooter 4.jpg",
      "img/scooter 5.jpg",
      "img/scooter 6.jpg",
    ],
    "after school scooter club": [
      "img/scooter 1.jpg",
      "img/scooter 2.jpg",
      "img/scooter 3.jpg",
      "img/scooter 4.jpg",
      "img/scooter 5.jpg",
      "img/scooter 6.jpg",
    ],
  };

  const DISCIPLINE_MAPPING = {
    "open session": ["🛹 Skateboard", "🛼 Roller"],
    "☕ open session": ["🛹 Skateboard", "🛼 Roller"],
    "beginners session": ["🛹 Skateboard", "🛼 Roller"],
    "beginners evening": ["🛹 Skateboard", "🛼 Roller"],
    "girl skate night": ["🛹 Skateboard", "🛼 Roller"],
    "queer skate night": ["🛹 Skateboard", "🛼 Roller"],
    "30+ (beginners)": ["🛹 Skateboard", "🛼 Roller"],
    "30+ (all abilities)": ["🛹 Skateboard", "🛼 Roller"],
    "quads & blades": ["🛼 Roller"],
    "quads and blades": ["🛼 Roller"],
    "scooter session": ["🛴 Scooter"],
    "scooters only": ["🛴 Scooter"],
    "after school scooter club": ["🛴 Scooter"],
    "after school club": ["🛹 Skateboard"],
    "after work club": ["🛹 Skateboard"],
    "☕ under 10s": ["all wheels welcome"],
    "under 10s": ["all wheels welcome"],
  };

  const SAMPLE_EVENTS = Object.keys(IMAGE_MAPPING).map((key, index) =>
    makeSampleEvent(key, 9 + index, 10 + index),
  );

  function getDisciplinesForEvent(title) {
    const lower_title = title.toLowerCase();
    for (const keyword in DISCIPLINE_MAPPING) {
      if (lower_title.includes(keyword)) {
        return DISCIPLINE_MAPPING[keyword];
      }
    }
    return null;
  }

  function generateDisciplineHTML(title) {
    const disciplines = getDisciplinesForEvent(title);
    if (!disciplines) return "";

    if (disciplines[0] === "all wheels welcome") {
      return '<div class="carousel-disciplines"><span class="discipline-tag all-wheels">All wheels welcome</span></div>';
    }

    let html = '<div class="carousel-disciplines">';
    for (const d of disciplines) {
      html += `<span class="discipline-tag">${d}</span>`;
    }
    html += "</div>";
    return html;
  }

  const LINK_MAPPING = {
    "beginners session": [
      { href: "/sessions#beginner_sessions", text: "More info" },
    ],
    "beginners evening": [
      { href: "/sessions#beginner_sessions", text: "More info" },
    ],
    closed: [{ href: "/sessions#beginner_sessions", text: "" }],
    "girl skate night": [
      { href: "/sessions#girl_skate_night", text: "More info" },
    ],
    "queer skate night": [
      { href: "/sessions#queer_skate_night", text: "More info" },
    ],
    "30+ (beginners)": [
      { href: "/sessions#pipe_and_slippers", text: "More info" },
    ],
    "30+ (all abilities)": [
      { href: "/sessions#pipe_and_slippers", text: "More info" },
    ],
    "quads & blades": [
      { href: "/sessions#quads_and_blades", text: "More info" },
    ],
    "quads and blades": [
      { href: "/sessions#quads_and_blades", text: "More info" },
    ],
    "open session": [
      { href: "/sessions", text: "View this week's open sessions" },
      { href: "/visit", text: "How to visit" },
    ],
    "☕ open session": [
      { href: "/sessions", text: "View all open sessions this week" },
      { href: "/visit", text: "How to visit" },
    ],
    "after school club": [{ href: "/coaching", text: "Book coaching" }],
    "after work club": [{ href: "/coaching", text: "Book coaching" }],
    "scooters only": [{ href: "/sessions#scooter_session", text: "More info" }],
    "after school scooter club": [
      { href: "/coaching/scooter/", text: "More info" },
    ],
    default: [{ href: "/sessions", text: "More info" }],
  };

  function getImageForEvent(title) {
    const lower_title = title.toLowerCase();
    for (const keyword in IMAGE_MAPPING) {
      if (lower_title.includes(keyword)) {
        const imageOrArray = IMAGE_MAPPING[keyword];
        if (Array.isArray(imageOrArray)) {
          const randomIndex = Math.floor(Math.random() * imageOrArray.length);
          return imageOrArray[randomIndex];
        }
        return imageOrArray;
      }
    }
    return DEFAULT_IMAGE;
  }

  function formatEventTime(startStr, endStr) {
    const start = new Date(startStr);
    const end = new Date(endStr);

    const day = start.toLocaleDateString("en-US", { weekday: "short" });
    const date = start.getDate();
    const month = start.toLocaleDateString("en-US", { month: "short" });

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

    const startTime = start
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .replace(" ", "")
      .toLowerCase();
    const endTime = end
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .replace(" ", "")
      .toLowerCase();

    return `${day} ${date}${suffix(date)} ${month}, ${startTime}-${endTime}`;
  }

  function generateLinkHTML(title) {
    const lower_title = title.toLowerCase();
    let linksHTML = "";
    let matchingLinks = LINK_MAPPING["default"]; // Start with default links

    for (const keyword in LINK_MAPPING) {
      if (keyword !== "default" && lower_title.includes(keyword)) {
        matchingLinks = LINK_MAPPING[keyword];
        break;
      }
    }

    for (const link of matchingLinks) {
      linksHTML += `<a href="${assetRoot + link.href}" class="carousel-item-link">${link.text}</a>`;
    }
    return linksHTML;
  }

  async function fetchAndPopulateCarousel() {
    if (
      API_KEY === "YOUR_GOOGLE_API_KEY" ||
      CALENDAR_ID === "YOUR_CALENDAR_ID"
    ) {
      console.error(
        "Please replace 'YOUR_GOOGLE_API_KEY' and 'YOUR_CALENDAR_ID' in carousel_loader.js",
      );
      carousel.innerHTML =
        '<p style="color: red;">Please configure the Google Calendar API Key and Calendar ID.</p>';
      return;
    }

    // Create a Date object for today at midnight (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Convert to ISO string format for the API (e.g., "2025-12-13T00:00:00.000Z")
    const timeMinToday = today.toISOString();

    // Create a Date object for tomorrow at midnight (used only if loading today's events)
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    let timeMaxToday = tomorrow.toISOString();

    if (window.carousel_load_week) {
      const in_a_week = new Date(today);
      in_a_week.setDate(today.getDate() + 7);
      timeMaxToday = in_a_week.toISOString();
    }

    // Build the Google Calendar API URL:
    // - timeMin: Start from today at midnight (always included)
    // - timeMax: Only included if window.carousel_load_today is true (limits to today's events only)
    //   If window.carousel_load_today is false/undefined, no timeMax is set, so the API will return
    //   events from today onwards, limited only by maxResults (100 events)
    // - maxResults=100: Maximum number of events to return (this is the hard limit)
    // - singleEvents=true: Expand recurring events into individual instances
    // - orderBy=startTime: Sort events chronologically
    //
    // NOTE: Without timeMax, you'll get up to 100 events starting from today. If you see events
    // loading up to a specific date like Jan 14th, it's likely because you have ~100 events
    // between now and that date, hitting the maxResults limit.
    let url = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}&timeMin=${timeMinToday}${window.carousel_load_today || window.carousel_load_week ? `&timeMax=${timeMaxToday}` : ""}&maxResults=100&singleEvents=true&orderBy=startTime`;

    let events = [];
    try {
      const response = await fetch(url);
      const data = await response.json();
      events = data.items || [];

      if (!response.ok && location.hostname === "localhost") {
        events = SAMPLE_EVENTS;
      }
    } catch (error) {
      console.error("Error fetching calendar events:", error);
      carousel.innerHTML =
        '<p style="color: red;">Error loading upcoming events.</p>';
    }

    let eventsToDisplay;

    if (GROUP_ALL_INSTANCES) {
      // Group all events by title and collect all their times
      const groupedEvents = {};
      for (const event of events) {
        const title = event.summary;
        if (!groupedEvents[title]) {
          groupedEvents[title] = [];
        }
        groupedEvents[title].push(event);
      }
      eventsToDisplay = groupedEvents;
    } else if (UNIQUE_EVENTS_ONLY) {
      const nextUpcomingEvents = {};
      for (const event of events) {
        const title = event.summary;
        if (!nextUpcomingEvents[title]) {
          nextUpcomingEvents[title] = event;
        }
      }
      eventsToDisplay = Object.values(nextUpcomingEvents);
    } else {
      eventsToDisplay = events;
    }

    let carouselHTML = "";

    if (GROUP_ALL_INSTANCES) {
      // Generate carousel items with all dates for each event type
      for (const title in eventsToDisplay) {
        const eventGroup = eventsToDisplay[title];
        const image = getImageForEvent(title);
        const links = generateLinkHTML(title);
        const disciplines = generateDisciplineHTML(title);

        // Generate all time strings for this event type
        let timesHTML = "";
        for (const event of eventGroup) {
          const time = formatEventTime(
            event.start.dateTime,
            event.end.dateTime,
          );
          timesHTML += `<div>${time}</div>`;
        }

        carouselHTML += `
                        <div class="carousel-item" style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${assetRoot + image}');">
                            <div class="carousel-item-text-container">
                                ${disciplines}
                                <div class="carousel-item-title">${title}</div>
                                <div class="carousel-item-subtitle">${timesHTML}</div>
                                <div class="carousel-item-links">${links}</div>
                            </div>
                        </div>
                    `;
      }
    } else {
      // Original behavior - one carousel item per event
      for (const event of eventsToDisplay) {
        const title = event.summary;
        const image = getImageForEvent(title);
        const time = formatEventTime(event.start.dateTime, event.end.dateTime);
        const links = generateLinkHTML(title);
        const disciplines = generateDisciplineHTML(title);

        carouselHTML += `
                        <div class="carousel-item" style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('${assetRoot + image}');">
                            <div class="carousel-item-text-container">
                                ${disciplines}
                                <div class="carousel-item-title">${title}</div>
                                <div class="carousel-item-subtitle">${time}</div>
                                <div class="carousel-item-links">${links}</div>
                            </div>
                        </div>
                    `;
      }
    }

    carousel.innerHTML = carouselHTML;
  }

  fetchAndPopulateCarousel();
});
