import React, { useState, useEffect } from "react";
import NavbarUser from "../../components/Navbar_User";
import { Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { MDBCol, MDBContainer, MDBRow, MDBCard, MDBCardTitle, MDBCardText, MDBCardBody, MDBCardImage } from 'mdb-react-ui-kit';

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

export default function QnA() {
  const { fontSize } = FormatComponent();
  const [redirectPath, setRedirectPath] = useState('')
  const [error, setError] = useState('');

  const [players, setPlayers] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await fetch('/api/userplayers/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify()
        });
        const [data, plays] = await resp.json();
        if (data === "Error") {
          console.error('Error: Failed to connect to database');
          setError('An error occured - Please contact +44(0)7446 167 655');
        } else if (data === "No") {
          setRedirectPath('/');
        } else {
          setPlayers(plays);
        }

      } catch (error) {
        console.error('Error:', error);
        setError('An error occured - Please contact +44(0)7446 167 655');
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
      <NavbarUser />
      {error && <Alert variant="danger" style={{ fontSize: fontSize * 0.6 }}>{`An error occured - Please contact +44(0)7446 167 655`}</Alert>}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
        {[...Array(27).keys()].map((indexOut) => (
          <span
            key={indexOut}
            style={{
              fontSize: fontSize,
              fontWeight: 'bold',
              margin: Math.min((5 * fontSize / 24), 5),
              cursor: players[indexOut] && players[indexOut].length > 0 ? 'pointer' : 'default',
              color: players[indexOut] && players[indexOut].length > 0 ? 'blue' : 'black',
              textDecoration: players[indexOut] && players[indexOut].length > 0 ? 'underline' : 'none'
            }}
            onClick={() =>
              players[indexOut]?.length > 0 && (window.location.href = `#${indexOut === 26 ? 'Other' : String.fromCharCode(indexOut + 65)}`)
            }
          >
            {indexOut === 26 ? 'Other' : String.fromCharCode(indexOut + 65)}
          </span>
        ))}
      </div>

      <div style={{ overflowY: 'scroll', height: '82vh' }}>
        {players.map((playersList, indexOut) => (
          <div key={indexOut}>
            {Array.isArray(playersList) && playersList.length > 0 && (
              <>
                <div id={indexOut === 26 ? 'Other' : String.fromCharCode(indexOut + 65)} style={{ textAlign: 'left', fontSize: fontSize, fontWeight: 'bold', margin: '20px' }}>
                  {indexOut === 26 ? 'Other' : String.fromCharCode(indexOut + 65)}
                </div>
                <div style={{ height: '100%', width: '100%', flexDirection: 'column', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
                  <MDBContainer style={{ marginTop: '1vh', maxWidth: '100%', width: '800px', fontSize: fontSize * 0.7, height: '80%' }}>
                    <MDBRow className="justify-content-center">
                      {playersList.map((player, indexIn) => (
                        <MDBCol key={indexIn} md="6" lg="6" xl="6">
                          <MDBCard style={{ borderRadius: '15px' }}>
                            <MDBCardBody className="p-4">
                              <div className="d-flex text-black">
                                <div className="flex-shrink-1">
                                  <MDBCardImage
                                    style={{
                                      maxWidth: '100%', // Set maximum width
                                      maxHeight: 'auto', // Set maximum height
                                      width: '150px',
                                      height: 'auto',
                                      borderRadius: '10px',
                                    }}
                                    src={`https://iclfantasypictures.s3.eu-west-2.amazonaws.com/profilePics/player${player[0]}.png`}
                                    alt={`User Profile: Player ${player[0]}`}
                                    fluid
                                  />
                                </div>

                                <div className="flex-grow-1 ms-3">
                                  <MDBCardTitle style={{ color: 'black' }}>
                                    {player[1]}
                                  </MDBCardTitle>
                                  <MDBCardText>{player[4]}</MDBCardText>
                                </div>
                              </div>

                              <div className="d-flex justify-content-between rounded-3 p-2 mt-4" style={{ backgroundColor: '#efefef' }}>
                                <div>
                                  <p className="mb-0">Points: {player[2]}pts</p>
                                  <p className="mb-0">Cost: £{player[3]}</p>
                                </div>
                              </div>

                              <div className="d-flex justify-content-between mt-4">
                                <Link to={`/users/players/${player[0]}`}>
                                  <Button style={{ fontSize: fontSize * 0.6 }}>
                                    Details
                                  </Button>
                                </Link>
                              </div>
                            </MDBCardBody>
                          </MDBCard>
                        </MDBCol>
                      ))}
                    </MDBRow>
                  </MDBContainer>
                </div>
                <hr />
              </>
            )}
          </div>
        ))}
      </div>
      {redirectPath && <Link to={redirectPath} style={{ display: 'none' }}></Link>
      }
    </div >
  );
}
