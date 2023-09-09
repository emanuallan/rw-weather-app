import axios from "axios";

export const getForecastData = async (latitude, longitude) => {
	try {
		const govEndpoint = `https://api.weather.gov/points/${latitude},${longitude}`;
		const govResponse = await axios.get(govEndpoint);
		const forecastEndpoint = govResponse.data.properties.forecast;
		const forecastResponse = await axios.get(forecastEndpoint);
		return forecastResponse.data;
	} catch (e) {
		console.log(e);
	}
};
