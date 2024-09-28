const firebaseConfig = {
  apiKey: "AIzaSyCu1mQApkRU9k_m_GdpUKkfmAXCTDQpPfw",
  authDomain: "energy-meter-2deb1.firebaseapp.com",
  databaseURL: "https://energy-meter-2deb1-default-rtdb.firebaseio.com",
  projectId: "energy-meter-2deb1",
  storageBucket: "energy-meter-2deb1.appspot.com",
  messagingSenderId: "414645995276",
  appId: "1:414645995276:web:aaa60bb0b9ae58f6a22b29"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Reference to the Realtime Database
const database = firebase.database();

// Reference to the sensor data and chart data
const sensorRef = database.ref('sensorData/');
const chartDataRef = database.ref('chartData/');

// Chart setup
let dataPoints = [];
let chart = new CanvasJS.Chart("chartContainer", {
  theme: "light2",
  title: {
    text: "Live Energy Data"
  },
  data: [{
    type: "line",
    dataPoints: dataPoints
  }]
});

// Function to update chart data in Firebase
function saveChartData() {
  chartDataRef.set(dataPoints.map(point => ({
    x: point.x.getTime(),  // Save timestamps
    y: point.y
  })));
}

// Fetch and initialize the chart with saved data
chartDataRef.once('value', (snapshot) => {
  const savedData = snapshot.val();
  if (savedData) {
    savedData.forEach(point => {
      dataPoints.push({
        x: new Date(point.x),  // Convert timestamp back to Date object
        y: point.y
      });
    });
    chart.render();  // Render the chart with the previous data
  }
});

// Real-time Firebase data fetching and chart update
sensorRef.on('value', (snapshot) => {
  const data = snapshot.val(); // Get the data object from Firebase
  
  if (data) {
    // Update the values on the web page
    document.getElementById('voltage').innerText = data.voltage || '--';
    document.getElementById('current').innerText = data.current || '--';
    document.getElementById('power').innerText = data.power || '--';
    document.getElementById('energy').innerText = data.energy || '--';
    document.getElementById('freq').innerText = data.frequency || '--';
    document.getElementById('pf').innerText = data.pf || '--';
    
    // Update chart data points for energy
    const xValue = new Date();  // Use the current timestamp for x-axis
    const yValue = parseFloat(data.energy) || 0;  // Using energy for y-axis data

    // Add new data point to the chart
    dataPoints.push({ x: xValue, y: yValue });

    // Limit the number of data points to avoid overcrowding the chart
    if (dataPoints.length > 500) {
      dataPoints.shift();
    }

    // Re-render the chart with updated data
    chart.render();

    // Save the updated chart data to Firebase
    saveChartData();
  } else {
    console.log('No data available');
  }
});
