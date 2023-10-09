// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL.
d3.json(queryUrl).then(function (data) {
   // Once we get a response, send the data.features object to the createFeatures function.
   createFeatures(data.features);
});

// Define a function that we to run once for each feature in the features array.
function createFeatures(earthquakeData) {

   // Give each feature a popup that describes the magnitude, date & time, and place of the earthquake.
   function Popups(feature, layer) {
      layer.bindPopup(`<h3> Magnitude: ${feature.properties.mag}</h3>
    <hr><p>Date and Time: ${new Date(feature.properties.time)}</p>
    <p>Place: ${feature.properties.place}</p>`);
    };

   // Give each feature a marker that reflects the magnitude of the earthquake by its size and depth of the earthquake by color.
   function Markers(feature, coordinates) {
      let depth = feature.geometry.coordinates[2];
      let geoMarkers = {
         radius: feature.properties.mag * 5,
         fillColor: colors(depth),
         fillOpacity: 0.7,
         weight: 0.5
      };
      return L.circleMarker(coordinates, geoMarkers);
   };


   // Create a GeoJSON layer that contains the features array on the earthquakeData object.
   // Run the onEachFeature function once for each piece of data in the array.
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

function addLegend(map) {
    let legend = L.control({ position: 'bottomright' });

    legend.onAdd = function () {
        let div = L.DomUtil.create('div', 'info legend');
        let depths = [-10, 10, 30, 50, 70, 90];

        // Add a white background to the legend.
        div.style.backgroundColor = 'white';
        div.style.padding = '10px';

        let legendInfo = "<h3>Depth (km)</h3>"
        div.innerHTML = legendInfo;

        // Loop through the depth ranges and generate labels with color previews.
        for (let i = 0; i < depths.length; i++) {
            let from = depths[i];
            let to = depths[i + 1];
            let color = colors(from + 1);

            // Create a label with a colored square and the depth range.
            let label = '<ul style="background:' + color + '" >' 
            + from + (to ? '&ndash;' + to : '+');

            // Append the label to the legend div.
            div.innerHTML += label + '<br>';
        }

        return div;
    };

    legend.addTo(map);
}

 
 
function createMap(earthquakes) {

   // Create the base layers.
   let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
   })

   // Create a baseMaps object.
   let baseMaps = {
      "Street Map": street
   };

   // Create an overlay object to hold our overlay.
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
   // Pass it our baseMaps and overlayMaps.
   // Add the layer control to the map.
   L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
   }).addTo(myMap);
   
   addLegend(myMap);
}

