import React, { useRef, useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container } from 'react-bootstrap';
import NavbarHome from '../../components/Navbar_Home'
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
  const emailRef = useRef();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('')
    const userEmail = emailRef.current.value;
    if ((/^[a-zA-Z]+$/.test(userEmail[0])) && (userEmail.endswith("@ic.ac.uk"))) {
      try {
        const resp = await fetch('/api/forgotpass/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: userEmail }),
        });
        const data = await resp.json();
        if (data === "True") {
          setSuccess(true);
        } else if (data === "No") {
          setError('Email address does not exist');
        } else {
          console.error('Error: Failed to connect to database');
          setError('An error occured - Please contact +44(0)7446 167 655');
        }
      } catch (error) {
        console.error('Error:', error);
        setError('An error occured - Please contact +44(0)7446 167 655');
      }

    } else {
      setError('Invalid credentials for user login');
    }
    setLoading(false);
  };


  return (
    <>
      <NavbarHome />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '85vh', width: '100vw' }}>
        <Container className="d-flex align-items-center justify-content-center" style={{ width: '700px', maxWidth: '90%', maxHeight: '90%' }}>
          <div className="w-100" style={{ width: '100%', height: '100%' }}>
            <Card>
              <Card.Body>
                {error && <Alert variant="danger" style={{ fontSize: fontSize * 0.6 }}>{error}</Alert>}
                {success && <Alert variant="success" style={{ fontSize: fontSize * 0.6 }}>Password Reset - Check email</Alert>}
                <h2 className="text-center mb-4" style={{ fontSize: fontSize }}>Forgotten Password</h2>
                <Form onSubmit={handleSubmit}>
                  <div>
                    <Form.Group id="useremail">
                      <Form.Label style={{ fontSize: fontSize * 0.7 }}>{`Email (@ic.ac.uk): `}</Form.Label>
                      <Form.Control type="text" ref={emailRef} required style={{ fontSize: fontSize * 0.7 }} />
                    </Form.Group>
                  </div>

                  <div style={{ marginBottom: '5%' }}></div>
                  <Button disabled={loading || success} className="w-100" type="submit" style={{ fontSize: fontSize * 0.7 }}>
                    {success ? 'Password Rest' : 'Reset Password'}
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