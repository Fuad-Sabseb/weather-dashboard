// =============================================
// api.js
// Handles communication with the Open-Meteo APIs
// =============================================
console.log("api.js loaded");
"use strict";

/**
 * Fetch latitude and longitude for a city
 * @param {string} city
 * @returns {Promise<Object>}
 */
async function fetchCoordinates(city) {
    try {
        const geoUrl =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const response = await fetch(geoUrl);

        if (!response.ok) {
            throw new Error(`Geocoding API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            throw new Error(
                `City "${city}" not found. Please try a different city.`
            );
        }

        const result = data.results[0];

        return {
            lat: result.latitude,
            lon: result.longitude,
            name: result.name || city,
            country: result.country || ""
        };

    } catch (error) {
        console.error("Geocoding error:", error);
        throw error;
    }
}

/**
 * Fetch current weather and 5-day forecast
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<Object>}
 */
async function fetchWeather(lat, lon) {
    try {

        const url =
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=6`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }

        const data = await response.json();

        if (!data.current || !data.daily) {
            throw new Error("Invalid weather data received");
        }

        return data;

    } catch (error) {
        console.error("Weather API error:", error);
        throw error;
    }
}