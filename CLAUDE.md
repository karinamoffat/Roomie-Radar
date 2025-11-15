# Project Spec: Housemate Management App

1. High level goal

Build a simple, beautiful household web app where each housemate can:

Set their current status (examples: "Going out tonight", "Watching a movie", "Studying", "Away for the weekend")

Share important upcoming events (exams, guests coming over, trips, etc.)

Indicate grocery plans (going shopping, can take requests, etc.)

Quickly glance at what everyone is up to today and this week

Priorities:

Extremely easy for non technical housemates to use

Clean, modern aesthetic

Mobile friendly first, but looks great on desktop

Minimal number of clicks for common actions

2. Tech stack

Use a simple modern web stack that Claude can generate fully:

Framework: Next.js (App Router) with TypeScript

Styling: Tailwind CSS, plus basic shadcn/ui components

Icons: lucide-react

Database: SQLite via Prisma (good enough for small shared app; can later switch to Postgres)

API: Next.js Route Handlers under app/api/\*

Auth: Lightweight “household code + name” system

No email login

Each house has a short code (for now, hardcode or simple text input)

Each housemate picks a name and color on first visit and is remembered via localStorage plus DB entry

3. Core concepts and data model

Use Prisma with the following schema as a starting point (Claude should adapt as needed):

// prisma/schema.prisma

datasource db {
provider = "sqlite"
url = "file:./dev.db"
}

generator client {
provider = "prisma-client-js"
}

model Household {
id String @id @default(cuid())
name String
code String @unique
members Member[]
createdAt DateTime @default(now())
}

model Member {
id String @id @default(cuid())
name String
colorHex String // accent color for UI chips
emoji String? // optional avatar emoji
householdId String
household Household @relation(fields: [householdId], references: [id])
statuses Status[]
events Event[]
groceries GroceryTrip[]
createdAt DateTime @default(now())
}

model Status {
id String @id @default(cuid())
memberId String
member Member @relation(fields: [memberId], references: [id])
label String // e.g. "Going out tonight", "Watching a movie"
category String // e.g. "going_out", "chilling", "studying", "away"
forTonight Boolean @default(false)
isActive Boolean @default(true)
createdAt DateTime @default(now())
expiresAt DateTime? // optional, for auto clearing
}

model Event {
id String @id @default(cuid())
memberId String
member Member @relation(fields: [memberId], references: [id])
title String // "Midterm exam", "Friends coming over"
type String // "exam", "guest", "trip", "other"
startsAt DateTime
endsAt DateTime?
location String?
details String?
isHousewide Boolean @default(false) // if everyone should know
createdAt DateTime @default(now())
}

model GroceryTrip {
id String @id @default(cuid())
memberId String
member Member @relation(fields: [memberId], references: [id])
storeName String
leavingAt DateTime?
note String? // "Going now", "Leaving in 30"
takingRequests Boolean @default(true)
isActive Boolean @default(true)
createdAt DateTime @default(now())
}

model GroceryRequest {
id String @id @default(cuid())
tripId String
trip GroceryTrip @relation(fields: [tripId], references: [id])
requestedBy String // free text name
item String
isDone Boolean @default(false)
createdAt DateTime @default(now())
}

4. App structure and routes

Use the Next.js App Router with the following pages:

/
Landing and quick join page.

Simple hero: app name, short tagline

Input for Household Code and Name

Button: “Enter house” creates or joins a household

/house/[code]
Main dashboard, showing:

A grid of cards, one per member

Each card shows:

Name, emoji, color banner

Current primary status

Quick actions buttons for that member (if this is the current user)

Small list of that member’s upcoming events

Grocery indicator if they have an active grocery trip

/house/[code]/events
More detailed event view, calendar style (simple list grouped by day is fine).

/house/[code]/settings
Household and profile settings:

Change your name, color, emoji

Rename household

Option to clear old events or statuses

Add API routes under:

app/api/households

app/api/members

app/api/statuses

app/api/events

app/api/groceries

CRUD operations should be simple and REST style.

5. UX flows
   5.1 Entering the app

User opens /

Sees:

App name, like “Houseboard”

Input: “Household code”

Secondary link: “Create a new household”

If they enter a new code, create new Household with default name (e.g. “Karina’s House”) and redirect to a quick setup:

Ask for their name

Pick a color pill and emoji

Save their member ID in localStorage, keyed by household code, so they stay recognised.

5.2 Setting a status

On the main dashboard /house/[code]:

For the current member card, show a prominent “Update status” button that opens a simple sheet or modal.

Present quick presets as large tappable pills:

Going out tonight

Watching a movie

Studying

Working late

Away for the weekend

Custom

If “Custom” is chosen, show a single text field and optional toggle “This is for tonight”.

When saving:

Mark existing active statuses for that user as inactive

Create new Status row

Optionally set expiresAt for some presets (for tonight, end of day)

5.3 Adding events

From the main dashboard:

Small “+ Event” button in the header and next to each member’s upcoming events list (for current user only).

Event form fields:

Title (required)

Type: select (Exam, Guest coming over, Travel, Other)

Date and time (start, optional end)

Switch: “Important for the whole house”

Optional location and notes

Once created, show:

Up to 3 upcoming events per member card

A “View all” link to /house/[code]/events

5.4 Grocery flow

On main dashboard:

At top or side, a compact “Groceries” section, showing:

Any active grocery trips (who, which store, leaving when)

For current user, button “I am going grocery shopping”

When user taps this button:

Ask for store name (text input with suggestions like “Loblaws”, “No Frills”)

Optional: “Leaving in X minutes” dropdown (Now, 15, 30, 60)

Toggle: “Taking requests”

