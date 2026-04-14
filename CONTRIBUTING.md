# Contributing

Thanks for helping out! This site is maintained by volunteers. Contributions of any size are welcome — copy tweaks, image updates, bug fixes, new sections, whatever.

## Ground rules

- Be respectful and constructive. This is a community project for a community space.
- Don't commit personal data, credentials, or anything you wouldn't want posted on a public skatepark noticeboard.
- Ask first before making large structural changes (new sections, big redesigns) — open an issue to discuss.

## Contributor agreement

By submitting a contribution (pull request, patch, issue attachment, or otherwise), you agree that your contribution is assigned to Skateboard Cambridge CIC, and that Skateboard Cambridge CIC may use it under any terms. You retain no separate rights to the contributed material beyond what is granted by the repository's [LICENSE](LICENSE).

See the [LICENSE](LICENSE) file for the full terms under which this repository is made public. In short: the code is visible so that volunteers can help improve the Cam Skate website, but it is not open source — you do not gain rights to use it for other purposes, and you especially do not gain rights to any images, logos, or brand assets.

## Getting set up

1. Fork the repo on GitHub (click "Fork" top-right).
2. Clone your fork locally: `git clone https://github.com/YOUR_USERNAME/cam_skate_site.git`
3. Serve it with any static file server — see the [README](readme.md#running-locally).

## Making a change

1. Create a branch: `git checkout -b fix/typo-on-homepage` (use a short, descriptive name).
2. Edit the files.
3. Check it in the browser — navigate the affected pages on desktop and mobile (browser DevTools can simulate mobile widths).
4. Commit with a clear message: `git commit -m "Fix typo on homepage hero"`.
5. Push and open a pull request against `main` on the main repo.
6. A maintainer will review. Once merged, Netlify auto-deploys within a minute or two.

## What to work on

Check the [Issues tab](../../issues) for things that need doing. Good first issues are tagged accordingly. If you spot something that needs fixing and there's no issue for it, feel free to just open a PR.

## Common tasks

### Updating session times

Session schedules are pulled live from a Google Calendar — **do not edit times in the HTML**. Ask a maintainer to update the calendar instead.

### Adding a new session type

When a new session type is added to the Google Calendar, update these three files so the carousel and weekly grid display it correctly:

- `carousel_loader.js` — add entries to `IMAGE_MAPPING` and `LINK_MAPPING`
- `week_loader.js` — add an entry to `COLOR_MAPPING`
- `opening.js` — add the session name to `valid_events` and `title_map` if it should appear in the homepage "open today" message

### Adding a new page

1. Create a new folder with an `index.html` (copy the structure of an existing page like `/visit/index.html`).
2. Add a nav link to both the desktop `<nav>` and the mobile overlay `<div class="overlay">` on every page that has the site header.
3. Update `readme.md`'s project-structure section.

### Adding images

Put them in `/img/` with a descriptive filename. Prefer `.jpg` for photos, `.png` for graphics with transparency, and keep file sizes reasonable (run through an image optimiser if large).

## Questions

Open an issue or email <hello@cam-skate.co.uk>.
