// Target specific HTML items
const sideMenu = document.querySelector("aside");
const menuBtn = document.querySelector("#menu-btn");
const closeBtn = document.querySelector("#close-btn");
const themeToggler = document.querySelector(".theme-toggler");

// Holds the background color of all chart
var chartBGColor = getComputedStyle(document.body).getPropertyValue(
  "--chart-background"
);
var chartFontColor = getComputedStyle(document.body).getPropertyValue(
  "--chart-font-color"
);
var chartAxisColor = getComputedStyle(document.body).getPropertyValue(
  "--chart-axis-color"
);

/*
  Event listeners for any HTML click
*/
menuBtn.addEventListener("click", () => {
  sideMenu.style.display = "block";
});

closeBtn.addEventListener("click", () => {
  sideMenu.style.display = "none";
});

themeToggler.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme-variables");
  themeToggler.querySelector("span:nth-child(1)").classList.toggle("active");
  themeToggler.querySelector("span:nth-child(2)").classList.toggle("active");

  // Update Chart background
  chartBGColor = getComputedStyle(document.body).getPropertyValue(
    "--chart-background"
  );
  chartFontColor = getComputedStyle(document.body).getPropertyValue(
    "--chart-font-color"
  );
  chartAxisColor = getComputedStyle(document.body).getPropertyValue(
    "--chart-axis-color"
  );
  updateChartsBackground();
});


// ***********************************************

const toggleBtn = document.getElementById('toggle-btn');
const bulb = document.getElementById('bulb');

toggleBtn.addEventListener('change', function () {
  if (this.checked) {
    // Turn bulb ON
    bulb.style.backgroundColor = "red";

    const newValue = "on"; // Replace with the new value you want to set

    fetch('/ledUpdate', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: newValue
    })
      .then((response) => response.json())
      .then((jsonResponse) => {
        // Handle the response after updating the variable
        console.log(jsonResponse);
      })
      .catch((error) => {
        // Handle any errors that occurred during the request
        console.error(error);
      });

  } else {
    // Turn bulb OFF
    bulb.style.backgroundColor = "#ccc";

    const newValue = "off"; // Replace with the new value you want to set

    fetch('/ledUpdate', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain'
      },
      body: newValue
    })
      .then((response) => response.json())
      .then((jsonResponse) => {
        // Handle the response after updating the variable
        console.log(jsonResponse);
      })
      .catch((error) => {
        // Handle any errors that occurred during the request
        console.error(error);
      });
  }
});


// Function to turn the toggle button ON
function turnToggleButtonOn() {
  toggleBtn.checked = true;
  bulb.style.backgroundColor = "red";
}

// Function to turn the toggle button OFF
function turnToggleButtonOff() {
  toggleBtn.checked = false;
  bulb.style.backgroundColor = "#ccc";
}







/*
  Plotly.js graph and chart setup code
*/
var temperatureHistoryDiv = document.getElementById("temperature-history");
var oxygenHistoryDiv = document.getElementById("oxygen-history");
var heartrateHistoryDiv = document.getElementById("heartrate-history");

var temperatureGaugeDiv = document.getElementById("temperature-gauge");
var oxygenGaugeDiv = document.getElementById("oxygen-gauge");
var heartrateGaugeDiv = document.getElementById("heartrate-gauge");

const historyCharts = [temperatureHistoryDiv, oxygenHistoryDiv, heartrateHistoryDiv];

const gaugeCharts = [temperatureGaugeDiv, oxygenGaugeDiv, heartrateGaugeDiv];

// History Data
var temperatureTrace = {
  x: [],
  y: [],
  name: "Temperature",
  mode: "lines+markers",
  type: "line",
};
var oxygenTrace = {
  x: [],
  y: [],
  name: "Humidity",
  mode: "lines+markers",
  type: "line",
};
var heartrateTrace = {
  x: [],
  y: [],
  name: "Heartrate",
  mode: "lines+markers",
  type: "line",
};

