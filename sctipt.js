const city = document.getElementById("city");
const country = document.getElementById("country");

const location_label = document.getElementById("location_label");
const location_url = "https://get.geojs.io/v1/ip/geo.json";

let location_obj, location_forecast_today, location_forecast_weekly;
showCurrentLocationWeather();

let allLabels = document.getElementsByClassName("label");
Array.from(allLabels).forEach((label)=>{
    tabLoad(label.innerHTML);
});


async function tabLoad(labelName) {
  locUrl = getLocationUrlByCity(labelName);
  let response = await fetch(locUrl);
  if (response.ok) {
    locationData = await response.json();

    location_obj = getLocationByName(locationData.results[0]);
    console.log(location_obj);
    showWeeklyWeather(location_obj, labelName);
  }
}
function showCurrentLocationWeather() {
  fetch(location_url)
    .then((response) => {
      return response.json();
    })
    .then((locationData) => {
      location_obj = getLocation(locationData);
      showLocation(location_obj);
      showTodayWeather(location_obj);
      show_current_WeeklyWeather(location_obj);
    });
}
function show_current_WeeklyWeather(location_obj) {
  fetch(getUrlByLocationWeekly(location_obj))
    .then((response) => {
      return response.json();
    })
    .then((currentLocation_Weekly_forecast_data) => {
      location_forecast_weekly = currentLocation_Weekly_forecast_data;
      //console.log(location_forecast_weekly);
      let currentTabs_Objects = document.getElementsByClassName("day_current");
      //console.log(currentTabs_Objects);
      showForecast_weekly(
        currentTabs_Objects,
        location_forecast_weekly,
        "day_current"
      );
    });
}
function showWeeklyWeather(location_obj, labelName) {
  fetch(getUrlByLocationWeekly(location_obj))
    .then((response) => {
      return response.json();
    })
    .then((currentLocation_Weekly_forecast_data) => {
      location_forecast_weekly = currentLocation_Weekly_forecast_data;
      console.log(location_forecast_weekly);
      let className = `day_${labelName}`;
      let currentTabs_Objects = document.getElementsByClassName(className);
      console.log(currentTabs_Objects);
      showForecast_weekly(
        currentTabs_Objects,
        location_forecast_weekly,
        className
      );
    });
}

function showForecast_weekly(
  Tabs_Objects,
  location_forecast_weekly,
  class_name
) {
  for (let i = 0; i < Tabs_Objects.length; i++) {
    const element = Tabs_Objects[i];
    const forecast_weekly = location_forecast_weekly.daily;
    element.innerHTML = "";
    let tempString = "";
    let src = getWeatherImgName(forecast_weekly.weathercode[i]);
    tempString +=
      `<img style="margin-bottom: 10px;" id=" ${class_name}_img_${i}" src="${src}" alt="current_${i}" class="weekly_img">` +
      `<div style="font-size: 18px ;" id="${class_name}_today_date${i}">${new Date(
        forecast_weekly.time[i]
      ).getDate()} ${
        month[new Date(forecast_weekly.time[i]).getMonth()]
      }</div>` +
      `<div style="font-size: 17px;" id="${class_name}_day${i}">${
        dayOfWeek[new Date(forecast_weekly.time[i]).getDay()]
      }</div>` +
      `<div id="${class_name}_probability${i}">PP ${forecast_weekly.precipitation_probability_max[i]}%</div>` +
      `<div id="${class_name}_temp${i}">t ${Math.round(
        +forecast_weekly.temperature_2m_min[i]
      )} - ${Math.round(+forecast_weekly.temperature_2m_max[i])}&#176C</div>` +
      `<div id="${class_name}_windspeed${i}">WS ${forecast_weekly.windspeed_10m_max[i]} km/h</div>`;
    element.innerHTML = tempString;
  }
}

function showTodayWeather(location_obj) {
  fetch(getUrlTodayByLocation(location_obj))
    .then((response) => {
      return response.json();
    })
    .then((location_forecast_todayData) => {
      location_forecast_today = location_forecast_todayData;
      showForecastToday(location_forecast_today);
    });
}
function getLocation(locationData) {
  return {
    city: locationData.city,
    country: locationData.country,
    longitude: locationData.longitude,
    latitude: locationData.latitude,
    timezone: locationData.timezone,
  };
}
function getLocationByName(locationData) {
  return {
    city: locationData.name,
    country: locationData.country,
    longitude: locationData.longitude,
    latitude: locationData.latitude,
    timezone: locationData.timezone,
  };
}

function showLocation(location_obj) {
  city.innerHTML = location_obj.city;
  country.innerHTML = location_obj.country;
  location_label.innerHTML = location_obj.city;
}
function showForecastToday(location_forecast_today) {
  const today_img = document.getElementById("today_img");
  let today_forecast = location_forecast_today.daily;
  today_img.src = getWeatherImgName(+today_forecast.weathercode);
  let elements = "";
  let today_date = new Date(today_forecast.time);
  const getAverage = (numbers) =>
    numbers.reduce((acc, number) => acc + number, 0) / numbers.length;
  let today_pressure = Math.round(
    getAverage(location_forecast_today.hourly.surface_pressure)
  );

  elements +=
    `<div style="font-size: 30px ;" id="today_date">${today_date.getDate()} ${
      month[today_date.getMonth()]
    }</div>` +
    `<div style="font-size: 30px;" id="today_day">${
      dayOfWeek[today_date.getDay()]
    }</div>` +
    `<div id="today_probability">PP ${today_forecast.precipitation_probability_max} %</div>` +
    `<div id="today_temp">t ${Math.round(
      +today_forecast.temperature_2m_min
    )} - ${Math.round(+today_forecast.temperature_2m_max)}&#176C</div>` +
    `<div id="today_pressure">Pr ${today_pressure} hPa</div>` +
    `<div id="today_windspeed">WS ${today_forecast.windspeed_10m_max} km/h</div>`;

  document.getElementById("forecast_today").innerHTML = elements;
}

function getUrlTodayByLocation(location_obj) {
  return `https://api.open-meteo.com/v1/forecast?latitude=${location_obj.latitude}&longitude=${location_obj.longitude}&hourly=surface_pressure&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max&timezone=${location_obj.timezone}&forecast_days=1`;
}
function getUrlByLocationWeekly(location_obj) {
  return `https://api.open-meteo.com/v1/forecast?latitude=${location_obj.latitude}&longitude=${location_obj.longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,windspeed_10m_max&timezone=${location_obj.timezone}`;
}
function getLocationUrlByCity(city) {
  return `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;
}

function getWeatherImgName(weather_code) {
  switch (weather_code) {
    case 0:
      return "./images/sunny.png";
    case 1:
    case 2:
    case 3:
      return "./images/sunwithclouds.png";
    case 45:
    case 48:
      return "./images/clouds.png";
    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return "./images/smallrain.png";
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
      return "./images/rain.png";
    case 71:
    case 73:
    case 75:
    case 77:
    case 85:
    case 86:
      return "./images/snow.png";
    case 80:
    case 81:
    case 82:
    case 95:
    case 96:
    case 99:
      return "./images/groza.png";
  }
}

const dayOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const month = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
