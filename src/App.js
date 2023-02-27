import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import BarNav from "./components/sideBar/BarNav";
import Header from "./components/header/Header";
import DataTable from "./components/DataTable/DataTable";
import { useState } from "react";
import "./App.css";

function App() {
  const [collapsed, setCollapsed] = useState(true);
  const isBarCollapsed = (isCollapsed) => {
    setCollapsed(isCollapsed);
    console.log(collapsed);
  };
  return (
    <Container
      fluid
      style={{ background: "rgb(243, 243, 243)" }}
    >
      <Row fluid className="d-flex flex-row">
        <Col
          id="sidebarMenu"
          className="sidebar d-lg-block p-0 collapse"
          md="auto"
        >
          <BarNav collapseHandler={isBarCollapsed} />
        </Col>

        <Col
          className={`home ${
            collapsed ? "home-section-bar-open" : "home-section"
          }`}
        >
          <Row>
            <Header />
            <DataTable />
          </Row>
        </Col>
        {/* <div className={`home ${collapsed ? "home-section-bar-open" : "home-section"}`}> Text </div> */}
      </Row>
    </Container>
  );
}

export default App;
