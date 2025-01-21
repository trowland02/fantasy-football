import React, { useState, useEffect } from "react";
import NavbarUser from "../../components/Navbar_User";
import { CircularProgress } from '@material-ui/core'
import { Grid, Button, Container, Typography, Table, TableBody, TableRow, TableCell } from '@material-ui/core';
import { Alert } from 'react-bootstrap';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';
import { MDBCol, MDBContainer, MDBRow, MDBCard, MDBCardTitle, MDBCardText, MDBCardBody, MDBCardImage } from 'mdb-react-ui-kit';

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
  const [redirectPath, setRedirectPath] = useState('')
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Loading state

  const [fantasyTeam, setFantasyTeam] = useState([])
  const [players, setPlayers] = useState([])
  const [captainIndex, setCaptainIndex] = useState(null);
  const [budget, setBudget] = useState(0)
  const [moneyLeft, setMoneyLeft] = useState(0)

  const [leaderboard, setLeaderboard] = useState([]);

  function sumCostColumn(array) {
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
      sum += array[i][4]; // Assuming the second column is at index 1
    }
    return sum;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await fetch('/api/gethomepage/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify()
        });
        const [data, team, capID, all_budg, plays, leaderb] = await resp.json();
        if (data === "Error") {
          console.error('Error: Failed to connect to database');
          setError('An error occured - Please contact +44(0)7446 167 655');
        } else if (data === "No") {
          setRedirectPath('/');
        } else {
          setFantasyTeam(team);
          setPlayers(plays);

          setCaptainIndex(capID)
          setBudget(all_budg)
          setLeaderboard(leaderb)

          setMoneyLeft(all_budg - sumCostColumn(team))
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
    setError('')
    try {
      const resp = await fetch('/api/changeteam/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ team: fantasyTeam.map((subArray) => subArray[0]), capID: captainIndex, budgLeft: moneyLeft })
      });
      const [data] = await resp.json();

      // Update the state with the extracted values
      if (data === "Error") {
        console.error('Error: Failed to connect to database');
        setError('An error occured - Please contact +44(0)7446 167 655');
      } else if (data === "No") {
        setRedirectPath('/');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occured - Please contact +44(0)7446 167 655');
    }
    setLoading(false); // Hide loading sign after the responses are generated
  };

  const handlePlayClick = async (e, teamIndex, playerIndex) => {
    if (fantasyTeam[teamIndex][0] === captainIndex) {
      setCaptainIndex(-1)
    }
    const updatedFantasyTeam = fantasyTeam.map((element, index) =>
      index === teamIndex ? players[playerIndex] : element
    );

    setFantasyTeam(updatedFantasyTeam);
    setMoneyLeft(budget - sumCostColumn(updatedFantasyTeam));
  };

  const handleCaptainClick = (e, teamIndex) => {
    setCaptainIndex(teamIndex);
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
      <NavbarUser />
      <Container maxWidth={false} style={{ padding: '2vh', marginTop: '1vh', width: '95vw', height: '85vh' }}>
        <Grid container spacing={2} style={{ height: '100%', border: 'none', padding: 0, margin: 0 }}>
          <Grid item xs={12} sm={isHorizontalView ? 6 : 12} style={{ height: isHorizontalView ? '100%' : '50%' }}>
            {error && <Alert variant="danger" style={{ fontSize: fontSize * 0.6 }}>{error}</Alert>}
            <div style={{
              height: '100%', width: '100%', flexDirection: 'column',
              ...(isHorizontalView
                ? { display: 'flex', alignItems: 'flex-start' }
                : { display: 'flex', justifyContent: 'center', alignItems: 'flex-start' })
            }}>
              <Typography variant="h6" style={{ fontSize: fontSize, marginBottom: '0.1rem', marginLeft: '1rem' }}>
                User Leaderboard:
              </Typography>
              <Container className="d-flex flex-wrap justify-content-center" style={{ marginTop: '1vh', maxWidth: '100%', width: '700px', fontSize: fontSize * 0.7, height: 'calc(100% - 3rem)' }}>
                <div style={{ maxHeight: '85%', overflowY: 'scroll' }}>
                  <Table style={{ tableLayout: "fixed", fontSize: fontSize * 0.6 }}>
                    <TableBody>
                      {leaderboard.map((leadUser, index) => (
                        <TableRow key={index} className={classes.tableRow} style={{ backgroundColor: index % 2 === 0 ? '#f2f2f2' : 'white' }}>
                          <TableCell className={classes.tableCell}>{leadUser[1]}</TableCell>
                          <TableCell className={classes.tableCell}>{leadUser[2]} Points</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Container>
            </div>
          </Grid>
          <Grid item xs={12} sm={isHorizontalView ? 6 : 12} style={{ height: isHorizontalView ? '100%' : '50%' }}>
            <div style={{
              height: '100%', width: '100%', flexDirection: 'column',
              ...(isHorizontalView
                ? { display: 'flex', alignItems: 'flex-start' }
                : { display: 'flex', justifyContent: 'center', alignItems: 'flex-start' })
            }}>
              <Typography variant="h6" style={{ fontSize: fontSize, marginBottom: '0.1rem', marginLeft: '1rem' }}>
                Your Fantasy Team:
              </Typography>
              <MDBContainer style={{ marginTop: '1vh', width: '100%', fontSize: fontSize * 0.7, height: '80%' }}>
                <div style={{ maxHeight: '100%', overflowY: 'scroll',  maxWidth: '100%' }}>
                  <MDBRow className="justify-content-center">
                    {fantasyTeam.map((teamPlayer, teamIndex) => (
                      <MDBCol key={teamIndex} md="4" lg="4" xl="4">
                        <MDBCard style={{ borderRadius: '15px' }}>
                          <MDBCardBody className="p-4">
                            <div className="d-flex text-black">
                              <div className="flex-shrink-1">
                                {(teamPlayer[0] === -2) ? (
                                  <MDBCardImage
                                    style={{
                                      maxWidth: '100%', // Set maximum width
                                      maxHeight: 'auto', // Set maximum height
                                      width: '150px',
                                      height: 'auto',
                                      borderRadius: '10px',
                                    }}
                                    src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-profiles/avatar-1.webp"
                                    alt="Generic placeholder image"
                                    fluid
                                  />
                                ) : (
                                  <MDBCardImage
                                    style={{
                                      maxWidth: '100%', // Set maximum width
                                      maxHeight: 'auto', // Set maximum height
                                      width: '150px',
                                      height: 'auto',
                                      borderRadius: '10px',
                                    }}
                                    src={`https://iclfantasypictures.s3.eu-west-2.amazonaws.com/profilePics/player${teamPlayer[0]}.png`}
                                    alt={`User Profile: Player ${teamPlayer[0]}`}
                                    fluid
                                  />
                                )}

                              </div>
                              <div className="flex-grow-1 ms-3">

                                <MDBCardTitle style={{ color: `${captainIndex === -1 ? 'black' : (teamPlayer[0] === captainIndex ? 'red' : 'black')}` }}>
                                  {`${captainIndex === -1 ? '' : (teamPlayer[0] === captainIndex ? 'CPTN: ' : '')}${teamPlayer[1]} ${teamPlayer[2]}`}
                                </MDBCardTitle>
                                <MDBCardText>{teamPlayer[5]}</MDBCardText>
                              </div>
                            </div>

                            <div className="d-flex justify-content-between rounded-3 p-2 mt-4"
                              style={{ backgroundColor: '#efefef' }}>
                              <div>
                                <p className="mb-0">Points: {teamPlayer[3]}pts</p>
                                <p className="mb-0">Cost: £{teamPlayer[4]}</p>
                              </div>
                            </div>
                            <div className="d-flex justify-content-between mt-4">
                              <Dropdown className="d-inline mx-2 text-center" autoClose="outside">
                                <Dropdown.Toggle id="dropdown-autoclose-outside">
                                  Change Player
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  {players.map((player, playerIndex) => {
                                    // Check if the player ID is not in the fantasy team before rendering
                                    const isPlayerInTeam = fantasyTeam.some((subArray) => subArray[0] === player[0]);
                                    if (!isPlayerInTeam) {
                                      const eventKey = `${teamIndex}-${playerIndex}`;
                                      return (
                                        <Dropdown.Item
                                          key={eventKey}
                                          href={`#/${eventKey}`} // Use eventKey for href
                                          onClick={(e) => handlePlayClick(e, teamIndex, playerIndex)}
                                        >
                                          {`${player[1]} ${player[2]} - £${player[4]}`}
                                        </Dropdown.Item>
                                      );
                                    }
                                    return null; // Render nothing if the player is already in the team
                                  })}
                                </Dropdown.Menu>
                              </Dropdown>
                            </div>

                          </MDBCardBody>
                        </MDBCard>
                      </MDBCol>
                    ))}
                  </MDBRow>
                </div>
              </MDBContainer>
              <Dropdown className="d-inline mx-2 text-center" autoClose="outside" style={{ marginTop: '0.5rem' }}>
                <Dropdown.Toggle id="dropdown-autoclose-outside">
                  Change Captain
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  {fantasyTeam.map((teamPlayer, teamIndex) => {
                    if (!(teamPlayer[0] === -2)) {
                      const eventKey = `${teamPlayer[0]}`;
                      return (
                        <Dropdown.Item
                          key={eventKey}
                          href={`#/${eventKey}`} // Use eventKey for href
                          onClick={(e) => handleCaptainClick(e, teamPlayer[0])}
                        >
                          {`${teamPlayer[1]} ${teamPlayer[2]}`}
                        </Dropdown.Item>
                      );
                    }
                    return null; // Render nothing if the player is already in the team
                  })}
                </Dropdown.Menu>
              </Dropdown>
              <Typography variant="h6" style={{ height: '10%', fontSize: fontSize * 0.8 }}>
                Budget Remaining: {moneyLeft}
              </Typography>
              <Button variant="contained" color="primary" disabled={loading || moneyLeft < 0} onClick={handleSubmit} style={{ width: '100%', marginBottom: '2vh', fontSize: fontSize * 0.6 }}>
                {loading ? <CircularProgress size={(fontSize * 0.8) + 'px'} style={{ color: 'white', fontSize: fontSize * 0.8 }} /> : "Submit Team"}
              </Button>
            </div>
          </Grid>
        </Grid>
      </Container >
      {redirectPath && <Link to={redirectPath} style={{ display: 'none' }}></Link>
      }
    </div >
  );
}
