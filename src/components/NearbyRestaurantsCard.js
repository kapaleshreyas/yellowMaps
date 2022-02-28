import { Card } from "react-bootstrap";

export default function NearbyRestaurantsCard(props) {
  return (
    <Card>
      <Card.Body>
        <Card.Title>Nearby Restaurants</Card.Title>
        <Card.Text style={{ overflowY: "scroll", height: "100px" }}>
          {props.markers != null &&
            props.markers.map((coords) => <Card>{coords.name}</Card>)}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}
