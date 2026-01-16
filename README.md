# Strat-O-Matic Player Evaluator

A web application for evaluating Strat-O-Matic and Baseball 365 players using custom fantasy point scoring. Built with React, TypeScript, and Tailwind CSS.

## Overview

This tool helps you evaluate baseball players by calculating fantasy points based on customizable scoring weights. Perfect for finding underpriced players and building optimal rosters.

## Features

### Scoring Configuration
- Define custom fantasy point weights for hitter stats (1B, 2B, 3B, HR, BB, HBP, SB, CS, outs)
- Define custom fantasy point weights for pitcher stats (IP, K, BB, H, HR, ER)
- Reset to default weights at any time
- Settings persist in browser localStorage

### Hitter Management
- Add, edit, and delete hitter season statistics
- View calculated metrics:
  - Total fantasy points
  - Points per 600 PA (normalized for playing time)
  - Points per game
  - Points per dollar (value analysis)
- Sortable columns for easy comparison
- Search/filter by name, team, or season

### Pitcher Management
- Add, edit, and delete pitcher season statistics
- View calculated metrics:
  - Total fantasy points
  - Points per inning pitched
  - Points per start
  - Points per dollar (value analysis)
- Sortable columns for easy comparison
- Search/filter by name, team, or season

### Data Persistence
- All data stored in browser localStorage
- No backend required
- Data persists across sessions

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Navigate to the project directory:

```bash
cd Strat-O-Matic
```

2. Install dependencies:

```bash
npm install
```

### Running the Application

Start the development server:

```bash
npm run dev
```

The application will open automatically in your browser at `http://localhost:3000`

### Building for Production

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Usage Guide

### 1. Configure Scoring Weights

Navigate to **Settings** to customize how stats are valued:

**Default Hitter Weights:**
- Single (1B): 2 points
- Double (2B): 3 points
- Triple (3B): 5 points
- Home Run (HR): 6 points
- Walk (BB): 1 point
- Hit By Pitch (HBP): 1 point
- Stolen Base (SB): 2 points
- Caught Stealing (CS): -1 point
- Out Penalty: -0.3 points per out

**Default Pitcher Weights:**
- Per Inning Pitched: 3 points
- Strikeout (K): 1 point
- Walk Allowed (BB): -1 point
- Hit Allowed (H): -1 point
- Home Run Allowed (HR): -3 points
- Earned Run (ER): -2 points

### 2. Add Players

**For Hitters:**
1. Go to the **Hitters** page
2. Click **Add Hitter**
3. Enter player stats (name, season, team, salary, AB, H, 2B, 3B, HR, BB, HBP, SB, CS, PA, Games)
4. Click **Add Hitter** to save

**For Pitchers:**
1. Go to the **Pitchers** page
2. Click **Add Pitcher**
3. Enter player stats (name, season, team, salary, IP, K, BB, H, HR, ER, Games, GS)
4. Click **Add Pitcher** to save

### 3. Analyze Players

- **Sort** by any column to find leaders in specific categories
- **Search** to filter by name, team, or season
- Compare **Points per Dollar** to identify underpriced players
- Use **Points per 600 PA** (hitters) or **Points per IP** (pitchers) to normalize for playing time

### 4. Edit or Delete Players

- Click the **Edit** icon to modify a player's stats
- Click the **Delete** icon to remove a player (confirmation required)

## Project Structure

```
Strat-O-Matic/
├── src/
│   ├── components/          # Reusable React components
│   │   ├── HitterForm.tsx
│   │   ├── HittersTable.tsx
│   │   ├── PitcherForm.tsx
│   │   └── PitchersTable.tsx
│   ├── pages/               # Page components
│   │   ├── HomePage.tsx
│   │   ├── SettingsPage.tsx
│   │   ├── HittersPage.tsx
│   │   └── PitchersPage.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useHitters.ts
│   │   ├── usePitchers.ts
│   │   └── useScoringWeights.ts
│   ├── utils/               # Utility functions
│   │   ├── calculations.ts
│   │   └── storage.ts
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx              # Main application with routing
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles with Tailwind
├── public/                  # Static assets
├── index.html               # HTML template
├── package.json             # Project dependencies
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── tailwind.config.js       # Tailwind CSS configuration
```

## Technology Stack

- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **React Router** - Client-side routing
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library

## Calculations

### Hitter Fantasy Points

```
Singles = H - 2B - 3B - HR
Outs = AB - H

Total Fantasy Points = 
  (Singles × Single Weight) +
  (2B × Double Weight) +
  (3B × Triple Weight) +
  (HR × Home Run Weight) +
  (BB × Walk Weight) +
  (HBP × Hit By Pitch Weight) +
  (SB × Stolen Base Weight) +
  (CS × Caught Stealing Weight) +
  (Outs × Out Penalty Weight)

Points per 600 PA = (Total Fantasy Points / PA) × 600
Points per Game = Total Fantasy Points / Games
Points per Dollar = Total Fantasy Points / Salary
```

### Pitcher Fantasy Points

```
Total Fantasy Points = 
  (IP × Per Inning Pitched Weight) +
  (K × Strikeout Weight) +
  (BB × Walk Allowed Weight) +
  (H × Hit Allowed Weight) +
  (HR × Home Run Allowed Weight) +
  (ER × Earned Run Weight)

Points per IP = Total Fantasy Points / IP
Points per Start = Total Fantasy Points / GS
Points per Dollar = Total Fantasy Points / Salary
```

## Future Enhancements

- CSV import/export for bulk player data
- Historical comparison charts
- Team roster building with salary cap
- Player projections
- Multi-season analysis

## License

This project is private and not licensed for public use.
