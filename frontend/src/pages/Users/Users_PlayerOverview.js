import React, { useState, useEffect } from 'react';
import { Grid, Container, TableContainer, Typography, Table, TableBody, TableRow, TableCell, Paper } from '@material-ui/core';
import { Form, Card, Alert } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavbarUserPlayer from '../../components/Navbar_UserPlayer'

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
  const [isHorizontalView, setIsHorizontalView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const aspectRatio = width / height;
      setIsHorizontalView(aspectRatio >= 1.2);
      setFontSize(Math.min(24 * width / 1000, 26));
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return { fontSize, isHorizontalView };
};

export default function QnA() {
  const { fontSize, isHorizontalView } = FormatComponent();
  const classes = useStyles(fontSize);
  const { playerID } = useParams();
  const [redirectPath, setRedirectPath] = useState('');
  const [error, setError] = useState('');

  const [playName, setPlayName] = useState('');
  const [socialEvents, setSocialEvents] = useState([[], [], [], [], [], [], []]);
  const [gameEvents, setGameEvents] = useState([[], [], [], [], [], [], [], [], [], [], [], [], [], [], []]);

  const gameSingle = [0, 7, 8]
  const socialSingle = []

  const socialArray = ["Get Withs [+1]", "Activities (Bedroom) [+3]", "x5 Jaegerbombs [+1]", "Races Won [+1]", "Races Lost [-1]", "Chunders [-2]", "Fumbles [-1]"]
  const gameArray = ["MotM [+3]", "Turned Up [+1]", "Played Half [+1]", "Scored [+3]", "Assists [+2]", "Goalie Save [+2]", "Defence Clean Sheet [+3]", "Champagne Moment [+2]", "DotD [-2]", "Yellow Card [-1]", "Red Card [-3]", "Gave Penalty [-3]", "Shitted [-1]", "Own Goal [-2]", "Conceeded 2 goals [-1]"]

  // ----------------------------------------------------------------------------------------------------------------------

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await fetch('/api/userplayerstats/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ itemID: playerID })
        });
        const [data, playerName, gamEvnts, socEvnts] = await resp.json();
        if (data === "Error") {
          console.error('Error: Failed to connect to database');
          setError(true);
        } else if (data === "No") {
          setRedirectPath('/');
        } else {
          setSocialEvents(socEvnts)
          setGameEvents(gamEvnts)
          setPlayName(playerName)
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
      <NavbarUserPlayer />

      <Container maxWidth={false} style={{ padding: '2vh', marginTop: '1vh', width: '95vw', height: '85vh' }}>
        <Typography variant="h6" style={{ fontSize: fontSize, marginBottom: '0.1rem', marginLeft: '1rem' }}>
          {`${playName} Stats`}
        </Typography>
        <Grid container spacing={2} style={{ height: '95%', border: 'none', padding: 0, margin: 0 }}>
          <Grid item xs={12} sm={isHorizontalView ? 6 : 12} style={{ height: isHorizontalView ? '100%' : '50%' }}>
            <div style={{
              height: '100%', width: '100%', flexDirection: 'column',
              ...(isHorizontalView
                ? { display: 'flex', alignItems: 'flex-start' }
                : { display: 'flex', justifyContent: 'center', alignItems: 'flex-start' })
            }}>
              <Container maxWidth={false} style={{ padding: '2vh', maxWidth: '100%', maxHeight: '85%', overflowY: 'scroll' }}>
                <Card>
                  <Card.Body>
                    {error && <Alert variant="danger" style={{ fontSize: fontSize * 0.6 }}>{`An error occured - Please contact +44(0)7446 167 655`}</Alert>}
                    <h2 className="text-center mb-4" style={{ fontSize: fontSize }}>Game Points</h2>
                    <Form>
                      {gameArray.map((eventName, eventInd) => (
                        <div>
                          {(gameEvents[eventInd].length > 0) ? (
                            <>
                              <span style={{ fontSize: fontSize * 0.6, marginRight: '1rem' }}>{`${eventName}: `}</span>
                              <Paper elevation={3} style={{ borderRadius: '15px', padding: '16px' }}>
                                <TableContainer style={{ maxHeight: `${4.2 * fontSize}px`, overflowY: 'scroll' }}>
                                  <Table style={{ tableLayout: "fixed", fontSize: fontSize * 0.6 }}>
                                    <TableBody>
                                      {gameEvents[eventInd].map((gameEvent, index) => (
                                        <TableRow className={classes.tableRow} style={{ backgroundColor: 'white' }}>
                                          <>
                                            <TableCell className={classes.tableCell}>{gameEvent[0]}</TableCell>
                                            <TableCell className={classes.tableCell}>{gameEvent[2]}</TableCell>
                                            {gameSingle.includes(eventInd) ? (null) :
                                              <TableCell className={classes.tableCell}>{`${gameEvent[1]} time(s)`}</TableCell>
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
            </div>
          </Grid>

          <Grid item xs={12} sm={isHorizontalView ? 6 : 12} style={{ height: isHorizontalView ? '100%' : '50%' }}>
            <div style={{
              height: '100%', width: '100%', flexDirection: 'column',
              ...(isHorizontalView
                ? { display: 'flex', alignItems: 'flex-start' }
                : { display: 'flex', justifyContent: 'center', alignItems: 'flex-start' })
            }}>
              <Container maxWidth={false} style={{ padding: '2vh', maxWidth: '100%', maxHeight: '85%', overflowY: 'scroll' }}>
                <Card>
                  <Card.Body>
                    <h2 className="text-center mb-4" style={{ fontSize: fontSize }}>Social Points</h2>
                    <Form>
                      {socialArray.map((eventName, eventInd) => (
                        <div>
                          {(socialEvents[eventInd].length > 0) ? (
                            <>
                              <span style={{ fontSize: fontSize * 0.6, marginRight: '1rem' }}>{`${eventName}: `}</span>
                              <Paper elevation={3} style={{ borderRadius: '15px', padding: '16px' }}>
                                <TableContainer style={{ maxHeight: `${4.2 * fontSize}px`, overflowY: 'scroll' }}>
                                  <Table style={{ tableLayout: "fixed", fontSize: fontSize * 0.6 }}>
                                    <TableBody>
                                      {socialEvents[eventInd].map((socailEvent, index) => (
                                        <TableRow className={classes.tableRow} style={{ backgroundColor: 'white' }}>
                                          <>
                                            <TableCell className={classes.tableCell}>{socailEvent[0]}</TableCell>
                                            <TableCell className={classes.tableCell}>{socailEvent[2]}</TableCell>
                                            {socialSingle.includes(eventInd) ? (null) :
                                              <TableCell className={classes.tableCell}>{`${socailEvent[1]} time(s)`}</TableCell>
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
            </div>
          </Grid>
        </Grid>
      </Container >
    </div >
  );
}