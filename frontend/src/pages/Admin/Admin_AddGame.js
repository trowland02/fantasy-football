import React, { useState, useEffect } from 'react';
import { Container, TableContainer, Table, TableBody, TableRow, TableCell, Paper } from '@material-ui/core';
import { Button, Form, Card, Alert, Row, Col, FormControl, InputGroup } from 'react-bootstrap';
import { makeStyles } from '@material-ui/core/styles';
import 'bootstrap/dist/css/bootstrap.min.css';
import Dropdown from 'react-bootstrap/Dropdown';
import NavbarAdminGame from '../../components/Navbar_AdminGame'

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

export default function AddGame() {
  const { fontSize } = FormatComponent();
  const classes = useStyles(fontSize);
  const [loading, setLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState('');
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('');
  const [players, setPlayers] = useState([]);

  const [gameDetails, setGameDetails] = useState(['', '', '', 0, 0, '']);
  // location, opponent, opp, wescored, theyscored, date

  const [events, setEvents] = useState([[], [], [], [], [], [], [], [], [], [], [], [], [], [], []]);
  const singleEvent = [0, 7, 8]

  const formsArray = ["MotM [+3]", "Turned Up [+1]", "Played Half [+1]", "Scored [+3]", "Assists [+2]", "Goalie Save [+2]", "Defence Clean Sheet [+3]", "Champagne Moment [+2]", "DotD [-2]", "Yellow Card [-1]", "Red Card [-3]", "Gave Penalty [-3]", "Shitted [-1]", "Own Goal [-2]", "Conceded 2 goals [-1]"]
  // pointsList = [MotM[+3], turnedUp[+1], halfGame[+1], scored[+3], assist[+2], goalieSave[+2], defenceCleanSheet[+3], champagne[+2], DotD[-2], yellow[-1], red[-1], penalty[-3], shitter[-1], ownGoal[-2], 2xConcede[-1]]

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
    if ((gameDetails[0] === '') || (gameDetails[1] === '') || (gameDetails[2] === '') || (gameDetails[5] === '')) {
      setError('Field left empty (opponent/date/location)')
    } else {
      try {
        const resp = await fetch('/api/addgame/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ details: gameDetails, eventList: events })
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

  const handleScoreChange = (value, changeIndex) => {
    if (value < 0 && gameDetails[changeIndex] > 0) {
      setGameDetails(gameDetails.map((item, index) => index === changeIndex ? item - 1 : item));
    }
    if (value > 0) {
      setGameDetails(gameDetails.map((item, index) => index === changeIndex ? item + 1 : item));
    }

  };

  const handleInputChange = (e, changeIndex) => {
    const value = e.target.value;
    setGameDetails(gameDetails.map((item, index) => index === changeIndex ? value : item));
  };

  const handleLocChange = (e, loc) => {
    setGameDetails(gameDetails.map((item, index) => index === 0 ? loc : item));
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
      <NavbarAdminGame />
      <Container maxWidth={false} style={{ padding: '2vh', width: '1000px', maxWidth: '95vw%', maxHeight: '85vh', overflowY: 'scroll' }}>
        <Card>
          <Card.Body>
            {success && <Alert variant="success" style={{ fontSize: fontSize * 0.6 }}>Game Added</Alert>}
            {error && <Alert variant="danger" style={{ fontSize: fontSize * 0.6 }}>{error}</Alert>}
            <h2 className="text-center mb-4" style={{ fontSize: fontSize }}>Add Game</h2>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Col>
                  <Form.Label>Opponent: </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="'Royal School of Mines'"
                    value={gameDetails[1]}
                    onChange={(e) => handleInputChange(e, 1)}
                  />
                </Col>
                <Col>
                  <Form.Label>Short-Hand: </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="'RSM'"
                    value={gameDetails[2]}
                    onChange={(e) => handleInputChange(e, 2)}
                  />
                </Col>
                <Col>
                  <Form.Label>Location: </Form.Label>
                  <Dropdown className="d-inline mx-2 text-center" autoClose="outside" style={{ fontSize: fontSize }}>
                    <Dropdown.Toggle id="dropdown-autoclose-outside">
                      {gameDetails[0] === '' ? `Select Location: ` : gameDetails[0]}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item
                        key='HOME'
                        href='#/HOME' // Use eventKey for href
                        onClick={(e) => handleLocChange(e, 'HOME')}>
                        HOME
                      </Dropdown.Item>
                      <Dropdown.Item
                        key='AWAY'
                        href='#/AWAY' // Use eventKey for href
                        onClick={(e) => handleLocChange(e, 'AWAY')}>
                        AWAY
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col>
                  <Form.Label>Date Picker: </Form.Label>
                  <Form.Control
                    type="date"
                    value={gameDetails[5]}
                    onChange={(e) => handleInputChange(e, 5)}
                  />
                </Col>
                <Col>
                  <Form.Label>We Scored:</Form.Label>
                  <InputGroup className="mb-3">
                    <Button variant="outline-primary" onClick={() => handleScoreChange(-1, 3)}>-</Button>
                    <FormControl
                      type="text"
                      value={gameDetails[3]}
                      readOnly
                    />
                    <Button variant="outline-primary" onClick={() => handleScoreChange(1, 3)}>+</Button>
                  </InputGroup>
                </Col>
                <Col>
                  <Form.Label>They Scored:</Form.Label>
                  <InputGroup className="mb-3">
                    <Button variant="outline-danger" onClick={() => handleScoreChange(-1, 4)}>-</Button>
                    <FormControl
                      type="text"
                      value={gameDetails[4]}
                      readOnly
                    />
                    <Button variant="outline-danger" onClick={() => handleScoreChange(1, 4)}>+</Button>
                  </InputGroup>
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

              <Button disabled={loading || success} variant="primary" className="w-100" type="submit" style={{ fontSize: fontSize * 0.6 }}>
                {success ? 'Game Added' : 'Add Game'}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container >
    </div >
  );
}