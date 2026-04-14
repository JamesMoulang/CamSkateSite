# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website for The Warehouse Skatepark in Cambridge, UK - an indoor skatepark run by Cam Skate (a Community Interest Company). The site provides information about sessions, coaching, visiting the park, and community involvement.

## Architecture

The site uses vanilla HTML, CSS, and JavaScript with no build system or framework. Key architectural patterns:

### Multi-page Structure
- Root `index.html` serves as the homepage
- Subdirectories contain section pages (`/sessions/`, `/coaching/`, `/visit/`, etc.)
- Each section has its own `index.html` that references assets relatively (e.g., `../style.css`, `../img/`)
- Navigation is consistent across all pages via shared header/footer HTML

### Google Calendar Integration
The site dynamically fetches and displays session schedules from Google Calendar:

- **Calendar ID**: `648a32abb0a80624c5f98e8e4bfd057578a6aed5110ba2addc6f9496fa9cabb4@group.calendar.google.com`
- **API Key**: `AIzaSyAbxzGY7irnlqDnG9NwmLuzwVb2Q3tkr3I` (public read-only key)
- **Three calendar loaders** serve different purposes:
  - `opening.js` - Shows today's opening hours on homepage (updates `#next_opening` element)
  - `carousel_loader.js` - Displays upcoming unique session types as carousel cards (controlled by `UNIQUE_EVENTS_ONLY` flag)
  - `week_loader.js` - Shows full weekly schedule in day-by-day capsules

### JavaScript Modules
- `script.js` - Core navigation (hamburger menu, overlays) and carousel button handlers
- `photo_tour.js` - Photo gallery/thumbnail viewer functionality
- All scripts use `DOMContentLoaded` to ensure elements exist before manipulation

### CSS Architecture
Single `style.css` file controls all styling:
- Uses CSS Grid for session grids and two-column layouts
- Carousel components with horizontal scroll-snap behavior
- Responsive design with mobile breakpoints (@media queries)
- Hamburger menu overlay navigation for mobile (< 950px)
- Logo marquee animation for sponsor section

### Asset Management
- All images in `/img/` directory
- Logo variants: `logo.png` (white), `logo_black.png` (black)
- Session-specific images mapped in `IMAGE_MAPPING` objects within JavaScript loaders
- PDFs (safeguarding docs, code of conduct) in `/docs/`

## Key Integration Points

### Calendar Event Display
When adding new session types to the Google Calendar, update these mappings:

1. **Color mapping** in `week_loader.js` (`COLOR_MAPPING` object) - defines session colors in weekly schedule
2. **Image mapping** in `carousel_loader.js` (`IMAGE_MAPPING` object) - defines carousel card backgrounds (can be single image or array for random selection)
3. **Link mapping** in `carousel_loader.js` (`LINK_MAPPING` object) - defines "More info" links on carousel cards
4. **Valid events** in `opening.js` (`valid_events` array and `title_map`) - controls which sessions appear in "open today" message

### Navigation
The navigation structure is hardcoded in header/footer HTML on each page. When adding new pages:
- Add `<li><a href="/new-page/">New Page</a></li>` to both desktop nav and mobile overlay
- Use `class="current-page"` on the active nav item (seen in `sessions/index.html:14`)
- Use `class="navbar-black-text"` on header for pages with white backgrounds

### Carousel Systems
Two distinct carousel implementations:
1. **Event carousels** (home, sessions page) - Dynamically populated from Google Calendar API
2. **Photo carousel** ("New Here" section) - Static content with auto-advance (5s interval) and dot navigation

## Deployment

The site is deployed via Netlify, which builds automatically on every push to the GitHub repo's `main` branch. To deploy changes, commit and push — no manual sync step is needed.

## Development Notes

- This is a static site meant to be served directly (no build step)
- Paths are absolute from root (e.g., `/sessions/`, `/img/`) - requires proper web server routing
- Google Calendar API calls happen client-side on page load
- No server-side code or backend database
- Membership/waiver system hosted externally at `membership.cam-skate.co.uk`
