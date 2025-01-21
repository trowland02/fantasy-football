import React, { useState, useEffect } from 'react';
import NavbarAdmin from "../../components/Navbar_Admin";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Grid, Container, Typography, Table, TableBody, TableRow, TableCell } from '@material-ui/core';
import { Button, Alert } from 'react-bootstrap';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import Dropdown from 'react-bootstrap/Dropdown';

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
      setFontSize(Math.min(24 * width / 1000, 26));
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return { fontSize };
};

export default function AdminHome() {
  const { fontSize } = FormatComponent();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [redirectPath, setRedirectPath] = useState('');

  const [editIndex, setEditIndex] = useState(null); // Index of the response being edited
  const [deletedIndex, setDeletedIndex] = useState(null);
  const [editedPlayer, setEditedPlayer] = useState([]);
  const [playersBoard, setPlayersBoard] = useState([]);
  const positions = ["Striker", "Mid-Fielder", "Goalier", "Defender", "All"]

  const classes = useStyles(fontSize);

  // ----------------------------------------------------------------------------------------------------------------------

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await fetch('/api/playerlead/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify()
        });
        const [data, leaderb] = await resp.json();
        if (data === "Error") {
          console.error('Error: Failed to connect to database');
          setError(true);
        } else if (data === "No") {
          setRedirectPath('/');
        } else {
          setPlayersBoard(leaderb)
        }

      } catch (error) {
        console.error('Error:', error);
        setError(true);
      }
    };
    fetchData();
  }, []);

  // ----------------------------------------------------------------------------------------------------------------------
  const handleDeletePlayer = async (e, index) => {
    e.preventDefault();
    setLoading(true);
    setError(false)
    if (deletedIndex) {
      setPlayersBoard(playersBoard.splice(deletedIndex, 1));
      if (index > deletedIndex) {
        index = index - 1
      }
    }
    setDeletedIndex(null)
    try {
      const resp = await fetch('/api/removeplayer/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemID: playersBoard[index][0] })
      });
      const data = await resp.json();

      if (data === "Error") {
        console.error('Error: Failed to connect to database');
        setError(true);
      } else if (data === "No") {
        setRedirectPath('/');
      } else {
        setDeletedIndex(index)
      }
    } catch (error) {
      console.error('Error: Failed to connect to database');
      setError(true);
    }
    setLoading(false); // Hide loading sign after the responses are generated
    setEditIndex(null); // Reset the editIndex
  };
  // ----------------------------------------------------------------------------------------------------------------------
  const handleUpdatePlayer = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loading sign
    setError(false)
    setDeletedIndex(null)
    const args = {
      playerID: editedPlayer[0],
      points: editedPlayer[3] - playersBoard[editIndex][3],
      cost: editedPlayer[4],
      position: editedPlayer[5]
    };

    try {
      const resp = await fetch('/api/updateplayer/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(args),
      });

      const data = await resp.json();
      // Update the state with the extracted values
      if (data === "Error") {
        console.error('Error: Failed to connect to database');
        setError(true);
      } else if (data === "No") {
        setRedirectPath('/');
      } else {
        setPlayersBoard(playersBoard.map((item, index) => index === editIndex ? editedPlayer : item));
      }
    } catch (error) {
      console.error('Error:', error);
      setError(true);
    }
    setLoading(false); // Hide loading sign after the responses are generated
    setEditIndex(null); // Reset the editIndex
    setEditedPlayer([]); // Clear the editedPlayer state after updating
  };
  // ----------------------------------------------------------------------------------------------------------------------
  const handleEditPlayer = (index) => {
    setEditedPlayer(playersBoard[index])
    setEditIndex(index);
  };
  // ----------------------------------------------------------------------------------------------------------------------
  const handleCancelEdit = () => {
    setEditIndex(null); // Reset the editIndex after canceling
    setEditedPlayer([]); // Clear the editedPlayer state after canceling
  };
  // ----------------------------------------------------------------------------------------------------------------------
  const handleUpdate = (e, newValue, fieldIndex) => {
    const updatedPlayer = editedPlayer.map((element, index) =>
      index === fieldIndex ? newValue : element
    );
    setEditedPlayer(updatedPlayer);
  };
  // ----------------------------------------------------------------------------------------------------------------------
  useEffect(() => {
    if (redirectPath) {
      const link = document.createElement('a');
      link.href = redirectPath;
      link.click();
    }
  }, [redirectPath]);
  // ----------------------------------------------------------------------------------------------------------------------
  return (
    <div className="non-scrollable-container">
      <NavbarAdmin />
      <Container maxWidth={false} style={{ padding: '2vh', marginTop: '1vh', width: '95vw', height: '85vh' }}>
        <Grid container spacing={2} style={{ height: '100%', border: 'none', padding: 0, margin: 0 }}>
          <Grid item xs={12} sm={12} style={{ height: '100%' }}>
            {error && <Alert variant="danger" style={{ fontSize: fontSize * 0.6 }}>{`An error occured - Please contact +44(0)7446 167 655`}</Alert>}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: "center" }}>
                <Button disabled={loading} onClick={() => setRedirectPath("/admin/add-player")} style={{ fontSize: fontSize * 0.6 }}>Add Player</Button>
              </div>
            <div style={{ height: '100%', width: '100%', flexDirection: 'column', display: 'flex', alignItems: 'flex-start' }}>
              <Typography variant="h6" style={{ fontSize: fontSize, marginBottom: '0.1rem', marginLeft: '5rem' }}>
                Player Leaderboard:
              </Typography>
              <Container className="d-flex flex-wrap justify-content-center" style={{ marginTop: '1vh', maxWidth: '100%', width: '1200px', fontSize: fontSize * 0.7, height: 'calc(95% - 4rem)' }}>
                <div style={{ maxHeight: '100%', overflowY: 'scroll' }}>
                  <Table style={{ tableLayout: "fixed", fontSize: fontSize * 0.6 }}>
                    <TableBody>
                      {playersBoard.map((leadPlayer, index) => (
                        <TableRow key={index} className={classes.tableRow} style={{ backgroundColor: index % 2 === 0 ? '#f2f2f2' : 'white' }}>
                          {editIndex === index ? (
                            <>
                              <TableCell className={classes.tableCell}>
                                {`${leadPlayer[1]} ${leadPlayer[2]}`}
                              </TableCell>

                              <TableCell className={classes.tableCell}>
                                <Dropdown className="d-inline mx-2 text-center" autoClose="outside" style={{ fontSize: fontSize }}>
                                  <Dropdown.Toggle id="dropdown-autoclose-outside">
                                    {editedPlayer[5]}
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu style={{ maxHeight: '22vh', overflowY: 'auto' }}>
                                    {positions.map((newPos, posIndex) => {
                                      // Check if the player ID is not in the fantasy team before rendering
                                      const eventKey = `${posIndex}`;
                                      return (
                                        <Dropdown.Item
                                          key={eventKey}
                                          href={`#/${eventKey}`} // Use eventKey for href
                                          onClick={(e) => handleUpdate(e, newPos, 5)}>
                                          {newPos}
                                        </Dropdown.Item>
                                      );
                                    })}
                                  </Dropdown.Menu>
                                </Dropdown>
                              </TableCell>

                              <TableCell className={classes.tableCell}>
                                <Dropdown className="d-inline mx-2 text-center" autoClose="outside" style={{ fontSize: fontSize }}>
                                  <Dropdown.Toggle id="dropdown-autoclose-outside">
                                    {editedPlayer[3]} pts
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu style={{ maxHeight: '22vh', overflowY: 'auto' }}>
                                    {Array.from({ length: ((leadPlayer[3] + 10) - (leadPlayer[3] - 10)) / 1 + 1 }, (_, i) => (leadPlayer[3] - 10) + i * 1).map((newPoint, pointIndex) => {
                                      // Check if the player ID is not in the fantasy team before rendering
                                      const eventKey = `${pointIndex}`;
                                      return (
                                        <Dropdown.Item
                                          key={eventKey}
                                          href={`#/${eventKey}`} // Use eventKey for href
                                          onClick={(e) => handleUpdate(e, newPoint, 3)}>
                                          {`${newPoint} pts`}
                                        </Dropdown.Item>
                                      );
                                    })}
                                  </Dropdown.Menu>
                                </Dropdown>
                              </TableCell>

                              <TableCell className={classes.tableCell}>
                                <Dropdown className="d-inline mx-2 text-center" autoClose="outside" style={{ fontSize: fontSize * 0.6 }}>
                                  <Dropdown.Toggle id="dropdown-autoclose-outside">
                                    £{editedPlayer[4]}
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu style={{ maxHeight: '22vh', overflowY: 'auto' }}>
                                    {Array.from({ length: ((leadPlayer[4] + 2000) - (leadPlayer[4] - 2000)) / 100 + 1 }, (_, i) => (leadPlayer[4] - 2000) + i * 100).map((newCost, costIndex) => {
                                      // Check if the player ID is not in the fantasy team before rendering
                                      const eventKey = `${costIndex}`;
                                      return (
                                        <Dropdown.Item
                                          key={eventKey}
                                          href={`#/${eventKey}`} // Use eventKey for href
                                          onClick={(e) => handleUpdate(e, newCost, 4)}>
                                          {`£ ${newCost}`}
                                        </Dropdown.Item>
                                      );
                                    })}
                                  </Dropdown.Menu>
                                </Dropdown>
                              </TableCell>

                              <TableCell className={classes.tableCell}>
                                <Button disabled={loading} onClick={handleUpdatePlayer} style={{ fontSize: fontSize * 0.4 }}>Update</Button>
                                <Button disabled={loading} onClick={handleCancelEdit} style={{ marginLeft: '0.5rem', fontSize: fontSize * 0.4, backgroundColor: 'red', borderColor: 'red' }}>Cancel</Button>
                                <Button disabled={loading} onClick={(e) => handleDeletePlayer(e, index)} style={{ marginLeft: '0.5rem', fontSize: fontSize * 0.4, backgroundColor: 'red', borderColor: 'red' }}>Delete</Button>
                              </TableCell>
                            </>

                          ) : (
                            deletedIndex === index ? (null) : (
                              <>
                                <TableCell className={classes.tableCell}>{leadPlayer[1]} {leadPlayer[2]}</TableCell>
                                <TableCell className={classes.tableCell}>{leadPlayer[5]}</TableCell>
                                <TableCell className={classes.tableCell}>{leadPlayer[3]} pts</TableCell>
                                <TableCell className={classes.tableCell}>£{leadPlayer[4]}</TableCell>
                                <TableCell className={classes.tableCell}>
                                  <Button disabled={loading} onClick={() => handleEditPlayer(index)} style={{ fontSize: fontSize * 0.6 }}>Edit</Button>
                                </TableCell>
                              </>
                            )
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Container>
            </div>
          </Grid >
        </Grid >
      </Container >
      {redirectPath && <Link to={redirectPath} style={{ display: 'none' }}></Link>
      }
    </div >
  );
}
