// Store the API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL.
d3.json(queryUrl).then(function(data) {
	// Send the data.features object to the createFeatures function.
	createFeatures(data.features);
});


// Define a function to run once for each feature in the features array.
function createFeatures(earthquakeData) {

	// Give each feature a popup that describes the magnitude, depth, place, and date & time of the earthquake.
	function Popups(feature, layer) {
		layer.bindPopup(`<h3> Magnitude: ${feature.properties.mag}</h3>
        <hr>
        <p>Depth: ${feature.geometry.coordinates[2]} km </p>
        <p>Place: ${feature.properties.place}</p>
        <p>Time: ${new Date(feature.properties.time)}</p>`);
	};

	// Give each feature a marker that reflects the magnitude of the earthquake by marker size and depth of the earthquake by marker color.
	function Markers(feature, coordinates) {
		let depth = feature.geometry.coordinates[2];
		let geoMarkers = {
			radius: feature.properties.mag * 5,
			fillColor: colors(depth),
			fillOpacity: 0.75,
			weight: 0.5,
            color: "black"
		};
		return L.circleMarker(coordinates, geoMarkers);
	};

	// Create a GeoJSON layer that contains the features array on the earthquakeData object.
	// Run the Popups and Markers functions once for each piece of data in the array.
	let earthquakes = L.geoJSON(earthquakeData, {
		onEachFeature: Popups,
		pointToLayer: Markers
	});

	// Send our earthquakes layer to the createMap function/
	createMap(earthquakes);
}


// Define a function to determine the color of each marker according to the depth of the earthquake. 
function colors(depth) {
	if (depth <= 10) {
		return "#a3f600";
	} else if (depth <= 30) {
		return "#dcf400";
	} else if (depth <= 50) {
		return "#f7db11";
	} else if (depth <= 70) {
		return "#fdb72a";
	} else if (depth <= 90) {
		return "#fca35d";
	} else {
		return "#ff5f65";
	}
}


// Define a function to generate a legend that provides context about the depth of the earthquake.
function addLegend(map) {
	let legend = L.control({
		position: 'bottomright'
	});

	legend.onAdd = function() {
		let div = L.DomUtil.create('div', 'info legend');
		let depths = [-10, 10, 30, 50, 70, 90];

		// Add a white background to the legend.
		div.style.backgroundColor = 'white';
		div.style.padding = '10px';

		let legendInfo = "<h3>Depth (km)</h3>";
		div.innerHTML = legendInfo;

		// Create a flex container for each legend item (color square + text label).
		for (let i = 0; i < depths.length; i++) {
			let from = depths[i];
			let to = depths[i + 1];
			let color = colors(from + 1);

			// Create a flex container for each legend item with spacing.
			let legendItem = document.createElement('div');
			legendItem.style.display = 'flex';
			legendItem.style.alignItems = 'center';
			legendItem.style.marginBottom = '5px';

			// Create a colored square with inline style.
			let colorLabel = document.createElement('div');
			colorLabel.style.width = '20px';
			colorLabel.style.height = '20px';
			colorLabel.style.backgroundColor = color;

			// Create a text label for the depth range with spacing.
			let textLabel = document.createElement('div');
			textLabel.textContent = from + (to ? ' - ' + to : ' +');
			textLabel.style.marginLeft = '10px';

			// Append the color square and text label to the legend item.
			legendItem.appendChild(colorLabel);
			legendItem.appendChild(textLabel);

			// Append the legend item to the legend div.
			div.appendChild(legendItem);
		}

		return div;
	};

	legend.addTo(map);
}


// Define a function to create the earthquake visualization map.
function createMap(earthquakes) {

	// Create the base layers.
	let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	})

	// Create a baseMaps object.
	let baseMaps = {
		"Street Map": street
	};

	// Create an overlay object to hold the overlay.
	let overlayMaps = {
		Earthquakes: earthquakes
	};

	// Create our map, giving it the streetmap and earthquakes layers to display on load.
	let myMap = L.map("map", {
		center: [
			37.09, -95.71
		],
		zoom: 5,
		layers: [street, earthquakes]
	});

	// Create a layer control.
	// Pass our baseMaps and overlayMaps.
	// Add the layer control to the map.
	L.control.layers(baseMaps, overlayMaps, {
		collapsed: false
	}).addTo(myMap);

	addLegend(myMap);
}