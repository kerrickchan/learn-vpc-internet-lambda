const https = require('https');

exports.handler = async (event) => {
  try {
    const lat = event.queryStringParameters?.lat || '40.7128'; // Default to New York City
    const lon = event.queryStringParameters?.lon || '-74.0060';
    const weatherData = await fetchWeatherData(lat, lon);
    return {
      statusCode: 200,
      body: JSON.stringify(weatherData),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch weather data' }),
    };
  }
};

function fetchWeatherData(lat, lon) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    if (!apiKey) {
      reject(new Error('OPENWEATHERMAP_API_KEY is not set'));
      return;
    }

    const options = {
      hostname: 'api.openweathermap.org',
      path: `/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`,
      method: 'GET',
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const weatherData = JSON.parse(data);
          resolve(weatherData);
        } catch (error) {
          reject(new Error('Failed to parse weather data'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}
