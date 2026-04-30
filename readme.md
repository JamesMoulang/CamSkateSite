# Cam Skate Website

The website for [The Warehouse Indoor Skatepark](https://cam-skate.co.uk) in Cambridge, UK — run by Skateboard Cambridge CIC (trading as Cam Skate), a Community Interest Company.

Volunteers are welcome to contribute. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Stack

Plain HTML, CSS, and JavaScript. No build step, no framework, no backend. Session times are pulled live from a public Google Calendar on page load.

## Running locally

Clone the repo, then serve the directory with any static file server. A couple of easy options:

```bash
# Python 3 (built into macOS and most Linux distros)
python3 -m http.server 8000

# Or Node
npx serve .
```

Then open <http://localhost:8000>.

Note: the Google Calendar API key is restricted to `cam-skate.co.uk`, so the calendar widgets (opening hours, weekly schedule, session carousel) will not load data when running on `localhost`. The rest of the site works normally. If you need the calendar to load locally, ask a maintainer to add `localhost` to the allowed referrers.

## Deployment

The site is hosted on Netlify and rebuilds automatically on every push to `main`. To deploy a change: open a pull request, get it reviewed, merge to `main`, and Netlify takes care of the rest.

## Project structure

```
/                  homepage (index.html) and shared CSS/JS
/sessions/         session schedule page
/coaching/         coaching landing page + subpages for skate/scooter/roller
/visit/            visiting info
/events/           events page
/about/            about + sub-sections (story, impact, campaigns)
/get_involved/     volunteering / community
/partners/         our partners and sponsors
/donate/           donations
/hire/             venue hire
/vouchers/         free entry vouchers for local orgs
/img/              all site images
/docs/             public PDFs (safeguarding, policies, code of conduct)
```

Core scripts:

- `script.js` — navigation, mobile menu, carousel controls
- `opening.js` — "open today" message on the homepage
- `carousel_loader.js` — upcoming-sessions carousel
- `week_loader.js` — weekly schedule grid
- `photo_tour.js` — photo gallery

## Contact

General enquiries: <hello@cam-skate.co.uk>

## Licence

The source code in this repository is [MIT licensed](LICENSE). Brand assets — the Cam Skate and The Warehouse Skatepark names, logos, photographs, and other media under `/img/` and `/docs/` — are not covered by the MIT grant and remain © Skateboard Cambridge CIC, all rights reserved. See the [LICENSE](LICENSE) file for details.
