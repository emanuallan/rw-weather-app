import React, { useState, useMemo, useEffect } from "react";
import rawLocations from "../data/locations.json";
import Select from "react-select";
import { getForecastData } from "../utils/ForecastFunctions";
import WeatherCard from "../components/WeatherCard";

import "../styles.css";

function WeatherPage() {
	const MAX_CITY_COUNT = 5;
	const [selectedCities, setSelectedCities] = useState([]);
	const [selectedCity, setSelectedCity] = useState(null);
	const [selectedCityWeather, setSelectedCityWeather] = useState(null);
	const [lastUpdated, setLastUpdated] = useState("");
	const placeholders = new Array(MAX_CITY_COUNT - selectedCities.length).fill(null);
	const [error, setError] = useState("");

	/**
	 * gets previously selected cities from local storage
	 */
	useEffect(() => {
		const storedCities = JSON.parse(localStorage.getItem("storedCities"));
		if (storedCities && storedCities.length) setSelectedCities(storedCities);
	}, []);

	/**
	 * updates local storage when selectedCities updates
	 */
	useEffect(() => {
		localStorage.setItem("storedCities", JSON.stringify(selectedCities));
	}, [selectedCities]);

	/**
	 * function that handles the currently selected city
	 * updates weather in the process
	 * @param {Object} city
	 */
	const handleSelectCity = async (city) => {
		setError("");
		await updateCityWeather(city.latitude, city.longitude);
		setSelectedCity(city);
	};

	/**
	 * function that handles adding a city to the selectedCities array,
	 * it won't add a city if it has already been added, instead it will
	 * select it
	 * @param {Object} location
	 */
	const handleAddCity = async (location) => {
		setError("");
		const { city, latitude, longitude, state_abbr, state } = location;
		const id = latitude + longitude;
		const repeatCity = selectedCities.find((city) => city.id === id);
		if (!!repeatCity) {
			await handleSelectCity(repeatCity);
		} else {
			let cityObject = { id, name: city, state, state_abbr, latitude, longitude };
			await handleSelectCity(cityObject);
			setSelectedCities([...selectedCities, cityObject]);
		}
	};

	/**
	 * helper function that updates the selected city's weather forecast
	 * @param {Object} cityObject
	 * @returns cityObject with updated weather
	 */
	const updateCityWeather = async (latitude, longitude) => {
		try {
			const forecastData = await getForecastData(latitude, longitude);
			setSelectedCityWeather(forecastData.properties.periods[0]);
			const options = {
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "numeric",
				minute: "numeric",
				second: "numeric",
				timeZoneName: "short",
			};
			setLastUpdated(new Date().toLocaleDateString(undefined, options));
		} catch (e) {
			//selectedCities.length ? await handleSelectCity(selectedCities[0]) : handleResetSelectedCity();
			setError(
				"an error has occurred, most likely caused by a missing property in the weather response, or the api being down"
			);
		}
	};

	/**
	 * function that handles removing the selectedCity from the
	 * selectedCities array. Defaults back to first element, null if it doesn't exist.
	 * @param {string} cityId
	 */
	const handleRemoveCity = async (cityId) => {
		setError("");
		const spliceIndex = selectedCities.findIndex((city) => city.id === cityId);
		selectedCities.splice(spliceIndex, 1);
		setSelectedCities([...selectedCities]);

		if (cityId === selectedCity?.id) {
			selectedCities.length ? await handleSelectCity(selectedCities[0]) : handleResetSelectedCity();
		}
	};

	/**
	 * Function that resets the selected city and update time as well
	 */
	const handleResetSelectedCity = () => {
		setSelectedCity(null);
		setLastUpdated("");
	};

	/**
	 * simplifying that large data
	 *
	 * I know, in the real world we obviously wouldnt do this, I am just doing it so it doesnt freeze my app
	 * since the original data is so large. And since I am running out of time I will explain in detail what I would
	 * actually do here.
	 *
	 * This kind of data would ideally be hosted in some sort of backend (perhaps MySQL so we could easily run queries
	 * against the data) that we could then fetch from using some sort of mechanism.
	 * My preferred mechanism would be to have that fetch have the following
	 * params:
	 *
	 * cityName (string): so a users input (via a debounced input) can be used to filter down the overall list of locations
	 *
	 * offset (number) & limit (number): these 2 params work together so I can lazy load the data into the application
	 * i.e. an offset of 0 and a limit of 10 would get me the first 10 locations and then changing the offset to 10 would
	 * get me the next 10 locations after that
	 *
	 * order (string): order can just be defaulted to ABC order in this case
	 *
	 */
	const locationOptions = useMemo(() => {
		const locations = [];

		for (let i = 0; i < rawLocations.length; i++) {
			// Check if the current index is a multiple of 100
			if (i % 100 === 0 && rawLocations[i].city) {
				locations.push(rawLocations[i]);
			}
		}

		return locations.map((l) => ({ label: l.city, ...l }));
	}, []);

	return (
		<div className="weather-app">
			<h1 className="weather-app-title">Redwood Weather App</h1>

			<div>
				{/* <LazyLoadingSelect /> */}
				<Select
					className="city-select"
					value={null}
					onChange={handleAddCity}
					options={locationOptions}
					placeholder={
						selectedCities.length >= MAX_CITY_COUNT
							? `You have selected the max number of cities (${MAX_CITY_COUNT})`
							: "Select a city"
					}
					isSearchable
					isDisabled={selectedCities.length >= MAX_CITY_COUNT}
				/>

				{selectedCities.length > 0 && (
					<div className="row">
						{selectedCities.map((city) => (
							/**If these chips became more complex I would definitely put them into their own component file */
							<div
								className={`column ${city.id === selectedCity?.id ? "selected" : ""} city`}
								key={city.id}
								onClick={() => handleSelectCity(city)}
							>
								{city.name}, {city.state_abbr}
							</div>
						))}
						{placeholders.map((placeholder, index) => (
							<div className="column placeholder" key={`placeholder-${index}`} style={{}} />
						))}
					</div>
				)}
			</div>

			{selectedCity && selectedCityWeather && (
				<div className="weather-card-wrapper">
					<WeatherCard
						city={selectedCity.name}
						state={selectedCity.state}
						temperature={selectedCityWeather.temperature}
						temperatureUnit={selectedCityWeather.temperatureUnit}
						probabilityOfPrecipitation={selectedCityWeather.probabilityOfPrecipitation.value}
						detailedForecast={selectedCityWeather.detailedForecast}
						icon={selectedCityWeather.icon}
					/>
					<div className="weather-card-icons">
						<img
							alt="refresh icon"
							src={"/refresh-icon.svg"}
							className="refresh-icon"
							onClick={() => updateCityWeather(selectedCity.latitude, selectedCity.longitude)}
						/>
						<p>last updated: {lastUpdated}</p>
						<img
							alt="trash icon"
							src={"/trash-icon.svg"}
							className="trash-icon"
							onClick={() => handleRemoveCity(selectedCity.id)}
						/>
					</div>
				</div>
			)}
			{error && <p style={{ color: "red" }}>{error}</p>}
		</div>
	);
}

export default WeatherPage;
