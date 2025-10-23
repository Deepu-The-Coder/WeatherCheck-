// By using 'defer' in the HTML <script> tag, we don't need the 'DOMContentLoaded' listener.
// The script will automatically run after the HTML document is parsed.

const cityInput = document.getElementById('cityInput');
const searchButton = document.getElementById('searchButton');
const buttonText = document.getElementById('buttonText');
const buttonLoader = document.getElementById('buttonLoader');
const errorMessage = document.getElementById('errorMessage');
const weatherResult = document.getElementById('weatherResult');

const API_KEY = "b9a139e5e26867e0e8a688bcb6d714ba"; // Hardcoded API key

const getWeather = async () => {
    const city = cityInput.value.trim();
    
    // Clear previous state
    errorMessage.textContent = '';
    errorMessage.classList.add('d-none'); // Hide error alert
    weatherResult.innerHTML = '';

    if (!city) {
        errorMessage.textContent = 'Please enter a city name.';
        errorMessage.classList.remove('d-none'); // Show error alert
        return;
    }

    // Show Loading State (Bootstrap "d-none" utility)
    buttonText.classList.add('d-none');
    buttonLoader.classList.remove('d-none');
    searchButton.disabled = true;

    try {
        const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error fetching data');
        }

        const data = await response.json();
        displayWeather(data);

    } catch (error) {
        let friendlyMessage = 'Failed to fetch weather. Check console for details.';
        if (error.message.toLowerCase().includes('city not found')) {
            friendlyMessage = 'City not found. Please check the spelling.';
        } else if (error.message.toLowerCase().includes('invalid api key')) {
            friendlyMessage = 'Invalid API key. Please check your key and try again.';
        } else if (error.message) {
            friendlyMessage = error.message.charAt(0).toUpperCase() + error.message.slice(1);
        }
        errorMessage.textContent = friendlyMessage;
        errorMessage.classList.remove('d-none'); // Show error alert
    } finally {
        // Reset Loading State
        buttonText.classList.remove('d-none');
        buttonLoader.classList.add('d-none');
        searchButton.disabled = false;
    }
};

const displayWeather = (data) => {
    weatherResult.innerHTML = '';
    
    const { name, main, weather, wind, sys } = data;
    const temperature = Math.round(main.temp);
    const feelsLike = Math.round(main.feels_like);
    const description = weather[0].description;
    const icon = weather[0].icon;
    const humidity = main.humidity;
    const windSpeed = (wind.speed * 3.6).toFixed(1); // Convert m/s to km/h
    const country = sys.country;

    const capitalizedDescription = description.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    
    // This HTML is now built with Bootstrap utility classes
    const weatherHTML = `
        <h2 class="fs-3 fw-semibold mb-2">${name}, ${country}</h2>
        <div class="d-flex align-items-center justify-content-center">
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${capitalizedDescription}" style="width: 80px; height: 80px; margin: -0.5rem;">
            <span class="display-3 fw-bold">${temperature}°C</span>
        </div>
        <p class="fs-5 text-capitalize text-body-secondary mt-2">${capitalizedDescription}</p>
        <p class="fs-6 text-muted">Feels like ${feelsLike}°C</p>

        <!-- Use Bootstrap's Grid system -->
        <div class="row g-3 mt-4 text-center">
            <div class="col">
                <div class="bg-light-subtle p-3 rounded-3">
                    <p class="fs-sm text-muted fw-medium mb-1">Humidity</p>
                    <p class="fs-4 fw-semibold mb-0">${humidity}%</p>
                </div>
            </div>
            <div class="col">
                <div class="bg-light-subtle p-3 rounded-3">
                    <p class="fs-sm text-muted fw-medium mb-1">Wind Speed</p>
                    <p class="fs-4 fw-semibold mb-0">${windSpeed} km/h</p>
                </div>
            </div>
        </div>
    `;
    
    weatherResult.innerHTML = weatherHTML;
};

// Event Listeners
searchButton.addEventListener('click', getWeather);
cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        getWeather();
    }
});