import { fetchWeather, searchCity } from "./api";
import { clearContainer, renderCurrentWeather, renderForecast, renderStatus } from "./render";
import { DailyForecastItem, FormState, GeoLocation, WeatherResponse } from "./types";

const formState: FormState = {
  cityQuery: "",
  isLoading: false,
  error: null,
};

function getRequiredElement<T extends HTMLElement>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Required DOM node not found for selector: "${selector}"`);
  }
  return element;
}

const weatherForm = getRequiredElement<HTMLFormElement>("#weather-form");
const cityInput = getRequiredElement<HTMLInputElement>("#city-input");
const statusContainer = getRequiredElement<HTMLDivElement>("#status-container");
const currentWeatherContainer = getRequiredElement<HTMLDivElement>("#current-weather");
const forecastContainer = getRequiredElement<HTMLDivElement>("#forecast-container");

function transformDailyForecast(daily: WeatherResponse["daily"]): DailyForecastItem[] {
  return daily.time.map((date: string, index: number): DailyForecastItem => ({
    date,
    weatherCode: daily.weather_code[index] ?? 0,
    maxTemp: daily.temperature_2m_max[index] ?? 0,
    minTemp: daily.temperature_2m_min[index] ?? 0,
    precipitationProb: daily.precipitation_probability_max[index] ?? 0,
  }));
}

async function handleWeatherSearch(cityName: string): Promise<void> {
  formState.cityQuery = cityName;
  formState.isLoading = true;
  formState.error = null;

  renderStatus(statusContainer, `Fetching weather data for "${cityName}"...`, false);
  clearContainer(currentWeatherContainer);
  clearContainer(forecastContainer);

  try {
    const location: GeoLocation = await searchCity(formState.cityQuery);
    const weatherData: WeatherResponse = await fetchWeather(location.latitude, location.longitude);

    clearContainer(statusContainer);
    renderCurrentWeather(currentWeatherContainer, location, weatherData.current);

    const forecastItems: DailyForecastItem[] = transformDailyForecast(weatherData.daily);
    renderForecast(forecastContainer, forecastItems);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
    formState.error = errorMessage;
    renderStatus(statusContainer, errorMessage, true);
  } finally {
    formState.isLoading = false;
  }
}

weatherForm.addEventListener("submit", (event: SubmitEvent): void => {
  event.preventDefault();
  const query = cityInput.value.trim();
  if (query.length > 0) {
    void handleWeatherSearch(query);
  }
});