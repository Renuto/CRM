import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import BarNav from "./components/SideBar/BarNav";
import "./App.css";

function App() {
  return (
    <Container fluid>
      <Row fluid>
        <Col id="sidebarMenu" className="d-md-block p-0 collapse" md="auto">
          <BarNav/>
        </Col>

        <Col className="ms-sm-auto px-md-4 bg-light" md="auto">
          <Row>Text</Row>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
