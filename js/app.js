// =============================================
// app.js
// Main Application Controller
// =============================================
console.log("app.js loaded");
"use strict";

// Show idle state when the application loads
showIdle();

/**
 * Handles weather search
 * @param {string} city
 */
async function handleSearch(city) {

    // Validate input
    if (!city || city.trim() === "") {
        showError("Please enter a city name.");
        return;
    }

    const trimmedCity = city.trim();

    console.log(`Searching for: "${trimmedCity}"`);

    showLoading();

    try {

        // Get city coordinates
        console.log("Fetching coordinates...");

        const coords = await fetchCoordinates(trimmedCity);

        console.log("Coordinates found:", coords);

        // Fetch weather data
        console.log("Fetching weather data...");

        const weatherData = await fetchWeather(
            coords.lat,
            coords.lon
        );

        console.log("Weather data received");

        // Render weather
        renderWeather(
            weatherData,
            coords.name,
            coords.country
        );

        showWeather();

        console.log(`Weather displayed for ${coords.name}`);

    } catch (error) {

        console.error("Search error:", error);

        showError(
            error.message ||
            "Could not fetch weather data. Please try again."
        );
    }
}

// =============================================
// DOM Elements
// =============================================

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

// =============================================
// Search Function
// =============================================

function performSearch() {

    const city = searchInput.value.trim();

    if (city) {

        handleSearch(city);

    } else {

        showError("Please enter a city name");

    }
}

// =============================================
// Event Listeners
// =============================================

// Search button
if (searchBtn) {

    searchBtn.addEventListener("click", performSearch);

    console.log("Search button connected");

} else {

    console.error("Search button not found");

}

// Enter key
if (searchInput) {

    searchInput.addEventListener("keydown", function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            performSearch();

        }

    });

    console.log("Search input connected");

} else {

    console.error("Search input not found");

}

// =============================================
// Application Ready
// =============================================

console.log(
    'Weather Dashboard ready! Try searching for a city like "London" or "Tokyo".'
);