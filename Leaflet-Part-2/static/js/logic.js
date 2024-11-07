// Create base map tile layer (using open street map)
let basmap = L.tileLayer(
    "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    attribution: 'Map data: &copy;'
});

// Define map, using Leaflet
let map = L.map("map", {
    center: [40.7, -94.5],
    zoom: 3
})

// Add base map to map
basmap.addTo(map);


// Create a new Layer Group for tectonic plates and earthquakes
let tectonicPlates = new L.LayerGroup();
let earthquakes = new L.LayerGroup();

let BaseMaps = {
    'Global Map': basmap
}

let overlays = {
    "Tectonic Plates": tectonicPlates,
    "Earthquakes": earthquakes
}

// Add layers for BaseMaps and overlays to map
L.control.layers(BaseMaps, overlays).addTo(map);

// Create function for assigning marker colors based on depth
function getColor(depth) {
    if(depth > 90) {
        return "#ea2c2c"
    } else if(depth > 70) {
        return "#ea822c"
    } else if(depth > 50) {
        return "#ee9c00"
    } else if(depth > 30) {
        return "#eecc00"
    } else if(depth > 10) {
        return "#d4ee00"
    }
    else {
        return "#98ee00"
    }
}

// Create funtion for assigning marker radius size based on magnitude
function getRadius(magnitude) {
    if(magnitude === 0) {
        return 1
    }
    return magnitude * 4
}


// Use D3 to get data, and add
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson").then(function(data) {
    console.log(data);
    // Create a function that applies styling and properties
    function styleInfo(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "#000000",
            radius:getRadius(feature.properties.mag),
            stroke: true,
            weight: 0.6
        }
    }

    // Apply functions to geoJSON data, defining where markers go on map layer, as well as their styling, and add popups to each marker
    L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng);
    },
    style: styleInfo,
    onEachFeature: function(feature, layer) {
        layer.bindPopup(`
                Magnitude: ${feature.properties.mag} <br>
                Depth: ${feature.geometry.coordinates[2]} <br>
                Location: ${feature.properties.place}
            `);
    }
    // Add all these features to earthquakes map
    }).addTo(earthquakes);
})

earthquakes.addTo(map);


// Define legend location, and apply function to create grades and matching colors cooresponding to markers on map
let legend = L.control({
    position: "bottomright"
});

    legend.onAdd = function(){
    let container = L.DomUtil.create("div", "info legend");
    let grades = [-10, 10, 30, 70, 90];
    let colors = ['#98ee00', '#d4ee00', '#eecc00', '#ee9c00', '#ea822c', '#ea2c2c'];
    for(let index = 0; index < grades.length; index++) {
        container.innerHTML += `<i style="background: ${colors[index]}"></i> ${grades[index]}+ </br>`
    }
    return container;
    }

    // Add legend to map
    legend.addTo(map);

    // Use d3 to read API for tectonic plate data and apply to map
    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(plateData) {
    L.geoJson(plateData, {
        color: "orange",
        width: 3,      
    }).addTo(tectonicPlates);

    tectonicPlates.addTo(map);
    });
