import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "./App.css";

function App() {
  return (
    <Container fluid>
      <Row fluid>
        <Col
          id="sidebarMenu"
          className="d-md-block collapse sidebar block-color "
          md={3}
          lg={2}
        >
          Text
        </Col>
        <Col 
          className="ms-sm-auto px-md-4 block-color bg-light"
          md={9}
          lg={10}
        >
          Text
        </Col>
      </Row>
    </Container>
  );
}

export default App;
