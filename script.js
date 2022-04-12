// Query Selectors
let selectVal = document.querySelector(".container select")
let form = document.querySelector(".container form")
let list = document.querySelector(".card--container")
let listChild = document.querySelector(".child--container")
let buttonSelector = document.getElementById('form-submit')
const msg = document.querySelector(".msg");

// Weather API key
const API_KEY = 'c73aa228bfba692462f96e89080aa39a'
let BASE_URL = 'http://api.openweathermap.org/data/2.5/'

// Variable Intilization
let cityName = null
let cityId = null
let zipCode = null
let dayTime = null

// celsius to fahrenheit
function cToF(celsius) 
{
	var cTemp = celsius;
	var cToFahr = cTemp * 9 / 5 + 32;
	var message = cToFahr;
	return message
}

// Fetch data from Api and render it
async function fetchDataFromApi() {

	// URL based on selected Value
	switch(selectVal.value) {

		case 'city-id' : 
			cityId = form.querySelector('[name="search-term"]').value
			BASE_URL = `${BASE_URL}forecast?id=${cityId}&units=metric&appid=${API_KEY}`
			break
		case 'city-zip':
			zipCode = form.querySelector('[name="search-term"]').value
			BASE_URL = `${BASE_URL}forecast?id=${zipCode}&units=metric&appid=${API_KEY}`
			break
		default:
			cityName = form.querySelector('[name="search-term"]').value.toLowerCase()
			BASE_URL = `${BASE_URL}forecast?q=${cityName}&units=metric&appid=${API_KEY}`
			break
	}

	// API request
	await fetch(BASE_URL)
	  .then(response => response.json())
	   .then(data => {

	   		// Remove error msg If exist
	   		msg.textContent = ''
	   		list.innerHTML = ''
			listChild.innerHTML = ''

	   		// Object destructing
	   		const { country, name } = data.city;
	   		const { main, sys, weather, dt } = data.list[0];

	   		// Get Current Day
	   		let dayname = new Date(dt * 1000).toLocaleDateString("en", {weekday: "long",});

	   		// Get Icon from S3 storage
	   		const icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${weather[0]["icon"]}.svg`;

	   		// Create li element for main card
		   	const li = document.createElement("li")
		   	li.classList.add("city--data")

		   	const markup = `<h2 class="city-name" data-name="${name},${country}">
				          		<span>${name}</span>
				          		<sup>${country}</sup>
				        	</h2>
				        	<h3>${dayname}</h3>
				        	<div class="city-temp">${Math.round(main.temp)}<sup>°C</sup> | ${cToF(Math.round(main.temp))}<sup>°F</sup></div>
				        	<figure>
				          		<img class="city-icon" src="${icon}" alt="${weather[0]["description"]}">
				          		<figcaption>${weather[0]["description"]}</figcaption>
					       	</figure>`
	   		
	   		// Render current day data
			li.innerHTML = markup;
	      	list.appendChild(li);


	      	// loop through to get data for next days
	   		for (let i=1; i < data.list.length; i++) {

	   			// Object destucting
	   			const { main, sys, weather, dt, dt_txt } = data.list[i];
	   			updatedTime = dt_txt.split(' ')

	   			if (dayTime === updatedTime[0]) {
	   				continue;
	   			} else if ( dayTime === null) {
	   				dayTime = updatedTime[0]
	   			}
	   			else {
	   				dayTime = updatedTime[0]

	   				// Get days
		   			var days = new Date(dt * 1000).toLocaleDateString("en-US", {weekday: "long",});

		   			// Get Icons from s3 stroge
		   			const icon = `https://s3-us-west-2.amazonaws.com/s.cdpn.io/162656/${weather[0]["icon"]}.svg`;	

		   			// Create next days elements
			      	const listItem =  document.createElement("li")
			      	listItem.classList.add("child--item")

		      		const childMarkup = `<h3>${days}</h3>
		      							<div class="city-temp">${Math.round(main.temp)}<sup>°C</sup> | ${cToF(Math.round(main.temp))}<sup>°F</sup></div>
					        			<figure>
					          				<img class="city-icon" src="${icon}" alt="${weather[0]["description"]}">
					          				<figcaption>${weather[0]["description"]}</figcaption>
						       			</figure>`
					// Render Data
		   			listItem.innerHTML = childMarkup;
		      		listChild.appendChild(listItem);
	      		}
	      	}
	    })
	   .catch(() => {
      		msg.textContent = "Please search for a valid city 😩";
    	});

	   	// Restore varibles
	    cityName = null
		cityId = null
		zipCode = null
		dayTime = null
		BASE_URL = 'http://api.openweathermap.org/data/2.5/'	   
}

// Click event listener
buttonSelector.addEventListener("click", fetchDataFromApi)