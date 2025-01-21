import React, { useRef, useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container } from 'react-bootstrap';
import NavbarUserPassword from '../../components/Navbar_UserPassword'
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
  const [redirectPath, setRedirectPath] = useState('')
  const userPassRef = useRef();
  const userConNewPassRef = useRef();
  const userNewPassRef = useRef();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('')
    const oldPassword = userPassRef.current.value;
    const newPassword = userNewPassRef.current.value;
    const newConfPass = userConNewPassRef.current.value;

    if ((newConfPass === newPassword) && !(newPassword.includes("'")) && (newPassword.length > 8)) {
      try {
        const resp = await fetch('/api/updatepassword/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ newPass: newPassword, oldPass: oldPassword }),
        });
        const data = await resp.json();
        if (data === "True") {
          setSuccess(true);
        } else if (data === "False") {
          setError('Password Incorrect');
        } else if (data === "No") {
          setRedirectPath('/');
        } else {
          console.error('Error: Failed to connect to database');
          setError('An error occured - Please contact +44(0)7446 167 655');
        }
      } catch (error) {
        console.error('Error:', error);
        setError('An error occured - Please contact +44(0)7446 167 655');
      }

    } else {
      setError('Invalid credentials for user login - password must be 8 characters');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (redirectPath) {
      const link = document.createElement('a');
      link.href = redirectPath;
      link.click();
    }
  }, [redirectPath]);

  return (
    <>
      <NavbarUserPassword />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '85vh', width: '100vw' }}>
        <Container className="d-flex align-items-center justify-content-center" style={{ width: '700px', maxWidth: '90%', maxHeight: '90%' }}>
          <div className="w-100" style={{ width: '100%', height: '100%' }}>
            <Card>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">Password Reset</Alert>}
                <h2 className="text-center mb-4" style={{ fontSize: fontSize }}>Create User</h2>
                <Form onSubmit={handleSubmit}>
                  <div>
                  <Form.Group id="oldpassword" >
                        <Form.Label style={{ fontSize: fontSize * 0.7 }}>Old Password</Form.Label>
                        <Form.Control type="password" ref={userPassRef} required style={{ fontSize: fontSize * 0.7 }} />
                      </Form.Group>
                      <Form.Group id="newpassword" >
                        <Form.Label style={{ fontSize: fontSize * 0.7 }}>New Password</Form.Label>
                        <Form.Control type="password" ref={userNewPassRef} required style={{ fontSize: fontSize * 0.7 }} />
                      </Form.Group>
                      <Form.Group id="confnewpassword" >
                        <Form.Label style={{ fontSize: fontSize * 0.7 }}>Confirm New Password</Form.Label>
                        <Form.Control type="password" ref={userConNewPassRef} required style={{ fontSize: fontSize * 0.7 }} />
                      </Form.Group>
                  </div>

                  <div style={{ marginBottom: '5%' }}></div>
                  <Button disabled={loading || success} className="w-100" type="submit" style={{ fontSize: fontSize * 0.7 }}>
                    {success ? 'Password Reset' : 'Reset Password'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </Container>
      </div >
    </>
  );
}