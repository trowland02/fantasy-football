import React, { useState, useEffect } from 'react';
import NavbarAdmin from "../../components/Navbar_Admin";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Grid, Container, Typography, Table, TableBody, TableRow, TableCell } from '@material-ui/core';
import { Alert, Button } from 'react-bootstrap';
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

export default function UsersView() {
  const { fontSize } = FormatComponent();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [redirectPath, setRedirectPath] = useState('');

  const [editIndex, setEditIndex] = useState(null); // Index of the response being edited
  const [editedUser, setEditedUser] = useState([]);
  const [usersBoard, setUsersBoard] = useState([]);

  const classes = useStyles(fontSize);

  // ----------------------------------------------------------------------------------------------------------------------

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await fetch('/api/userlead/', {
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
          setUsersBoard(leaderb)
        }

      } catch (error) {
        console.error('Error:', error);
        setError(true);
      }
    };
    fetchData();
  }, []);

  // ----------------------------------------------------------------------------------------------------------------------
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true); // Show loading sign
    setError(false)
    const args = {
      userID: editedUser[0],
      points: editedUser[2],
      budget: editedUser[3]
    };

    try {
      const resp = await fetch('/api/updateuser/', {
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
        setUsersBoard(usersBoard.map((item, index) => index === editIndex ? editedUser : item));
      }
    } catch (error) {
      console.error('Error:', error);
      setError(true);
    }
    setLoading(false); // Hide loading sign after the responses are generated
    setEditIndex(null); // Reset the editIndex
    setEditedUser([]); // Clear the editedUser state after updating
  };
  // ----------------------------------------------------------------------------------------------------------------------
  const handleEditUser = (index) => {
    setEditedUser(usersBoard[index])
    setEditIndex(index);
  };
  // ----------------------------------------------------------------------------------------------------------------------
  const handleCancelEdit = () => {
    setEditIndex(null); // Reset the editIndex after canceling
    setEditedUser([]); // Clear the editedUser state after canceling
  };
  // ----------------------------------------------------------------------------------------------------------------------
  const handleUpdate = (e, newValue, fieldIndex) => {
    const updatedUser = editedUser.map((element, index) =>
      index === fieldIndex ? newValue : element
    );
    setEditedUser(updatedUser);
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
            <div style={{ height: '100%', width: '100%', flexDirection: 'column', display: 'flex', alignItems: 'flex-start' }}>
              <Typography variant="h6" style={{ fontSize: fontSize, marginBottom: '0.1rem', marginLeft: '1rem' }}>
                User Leaderboard:
              </Typography>
              <Container className="d-flex flex-wrap justify-content-center" style={{ marginTop: '1vh', maxWidth: '100%', width: '1200px', fontSize: fontSize * 0.7, height: 'calc(100% - 3rem)' }}>
                <div style={{ maxHeight: '85%', overflowY: 'scroll' }}>
                  <Table style={{ tableLayout: "fixed", fontSize: fontSize * 0.6 }}>
                    <TableBody>
                      {usersBoard.map((leadUser, index) => (
                        <TableRow key={index} className={classes.tableRow} style={{ backgroundColor: index % 2 === 0 ? '#f2f2f2' : 'white' }}>
                          {editIndex === index ? (
                            <>
                              <TableCell className={classes.tableCell}>
                                {leadUser[1]}
                              </TableCell>

                              <TableCell className={classes.tableCell}>
                                <Dropdown className="d-inline mx-2 text-center" autoClose="outside" style={{ fontSize: fontSize }}>
                                  <Dropdown.Toggle id="dropdown-autoclose-outside">
                                    {editedUser[2]} pts
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu style={{ maxHeight: '22vh', overflowY: 'auto' }}>
                                    {Array.from({ length: ((leadUser[2] + 10) - (leadUser[2] - 10)) / 1 + 1 }, (_, i) => (leadUser[2] - 10) + i * 1).map((newPoint, pointIndex) => {
                                      // Check if the user ID is not in the fantasy team before rendering
                                      const eventKey = `${pointIndex}`;
                                      return (
                                        <Dropdown.Item
                                          key={eventKey}
                                          href={`#/${eventKey}`} // Use eventKey for href
                                          onClick={(e) => handleUpdate(e, newPoint, 2)}>
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
                                    £{editedUser[3]}
                                  </Dropdown.Toggle>
                                  <Dropdown.Menu style={{ maxHeight: '22vh', overflowY: 'auto' }}>
                                    {Array.from({ length: ((leadUser[3] + 2000) - (leadUser[3] - 2000)) / 100 + 1 }, (_, i) => (leadUser[3] - 2000) + i * 100).map((newCost, costIndex) => {
                                      // Check if the user ID is not in the fantasy team before rendering
                                      const eventKey = `${costIndex}`;
                                      return (
                                        <Dropdown.Item
                                          key={eventKey}
                                          href={`#/${eventKey}`} // Use eventKey for href
                                          onClick={(e) => handleUpdate(e, newCost, 3)}>
                                          {`£ ${newCost}`}
                                        </Dropdown.Item>
                                      );

                                    })}
                                  </Dropdown.Menu>
                                </Dropdown>
                              </TableCell>

                              <TableCell className={classes.tableCell}>
                                <Button disabled={loading} onClick={handleUpdateUser} style={{ fontSize: fontSize * 0.6 }}>Update</Button>
                                <Button onClick={handleCancelEdit} style={{ marginLeft:'0.5rem', fontSize: fontSize * 0.6, backgroundColor: 'red', borderColor: 'red' }}>Cancel</Button>
                              </TableCell>
                            </>

                          ) : (

                            <>
                              <TableCell className={classes.tableCell}>{leadUser[1]}</TableCell>
                              <TableCell className={classes.tableCell}>{leadUser[2]} pts</TableCell>
                              <TableCell className={classes.tableCell}>£{leadUser[3]}</TableCell>
                              <TableCell className={classes.tableCell}>
                                <Button disabled={loading} onClick={() => handleEditUser(index)} style={{ fontSize: fontSize * 0.6 }}>Edit</Button>
                              </TableCell>
                            </>

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
