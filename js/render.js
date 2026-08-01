// =============================================
// render.js
// Handles rendering weather data and UI states
// =============================================

"use strict";

/**
 * Returns weather description and Font Awesome icon
 */
function getWeatherInfo(code) {
    const map = {
        0: { desc: "Clear sky", icon: "fa-sun" },
        1: { desc: "Mainly clear", icon: "fa-cloud-sun" },
        2: { desc: "Partly cloudy", icon: "fa-cloud-sun" },
        3: { desc: "Overcast", icon: "fa-cloud" },
        45: { desc: "Fog", icon: "fa-smog" },
        48: { desc: "Depositing rime fog", icon: "fa-smog" },
        51: { desc: "Light drizzle", icon: "fa-cloud-rain" },
        53: { desc: "Moderate drizzle", icon: "fa-cloud-rain" },
        55: { desc: "Dense drizzle", icon: "fa-cloud-rain" },
        61: { desc: "Slight rain", icon: "fa-cloud-rain" },
        63: { desc: "Moderate rain", icon: "fa-cloud-showers-heavy" },
        65: { desc: "Heavy rain", icon: "fa-cloud-showers-heavy" },
        71: { desc: "Slight snow", icon: "fa-snowflake" },
        73: { desc: "Moderate snow", icon: "fa-snowflake" },
        75: { desc: "Heavy snow", icon: "fa-snowflake" },
        80: { desc: "Rain showers", icon: "fa-cloud-rain" },
        81: { desc: "Moderate showers", icon: "fa-cloud-showers-heavy" },
        82: { desc: "Violent showers", icon: "fa-cloud-showers-heavy" },
        95: { desc: "Thunderstorm", icon: "fa-cloud-bolt" },
        96: { desc: "Thunderstorm with hail", icon: "fa-cloud-bolt" },
        99: { desc: "Thunderstorm with heavy hail", icon: "fa-cloud-bolt" }
    };

    return map[code] || {
        desc: "Unknown",
        icon: "fa-question"
    };
}

/**
 * Renders current weather and forecast
 */
function renderWeather(data, cityName, country) {

    const current = data.current;
    const daily = data.daily;
    const today = new Date();

    // City Name
    const cityEl = document.getElementById("cityName");

    if (cityEl) {
        cityEl.textContent =
            `${cityName}${country ? ", " + country : ""}`;
    }

    // Current Date
    const dateEl = document.getElementById("currentDate");

    if (dateEl) {
        dateEl.textContent = today.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric"
        });
    }

    // Temperature
    const tempEl = document.getElementById("currentTemp");

    if (tempEl) {
        tempEl.textContent =
            Math.round(current.temperature_2m) + "°C";
    }

    // Weather Description
    const weatherInfo =
        getWeatherInfo(current.weather_code);

    const descEl =
        document.getElementById("weatherDescription");

    if (descEl) {
        descEl.textContent = weatherInfo.desc;
    }

    // Humidity
    const humidityEl =
        document.getElementById("humidity");

    if (humidityEl) {
        humidityEl.textContent =
            current.relative_humidity_2m ?? "--";
    }

    // Wind Speed
    const windEl =
        document.getElementById("windSpeed");

    if (windEl) {
        windEl.textContent =
            current.wind_speed_10m ?? "--";
    }

    // Forecast
    const forecastGrid =
        document.getElementById("forecastGrid");

    if (!forecastGrid) return;

    forecastGrid.innerHTML = "";

    // Skip today and show next five days
    for (let i = 1; i <= 5; i++) {

        if (i >= daily.time.length) break;

        const date = new Date(daily.time[i]);

        const dayName =
            date.toLocaleDateString("en-US", {
                weekday: "short"
            });

        const max =
            Math.round(daily.temperature_2m_max[i]);

        const min =
            Math.round(daily.temperature_2m_min[i]);

        const info =
            getWeatherInfo(daily.weather_code[i]);

        const card =
            document.createElement("div");

        card.className =
            "bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10 hover:bg-white/20 transition";

        card.innerHTML = `
            <p class="text-sm font-medium text-white/70">
                ${dayName}
            </p>

            <i class="fas ${info.icon} text-2xl text-amber-300 my-1"></i>

            <p class="text-sm font-semibold">
                ${max}°
            </p>

            <p class="text-xs text-white/50">
                ${min}°
            </p>

            <p class="text-[10px] text-white/40 truncate">
                ${info.desc}
            </p>
        `;

        forecastGrid.appendChild(card);
    }
}

/**
 * Show idle state
 */
function showIdle() {

    document
        .getElementById("idleState")
        ?.classList.remove("hidden");

    document
        .getElementById("loadingState")
        ?.classList.add("hidden");

    document
        .getElementById("errorState")
        ?.classList.add("hidden");

    document
        .getElementById("weatherDisplay")
        ?.classList.add("hidden");
}

/**
 * Show loading state
 */
function showLoading() {

    document
        .getElementById("idleState")
        ?.classList.add("hidden");

    document
        .getElementById("loadingState")
        ?.classList.remove("hidden");

    document
        .getElementById("errorState")
        ?.classList.add("hidden");

    document
        .getElementById("weatherDisplay")
        ?.classList.add("hidden");
}

/**
 * Show error state
 */
function showError(message) {

    document
        .getElementById("idleState")
        ?.classList.add("hidden");

    document
        .getElementById("loadingState")
        ?.classList.add("hidden");

    document
        .getElementById("errorState")
        ?.classList.remove("hidden");

    document
        .getElementById("weatherDisplay")
        ?.classList.add("hidden");

    const errorMessage =
        document.getElementById("errorMessage");

    if (errorMessage) {
        errorMessage.textContent =
            message || "Failed to load weather.";
    }
}

/**
 * Show weather data
 */
function showWeather() {

    document
        .getElementById("idleState")
        ?.classList.add("hidden");

    document
        .getElementById("loadingState")
        ?.classList.add("hidden");

    document
        .getElementById("errorState")
        ?.classList.add("hidden");

    document
        .getElementById("weatherDisplay")
        ?.classList.remove("hidden");
}