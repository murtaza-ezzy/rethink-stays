# ReThink Stay - Global Accommodation Emissions Calculator

A lightweight, high-performance React application designed to calculate and offset the carbon footprint of overnight stays. It uses the latest standards-compliant algorithms to evaluate carbon emissions based on location-specific electricity grids, accommodation tiers, and Köppen-Geiger climate HVAC multipliers.

## Key Features
- **Multi-Country Support:** India, USA, Canada, with a Global average fallback.
- **Granular Grid Factors:** Includes 60+ state/province level carbon intensity metrics.
- **Climate HVAC Adjustment:** Multiplies HVAC heating/cooling footprint dynamically based on 12 Köppen-Geiger climate zones.
- **8 Accommodation Categories:** Ranging from hostels and homestays to luxury resorts and serviced apartments.
- **Comprehensive Breakdown:** Highlights emissions across Electricity, Water, Waste, Laundry, HVAC, Food Service, and Housekeeping.
- **Comparison Tooling:** View potential emissions savings compared against other regions/countries.

## Tech Stack
- **Framework:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS v4 + PostCSS
- **Icons:** Lucide React

## Getting Started

### Installation
Install the project dependencies:
```bash
npm install
```

### Run Locally (Dev)
Start the Vite development server:
```bash
npm run dev
```

### Production Build
Build the minified production assets:
```bash
npm run build
```
