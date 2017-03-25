// Eslint configuration for editor.
/* globals google */
/* eslint-env browser */
/* eslint quotes: ["warn", "single"]*/

const mapStyle = [
  {
    'elementType': 'geometry',
    'stylers': [
      {
        'color': '#f5f5f5'
      }
    ]
  },
  {
    'elementType': 'labels.icon',
    'stylers': [
      {
        'visibility': 'off'
      }
    ]
  },
  {
    'elementType': 'labels.text.fill',
    'stylers': [
      {
        'color': '#616161'
      }
    ]
  },
  {
    'elementType': 'labels.text.stroke',
    'stylers': [
      {
        'color': '#f5f5f5'
      }
    ]
  },
  {
    'featureType': 'administrative.land_parcel',
    'elementType': 'labels.text.fill',
    'stylers': [
      {
        'color': '#bdbdbd'
      }
    ]
  },
  {
    'featureType': 'poi',
    'elementType': 'geometry',
    'stylers': [
      {
        'color': '#eeeeee'
      }
    ]
  },
  {
    'featureType': 'poi',
    'elementType': 'labels.text.fill',
    'stylers': [
      {
        'color': '#757575'
      }
    ]
  },
  {
    'featureType': 'poi.park',
    'elementType': 'geometry',
    'stylers': [
      {
        'color': '#e5e5e5'
      }
    ]
  },
  {
    'featureType': 'poi.park',
    'elementType': 'labels.text.fill',
    'stylers': [
      {
        'color': '#9e9e9e'
      }
    ]
  },
  {
    'featureType': 'road',
    'elementType': 'geometry',
    'stylers': [
      {
        'color': '#ffffff'
      }
    ]
  },
  {
    'featureType': 'road.arterial',
    'elementType': 'labels.text.fill',
    'stylers': [
      {
        'color': '#757575'
      }
    ]
  },
  {
    'featureType': 'road.highway',
    'elementType': 'geometry',
    'stylers': [
      {
        'color': '#dadada'
      }
    ]
  },
  {
    'featureType': 'road.highway',
    'elementType': 'labels.text.fill',
    'stylers': [
      {
        'color': '#616161'
      }
    ]
  },
  {
    'featureType': 'road.local',
    'elementType': 'labels.text.fill',
    'stylers': [
      {
        'color': '#9e9e9e'
      }
    ]
  },
  {
    'featureType': 'transit.line',
    'elementType': 'geometry',
    'stylers': [
      {
        'color': '#e5e5e5'
      }
    ]
  },
  {
    'featureType': 'transit.station',
    'elementType': 'geometry',
    'stylers': [
      {
        'color': '#eeeeee'
      }
    ]
  },
  {
    'featureType': 'water',
    'elementType': 'geometry',
    'stylers': [
      {
        'color': '#c9c9c9'
      }
    ]
  },
  {
    'featureType': 'water',
    'elementType': 'labels.text.fill',
    'stylers': [
      {
        'color': '#9e9e9e'
      }
    ]
  }
]

// Colors from https://en.wikipedia.org/wiki/New_York_City_Subway_nomenclature#Colors_and_trunk_lines
let routeColors = {
  // IND Eighth Avenue Line
  'A': '#2850ad',
  'C': '#2850ad',
  'E': '#2850ad',

  // IND Sixth Avenue Line
  'B': '#ff6319',
  'D': '#ff6319',
  'F': '#ff6319',
  'M': '#ff6319',

  // IND Crosstown Line
  'G': '#6cbe45',

  // BMT Canarsie Line
  'L': '#a7a9ac',

  // BMT Nassau Street Line
  'J': '#996633',
  'Z': '#996633',

  // BMT Broadway Line
  'N': '#fccc0a',
  'Q': '#fccc0a',
  'R': '#fccc0a',
  'W': '#fccc0a',

  // IRT Broadway – Seventh Avenue Line
  '1': '#ee352e',
  '2': '#ee352e',
  '3': '#ee352e',

  // IRT Lexington Avenue Line
  '4': '#00933c',
  '5': '#00933c',
  '6': '#00933c',

  // IRT Flushing Line
  '7': '#b933ad',

  // Shuttles
  'S': '#808183',
};

const Features = {
	SUBWAY_STATION : 1,
	SUBWAY_LINE    : 2
}

function initMap() {
    // Create Map
    const map = new google.maps.Map(document.getElementsByClassName('map')[0], {
        zoom: 11,
        center: {
            // New York City
            lat: 40.7305, 
            lng: -73.9091
        }, 
        
        // Set background map to silver.
        styles: mapStyle
    });
    
    const infoWindow = new google.maps.InfoWindow();
    
    // Load data from the backend
    map.data.loadGeoJson('/data/subway-stations');
    map.data.loadGeoJson('/data/subway-lines');
    
    // Style the geo data features (stations & lines)
    map.data.setStyle( feature => {
    	// `feature` may be a station or a line
    	// Stations have line property, while lines do not.

    	let line = feature.getProperty('line');
    	
    	if (typeof line !== "undefined") {
    		// this is a station.
    		// return icon style
    		return {
    			icon: {
    				fillColor: 'LightSteelBlue',
    				strokeColor: 'gray',
    				fillOpacity: 1.0,
    				scale: 1.2,
    				path: 'M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.2' +
            '3l2-2H14l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-' +
            '4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1' +
            '.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5' +
            '-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z'
    			}
    		}
    	}
    	// else, this feature is a line.
    	// set strokeColor according to routeColors.
    	return {
    		strokeColor: routeColors[feature.getProperty('rt_symbol')]
		};

    });
    
    // Display station & line info when station is clicked.
  map.data.addListener('click', ev => {
    let f = ev.feature;
    let stationName = f.getProperty('name');
    let line = f.getProperty('line');
    // Stations have line property, while lines do not.
    if (typeof line === "undefined") {
      return;
    }
    if (line.includes('-')) {
      line += ' lines';
    } else {
      line += ' line';
    }
    infoWindow.setContent(`<b>${stationName} Station</b><br/>Serves ${line}`);
    // Hat tip geocodezip: http://stackoverflow.com/questions/23814197
    infoWindow.setPosition(f.getGeometry().get());
    infoWindow.setOptions({
      pixelOffset: new google.maps.Size(0, 0)
    });
    infoWindow.open(map);
  });

}

function _getType(feature) {
	// A feature is a subway line if it contains a line property.
	if (typeof feature.getProperty('line') !== 'undefined') {
		return Features.SUBWAY_LINE;
	}
	// else, It is a subway station.
	return Features.SUBWAY_STATION;
}
