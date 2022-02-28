import { Card } from "react-bootstrap";

export default function PastSearchesCard(props) {
  return (
    <Card>
      <Card.Body>
        <Card.Title>Past Searches</Card.Title>
        <Card.Text>
          given below are the list of locations from where you searched last
          searched from.
        </Card.Text>
        <Card.Text style={{ overflowY: "scroll", height: "100px" }}>
          {props.lastSearch != null &&
            props.lastSearch.map((i) => <Card>{i}</Card>)}
        </Card.Text>
      </Card.Body>
    </Card>
  );
}
