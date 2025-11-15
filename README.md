# Houseboard - Housemate Management App

A simple, beautiful household web app for coordinating with housemates. Share statuses, events, and grocery shopping trips in real-time.

## Features

- **Status Updates**: Set your current status (going out, studying, watching movies, etc.)
- **Event Sharing**: Share important upcoming events (exams, guests, trips)
- **Grocery Coordination**: Coordinate grocery shopping trips and take requests from housemates
- **Mobile-First Design**: Beautiful, responsive interface that works great on all devices
- **Simple Authentication**: No email required - just a household code and your name

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npx prisma migrate dev
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

### Creating/Joining a Household

1. Visit the home page
2. Enter a household code (create a new one or use an existing one)
3. Click "Enter House"
4. Set up your profile (name, color, emoji)

### Setting Your Status

1. On the dashboard, click "Update Status" on your card
2. Choose from preset statuses or create a custom one
3. Your status will be visible to all housemates

### Adding Events

1. Click the calendar icon on your member card
2. Fill in event details (title, type, date/time, location)
3. Toggle "Important for the whole house" if everyone should know
4. Events appear on your card and the dedicated Events page

### Grocery Shopping

1. Click the shopping cart icon on your member card
2. Enter store name and when you're leaving
3. Toggle "Taking requests" to let others add items
4. Other housemates can add items to your trip
5. Mark the trip as done when finished

### Sharing Your Household Code

Go to Settings and share your household code with housemates so they can join!

## Tech Stack

- **Framework**: Next.js 16 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Project Structure

```
house_app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── house/[code]/      # Household pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Landing page
├── components/            # React components
├── lib/                  # Utility functions
├── prisma/               # Database schema and migrations
└── public/               # Static assets
```

## Database Schema

- **Household**: Household information and code
- **Member**: Individual housemates
- **Status**: Current status for each member
- **Event**: Upcoming events
- **GroceryTrip**: Active grocery shopping trips
- **GroceryRequest**: Items requested for grocery trips

## Development

### Database Commands

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Build for Production

```bash
npm run build
npm start
```

## License

MIT
