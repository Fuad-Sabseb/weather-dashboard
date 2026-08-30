import { CurrentWeatherData, DailyForecastItem, GeoLocation } from "./types";

const WEATHER_CODE_DESCRIPTIONS: Readonly<Record<number, string>> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  48: "Depositing rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  71: "Slight snow fall",
  73: "Moderate snow fall",
  75: "Heavy snow fall",
  80: "Slight rain showers",
  81: "Moderate rain showers",
  82: "Violent rain showers",
  95: "Thunderstorm",
};

export function getWeatherCondition(code: number): string {
  return WEATHER_CODE_DESCRIPTIONS[code] ?? "Unknown conditions";
}

export function renderCurrentWeather(
  container: HTMLElement,
  location: GeoLocation,
  weather: CurrentWeatherData
): void {
  const condition = getWeatherCondition(weather.weather_code);
  const locationLabel = location.admin1
    ? `${location.name}, ${location.admin1}, ${location.country}`
    : `${location.name}, ${location.country}`;

  container.innerHTML = `
    <article class="current-card">
      <header>
        <h2>${locationLabel}</h2>
        <p class="condition">${condition}</p>
      </header>
      <div class="metrics-grid">
        <div class="metric">
          <span class="label">Temperature</span>
          <span class="value">${Math.round(weather.temperature_2m)}°C</span>
        </div>
        <div class="metric">
          <span class="label">Feels Like</span>
          <span class="value">${Math.round(weather.apparent_temperature)}°C</span>
        </div>
        <div class="metric">
          <span class="label">Humidity</span>
          <span class="value">${weather.relative_humidity_2m}%</span>
        </div>
        <div class="metric">
          <span class="label">Wind Speed</span>
          <span class="value">${weather.wind_speed_10m} km/h</span>
        </div>
      </div>
    </article>
  `;
}

export function renderForecast(container: HTMLElement, forecastItems: DailyForecastItem[]): void {
  const cardsHtml = forecastItems
    .map((item: DailyForecastItem): string => {
      const date = new Date(item.date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      const condition = getWeatherCondition(item.weatherCode);

      return `
        <div class="forecast-card">
          <h3>${date}</h3>
          <p class="forecast-condition">${condition}</p>
          <div class="temp-range">
            <span class="max">${Math.round(item.maxTemp)}°C</span> /
            <span class="min">${Math.round(item.minTemp)}°C</span>
          </div>
          <p class="precipitation">Rain: ${item.precipitationProb}%</p>
        </div>
      `;
    })
    .join("");

  container.innerHTML = `
    <section class="forecast-section">
      <h2>7-Day Forecast</h2>
      <div class="forecast-grid">
        ${cardsHtml}
      </div>
    </section>
  `;
}

export function renderStatus(container: HTMLElement, message: string, isError: boolean): void {
  container.innerHTML = `
    <div class="status-box ${isError ? "status-error" : "status-loading"}" role="alert">
      <p>${message}</p>
    </div>
  `;
}

export function clearContainer(container: HTMLElement): void {
  container.innerHTML = "";
}