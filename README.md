# Campus Helpdesk

A campus facilities and IT request portal prototype for SRM Institute of Science and Technology, Tiruchirappalli. The interface includes a dashboard, request intake and tracking, staff queue, category administration, architecture notes, and delivery guidance. The header uses the supplied transparent SRM logo.

## Open the website later

This is a React web project, so open it through a local development server rather than opening an HTML file directly.

1. Install Node.js (LTS) if it is not already installed.
2. Open a terminal in this folder.
3. Run `npm install` once.
4. Run `npm run dev`.
5. Open the local address printed in the terminal.

To make a production build, run `node_modules/.bin/tsc --noEmit` and `node_modules/.bin/vite build`.

## Current prototype behavior

Requests are stored in the current browser's local storage. The register starts empty and shows only requests entered in that browser. The requester, staff, and administrator selector is a local workflow preview, not campus sign-in. Entries are not shared across devices and this prototype is not connected to a live campus service.
