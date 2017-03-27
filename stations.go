package nycsubway

import (
	"encoding/json"
	"fmt"
	rtree "github.com/dhconnelly/rtreego"
	geojson "github.com/paulmach/go.geojson"
	"log"
	"math"
	"net/http"
	"strconv"
	"strings"
)

// Define an 2 dimensional Rtree to hold the stations data.
// Each node in the rtree may have a minimum of 25 & maximum of 50 children.
var Stations = rtree.NewTree(2, 25, 50)

// Define a Station.
type Station struct {
	feature *geojson.Feature
}

// Station is a Spatial structure.
func (station *Station) Bounds() *rtree.Rect {
	return rtree.Point{
		station.feature.Geometry.Point[0],
		station.feature.Geometry.Point[1],
	}.ToRect(1e-6)
}

// Loads the stations data into the Rtree
func loadStationsData() {
	// Load GeoJson stations data
	rawStationsData := GeoJSON["subway-stations.geojson"]
	stationsCollection, err := geojson.UnmarshalFeatureCollection(rawStationsData)
	if err != nil {
		// This will bring down the cloud instance.
		msg := fmt.Sprintf("Could not load station data. %s", err)
		log.Fatal(msg)
	}

	for _, feature := range stationsCollection.Features {
		// Add each feature to a Station struct
		station := new(Station)
		station.feature = feature

		// and insert it into the Stations rtree
		Stations.Insert(station)
	}
}

func stationsHandler(w http.ResponseWriter, r *http.Request) {
	// Parse `viewport` from request.

	viewport, err := newRect(r.FormValue("viewport"))
	if err != nil {
		msg := fmt.Sprintf("Invalid viewport: %s", err)
		http.Error(w, msg, 400)
		return
	}

	// Query the Rtree to find all stations within the viewport.
	stations := Stations.SearchIntersect(viewport)

	// Send the stations data in the response.
	w.Header().Set("Content-type", "application/json")
	fc := geojson.NewFeatureCollection()
	for _, station := range stations {
		fc.AddFeature(station.(*Station).feature)
	}

	// Write JSON to response
	err = json.NewEncoder(w).Encode(fc)
	if err != nil {
		msg := fmt.Sprintf("Couldn't encode results. %s", err)
		http.Error(w, msg, 500)
		return
	}
}

// Create a rtree.Rect to define the viewport
func newRect(vp string) (*rtree.Rect, error) {
	// `viewport` is a query string parameter of the form:
	// `swLat,swLng|neLat,neLng`
	var coords = strings.Split(vp, "|")
	sw := strings.Split(coords[0], ",")
	ne := strings.Split(coords[1], ",")

	swLat, err := strconv.ParseFloat(sw[0], 64)
	if err != nil {
		return nil, err
	}
	swLng, err := strconv.ParseFloat(sw[1], 64)
	if err != nil {
		return nil, err
	}
	neLat, err := strconv.ParseFloat(ne[0], 64)
	if err != nil {
		return nil, err
	}
	neLng, err := strconv.ParseFloat(ne[1], 64)
	if err != nil {
		return nil, err
	}
	
	// most negative point
	minLat := math.Min(swLat, neLat)
	minLng := math.Min(swLng, neLng)

	// length & breadth of Rect
	distLat := math.Max(swLat, neLat) - minLat
	distLng := math.Max(swLng, neLng) - minLng

	// Create Rect
	leftPoint := rtree.Point{minLng, minLat}
	dists := []float64{distLng, distLat}
	rect, err := rtree.NewRect(leftPoint, dists)
	if err != nil {
		return nil, err
	}
	return rect, nil
}