var temperatureLayout = {
  autosize: true,
  title: {
    text: "Temperature",
  },
  font: {
    size: 12,
    color: chartFontColor,
    family: "poppins, san-serif",
  },
  colorway: ["#05AD86"],
  margin: { t: 40, b: 40, l: 60, r: 60, pad: 10 },
  plot_bgcolor: chartBGColor,
  paper_bgcolor: chartBGColor,
  xaxis: {
    color: chartAxisColor,
    linecolor: chartAxisColor,
    gridwidth: "2",
    autorange: true,
  },
  yaxis: {
    color: chartAxisColor,
    linecolor: chartAxisColor,
    gridwidth: "2",
    autorange: true,
  },
};
var oxygenLayout = {
  autosize: true,
  title: {
    text: "Oxygen Saturation",
  },
  font: {
    size: 12,
    color: chartFontColor,
    family: "poppins, san-serif",
  },
  colorway: ["#05AD86"],
  margin: { t: 40, b: 40, l: 30, r: 30, pad: 0 },
  plot_bgcolor: chartBGColor,
  paper_bgcolor: chartBGColor,
  xaxis: {
    color: chartAxisColor,
    linecolor: chartAxisColor,
    gridwidth: "2",
  },
  yaxis: {
    color: chartAxisColor,
    linecolor: chartAxisColor,
  },
};

var heartrateLayout = {
  autosize: true,
  title: {
    text: "Heart Rate",
  },
  font: {
    size: 12,
    color: chartFontColor,
    family: "poppins, san-serif",
  },
  colorway: ["#05AD86"],
  margin: { t: 40, b: 40, l: 30, r: 30, pad: 0 },
  plot_bgcolor: chartBGColor,
  paper_bgcolor: chartBGColor,
  xaxis: {
    color: chartAxisColor,
    linecolor: chartAxisColor,
    gridwidth: "2",
  },
  yaxis: {
    color: chartAxisColor,
    linecolor: chartAxisColor,
  },
};

var config = { responsive: true };

window.addEventListener("load", (event) => {
  Plotly.newPlot(
    temperatureHistoryDiv,
    [temperatureTrace],
    temperatureLayout,
    config
  );
  Plotly.newPlot(oxygenHistoryDiv, [oxygenTrace], oxygenLayout, config);
  Plotly.newPlot(
    heartrateHistoryDiv,
    [heartrateTrace],
    heartrateLayout,
    config
  );

  // Run it initially
  handleDeviceChange(mediaQuery);
});

// Gauge Data
var temperatureData = [
  {
    domain: { x: [0, 1], y: [0, 1] },
    value: 0,
    title: { text: "Temperature" },
    type: "indicator",
    mode: "gauge+number+delta",
    delta: { reference: 37 },
    gauge: {
      axis: { range: [null, 50] },
      steps: [
        { range: [0, 30], color: "lightgray" },
        { range: [30, 40], color: "gray" },
      ],
      threshold: {
        line: { color: "red", width: 4 },
        thickness: 0.75,
        value: 37,
      },
    },
  },
];

var oxygenData = [
  {
    domain: { x: [0, 1], y: [0, 1] },
    value: 0,
    title: { text: "Oxygen Saturation" },
    type: "indicator",
    mode: "gauge+number+delta",
    delta: { reference: 97 },
    gauge: {
      axis: { range: [null, 100] },
      steps: [
        { range: [0, 95], color: "lightgray" },
        { range: [95, 100], color: "gray" },
      ],
      threshold: {
        line: { color: "red", width: 4 },
        thickness: 0.75,
        value: 97,
      },
    },
  },
];

var heartrateData = [
  {
    domain: { x: [0, 1], y: [0, 1] },
    value: 0,
    title: { text: "Heart Rate" },
    type: "indicator",
    mode: "gauge+number+delta",
    delta: { reference: 72 },
    gauge: {
      axis: { range: [null, 100] },
      steps: [
        { range: [0, 70], color: "lightgray" },
        { range: [70, 80], color: "gray" },
      ],
      threshold: {
        line: { color: "red", width: 4 },
        thickness: 0.75,
        value: 72,
      },
    },
  },
];

var layout = { width: 300, height: 250, margin: { t: 0, b: 0, l: 0, r: 0 } };

Plotly.newPlot(temperatureGaugeDiv, temperatureData, layout);
Plotly.newPlot(oxygenGaugeDiv, oxygenData, layout);
Plotly.newPlot(heartrateGaugeDiv, heartrateData, layout);

