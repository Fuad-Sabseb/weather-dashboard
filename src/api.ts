import { GeocodingResponse, GeoLocation, WeatherResponse } from "./types";

const GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";
const WEATHER_BASE_URL = "https://api.open-meteo.com/v1/forecast";

export async function searchCity(city: string): Promise<GeoLocation> {
  const params = new URLSearchParams({
    name: city.trim(),
    count: "1",
    language: "en",
    format: "json",
  });

  const response: Response = await fetch(`${GEOCODING_BASE_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch location coordinates (Status: ${response.status})`);
  }

  const data: GeocodingResponse = await response.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`No location results found for "${city}"`);
  }

  return data.results[0]!;
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherResponse> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "auto",
  });

  const response: Response = await fetch(`${WEATHER_BASE_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch weather forecast (Status: ${response.status})`);
  }

  const data: WeatherResponse = await response.json();
  return data;
}