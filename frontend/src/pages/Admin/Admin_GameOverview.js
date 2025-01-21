import React, { useState, useEffect } from 'react';
import { Container, TableContainer, Table, TableBody, TableRow, TableCell, Paper } from '@material-ui/core';
import { Form, Card, Alert, Row, Col } from 'react-bootstrap';
import { makeStyles } from '@material-ui/core/styles';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useParams } from "react-router-dom"
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
  const { gameID } = useParams();
  const classes = useStyles(fontSize);
  const [redirectPath, setRedirectPath] = useState('');
  const [error, setError] = useState('');

  const [gameDetails, setGameDetails] = useState(['', '', '', 0, 0, '']);
  // location, opponent, opp, wescored, theyscored, date

  const [events, setEvents] = useState([[], [], [], [], [], [], [], [], [], [], [], [], [], [], []]);
  const singleEvent = [0, 7, 8]

  const formsArray = ["MotM [+3]", "Turned Up [+1]", "Played Half [+1]", "Scored [+3]", "Assists [+2]", "Goalie Save [+2]", "Defence Clean Sheet [+3]", "Champagne Moment [+2]", "DotD [-2]", "Yellow Card [-1]", "Red Card [-3]", "Gave Penalty [-3]", "Shitted [-1]", "Own Goal [-2]", "Conceeded 2 goals [-1]"]
  // pointsList = [MotM[+3], turnedUp[+1], halfGame[+1], scored[+3], assist[+2], goalieSave[+2], defenceCleanSheet[+3], champagne[+2], DotD[-2], yellow[-1], red[-1], penalty[-3], shitter[-1], ownGoal[-2], 2xConceed[-1]]

  // ----------------------------------------------------------------------------------------------------------------------

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await fetch('/api/gameoverview/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itemID: gameID })
        });
        const [data, details, evts] = await resp.json();
        if (data === "Error") {
          console.error('Error: Failed to connect to database');
          setError(true);
        } else if (data === "No") {
          setRedirectPath('/');
        } else if (data === "False") {
          setRedirectPath('/admin/games');
        } else {
          setGameDetails(details)
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
      <NavbarAdminGame />
      <Container maxWidth={false} style={{ padding: '2vh', width: '1000px', maxWidth: '95vw%', maxHeight: '85vh', overflowY: 'scroll' }}>
        <Card>
          <Card.Body>
            {error && <Alert variant="danger" style={{ fontSize: fontSize * 0.6 }}>{`An error occured - Please contact +44(0)7446 167 655`}</Alert>}
            <h2 className="text-center mb-4" style={{ fontSize: fontSize }}>{`RSM: ${gameDetails[3]} - ${gameDetails[2]}: ${gameDetails[4]}`}</h2>
            <Form>
              <Row className="mb-3">
                <Col>
                  <Form.Label>Location: </Form.Label>
                  <Form.Control
                    type="text"
                    value={gameDetails[0]}
                    readOnly
                  />
                </Col>
                <Col>
                  <Form.Label>Date: </Form.Label>
                  <Form.Control
                    type="text"
                    value={`${gameDetails[5].split('-')[2]}/${gameDetails[5].split('-')[1]}/${gameDetails[5].split('-')[0]}`}
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