// Will hold the arrays we receive from our DHT22 sensor
// Temperature
let newTempXArray = [];
let newTempYArray = [];
// Humidity
let newOxygenXArray = [];
let newOxygenYArray = [];
// heartrate
let newHeartrateXArray = [];
let newHeartrateYArray = [];

// The maximum number of data points displayed on our scatter/line graph
let MAX_GRAPH_POINTS = 12;
let ctr = 0;

// Callback function that will retrieve our latest sensor readings and redraw our Gauge with the latest readings
function updateSensorReadings(jsonResponse) {
  console.log(typeof jsonResponse);
  console.log(jsonResponse);

  let temperature = Number(jsonResponse.temperature).toFixed(2);
  let humidity = Number(jsonResponse.humidity).toFixed(2);

  updateBoxes(temperature, humidity);

  updateGauge(temperature, humidity);

  // Update Temperature Line Chart
  updateCharts(
    temperatureHistoryDiv,
    newTempXArray,
    newTempYArray,
    temperature
  );
  // Update Humidity Line Chart
  updateCharts(
    humidityHistoryDiv,
    newHumidityXArray,
    newHumidityYArray,
    humidity
  );
}


//new function for update the temp values

function updateTemperatureReadings(temp) {
  let temperature = Number(temp).toFixed(2);

  updateTemperatureBox(temperature);

  updateTemperatureGauge(temperature);

  // Update Temperature Line Chart
  updateCharts(
    temperatureHistoryDiv,
    newTempXArray,
    newTempYArray,
    temperature
  );
}


// function ended

//new function for update the oxygen values

function updateOxygenReadings(oxy) {
  let oxygen = Number(oxy).toFixed(2);

  updateOxygenBox(oxygen);

  updateOxygenGauge(oxygen);

  // Update oxygen Line Chart
  updateCharts(
    oxygenHistoryDiv,
    newOxygenXArray,
    newOxygenYArray,
    oxygen
  );
}


// function ended

//new function for update the heartrate values

function updateHeartrateReadings(hr) {
  let heartrate = Number(hr).toFixed(2);

  updateHeartrateBox(heartrate);

  updateHeartrateGauge(heartrate);

  // Update Temperature Line Chart
  updateCharts(
    heartrateHistoryDiv,
    newHeartrateXArray,
    newHeartrateYArray,
    heartrate
  );
}


// function ended



function updateBoxes(temperature, humidity) {
  let temperatureDiv = document.getElementById("temperature");
  let humidityDiv = document.getElementById("humidity");

  temperatureDiv.innerHTML = temperature + " C";
  humidityDiv.innerHTML = humidity + " %";
}


//new function for update temp box
function updateTemperatureBox(temperature) {
  let temperatureDiv = document.getElementById("temperature");
  temperatureDiv.innerHTML = temperature + " °C   " + " /  " + ((temperature * 9 / 5) + 32) + " F";
}
//ended 

//new function for update oxygen box
function updateOxygenBox(oxygen) {
  let oxygenDiv = document.getElementById("oxygen");
  oxygenDiv.innerHTML = oxygen + " %";
}
//ended 

//new function for update heartrate box
function updateHeartrateBox(heartrate) {
  let heartrateDiv = document.getElementById("heartrate");
  heartrateDiv.innerHTML = heartrate + " BPM";
}
//ended 

function updateGauge(temperature, humidity) {
  var temperature_update = {
    value: temperature,
  };
  var humidity_update = {
    value: humidity,
  };

  Plotly.update(temperatureGaugeDiv, temperature_update);
  Plotly.update(humidityGaugeDiv, humidity_update);
}


//update gauge new function
function updateTemperatureGauge(temperature) {
  var temperature_update = {
    value: temperature,
  };

  Plotly.update(temperatureGaugeDiv, temperature_update);
}


//function ended

//update oxygen gauge new function
function updateOxygenGauge(oxygen) {
  var oxygen_update = {
    value: oxygen,
  };

  Plotly.update(oxygenGaugeDiv, oxygen_update);
}


//function ended

