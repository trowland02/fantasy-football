import React, { useState, useEffect } from 'react';
import { Container, TableContainer, Table, TableBody, TableRow, TableCell, Paper } from '@material-ui/core';
import { Form, Card, Alert, Row, Col } from 'react-bootstrap';
import { makeStyles } from '@material-ui/core/styles';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavbarUserSocial from '../../components/Navbar_UserSocial'

const useStyles = makeStyles((theme) => ({
  tableRow: {
    height: (fontSize) => fontSize * 1.2,
  },
  tableCell: {
    padding: '5px',
  },
}));

const FormatComponent = () => {
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setFontSize(Math.max(Math.min(24 * width / 1000, 24), 12));
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return { fontSize };
};

export default function AddSocial() {
  const { fontSize } = FormatComponent();
  const { socialID } = useParams();
  const classes = useStyles(fontSize);
  const [redirectPath, setRedirectPath] = useState('');
  const [error, setError] = useState('');

  const [socialDetails, setSocialDetails] = useState(['', '']);
  // location, opponent, opp, wescored, theyscored, date

  const [events, setEvents] = useState([[], [], [], [], [], [], []]);
  const singleEvent = []

  const formsArray = ["Get Withs [+1]", "Activities (Bedroom) [+3]", "x5 Jaegerbombs [+1]", "Races Won [+1]", "Races Lost [-1]", "Chunders [-2]", "Fumbles [-1]"]
  // pointsList = [getWiths[+1], activitites[+3], drinks[+1], racesWon[+1], racesLost[-1], chunders[-1], fumbles[-1]]
  // ----------------------------------------------------------------------------------------------------------------------

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await fetch('/api/socialoverview/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itemID: socialID })
        });
        const [data, details, evts] = await resp.json();
        if (data === "Error") {
          console.error('Error: Failed to connect to database');
          setError(true);
        } else if (data === "No") {
          setRedirectPath('/');
        } else if (data === "False") {
          setRedirectPath('/users/socials');
        } else {
          setSocialDetails(details)
          setEvents(evts)
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
      <NavbarUserSocial />
      <Container maxWidth={false} style={{ padding: '2vh', width: '1000px', maxWidth: '95vw%', maxHeight: '85vh', overflowY: 'scroll' }}>
        <Card>
          <Card.Body>
            {error && <Alert variant="danger" style={{ fontSize: fontSize * 0.6 }}>{`An error occured - Please contact +44(0)7446 167 655`}</Alert>}
            <h2 className="text-center mb-4" style={{ fontSize: fontSize }}>Add Socail</h2>
            <Form>
              <Row className="mb-3">
                <Col>
                  <Form.Label>Location: </Form.Label>
                  <Form.Control
                    type="text"
                    value={socialDetails[0]}
                    readOnly
                  />
                </Col>
                <Col>
                  <Form.Label>Date: </Form.Label>
                  <Form.Control
                    type="text"
                    value={`${socialDetails[1].split('-')[2]}/${socialDetails[1].split('-')[1]}/${socialDetails[1].split('-')[0]}`}
                    readOnly
                  />
                </Col>
              </Row>
              <hr />

              {formsArray.map((eventName, eventInd) => (
                <div>
                  {(events[eventInd].length > 0) ? (
                    <>
                      <span style={{ fontSize: fontSize * 0.6, marginRight: '1rem' }}>{`${eventName}: `}</span>
                      <Paper elevation={3} style={{ borderRadius: '15px', padding: '16px' }}>
                        <TableContainer style={{ maxHeight: `${4.2 * fontSize}px`, overflowY: 'scroll' }}>
                          <Table style={{ tableLayout: "fixed", fontSize: fontSize * 0.6 }}>
                            <TableBody>
                              {events[eventInd].map((eventPlayer, index) => (
                                <TableRow key={index} className={classes.tableRow} style={{ backgroundColor: index % 2 === 0 ? '#f2f2f2' : 'white' }}>
                                  <>
                                    <TableCell className={classes.tableCell}>{eventPlayer[0]}</TableCell>
                                    {singleEvent.includes(eventInd) ? (null) :
                                      <TableCell className={classes.tableCell}>{eventPlayer[1]}</TableCell>
                                    }
                                  </>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Paper>
                    </>
                  ) : (null)}
                </div>
              ))}
            </Form>
          </Card.Body>
        </Card>
      </Container >
    </div >
  );
}