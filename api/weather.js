import axios from "axios";
import { API_KEY } from '@env';

const forecastEndpoint = params => `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${params.cityName}&days=${params.days}&lang=${params.lang}`;
const locationsEndpoint = params => `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${params.cityName}&lang=${params.lang}`;

const apiCall = async (endpoint) => {
    const options = {
        method: 'GET',
        url: endpoint,
    };

    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.log('error: ', error);
        return null;
    }
}

export const fetchWeatherForecast = params => {
    let forecastUrl = forecastEndpoint(params);
    return apiCall(forecastUrl);
}

export const fetchLocations = params => {
    let locationsUrl = locationsEndpoint(params);
    return apiCall(locationsUrl);
}