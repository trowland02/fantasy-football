import React, { useEffect, useState } from 'react';
import NavbarUser from "../../components/Navbar_User";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Form, Button, Card, Container, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const FormatComponent = () => {
  const [fontSize, setFontSize] = useState(16);
  const [containerSize, setContainerSize] = useState(400)

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setFontSize(Math.min(22 * width / 1000, 22));
      if (width > 960) {
        setContainerSize(400);
      } else if (width > 800) {
        setContainerSize(width / 2.4);
      } else if (width < 600) {
        setContainerSize(width * 0.8);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return { fontSize, containerSize };
};

export default function RemoveDoc() {
  const { fontSize, containerSize } = FormatComponent();
  const [docsArr, setDocs] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [removeDoc, setRemoveDoc] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await fetch('/api/listdocs/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify()
        });
        const [data, receivedDocs] = await resp.json();

        // Update the state with the extracted values
        if (data === "Error") {
          console.error('Error: Failed to connect to Weaviate')
          setError('An error occured - Please contact help');
        } else if (data === "False") {
          setSuccess('No documents exist within the class');
        } else if (data === "No") {
          setRedirectPath('/');
        } else {
          setDocs(receivedDocs);
          console.log(receivedDocs)
        }
      } catch (error) {
        console.error('Error:', error);
        setError('There was an error connecting to the host');
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e, doc) => {
    setLoading(true)
    setRemoveDoc(doc)
    e.preventDefault();
    try {
      const resp = await fetch('/api/removedoc/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName: doc })
      });
      const data = await resp.json();

      // Update the state with the extracted values
      if (data === "Error") {
        console.error('Error: Failed to connect to Weaviate')
        setError('An error occured - Please contact help');
      } else if (data === "No") {
        setRedirectPath('/');
      } else {
        setSuccess(`Document '${doc}' Removed`);
        // Update the docs state by removing the deleted document
        setDocs(docsArr.map((subArray) => subArray.filter((item) => item !== doc)));
      }
    } catch (error) {
      console.error('Error:', error);
      setError('There was an error connecting to the host');
    }
    setLoading(false)
    setRemoveDoc('')
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
      <>
        <NavbarUser />
        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
          {[...Array(27).keys()].map((indexOut) => (
            <span
              key={indexOut}
              style={{
                fontSize: fontSize,
                fontWeight: 'bold',
                margin: Math.min((5 * fontSize / 24), 5),
                cursor: docsArr[indexOut] && docsArr[indexOut].length > 0 ? 'pointer' : 'default',
                color: docsArr[indexOut] && docsArr[indexOut].length > 0 ? 'blue' : 'black',
                textDecoration: docsArr[indexOut] && docsArr[indexOut].length > 0 ? 'underline' : 'none'
              }}
              onClick={() =>
                docsArr[indexOut]?.length > 0 && (window.location.href = `#${indexOut === 26 ? 'Other' : String.fromCharCode(indexOut + 65)}`)
              }
            >
              {indexOut === 26 ? 'Other' : String.fromCharCode(indexOut + 65)}
            </span>
          ))}
        </div>

        <div style={{ overflowY: 'scroll', height: '82vh' }}>
          {docsArr.map((docs, indexOut) => (
            <div key={indexOut}>
              {Array.isArray(docs) && docs.length > 0 && (
                <>
                  <div id={indexOut === 26 ? 'Other' : String.fromCharCode(indexOut + 65)} style={{ textAlign: 'left', fontSize: fontSize, fontWeight: 'bold', margin: '20px' }}>
                    {indexOut === 26 ? 'Other' : String.fromCharCode(indexOut + 65)}
                  </div>
                  <Container className="d-flex flex-wrap align-items-center justify-content-center">
                    {docs.map((doc, indexIn) => (
                      <div key={indexIn} className="mx-3 my-3">
                        <Card style={{ width: containerSize }}>
                          <Card.Body>
                            <Form name="remove" onSubmit={(e) => handleSubmit(e, doc)}>
                              <Form.Group id="class">
                                <Form.Label style={{ fontSize: Math.max(fontSize * 0.8, 14) }}>{`File Name: ${doc}`}</Form.Label>
                                <br />
                              </Form.Group>
                              <Form.Group>
                                <div>
                                  <Button className="w-100" type="submit" disabled={loading} style={{ fontSize: Math.max(fontSize * 0.9, 14) }}>
                                    {doc === removeDoc ? 'Removing...' : 'Remove'}
                                  </Button>
                                </div>
                              </Form.Group>
                            </Form>
                          </Card.Body>
                        </Card>
                      </div>
                    ))}
                  </Container>
                  <hr /> {/* put line here */}
                </>
              )}
            </div>
          ))}
        </div>
      </>
      {redirectPath && <Link to={redirectPath} style={{ display: 'none' }}></Link>}
    </div>
  );
}
