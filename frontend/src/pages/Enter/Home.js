import React, { useRef, useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

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

export default function Home() {
  const { fontSize } = FormatComponent();
  const userEmailRef = useRef();
  const userPassRef = useRef();
  const APIKeyNameRef = useRef();
  const adminNameRef = useRef();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  const [userChecked, setUserChecked] = useState(false);
  const [redirectPath, setRedirectPath] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetch('/api/logout/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify()
        });
        // You can do something with the response here if needed
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchData();
  }, []);

  const handleAdminChange = (event) => {
    const adminValue = event.target.value;
    setAdminChecked((prevSelectedOption) => (prevSelectedOption === adminValue ? '' : adminValue));
    setUserChecked(false);
  };

  const handleUserChange = (event) => {
    const userValue = event.target.value;
    setUserChecked((prevSelectedOption) => (prevSelectedOption === userValue ? '' : userValue));
    setAdminChecked(false);
  };

  const adminLogin = async () => {
    const APIKeyName = APIKeyNameRef.current.value;
    const adminName = adminNameRef.current.value;
    try {
      const resp = await fetch('/api/accessadmin/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: APIKeyName, name: adminName }),
      });
      const data = await resp.json();
      if (data === "True") {
        setRedirectPath('/admin');
      } else if (data === "False") {
        setError('Invalid credentials for admin login');
      } else {
        console.error('Error: Failed to connect to database');
        setError('An error occured - Please contact +44(0)7446 167 655');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occured - Please contact +44(0)7446 167 655');
    }
    setLoading(false);
  };

  const userLogin = async () => {
    const userpass = userPassRef.current.value;
    const userEmail = userEmailRef.current.value;
    if (userEmail.endsWith("@ic.ac.uk")) {
      try {
        const resp = await fetch('/api/accessuser/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ password: userpass, email: userEmail }),
        });
        const data = await resp.json();
        if (data === "True") {
          setRedirectPath('/users');
        } else if (data === "False") {
          setError('Invalid credentials for user login');
        } else {
          console.error('Error: Failed to connect to database');
          setError('An error occured - Please contact +44(0)7446 167 655');
        }
      } catch (error) {
        console.error('Error:', error);
        setError('An error occured - Please contact +44(0)7446 167 655');
      }
    }
    else {
      setError('Email must end in "@ic.ac.uk"');
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('')

    if (adminChecked || userChecked) {
      setLoading(true);
      if (adminChecked) {
        adminLogin();
      } else {
        userLogin();
      }
    } else {
      setError('Please select a login option');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (redirectPath) {
      const link = document.createElement('a');
      link.href = redirectPath;
      link.click();
    }
  }, [redirectPath]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100vw' }}>
      <Container className="d-flex align-items-center justify-content-center" style={{ width: '700px', maxWidth: '90%', maxHeight: '90%' }}>
        <div className="w-100" style={{ width: '100%', height: '100%' }}>
          <Card>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              <h2 className="text-center mb-4" style={{ fontSize: fontSize }}>Log In</h2>
              <Form onSubmit={handleSubmit}>
                <Form.Group id="loginOption">
                  <div>
                    <Form.Check
                      style={{ fontSize: fontSize * 0.8 }}
                      type="radio"
                      name="login"
                      value="Admin"
                      label="Admin"
                      checked={adminChecked}
                      onChange={handleAdminChange}
                    />
                    <Form.Check
                      style={{ fontSize: fontSize * 0.8 }}
                      type="radio"
                      name="login"
                      value="User"
                      label="User"
                      checked={userChecked}
                      onChange={handleUserChange}
                    />
                  </div>
                </Form.Group>
                {adminChecked && (
                  <div>
                    <Form.Group id="name">
                      <Form.Label style={{ fontSize: fontSize * 0.7 }}>Name</Form.Label>
                      <Form.Control type="text" ref={adminNameRef} required style={{ fontSize: fontSize * 0.7 }} />
                    </Form.Group>
                    <Form.Group id="API_key">
                      <Form.Label style={{ fontSize: fontSize * 0.7 }}>API key</Form.Label>
                      <Form.Control type="password" ref={APIKeyNameRef} required style={{ fontSize: fontSize * 0.7 }} />
                    </Form.Group>
                  </div>
                )}
                {userChecked && (
                  <>
                    <div>
                      <Form.Group id="email">
                        <Form.Label style={{ fontSize: fontSize * 0.7 }}>Email</Form.Label>
                        <Form.Control type="text" ref={userEmailRef} required style={{ fontSize: fontSize * 0.7 }} />
                      </Form.Group>
                      <Form.Group id="password">
                        <Form.Label style={{ fontSize: fontSize * 0.7 }}>Password</Form.Label>
                        <Form.Control type="password" ref={userPassRef} required style={{ fontSize: fontSize * 0.7 }} />
                      </Form.Group>
                    </div>
                    <div className="text-left">
                      <Link to="/forgot-password">Forgot Password</Link> {/* Add Forgot Password button */}
                    </div>
                    <div className="text-rig">
                      <Link to="/create-account">Create Account</Link> {/* Add Create Account button */}
                    </div></>
                )}
                <div style={{ marginBottom: '5%' }}></div>
                <Button disabled={loading} className="w-100" type="submit" style={{ fontSize: fontSize * 0.7 }}>
                  Log In
                </Button>
              </Form>
            </Card.Body>
          </Card>
          {redirectPath && <Link to={redirectPath} style={{ display: 'none' }}></Link>}
        </div>
      </Container>
    </div >
  );
}