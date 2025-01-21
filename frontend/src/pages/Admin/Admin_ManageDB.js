import React, { useEffect, useState } from 'react';
import NavbarAdmin from "../../components/Navbar_Admin";
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Container, Alert } from 'react-bootstrap';
import { CircularProgress, Table, TableCell, TableRow, TableBody } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  tableRow: {
    height: (fontSize) => fontSize * 0.8,
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
      setFontSize(Math.max(Math.min(18 * width / 1000, 18), 8));
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return { fontSize };
};

export default function ManageDB() {
  const { fontSize } = FormatComponent();
  const [backups, setBackups] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [restoreID, setRestoreID] = useState('');
  const [removeID, setRemoveID] = useState('');
  const [loadingBackups, setLoadingBackups] = useState(true); // Loading state for fetching backups
  const [redirectPath, setRedirectPath] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await fetch('/api/listbackups/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify()
        });
        const [data, receivedBackups] = await resp.json();
        if (data === "Error") {
          console.error('Error: Failed to connect to Weaviate')
          setError('There was an error connecting to Host');
        } else if (data === "No") {
          setRedirectPath('/');
        } else {
          setBackups(receivedBackups);
        }

        setLoadingBackups(false); // Hide loading sign after fetching backups
      } catch (error) {
        console.error('Error:', error);
        setError('There was an error connecting to the host');
        setLoadingBackups(false); // Hide loading sign in case of error
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const dateParts = dateString.split('_');
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];
    const hour = dateParts[3];
    const minute = dateParts[4];
    // JavaScript's Date object uses 0-based month index, so we subtract 1 from the month value
    const date = new Date(year, month - 1, day);

    // Get the first 3 letters of the month name
    const monthName = date.toLocaleString('default', { month: 'short' });

    // Format the final string
    return `${monthName} ${day}, ${year} ${hour}:${minute}`;
  };

  const handleSubmitBack = async (e) => {
    setLoadingBackups(true);
    setRestoreID('true');
    e.preventDefault();
    try {
      const resp = await fetch('/api/backupdb/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(),
      });
      const [data, backupID] = await resp.json();

      // Update the state with the extracted values
      if (data === 'Error') {
        console.error('Error: Failed to connect to Weaviate');
        setError('There was an error connecting to Host');
      } else if (data === 'No') {
        setRedirectPath('/');
      } else {
        setBackups((prevBackups) => [backupID, ...prevBackups]); // Using functional update pattern
      }
    } catch (error) {
      console.error('Error:', error);
      setError('There was an error connecting to the host');
    }
    setLoadingBackups(false);
    setRestoreID('');
  };

  const handleDeleteResponse = async (e, backInd) => {
    e.preventDefault();
    setLoading(true)
    setRemoveID(backInd)
    try {
      const resp = await fetch('/api/removebackup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ backupID: backups[backInd] })
      });
      const data = await resp.json();

      // Update the state with the extracted values
      if (data === "Error") {
        console.error('Error: Failed to connect to Weaviate')
        setError('There was an error connecting to Host');
      } else if (data === "No") {
        setRedirectPath('/');
      } else {
        setBackups(backups.filter((_, index) => index !== backInd));
      }
    } catch (error) {
      console.error('Error:', error);
      setError('There was an error connecting to the host');
    }
    setRemoveID('')
    setLoading(false)
  };

  const handleSubmit = async (e, backInd) => {
    setLoading(true)
    setRestoreID(backInd)
    e.preventDefault();
    try {
      const resp = await fetch('/api/restoredb/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ backupID: backups[backInd] })
      });
      const data = await resp.json();

      // Update the state with the extracted values
      if (data === "Error") {
        console.error('Error: Failed to connect to Weaviate')
        setError('There was an error connecting to Host');
      } else if (data === "No") {
        setRedirectPath('/');
      } else {
        setSuccess("Restore Complete");
      }

    } catch (error) {
      console.error('Error:', error);
      setError('There was an error connecting to the host');
    }
    setLoading(false)
    setRestoreID('')
  };

  const classes = useStyles(fontSize);

  useEffect(() => {
    if (redirectPath) {
      const link = document.createElement('a');
      link.href = redirectPath;
      link.click();
    }
  }, [redirectPath]);

  return (
    <>
      <div className="non-scrollable-container">
        <NavbarAdmin />
        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        <div style={{ height: '87vh', marginTop: '1.5vh' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: "center" }}>
            <Button disabled={loading || loadingBackups} onClick={handleSubmitBack} style={{ fontSize: fontSize * 0.7 }}>
              {restoreID === 'true' ? 'Backing Up...' : 'Backup Database'}
            </Button>
            <div>
              {loadingBackups && <CircularProgress style={{ fontSize: fontSize * 0.7, marginLeft: '1vw' }} />}
            </div>
          </div>
          <Container className="d-flex flex-wrap justify-content-center" style={{ marginTop: '1.5vh', maxWidth: '95vw', width: '700px', fontSize: fontSize * 0.7, height: 'calc(100% - 3rem)' }}>
            <div style={{ maxHeight: '100%', overflowY: 'scroll' }}>
              <Table style={{ tableLayout: "fixed", fontSize: fontSize * 0.6 }}>
                <TableBody>
                  {backups.map((backup, index) => (
                    <TableRow key={index} className={classes.tableRow} style={{ backgroundColor: index % 2 === 0 ? '#f2f2f2' : 'white' }}>
                      <TableCell className={classes.tableCell}>{formatDate(backup)}</TableCell>
                      <TableCell className={classes.tableCell}>
                        <div style={{ display: 'flex', gap: '2vw' }}>
                          <Button
                            disabled={loading || index === restoreID}
                            onClick={(e) => handleSubmit(e, index)}
                            style={{ fontSize: fontSize * 0.6 }}
                          >
                            {index === restoreID ? 'Restoring...' : 'Restore'}
                          </Button>
                          <Button
                            disabled={loading || index === removeID}
                            onClick={(e) => handleDeleteResponse(e, index)}
                            variant="danger"
                            style={{ fontSize: fontSize * 0.6 }}
                          >
                            {index === removeID ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Container>
        </div>
        {redirectPath && <Link to={redirectPath} style={{ display: 'none' }}></Link>}
      </div>
    </>
  );
}