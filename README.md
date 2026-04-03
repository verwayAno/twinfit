# TwinFit

TwinFit is a multi-role athlete monitoring prototype built with Next.js. It connects three interfaces in one app:

- Player check-in for subjective symptoms and pain-zone reporting
- Medical triage for AI-assisted review and protocol validation
- Coach intelligence view for live risk tracking and approved return-to-play guidance

The app now opens on the Player interface by default so the athlete workflow is the first experience when launching the product.

## Overview

TwinFit combines subjective player input, injury-risk modeling, and role-specific decision support into one shared interface. Players report how they feel, medical staff validate what matters, and coaches act on reviewed information rather than raw unconfirmed signals.

## Current Product Flow

1. A player opens the app and completes a check-in.
2. The submission stores notes, selected body zones, and review state.
3. Medical staff review flagged players inside the triage dashboard.
4. When medical validates a protocol, that approval is pushed into shared app state.
5. The coach dashboard immediately reflects the approved recommendation and shows a live update.

## Key Features

### Player Interface

- Player-first launch experience
- Mobile-style check-in flow
- Body-zone pain reporting
- Submission status feedback for pending review and approved protocols

### Medical Dashboard

- Redesigned triage cards with a simple anatomical injury preview on the left
- AI risk overlays on the anatomical body map
- Dashed anatomical overlays for player-reported pain zones
- AI-generated protocol review and medical approval action
- Pending review queue for self-reported submissions outside the critical-risk list

### Coach Dashboard

- Roster indicators for pending and approved players
- Approved medical recommendations displayed directly in the insights panel
- Player-reported injury zones reflected on the body visualization
- Live approval alerts in the coach feed

### Team Report

- Dedicated report route at `/report`
- Animated loading state while team protocols are assembled
- White-background printable layout for daily follow-up
- Full-team risk grouping for critical, elevated, and clear players
- Save-to-PDF workflow through browser print

## Tech Stack

- Next.js 16.2.2
- React 19.2.4
- Ant Design 6
- Framer Motion 12
- Lucide React
- Tailwind CSS 4

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm

### Install

```bash
npm install
```

### Run

```bash
npm run dev
```

Open the local URL shown by Next.js in the terminal.

## Main Routes

- `/` for the multi-role app shell
- `/report` for the printable full-team report
- `/api/generate-protocol` for the mock AI protocol endpoint

## Project Structure

```text
src/
  app/
    page.js
    report/page.js
    api/generate-protocol/route.js
  components/
    AnatomicalTwin.js
    CoachDashboard.js
    IdentityPanel.js
    InsightsPanel.js
    MedicalDashboard.js
    PlayerApp.js
  data/
    players.json
  utils/
    injuryModel.js
```

## Notes

- Shared cross-role state is currently modeled with in-memory React state for prototype purposes.
- Medical approvals and player submissions are not persisted to a backend yet.
- The protocol endpoint is mock AI logic intended for demonstration and workflow testing.
