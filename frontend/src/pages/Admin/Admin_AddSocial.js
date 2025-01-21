import React, { useState, useEffect } from 'react';
import { Container, TableContainer, Table, TableBody, TableRow, TableCell, Paper } from '@material-ui/core';
import { Button, Form, Card, Alert, Row, Col } from 'react-bootstrap';
import { makeStyles } from '@material-ui/core/styles';
import 'bootstrap/dist/css/bootstrap.min.css';
import Dropdown from 'react-bootstrap/Dropdown';
import NavbarAdminSocial from '../../components/Navbar_AdminSocial'

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
  const classes = useStyles(fontSize);
  const [loading, setLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState('');
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('');
  const [players, setPlayers] = useState([]);

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
        const resp = await fetch('/api/getplayers/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify()
        });
        const [data, players] = await resp.json();
        if (data === "Error") {
          console.error('Error: Failed to connect to database');
          setError('An error occured - Please contact +44(0)7446 167 655');
        } else if (data === "No") {
          setRedirectPath('/');
        } else {
          setPlayers(players)
        }

      } catch (error) {
        console.error('Error:', error);
        setError('An error occured - Please contact +44(0)7446 167 655');
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {

    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');
    if ((socialDetails[0] === '') || (socialDetails[1] === '') || (socialDetails[2] === '') || (socialDetails[5] === '')) {
      setError('Field left empty (opponent/date/location)')
    } else {
      try {
        const resp = await fetch('/api/addsocial/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ details: socialDetails, eventList: events })
        });
        const data = await resp.json();

        // Update the state with the extracted values
        if (data === "Error") {
          console.error('Error: Failed to connect to database');
          setError('An error occured - Please contact +44(0)7446 167 655');
        } else if (data === "No") {
          setRedirectPath('/');
        } else {
          setSuccess(true)
        }
      } catch (error) {
        console.error('Error:', error);
        setError('An error occured - Please contact +44(0)7446 167 655');
      }
    }
    setLoading(false); // Hide loading sign after the responses are generated
  };

  const handleNewEvent = (e, playIndex, eventIndex) => {
    if (singleEvent.includes(eventIndex)) {
      setEvents(events.map((item, index) => index === eventIndex ? [[players[playIndex][0], players[playIndex][1], 1]] : item));
    } else {
      var updatedEvents = events
      if (updatedEvents[eventIndex].map(item => item[0]).includes(players[playIndex][0])) {
        var currEvent = updatedEvents[eventIndex]

        currEvent = currEvent.map((item, index) => item[0] === players[playIndex][0] ? [item[0], item[1], item[2] + 1] : item);
        updatedEvents = updatedEvents.map((item, index) => index === eventIndex ? currEvent : item);
        setEvents(updatedEvents)
      }
      else {
        updatedEvents[eventIndex].push([players[playIndex][0], players[playIndex][1], 1])
        setEvents(updatedEvents)
      }
    }
  };

  const handleDeleteEvent = (playIndex, eventIndex) => {

    if (singleEvent.includes(eventIndex)) {
      setEvents(events.map((item, index) => index === eventIndex ? [] : item));
    } else {
      var updatedEvents = events
      var currEvent = updatedEvents[eventIndex]

      currEvent = currEvent.filter((item, index) => item[0] !== playIndex);
      updatedEvents = updatedEvents.map((item, index) => index === eventIndex ? currEvent : item);
      setEvents(updatedEvents)
    }
  };

  const handleInputChange = (e, changeIndex) => {
    const value = e.target.value;
    setSocialDetails(socialDetails.map((item, index) => index === changeIndex ? value : item));
  };

  useEffect(() => {
    if (redirectPath) {
      const link = document.createElement('a');
      link.href = redirectPath;
      link.click();
    }
  }, [redirectPath]);

  return (
    <div className="non-scrollable-container">
      <NavbarAdminSocial />
      <Container maxWidth={false} style={{ padding: '2vh', width: '1000px', maxWidth: '95vw%', maxHeight: '85vh', overflowY: 'scroll' }}>
        <Card>
          <Card.Body>
            {success && <Alert variant="success" style={{ fontSize: fontSize * 0.6 }}>Social Added</Alert>}
            {error && <Alert variant="danger" style={{ fontSize: fontSize * 0.6 }}>{error}</Alert>}
            <h2 className="text-center mb-4" style={{ fontSize: fontSize }}>Add Socail</h2>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Col>
                  <Form.Label>Location: </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="'Slug'"
                    value={socialDetails[0]}
                    onChange={(e) => handleInputChange(e, 0)}
                  />
                </Col>
                <Col>
                  <Form.Label>Date Picker: </Form.Label>
                  <Form.Control
                    type="date"
                    value={socialDetails[1]}
                    onChange={(e) => handleInputChange(e, 1)}
                  />
                </Col>
              </Row>


              {/* Input for number of goals we scored, number they scored, the opponent, an abbreviation for the opponent and the date */}
              {formsArray.map((eventName, eventInd) => (
                <div>
                  <span style={{ fontSize: fontSize * 0.6, marginRight: '1rem' }}>{`${eventName}: `}</span>
                  <Dropdown className="d-inline mx-2 text-center" autoClose="outside" style={{ fontSize: fontSize }}>
                    <Dropdown.Toggle id="dropdown-autoclose-outside">
                      Select Player:
                    </Dropdown.Toggle>
                    <Dropdown.Menu style={{ maxHeight: '22vh', overflowY: 'auto' }}>
                      {players.map((player, playerInd) => {
                        // Check if the player ID is not in the fantasy team before rendering
                        const eventKey = `${player[0]}`;
                        return (
                          <Dropdown.Item
                            key={eventKey}
                            href={`#/${eventKey}`} // Use eventKey for href
                            onClick={(e) => handleNewEvent(e, playerInd, eventInd)}>
                            {player[1]}
                          </Dropdown.Item>
                        );
                      })}
                    </Dropdown.Menu>
                  </Dropdown>
                  {(events[eventInd].length > 0) ? (
                    <>
                      <Paper elevation={3} style={{ borderRadius: '15px', padding: '16px' }}>
                        <TableContainer style={{ maxHeight: `${4.2 * fontSize}px`, overflowY: 'scroll' }}>
                          <Table style={{ tableLayout: "fixed", fontSize: fontSize * 0.6 }}>
                            <TableBody>
                              {events[eventInd].map((eventPlayer, index) => (
                                <TableRow key={index} className={classes.tableRow} style={{ backgroundColor: index % 2 === 0 ? '#f2f2f2' : 'white' }}>
                                  <>
                                    <TableCell className={classes.tableCell}>{eventPlayer[1]}</TableCell>
                                    {singleEvent.includes(eventInd) ? (null) :
                                      <TableCell className={classes.tableCell}>{eventPlayer[2]}</TableCell>
                                    }
                                    <TableCell className={classes.tableCell}>
                                      <div style={{ display: 'flex' }}>
                                        <Button disabled={loading} onClick={() => handleDeleteEvent(eventPlayer[0], eventInd)} style={{ fontSize: fontSize * 0.6 }}>X</Button>
                                      </div>
                                    </TableCell>
                                  </>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Paper>
                    </>
                  ) : (null)}
                  <hr />
                </div>
              ))}

              <Button disabled={loading || success} type="submit" style={{ fontSize: fontSize * 0.6 }}>
                {success ? 'Socail Added' : 'Add Socail'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container >
    </div >
  );
}