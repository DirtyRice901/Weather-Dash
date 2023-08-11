//global variables
var apiKey = "9e9d71158740d71176cbc74fb3a5e39b";
var savedSearches = [];

//create list of recent searched cities
var searchHistoryList = function(cityName) {
    $('.past-search:contains("' + cityName + '")').remove();

// create input with city name
    var searchHistoryInput = $("<p>");
    searchHistoryInput.addClass("past-search");
    searchHistoryInput.text(cityName);

// create container for input
    var searchInputContainer = $("<div>");
    searchInputContainer.addClass("past-search");

// append input to container
    searchInputContainer.append(searchHistoryInput);
    
// append input container to search history container
    var searchHistoryContainerEle = $("#search-history-container");
    searchHistoryContainerEle.append(searchInputContainer);
    
    if (savedSearches.length > 0){
//update saveSearches with recent saved searches
        var recentSavedSearches = localStorage.getItem("savedSearches");
        savedSearches = JSON.parse(recentSavedSearches);        
    }

// add city name to array of saved searches
    savedSearches.push(cityName);
    localStorage.setItem("savedSearches", JSON.stringify(savedSearches)); 

// reset input field
    $("#search-input").val("");

};

// establish loadSearchHistory variable and load in search history container
var loadSearchHistory = function() {

    var saveSearchHistory = localStorage.getItem("savedSearches");

    // return false if no recent saved searches
    if (!saveSearchHistory) {
        return false;
    }

   //create array from savedSearchHistory
   saveSearchHistory = JSON.parse(saveSearchHistory);
   
   //make entry for every item in the list of savedSearchHistory
   for (var i = 0; i < saveSearchHistory.length; i++) {
    searchHistoryList(savedSearchHistory[i]);
   }
};
//retrieve data from open weather api for city
var currentWeatherZone = function(cityName) {
    fetch(`https://api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}`)
    //generate a response
        .then(function(response) {
            return response.json();
        })
        .then(function(response) {
        //city longitude and latitude
            var cityLon = response.coord.lon;
            var cityLat = response.coord.lat;

            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`)
                //generate a response once call api for longititude and latitude
                .then(function(response) {
                    return response.json();
                })
                // generate data from response and apply to current weather condition
                .then(function(response) {
                    searchHistoryList(cityName);

                    var currentWeatherContainer = $("#current-weather-container");
                    currentWeatherContainer.addClass("current-weather-container");

                    // add city name, date and icon 
                    var currentTitle = $("#current-title");
                    var currentDay = moment().format("M/D/YYYY");
                    currentTitle.text(`${cityName} (${currentDay})`);
                    var currentIcon = $("#current-weather-icon");
                    currentIcon.addClass("current-weather-icon");
                    var currentIconCode = response.current.weather[0].icon;
                    currentIcon.attr("src", `https://openweathermap.org/img/wn/${currentIconCode}@2x.png`);
    
                    //add current temperature to main display
                    var currentTemperature = $("#current-temperature");
                    currentTemperature.text("Temperature: " + response.current.temp + " \u00B0F");

                    //add current HUMIDITY to main display
                    var currentHumidity = $("#current-humidity");
                     currentHumidity.text("Humidity: " + response.current.humidity + "%");

                    //add current wind speed to main display
                    var currentWindSpeed = $("#current-wind-speed");
                    currentWindSpeed.text("Wind Speed: " + response.current.wind_speed + " MPH");

                    //add uv index to main display 
                    var currentUvIndex = $("#current-uv-index");
                    currentUvIndex.text("UV Index: ");
                    var currentNumber = $("#current-number");
                    currentNumber.text(response.current.uvi);
    
                    //add appropriate background color to current uv index 
                    if (response.current.uvi <= 2) {
                        currentNumber.addClass("favorable");
                    } else if (response.current.uvi >=3 && response.current.uvi <= 7) {
                        currentNumber.addClass("moderate");
                    } else {
                        currentNumber.addClass("severe");
                    }  

                })
        
            })
            .catch(function(err) {
                //reset
                $("#search-input").val("");

                //error alert
                alert("Unable to locate the city you seached. Please try a valid city.");
            });
};

var fiveDayForecast = function(cityName) {
        //call data from openweather api current weather
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`)
        //get a response
            .then(function(response) {
                return response.json();
        })
        .then(function(response) {
            //call city long and lat
            var cityLon = response.coord.lon;
            var cityLat = response.coord.lat;

            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${cityLat}&lon=${cityLon}&exclude=minutely,hourly,alerts&units=imperial&appid=${apiKey}`)
                //get response one call api
                .then(function(response) {
                    return response.json();
                })
                .then(function(response) {
                    console.log(response);
                    //add five day futureForecastTitle
                    var futureForecastTitle = $("#future-forecast-title");
                    futureForecastTitle.text ("5 Day Forecast:")

                    //set each 5 day with acquired data
                    for(var i = 1; i <= 5; i++) {
                        //create card container for future cards
                        var futureDate = $("#future-date-" + i);
                        date = moment().add(i, "d").format("M/DD/YYYY");
                        futureDate.text(date);

                        //add 5 day icon
                        var futureIcon = $("#future-icon-" + i);
                        futureIcon.addClass("future-icon");
                        var futureIconCode = response.daily[i].weather[0].icon;
                        futureIcon.attr("src", `https://openweathermap.org/img/wn/${futureIconCode}@2x.png`)

                        // 5 day temperature 
                        var futureTemp = $("#future-temp-" + i);
                        futureTemp.text("Temp: " + response.daily[i].temp.day + " \u00B0F");

                        //5 day humid
                        var futureHumidity = $("#future-humidity-" + i);
                        futureHumidity.text("HUmidity: " + response.daily[i].humidity + "%");
                    }
                })

    })
};

//called when search form is submitted
$("#search-form").on("submit", function(){
    event.preventDefault();

    //get name of city that was searched
    var cityName = $("#search-input").val();

    if (cityName === "" || cityName == null) {
        //send alert input empty after submission
        alert("Select a city.");
        event.preventDefault();
    } else {
        //add valid cityName to search list and display its weather
        currentWeatherZone(cityName);
        fiveDayForecast(cityName);
    }
});

//called load search history
$("#search-history-container").on("click", "p", function() {
    var previousCityName = $(this).text();
    currentWeatherZone(previousCityName);
    fiveDayForecast(previousCityName);
    var previousCityClick = $(this);
    previousCityClick.remove();
});

loadSearchHistory();