import React from "react";
import { Map, GoogleApiWrapper, Marker, InfoWindow } from "google-maps-react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import PastSearchesCard from "./PastSearchesCard";
import NearbyRestaurantsCard from "./NearbyRestaurantsCard";

// Developer : Shreyas Kapale
/* 
Search Keys 
  
  INFO_WINDOW_METHODS : info window (google maps component) methods which show restaurant name on hover over marker

  GOOGLE_NEARBY_API : google search api method which searches nearby restaurants

  GET_GPS_LOCATION : Method to get gps coordinates 


*/
export class MapContainer extends React.PureComponent {
  // latitude and longitude comes from passed props
  state = {
    center: {},
    markers: null,
    showingInfoWindow: false,
    activeMarker: {},
    selectedPlace: {},
  };

  // ##################### INFO_WINDOW_METHODS_START ############################
  onMarkerClick = (props, marker, e) =>
    this.setState({
      selectedPlace: props,
      activeMarker: marker,
      showingInfoWindow: true,
    });

  onClose = (props) => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null,
      });
    }
  };
  // ##################### INFO_WINDOW_METHODS_END ###############################

  // ##################### GOOGLE_NEARBY_API_START ###############################
  fetchPlaces = (mapProps, map, radius = 10000) => {
    let coordinates = [];
    const { google } = mapProps;
    const service = new google.maps.places.PlacesService(map);
    var request = {
      location: this.state.center,
      radius: radius,
      query: "restaurant",
    };

    service.textSearch(request, (results, status) => {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
          // console.log(results[i]);
          // push each item to the coordinates
          coordinates.push(results[i]);
        }

        // keeps on increasing the range until it reachs 1000 restaurant

        // if(coordinates.length < 999){
        //   radius+=10000
        //   this.fetchPlaces(mapProps,map,radius)
        // }

        this.setState({ markers: coordinates });
      }
    });
  };
  // ##################### GOOGLE_NEARBY_API_END ################################

  // for testing
  // clickMarker = (props, marker) => {
  //   console.log(props.placeId);
  // };

  // ##################### GET_GPS_LOCATION_START ######################################

  getCurrentLocation = () => {
    navigator?.geolocation.getCurrentPosition(
      ({ coords: { latitude: curLat, longitude: curLng } }) => {
        const pos = { lat: curLat, lng: curLng };
        console.log(pos);
        this.setState({ center: pos });

        // get the current city

        fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${curLat},${curLng}&key=${process.env.REACT_APP_GOOGLE_MAP_API_KEY}`
        )
          .then((response) => response.json())
          .then((data) => {
            // save it as last searched city

            if (localStorage.getItem("last_searched") === null) {
              let temp = [
                data.plus_code.compound_code.split(",")[0].split(" ")[1],
              ];
              localStorage.setItem("last_searched", JSON.stringify(temp));
              this.setState({ lastSearch: temp });
            } else {
              let temp = JSON.parse(localStorage.getItem("last_searched"));
              if (temp.length === 10) {
                temp.shift();
              }
              temp.push(
                data.plus_code.compound_code.split(",")[0].split(" ")[1]
              );
              localStorage.setItem("last_searched", JSON.stringify(temp));
              this.setState({ lastSearch: temp });
            }
          });
      }
    );
  };
  // ##################### GET_GPS_LOCATION_END ######################################

  // get past searches after component load
  componentDidMount() {
    if (localStorage.getItem("last_searched") !== null) {
      let temp = JSON.parse(localStorage.getItem("last_searched"));
      this.setState({ lastSearch: temp });
    }
  }

  render() {
    if (!this.props.loaded) return <div>Loading map please wait...</div>;
    return (
      <div>
        <Container>
          <Row>
            <Col lg={6}>
              <br></br>
              <Card>
                <Card.Header as="h5" style={{ backgroundColor: "yellow" }}>
                  Yellow Maps
                </Card.Header>
                <Card.Body>
                  <Card.Title>Instructions</Card.Title>
                  <Card.Text>
                    Click on find nearby button to find nearby restaurants, and
                    click on allow when asked for location permission.
                  </Card.Text>
                  <Button variant="primary" onClick={this.getCurrentLocation}>
                    find nearby
                  </Button>
                  <br />
                  Current location :
                  <Card>
                    <p>
                      {this.state.center.lat},{this.state.center.lng}
                    </p>
                  </Card>
                </Card.Body>
              </Card>
              <br></br>
              <PastSearchesCard lastSearch={this.state.lastSearch} />
              <br></br>
              <NearbyRestaurantsCard markers={this.state.markers} />
            </Col>

            <Col sm={6}>
              <Map
                className="map"
                google={this.props.google}
                center={{
                  lat: this.state.center.lat,
                  lng: this.state.center.lng,
                }}
                onReady={this.fetchPlaces}
                // onBoundsChanged={this.fetchPlaces}
                onCenterChanged={this.fetchPlaces}
                style={{ height: "100%", width: "50%" }}
                zoom={13}
              >
                {this.state.markers != null &&
                  this.state.markers.map((coords) => (
                    <Marker
                      name={coords.name}
                      key={coords.place_id}
                      position={coords.geometry.location}
                      onMouseover={this.onMarkerClick}
                      placeId={coords.place_id}
                    />
                  ))}
                <InfoWindow
                  marker={this.state.activeMarker}
                  visible={this.state.showingInfoWindow}
                  onClose={this.onClose}
                >
                  <div>
                    <h4>{this.state.selectedPlace.name}</h4>
                  </div>
                </InfoWindow>
              </Map>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
})(MapContainer);
