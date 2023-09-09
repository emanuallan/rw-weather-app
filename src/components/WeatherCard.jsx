import React from "react";
import "../styles.css";
// ^ usually id have a seperate style sheet for each component but
// since this project is small I think one global one is fine

function WeatherCard({
	city,
	state,
	temperature,
	temperatureUnit,
	probabilityOfPrecipitation,
	icon,
	detailedForecast,
}) {
	return (
		<div className="weather-card">
			<div className="weather-card-text">
				<h2>
					{city}, {state}
				</h2>{" "}
				<div className="flex">
					<h3>
						{temperature} &deg;
						{temperatureUnit}
					</h3>
					{probabilityOfPrecipitation && (
						<h3 style={{ marginLeft: 24 }}>{probabilityOfPrecipitation}% chance of precipitation</h3>
					)}
				</div>
				<p>{detailedForecast}</p>
			</div>

			<img className="weather-icon" alt={"weather icon"} src={icon} />
		</div>
	);
}

export default WeatherCard;
