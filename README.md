# Weather Dashboard (TypeScript Edition)

A modern, responsive weather dashboard rewritten from the ground up in strict TypeScript. It queries the Open-Meteo Geocoding and Weather Forecast APIs to deliver real-time weather metrics and a 7-day daily forecast for any city worldwide.

---

## Features

- **Strict Type Safety**: Fully typed with TypeScript in strict mode (`strict: true`, `noImplicitAny: true`), featuring explicit interfaces for all API payloads and application state.
- **Zero `any`**: No loose typing or `any` keywords anywhere in the codebase.
- **Location Search**: Automatic latitude/longitude resolution using Open-Meteo Geocoding API.
- **Current Weather Conditions**: Displays real-time temperature, apparent ("feels like") temperature, relative humidity, wind speed, and WMO weather interpretations.
- **7-Day Forecast**: Visual daily cards showing high/low temperature ranges, weather descriptions, and maximum precipitation probabilities.
- **Modular Architecture**: Clean separation between API client logic, DOM rendering engines, and state management.

---

## Project Structure

```text
weather-dashboard/
├── index.html          # Main HTML entry point
├── styles.css          # Styling & layout definitions
├── tsconfig.json       # Strict TypeScript compiler options
├── package.json        # Project metadata & scripts
├── src/                # TypeScript source files
│   ├── types.ts        # Interfaces for Geocoding, Forecast, and Form State
│   ├── api.ts          # Strongly-typed fetch functions for Open-Meteo
│   ├── render.ts       # DOM injection and formatting utilities
│   └── app.ts          # Application orchestrator and event handlers
└── dist/               # Compiled JavaScript output (generated)