For each active trip:

Show card with:

Member name and emoji

Store and leaving time

List of requests

Small text field for others to add items, labelled “Add a request”

The member who owns the trip can mark it “Done”, which sets isActive to false.

6. UI design

Goal: cozy but modern. Focus on fast scanning and tap targets that work well on phones.

6.1 General style

Background: subtle neutral (for example bg-slate-100)

Cards: rounded rounded-2xl, soft shadow, padding p-4 md:p-5

Accent color: pick a primary (for example indigo-500) plus unique accent per member from their colorHex

Typography:

Use system fonts via Tailwind default

Headings: text-xl md:text-2xl font-semibold

Body: text-sm md:text-base text-slate-700

Spacing:

Comfortable spacing between cards: gap-4 md:gap-6

Enough padding on mobile: px-3 py-4

6.2 Layout

On mobile:

Single column stacked layout

Top to bottom: header, quick actions, member cards

On desktop:

Responsive grid for member cards, for example grid-cols-2 up to grid-cols-3 depending on width

Persistent top bar:

Left: household name

Center: simple tabs (“Dashboard”, “Events”, “Settings”)

Right: current member’s emoji avatar button to open profile

6.3 Components to implement

Ask Claude to create these React components under components/:

HouseholdHeader

Props: household name, active tab, onTabChange, currentMember

Shows tabs and small avatar for current member

MemberCard

Props: member, currentStatus, upcomingEvents, activeGroceryTrip, isCurrentUser

Layout:

Top row: name, emoji, colored stripe

Middle: status pill with status label, subtle category icon

Bottom: upcoming events list and grocery indicator

If isCurrentUser:

Show big primary button “Update status”

Small buttons: “+ Event”, “Grocery trip”

StatusPill

Props: label, category, isActive

Styled with pill shape and category color

EventListCompact

Props: events (list)

Shows up to 3 events with time and small icon

GroceryTripCard

Used on both dashboard and grocery section

Props: trip, isOwner

Shows store, leaving time, and list of requests

For others: simple “Add item” input and button

For owner: “Mark done” button

CreateStatusModal, CreateEventModal, CreateGroceryTripModal

Implement using shadcn/ui Dialog

Use simple forms with minimal fields

7. State and data fetching

Use React Query (TanStack Query) or Next.js server components plus client hooks for data fetch. Preference: keep it simple:

For server data:

Use simple fetch from client components to call /api/\* routes.

For current member:

Store memberId in localStorage keyed by household code.

On dashboard load:

If no memberId found, prompt mini setup to create a Member record.

Outline:

// Example util
export function getLocalMemberId(code: string): string | null {
if (typeof window === "undefined") return null;
return window.localStorage.getItem(`house-member-${code}`);
}

export function setLocalMemberId(code: string, id: string) {
if (typeof window === "undefined") return;
window.localStorage.setItem(`house-member-${code}`, id);
}

8. API outline

Explain clearly what Claude should implement.

8.1 Households

POST /api/households

Body: { code: string, name?: string }

Creates a new household if not exists, or returns existing one

GET /api/households/[code]

Returns household and members

8.2 Members

POST /api/members

Body: { householdCode, name, colorHex, emoji }

Creates a new member in the household

PATCH /api/members/[id]

Update name, color, emoji

8.3 Statuses

POST /api/statuses

Body: { memberId, label, category, forTonight }

Deactivate previous active statuses for that member, create new one

GET /api/statuses?householdCode=...

Returns latest status per member

8.4 Events

POST /api/events

Body: { memberId, title, type, startsAt, endsAt?, location?, details?, isHousewide? }

GET /api/events?householdCode=...

Returns upcoming events for all members in that household

8.5 Groceries

POST /api/groceries

Body: { memberId, storeName, leavingAt?, note?, takingRequests? }

PATCH /api/groceries/[id]

Mark done or change note

POST /api/groceries/[id]/requests

Body: { requestedBy, item }

9. Aesthetic details for Claude to follow

Use subtle interactive micro animations:

Slight scale up on hover for cards on desktop

Button hover states using Tailwind hover:opacity-90

Use lucide icons:

Status categories: PartyPopper, Clapperboard, BookOpen, Plane, etc.

Events: Calendar, Bell, Users

Groceries: ShoppingCart, Milk, ListChecks

Status colors:

Going out: purple

Watching a movie: amber

Studying: blue

Away: rose

Custom: neutral

Example Tailwind for a member card wrapper:

<div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
  {/* header, status, etc */}
</div>

10. Implementation steps for Claude

When you run this in Claude Code, it should:

Scaffold a new Next.js TypeScript app with Tailwind configured.

Install dependencies:

@prisma/client and prisma

lucide-react

class-variance-authority, tailwind-merge (if needed for shadcn style utilities)

Set up Prisma with the provided schema and run prisma migrate dev.

Implement the API routes described above.

Build UI pages:

/ landing page

/house/[code]/page.tsx for main dashboard with server data fetching plus client components

/house/[code]/events/page.tsx for events listing

/house/[code]/settings/page.tsx for simple settings

Implement the component set listed in section 6.3 with focus on:

Mobile first layout

Very clear hierarchy of information

Easy, obvious buttons for non technical users

Handle basic error states:

Household not found

Network errors on form submission

Empty states (no events yet, no statuses yet)

11. Nice to have stretch goals

Claude can add these only if there is time:

Simple color picker for member accent color

Toggle on events for “Show on my status” so that a big exam automatically appears as part of status

A small “Today” strip at the top of the dashboard summarizing:

Number of people home vs out

Number of exams today

Any guests coming today

Dark mode toggle using CSS variables and Tailwind
