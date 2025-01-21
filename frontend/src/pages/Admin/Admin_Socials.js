import React, { useEffect, useState } from 'react';
import NavbarAdmin from "../../components/Navbar_Admin";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button, Card, Container, Alert } from 'react-bootstrap';
import { Link } from "react-router-dom"

const FormatComponent = () => {
  const [fontSize, setFontSize] = useState(16);
  const [containerSize, setContainerSize] = useState(400)

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setFontSize(Math.min(22 * width / 1000, 22));
      if (width > 960) {
        setContainerSize(400);
      } else if (width > 800) {
        setContainerSize(width / 2.4);
      } else if (width < 600) {
        setContainerSize(width * 0.8);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return { fontSize, containerSize };
};

export default function Socials() {
  const { fontSize, containerSize } = FormatComponent();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(false);
  const [redirectPath, setRedirectPath] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await fetch('/api/socials/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify()
        });
        const [data, receivedEvents] = await resp.json();

        // Update the state with the extracted values
        if (data === "Error") {
          console.error('Error: Failed to connect to database');
          setError(true);
        } else if (data === "No") {
          setRedirectPath('/');
        } else {
          setEvents(receivedEvents);
        }
      } catch (error) {
        console.error('Error:', error);
        setError(true);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (redirectPath) {
      const link = document.createElement('a');
      link.href = redirectPath;
      link.click();
    }
  }, [redirectPath]);

  return (
    <div className="non-scrollable-container">
      <>
        <NavbarAdmin />
        {error && <Alert variant="danger" style={{ fontSize: fontSize * 0.6 }}>{`An error occured - Please contact +44(0)7446 167 655`}</Alert>}
        <Container style={{ height: '85vh' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: "center", marginTop: "0.6rem" }}>
            <Button onClick={() => setRedirectPath('/admin/socials/addsocial')} style={{ fontSize: fontSize * 0.8 }}>Add Social</Button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
            {[...Array(27).keys()].map((indexOut) => (
              <span
                key={indexOut}
                style={{
                  fontSize: fontSize,
                  fontWeight: 'bold',
                  margin: Math.min((5 * fontSize / 24), 5),
                  cursor: events[indexOut] && events[indexOut].length > 0 ? 'pointer' : 'default',
                  color: events[indexOut] && events[indexOut].length > 0 ? 'blue' : 'black',
                  textDecoration: events[indexOut] && events[indexOut].length > 0 ? 'underline' : 'none'
                }}
                onClick={() =>
                  events[indexOut]?.length > 0 && (window.location.href = `#${indexOut === 26 ? 'Other' : String.fromCharCode(indexOut + 65)}`)
                }
              >
                {indexOut === 26 ? 'Other' : String.fromCharCode(indexOut + 65)}
              </span>
            ))}
          </div>

          <Container style={{ height: 'calc(90% - 4rem)' }}>
            <div style={{ maxHeight: '100%', overflowY: 'scroll' }}>
              {events.map((eventList, indexOut) => (
                <div key={indexOut}>
                  {Array.isArray(eventList) && eventList.length > 0 && (
                    <>
                      <div id={indexOut === 26 ? 'Other' : String.fromCharCode(indexOut + 65)} style={{ textAlign: 'left', fontSize: fontSize, fontWeight: 'bold', margin: '20px' }}>
                        {indexOut === 26 ? 'Other' : String.fromCharCode(indexOut + 65)}
                      </div>
                      <Container className="d-flex flex-wrap align-items-center justify-content-center">
                        {eventList.map((event, indexIn) => (
                          <div key={indexIn} className="mx-3 my-3">
                            <Card style={{ width: containerSize }}>
                              <Card.Body>
                                <Form name="edit" >
                                  <Form.Group id="class">
                                    <Form.Label style={{ fontSize: Math.max(fontSize * 0.8, 14) }}>{event[1]}</Form.Label>
                                    <br />
                                    <Form.Label style={{ fontSize: Math.max(fontSize * 0.8, 14) }}>{event[2]}</Form.Label>
                                    <br />
                                  </Form.Group>
                                  <Form.Group>
                                    <div>
                                      <Link to={`/admin/socials/${event[0]}`}>
                                        <Button className="w-100" type="submit" style={{ fontSize: Math.max(fontSize * 0.9, 14) }}>
                                          Details
                                        </Button>
                                      </Link>
                                    </div>
                                  </Form.Group>
                                </Form>
                              </Card.Body>
                            </Card>
                          </div>
                        ))}
                      </Container>
                      <hr />
                    </>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </Container>
      </>
      {redirectPath && <Link to={redirectPath} style={{ display: 'none' }}></Link>}
    </div>
  );
}
