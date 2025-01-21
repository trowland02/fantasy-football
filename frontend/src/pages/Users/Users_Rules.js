import React, { useState, useEffect } from "react";
import NavbarUser from "../../components/Navbar_User";
import { Grid, Container, Typography, Table, TableBody, TableRow, TableCell } from '@material-ui/core';
import { Alert } from 'react-bootstrap';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';

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
  const [redirectPath, setRedirectPath] = useState('')
  const [error, setError] = useState('');

  const [gameRules, setGameRules] = useState([])
  const [socialRules, setSocialRules] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resp = await fetch('/api/userrules/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify()
        });
        const [data, socails, games] = await resp.json();
        if (data === "Error") {
          console.error('Error: Failed to connect to database');
          setError('An error occured - Please contact +44(0)7446 167 655');
        } else if (data === "No") {
          setRedirectPath('/');
        } else {
          setGameRules(games)
          setSocialRules(socails)
        }

      } catch (error) {
        console.error('Error:', error);
        setError('An error occured - Please contact +44(0)7446 167 655');
      }
    };

    fetchData();
  }, []);

  const classes = useStyles(fontSize);

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
      <Container maxWidth={false} style={{ padding: '2vh', marginTop: '1vh', width: '95vw', height: '85%' }}>
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
                Game Points:
              </Typography>
              <Container className="d-flex flex-wrap justify-content-center" style={{ marginTop: '1vh', maxWidth: '100%', width: '900px', fontSize: fontSize * 0.7, height: 'calc(100% - 3rem)' }}>
                <div style={{ maxHeight: '85%', overflowY: 'scroll' }}>
                  <Table style={{ tableLayout: "fixed", fontSize: fontSize * 0.6 }}>
                    <TableBody>
                      {gameRules.map((rule, ruleIndex) => (
                        <TableRow key={ruleIndex} className={classes.tableRow} style={{ backgroundColor: ruleIndex % 2 === 0 ? '#f2f2f2' : 'white' }}>
                          <TableCell className={classes.tableCell}>{rule[0]}</TableCell>
                          <TableCell className={classes.tableCell}>{rule[1]} Points</TableCell>
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
                Social Points:
              </Typography>
              <Container className="d-flex flex-wrap justify-content-center" style={{ marginTop: '1vh', maxWidth: '100%', width: '900px', fontSize: fontSize * 0.7, height: 'calc(100% - 3rem)' }}>
                <div style={{ maxHeight: '85%', overflowY: 'scroll' }}>
                  <Table style={{ tableLayout: "fixed", fontSize: fontSize * 0.6 }}>
                    <TableBody>
                      {socialRules.map((rule, ruleIndex) => (
                        <TableRow key={ruleIndex} className={classes.tableRow} style={{ backgroundColor: ruleIndex % 2 === 0 ? 'white' : '#f2f2f2' }}>
                          <TableCell className={classes.tableCell}>{rule[0]}</TableCell>
                          <TableCell className={classes.tableCell}>{rule[1]} Points</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Container>
            </div>
          </Grid>
        </Grid>
      </Container >
      {redirectPath && <Link to={redirectPath} style={{ display: 'none' }}></Link>
      }
    </div >
  );
}
