document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const CALENDAR_ID = '648a32abb0a80624c5f98e8e4bfd057578a6aed5110ba2addc6f9496fa9cabb4@group.calendar.google.com';
    const API_KEY = 'AIzaSyAbxzGY7irnlqDnG9NwmLuzwVb2Q3tkr3I';

    const carousel = document.querySelector('.carousel');
    const week_schedule = document.getElementById('week_schedule');
    console.log(week_schedule);

    function formatEventTime(startStr, endStr) {
        const start = new Date(startStr);
        const end = new Date(endStr);

        const day = start.toLocaleDateString('en-US', { weekday: 'short' });
        const date = start.getDate();
        const month = start.toLocaleDateString('en-US', { month: 'short' });

        const suffix = (date) => {
            if (date > 3 && date < 21) return 'th';
            switch (date % 10) {
                case 1: return "st";
                case 2: return "nd";
                case 3: return "rd";
                default: return "th";
            }
        };

        const startTime = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).replace(' ', '').toLowerCase();
        const endTime = end.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).replace(' ', '').toLowerCase();

        return `${startTime}-${endTime}`;
    }

    const COLOR_MAPPING = {
        'beginners session': '#4CAF50', // Green
        'beginners evening': '#4CAF50', // Green
        'open session': '#2196F3',      // Blue
        '☕ open session': '#2196F3',
        'after school club': '#FFC107', // Amber
        'after work club': '#FFC107',
        '☕ under 10s': '#FF9800',       // Orange
        'under 10s': '#FF9800',
        'girl skate night': '#E91E63',   // Pink
        'quads & blades': '#9C27B0',    // Purple
        'quads and blades': '#9C27B0',  // Purple
        'queer skate night': '#673AB7',  // Deep Purple
        '30+ (beginners)': '#795548',     // Brown
        '30+ (all abilities)': '#795548',
        'scooter session': '#607D8B',    // Blue Grey
        'after school scooter club': '#607D8B', // Blue Grey
        'default': '#9E9E9E'             // Grey
    };

    function getColorForEvent(title) {
        const lower_title = title.toLowerCase();
        for (const keyword in COLOR_MAPPING) {
            if (lower_title.includes(keyword)) {
                return COLOR_MAPPING[keyword];
            }
        }
        return COLOR_MAPPING['default'];
    }

    async function fetchAndPopulateCarousel() {
        if (API_KEY === 'YOUR_GOOGLE_API_KEY' || CALENDAR_ID === 'YOUR_CALENDAR_ID') {
            console.error("Please replace 'YOUR_GOOGLE_API_KEY' and 'YOUR_CALENDAR_ID' in carousel_loader.js");
            // Handle error display in the UI
            return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        const timeMinToday = today.toISOString();

        const aWeekFromNow = new Date(today);
        aWeekFromNow.setDate(today.getDate() + 7);
        const timeMaxToday = aWeekFromNow.toISOString();

        let url = `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}&timeMin=${timeMinToday}&timeMax=${timeMaxToday}&maxResults=100&singleEvents=true&orderBy=startTime`;

        try {
            const response = await fetch(url);
            const data = await response.json();
            const events = data.items || [];

            const dates = {};

            for (const event of events) {
                const dateString = event.start.dateTime;
                const date = new Date(dateString);
                let formattedDay = date.toLocaleDateString('en-GB', { 
                    weekday: 'long',
                    // day: 'numeric',
                    // month: 'short'
                });

                const dayOfMonth = date.getDate();
                const ordinal = (d) => {
                    const s = ["th", "st", "nd", "rd"];
                    const v = d % 100;
                    return s[(v - 20) % 10] || s[v] || s[0];
                };
                formattedDay = formattedDay.replace(String(dayOfMonth), dayOfMonth + ordinal(dayOfMonth));
                
                if (!dates[formattedDay]) {
                    dates[formattedDay] = [];
                }

                dates[formattedDay].push({
                    time: formatEventTime(event.start.dateTime, event.end.dateTime),
                    title: event.summary,
                    color: getColorForEvent(event.summary)
                });
            }

            let scheduleHTML = ''; // No wrapper div
            for (const day in dates) {
                scheduleHTML += `
                    <div class="day-capsule">
                        <h3>${day}</h3>
                `;
                for (const session of dates[day]) {
                    scheduleHTML += `
                        <div class="session-item" style="background-color: ${session.color};">
                            <div class="session-time">${session.time}</div>
                            <div class="session-title">${session.title}</div>
                        </div>
                    `;
                }
                scheduleHTML += '</div>';
            }

            if (week_schedule) {
                week_schedule.classList.add('schedule-capsules'); // Add class to the element
                week_schedule.innerHTML = scheduleHTML;
            }

        } catch (error) {
            console.error('Error fetching calendar events:', error);
            if (week_schedule) {
                week_schedule.innerHTML = '<p style="color: red;">Error loading week schedule.</p>';
            }
        }
    }

    if (week_schedule) {
        fetchAndPopulateCarousel();
    }
});