//update heartrate gauge new function
function updateHeartrateGauge(heartrate) {
  var heartrate_update = {
    value: heartrate,
  };

  Plotly.update(heartrateGaugeDiv, heartrate_update);
}


//function ended

function updateCharts(lineChartDiv, xArray, yArray, sensorRead) {
  if (xArray.length >= MAX_GRAPH_POINTS) {
    xArray.shift();
  }
  if (yArray.length >= MAX_GRAPH_POINTS) {
    yArray.shift();
  }
  xArray.push(ctr++);
  yArray.push(sensorRead);

  var data_update = {
    x: [xArray],
    y: [yArray],
  };

  Plotly.update(lineChartDiv, data_update);
}

function updateChartsBackground() {
  // updates the background color of historical charts
  var updateHistory = {
    plot_bgcolor: chartBGColor,
    paper_bgcolor: chartBGColor,
    font: {
      color: chartFontColor,
    },
    xaxis: {
      color: chartAxisColor,
      linecolor: chartAxisColor,
    },
    yaxis: {
      color: chartAxisColor,
      linecolor: chartAxisColor,
    },
  };
  historyCharts.forEach((chart) => Plotly.relayout(chart, updateHistory));

  // updates the background color of gauge charts
  var gaugeHistory = {
    plot_bgcolor: chartBGColor,
    paper_bgcolor: chartBGColor,
    font: {
      color: chartFontColor,
    },
    xaxis: {
      color: chartAxisColor,
      linecolor: chartAxisColor,
    },
    yaxis: {
      color: chartAxisColor,
      linecolor: chartAxisColor,
    },
  };
  gaugeCharts.forEach((chart) => Plotly.relayout(chart, gaugeHistory));
}

const mediaQuery = window.matchMedia("(max-width: 600px)");

mediaQuery.addEventListener("change", function (e) {
  handleDeviceChange(e);
});

function handleDeviceChange(e) {
  if (e.matches) {
    console.log("Inside Mobile");
    var updateHistory = {
      width: 323,
      height: 250,
      "xaxis.autorange": true,
      "yaxis.autorange": true,
    };
    historyCharts.forEach((chart) => Plotly.relayout(chart, updateHistory));
  } else {
    var updateHistory = {
      width: 550,
      height: 260,
      "xaxis.autorange": true,
      "yaxis.autorange": true,
    };
    historyCharts.forEach((chart) => Plotly.relayout(chart, updateHistory));
  }
}

function retrieveSensorReadings() {
  // fetch(`/sensorReadings`)
  //   .then((response) => response.json())
  //   .then((jsonResponse) => {
  //     updateSensorReadings(jsonResponse);
  //   });

  fetch(`/temperature`)
    .then((response) => response.text())
    .then((textResponse) => {
      console.log("temperature",textResponse);
      updateTemperatureReadings(textResponse)
    });

  fetch(`/IR`)
    .then((response) => response.text())
    .then((textResponse) => {
      console.log("IR", textResponse);
    });

  fetch(`/HR`)
    .then((response) => response.text())
    .then((textResponse) => {
      console.log("HR", textResponse);
      updateHeartrateReadings(textResponse)
    });

  fetch(`/SPO2`)
    .then((response) => response.text())
    .then((textResponse) => {
      console.log("SPO2", textResponse);
      updateOxygenReadings(textResponse)
    });

  fetch('/led')
    .then((response) => response.text())
    .then((textResponse) => {
      console.log(textResponse);
      if(textResponse == 'on'){
        turnToggleButtonOn();
      }else{
        turnToggleButtonOff()
      }
    });

  // var temperature = Math.random() * 10 + 20;
  // var humidity = Math.random() * 20 + 40;
  // var pressure = Math.random() * 200 + 900;

  // var sensorReadings = {
  //   temperature: temperature,
  //   humidity: humidity,
  //   pressure: pressure
  // };
  // var sensorReadings = msg.payload;
  // console.log(sensorReadings);
  // updateSensorReadings(sensorReadings);
}

// Continuos loop that runs evry 3 seconds to update our web page with the latest sensor readings
(function loop() {
  setTimeout(() => {
    retrieveSensorReadings();
    loop();
  }, 3000);
})();
