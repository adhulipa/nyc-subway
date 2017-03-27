package nycsubway

import (
	"io/ioutil"
	"log"
	"net/http"
	"path/filepath"
)

var GeoJSON = make(map[string][]byte)

func cacheGeoJson() {
	// Read filenames in data directory
	filenames, err := filepath.Glob("data/*")
	if err != nil {
		log.Fatal(err)
	}

	// For each file
	for _, filename := range filenames {
		// Read file
		data, err := ioutil.ReadFile(filename)
		if err != nil {
			log.Fatal(err)
		}

		// Cache file
		name := filepath.Base(filename)
		GeoJSON[name] = data
	}
}

func init() {
	// Cachec GeoJSON
	cacheGeoJson()
	loadStationsData()

	// Set up stations handler
	http.HandleFunc("/data/subway-stations", stationsHandler)

	// Set up lines handler
	http.HandleFunc("/data/subway-lines", linesHandler)
}

func linesHandler(w http.ResponseWriter, r *http.Request) {
	// Send lines data
	w.Header().Set("Content-type", "application/json")
	w.Write(GeoJSON["subway-lines.geojson"])
}
