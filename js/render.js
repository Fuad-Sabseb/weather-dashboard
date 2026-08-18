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
        0: { desc: "Clear", icon: "fa-sun" },
        1: { desc: "Mostly clear", icon: "fa-cloud-sun" },
        2: { desc: "Partly cloudy", icon: "fa-cloud-sun" },
        3: { desc: "Cloudy", icon: "fa-cloud" },
        45: { desc: "Foggy", icon: "fa-smog" },
        48: { desc: "Rime fog", icon: "fa-smog" },
        51: { desc: "Light drizzle", icon: "fa-cloud-rain" },
        53: { desc: "Drizzle", icon: "fa-cloud-rain" },
        55: { desc: "Heavy drizzle", icon: "fa-cloud-rain" },
        61: { desc: "Light rain", icon: "fa-cloud-rain" },
        63: { desc: "Rain", icon: "fa-cloud-showers-heavy" },
        65: { desc: "Heavy rain", icon: "fa-cloud-showers-heavy" },
        71: { desc: "Light snow", icon: "fa-snowflake" },
        73: { desc: "Snow", icon: "fa-snowflake" },
        75: { desc: "Heavy snow", icon: "fa-snowflake" },
        80: { desc: "Showers", icon: "fa-cloud-rain" },
        81: { desc: "Heavy showers", icon: "fa-cloud-showers-heavy" },
        82: { desc: "Extreme showers", icon: "fa-cloud-showers-heavy" },
        95: { desc: "Storm", icon: "fa-cloud-bolt" },
        96: { desc: "Storm with hail", icon: "fa-cloud-bolt" },
        99: { desc: "Severe storm", icon: "fa-cloud-bolt" }
    };

    return map[code] || {
        desc: "N/A",
        icon: "fa-circle-question"
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
            country ? `${cityName}, ${country}` : cityName;
    }

    // Current Date
    const dateEl = document.getElementById("currentDate");

    if (dateEl) {
        dateEl.textContent = today.toLocaleDateString(undefined, {
            weekday: "long",
            month: "short",
            day: "numeric"
        });
    }

    // Temperature (now supports Fahrenheit toggle)
    const tempEl = document.getElementById("currentTemp");
    const useFahrenheit = localStorage.getItem("unit") === "F";

    if (tempEl) {
        const tempC = current.temperature_2m;
        const displayTemp = useFahrenheit
            ? Math.round((tempC * 9) / 5 + 32)
            : Math.round(tempC);

        tempEl.textContent =
            `${displayTemp}°${useFahrenheit ? "F" : "C"}`;
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
            `${current.relative_humidity_2m ?? "--"}%`;
    }

    // Wind Speed
    const windEl =
        document.getElementById("windSpeed");

    if (windEl) {
        windEl.textContent =
            `${current.wind_speed_10m ?? "--"} km/h`;
    }

    // Forecast
    const forecastGrid =
        document.getElementById("forecastGrid");

    if (!forecastGrid) return;

    forecastGrid.innerHTML = "";

    // Skip today and show next seven days
    for (let i = 1; i <= 7; i++) {

        if (i >= daily.time.length) break;

        const date = new Date(daily.time[i]);

        const dayName =
            date.toLocaleDateString(undefined, {
                weekday: "long"
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
            "bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20 hover:bg-white/30 transition cursor-pointer";

        card.innerHTML = `
            <p class="text-sm font-semibold text-white/80">
                ${dayName}
            </p>

            <i class="fas ${info.icon} text-3xl text-yellow-300 my-2"></i>

            <p class="text-base font-bold">
                ${max}° / ${min}°
            </p>

            <p class="text-xs text-white/50 truncate">
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
            message || "Something went wrong. Please try again.";
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
