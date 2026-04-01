const calendar_id = '648a32abb0a80624c5f98e8e4bfd057578a6aed5110ba2addc6f9496fa9cabb4@group.calendar.google.com';
const api_key = 'AIzaSyAbxzGY7irnlqDnG9NwmLuzwVb2Q3tkr3I';

const maxResults = 20;  // Change this to get more or fewer events
const orderBy = 'startTime';
var today = new Date();
today.setDate(today.getDate() - 1);
const timeMin = today.toISOString(); // Get only upcoming events

const url = `https://www.googleapis.com/calendar/v3/calendars/${calendar_id}/events?key=${api_key}&maxResults=${maxResults}&orderBy=${orderBy}&singleEvents=true&timeMin=${encodeURIComponent(timeMin)}`;

// Fetch

fetch(url)
.then(response => {
if (!response.ok) {
  throw new Error('Network response was not ok');
}
return response.json();
})
.then(data => {
console.log('Events:', data.items);

// const opening_hours = {
//   'Mon Jan 06': [ early_evening ],
// };

const colors = {
  purple: '#9D00FF',
  blue: '#5383ec',
  green: '#018E42',
  red: '#BF1A2F',
};

const session_colors = {
  'open session': colors.blue,
  '☕ open session': colors.blue,
  'after school club': colors.purple,
  'after work club': colors.purple,
  '☕ under 10s': colors.green,
  'closed': colors.red,
  'girl skate night': colors.green,
  'quads & blades': colors.green,
  'queer skate night': colors.green,
  '30+ (beginners)': colors.green,
  '30+ (all abilities)': colors.green,
};

const opening_hours = {};

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dates = [];

const today = new Date();

data.items.map((item) => {
  // Use local time from the dateTime string directly (Google Calendar returns local time)
  const start_date = new Date(item.start.dateTime);
  const end_date = new Date(item.end.dateTime);

  // Use local hours (not UTC) so BST/GMT is handled correctly
  const start_hours = start_date.getHours() + (start_date.getMinutes() / 60);
  const end_hours = end_date.getHours() + (end_date.getMinutes() / 60);

  const day = daysOfWeek[start_date.getDay()];
  const month = months[start_date.getMonth()];
  const dayOfMonth = start_date.getDate().toString().padStart(2, '0');

  const date_key = `${day} ${month} ${dayOfMonth}`;

  if (!opening_hours.hasOwnProperty(date_key)) {
    opening_hours[date_key] = [];
  }

  console.log(item.summary, item);

  if (item.summary && item.visibility != 'private') {
    opening_hours[date_key].push({
      start: start_hours,
      end: end_hours,
      start_time: `${start_date.getHours()}:${start_date.getMinutes().toString().padStart(2,'0')}`,
      end_time: `${end_date.getHours()}:${end_date.getMinutes().toString().padStart(2,'0')}`,
      title: item.summary,
    });
  }
});

console.log(opening_hours);

var currentDate = new Date();
// Only check today.
const oh = opening_hours[currentDate.toString().substr(0, 10)];

let text = 'The Warehouse is not open to the public today.';
let found = false;

let valid_events = [
  'open session',
  '☕ open session',
  'beginners session',
  'beginners evening',
  'beginner session',
  'beginner evening',
  'saturday beginners evening',
  'saturday beginner evening',
  'beginners',
  // 'after school club',
  // 'after work club',
  // 'after school scooter club',
  '☕ under 10s',
  'under 10s',
  // 'closed',
  'girl skate night',
  'quads & blades',
  'quads and blades',
  'queer skate night',
  '30+ (beginners)',
  '30+ (all abilities)',
  'under 21s',
  'full moon (open session)',
  'roller disco (family)',
  'roller disco (adults)',
];

let title_map = {
  'under 10s': 'Junior Jam (under 10s only)',
  '☕ under 10s': 'Junior Jam (under 10s only)',
  '30+ (beginners)': 'Pipe & Slippers (30+)',
  '30+ (all abilities)': 'Pipe & Slippers (30+)',
}

let i = 0;
while (i < oh.length) {
  const o = oh[i];

  console.log('checking', o);

  if (valid_events.indexOf(o.title.toLowerCase()) > -1 &&
      !found &&
      o.end > currentDate.getHours() && 
      !o.private
  ) {
    let mapped_title = title_map[o.title.toLowerCase()] ? title_map[o.title.toLowerCase()] : o.title;

    found = true;

    console.log('found', o);

    text = `The Warehouse is open today from ${o.start_time} to ${o.end_time} for ${mapped_title}!`;
  }

  i++;
}

if (!found) {
  console.log('not found');

  for (var j = 0; j < oh.length; j++) {
    const o = oh[j];
    if (valid_events.indexOf(o.title.toLowerCase()) > -1 &&
      // o.end > currentDate.getHours() && 
      !o.private
    ) {
      let mapped_title = title_map[o.title.toLowerCase()] ? title_map[o.title.toLowerCase()] : o.title;
      text = `The Warehouse is shut for the day. It was open from ${o.start_time} to ${o.end_time} for ${mapped_title}.`;
    }
  }
}

document.getElementById('next_opening').innerText = text;
})
.catch(error => {
console.error('Error fetching calendar events:', error);
});

// console.log(oh);
// console.log(currentDate.getHours());