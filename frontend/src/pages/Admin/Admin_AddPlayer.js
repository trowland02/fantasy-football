import React, { useRef, useState, useEffect } from 'react';
import { Container } from '@material-ui/core';
import { Button, Form, Card, Alert } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Dropdown from 'react-bootstrap/Dropdown';
import NavbarAdminPlayer from '../../components/Navbar_AdminPlayer'

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

export default function AddPlayer() {
  const { fontSize } = FormatComponent();
  const [loading, setLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState('');
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('');

  const fNameRef = useRef();
  const sNameRef = useRef();
  const baseCostRef = useRef();
  const [playPos, setPlayPos] = useState('');
  const positions = ["Striker", "Mid-Fielder", "Goalier", "Defender", "All"]

  const handleSubmit = async (e) => {
    const playFName = fNameRef.current.value;
    const playSName = sNameRef.current.value;
    const playBase = baseCostRef.current.value;

    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    if ((playFName === '') || (playSName === '') || (playBase === '') || (playPos === '') || (selectedFile && selectedFile.name.split('.').pop() !== 'png' && selectedFile.name.split('.').pop() !== 'jpg')) {
      setError('Field left empty - Ensure uploaded file is photo')
    } else {
      try {
        const resp = await fetch('/api/addplayer/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fName: playFName, sName: playSName, baseCost: playBase, position: playPos })
        });
        const data = await resp.json();

        // Update the state with the extracted values
        if (data === "Error") {
          console.error('Error: Failed to connect to database');
          setError('An error occured - Please contact +44(0)7446 167 655');
        } else if (data === "False") {
          setError('Names can only include alphabetic characters');
        } else if (data === "No") {
          setRedirectPath('/');
        } else {

          try {
            uploadProfilePic(playFName, playSName, playBase)
            setSuccess(true)
          } catch (error) {
            setError('Error uploading png - Please contact +44(0)7446 167 655');
            console.error('Error uploading file:', error);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        setError('An error occured - Please contact +44(0)7446 167 655');
      }
    }
    setLoading(false); // Hide loading sign after the responses are generated
  };

  const handlePlayerPos = (e, pos) => {
    setPlayPos(pos);
  };

  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const uploadProfilePic = async (playFName, playSName, playBase) => {

    const resp = await fetch('/api/getplayerid/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fName: playFName, sName: playSName, baseCost: playBase, position: playPos })
    });
    const [data, playID] = await resp.json();

    // Update the state with the extracted values
    if (data === "Error") {
      console.error('Error: Failed to connect to database');
      setError('An error occured - Please contact +44(0)7446 167 655');
    } else if (data === "No") {
      setRedirectPath('/');
    } else {
      if (selectedFile) {
        const formData = {
        file: selectedFile,
        fileID: playID
        }
        const uploadResp = await fetch('/api/uploadpicture/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData),
        }); 
        const uploadData = await uploadResp.json();
        if (uploadData === "Error") {
          setError(uploadData.error || 'Failed to upload image');
        } else {
          setSuccess(true)
        }  
      }
    }
    setLoading(false); // Hide loading sign after the responses are generated
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
      <NavbarAdminPlayer />
      <Container style={{ marginTop: '1rem', padding: '2vh', width: '700px', maxWidth: '95vw%', maxHeight: '85vh', overflowY: 'scroll' }}>
        <Card>
          <Card.Body>
            {success && <Alert variant="success" style={{ fontSize: fontSize * 0.6 }}>Player Added</Alert>}
            {error && <Alert variant="danger" style={{ fontSize: fontSize * 0.6 }}>{error}</Alert>}
            <h2 className="text-center mb-4" style={{ fontSize: fontSize }}>Add Player</h2>
            <Form onSubmit={handleSubmit}>
              <div>
                <Form.Group id="firstName">
                  <Form.Label style={{ fontSize: fontSize * 0.7 }}>First Name: </Form.Label>
                  <Form.Control type="text" ref={fNameRef} required style={{ fontSize: fontSize * 0.7 }} />
                </Form.Group>
                <Form.Group id="lastName">
                  <Form.Label style={{ fontSize: fontSize * 0.7 }}>Last Name: </Form.Label>
                  <Form.Control type="text" ref={sNameRef} required style={{ fontSize: fontSize * 0.7 }} />
                </Form.Group>
                <Form.Group id="basecost">
                  <Form.Label style={{ fontSize: fontSize * 0.7 }}>Cost: </Form.Label>
                  <Form.Control type="text" ref={baseCostRef} required style={{ fontSize: fontSize * 0.7 }} />
                </Form.Group>
              </div>
              <Container className="d-flex flex-wrap justify-content-center" >
                <Dropdown className="d-inline mx-2 text-center" autoClose="outside">
                  <Dropdown.Toggle id="dropdown-autoclose-outside">
                    {playPos.length > 0 ? playPos : 'Select Position: '}
                  </Dropdown.Toggle>
                  <Dropdown.Menu style={{ maxHeight: '22vh', overflowY: 'auto' }}>
                    {positions.map((newPos, posIndex) => {
                      // Check if the player ID is not in the fantasy team before rendering
                      const eventKey = `${posIndex}`;
                      return (
                        <Dropdown.Item
                          key={eventKey}
                          href={`#/${eventKey}`} // Use eventKey for href
                          onClick={(e) => handlePlayerPos(e, newPos)}>
                          {newPos}
                        </Dropdown.Item>
                      );

                    })}
                  </Dropdown.Menu>
                </Dropdown>
                <input type="file" onChange={handleFileChange} />
                <div style={{ marginBottom: '5%' }}></div>
                <Button disabled={loading} type="submit" style={{ fontSize: fontSize * 0.7 }}>
                  {success ? 'Player Added' : 'Add Player'}
                </Button>
              </Container>
            </Form>
          </Card.Body>
        </Card>
      </Container >
    </div >
  );
}