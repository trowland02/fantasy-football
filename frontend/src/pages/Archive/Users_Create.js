import React, { useState, useEffect } from 'react';
import NavbarUser from "../../components/Navbar_User";
import { Alert } from 'react-bootstrap';
import { Delete } from '@material-ui/icons';
import { CircularProgress, Button, Container, Grid, FormControlLabel, Checkbox, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';

const FormatComponent = () => {
  const [fontSize, setFontSize] = useState(16);
  const [checkboxTransform, setCheckboxTransform] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setFontSize(Math.max(Math.min(18 * width / 1000, 18), 8));
      setCheckboxTransform(Math.max(Math.min(1 * height / 500, 4), 0.5));
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return { fontSize, checkboxTransform };
};

export default function FileUploader() {
  const { fontSize, checkboxTransform } = FormatComponent();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedOverride, setSelectedOverride] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState('');
  const [docInfo, setDocInfo] = useState('');

  const handleFileChange = (event) => {
    const numFilesSelected = event.target.files.length;
    setSelectedFiles([...selectedFiles, ...event.target.files]);
    // Create an array with the number of selected files times false
    const falseArray = new Array(numFilesSelected).fill(false);
    setSelectedOverride([...selectedOverride, ...falseArray]);
  };

  const handleOverrideChange = (index) => {
    setSelectedOverride((prevOverride) => {
      const updatedOverride = [...prevOverride];
      updatedOverride[index] = !updatedOverride[index];
      return updatedOverride;
    });

  };

  const handleRemoveFile = (index) => {
    const files = [...selectedFiles];
    const override = [...selectedOverride];
    override.splice(index, 1);
    setSelectedOverride(override);
    files.splice(index, 1);
    setSelectedFiles(files);
  };

  function formDataToObject(formData) {
    const object = {};
    formData.forEach((value, key) => {
      // If the key already exists in the object, treat it as an array
      if (object.hasOwnProperty(key)) {
        if (!Array.isArray(object[key])) {
          object[key] = [object[key]];
        }
        object[key].push(value);
      } else {
        object[key] = value;
      }
    });
    return object;
  }

  const handleUpload = async () => {
    try {
      setLoading(true)
      setError('')

      const formData = new FormData();

      for (let index = 0; index < selectedFiles.length; index++) {
        const file = selectedFiles[index];
        const override = selectedOverride[index];

        formData.append('files', file); // Assuming 'file' is the file object you want to upload
        formData.append('overrides', override);

      }
      console.log(formDataToObject(formData))

      const resp = await fetch('/api/uploadfile/', {
        method: 'POST',
        body: formData,
      });

      if (resp.ok) {
        console.log("Succesful")
      } else {
        console.error("error")
      }

      const [data, recievedDocInfo] = await resp.json();
      // Update the state with the extracted values
      if (data === "Error") {
        console.error('Error: Failed to connect to Weaviate')
        setError('An error occured - Please contact help');
      } else if (data === "No") {
        setRedirectPath('/');
      } else {
        setDocInfo(recievedDocInfo)
      }

    } catch (error) {
      console.error('Error:', error);
      setError('There was an error connecting to the host');
    }
    setLoading(false)
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
      <div className="non-scrollable-container">
        <NavbarUser />
        {error && <Alert variant="danger">{error}</Alert>}
        <div style={{ height: '85vh', display: 'flex', flexDirection: 'column' }}>
          <Container style={{ width: '50rem', maxWidth: '90vw', height: 'calc(110% - 2.5rem)', paddingTop: '1rem' }}>
            <Grid container spacing={2} direction="column" alignItems="center" style={{ flexGrow: 1, height: '100%', maxWidth: '100%' }}>
              <Grid item style={{ paddingBottom: '1rem' }}>
                <label htmlFor="file-input">
                  <Button variant="contained" color="primary" component="span" disabled={loading} style={{ fontSize: fontSize }}>
                    Click to upload files
                  </Button>
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
              </Grid>
              {selectedFiles.length > 0 && (
                <Container style={{ width: '100%', maxHeight: 'calc(95% - 7.5rem)' }}>
                  <Grid item xs={12} style={{ border: 'none', padding: '1rem', height: '100%', overflowY: 'auto' }}>
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                      {selectedFiles.map((file, index) => (
                        <li key={index} style={{ marginBottom: '5px' }}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={docInfo.length > 0 ? 4 : 6} style={{ fontSize: fontSize, paddingRight: '1vw' }}>
                              {file.name}
                            </Grid>
                            <Grid item xs={docInfo.length > 0 ? 2 : 3}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    style={{
                                      transform: `scale(${checkboxTransform})`,
                                    }}
                                    checked={file.override}
                                    onChange={() => handleOverrideChange(index)}
                                    color="primary"
                                  />
                                }
                                label={
                                  <Typography style={{ fontSize: fontSize, paddingLeft: '1vw', paddingRight: '1vw' }}>
                                    Override
                                  </Typography>
                                }
                              />
                            </Grid>
                            <Grid item xs={1}>
                              <div></div>
                            </Grid>
                            <Grid item xs={docInfo.length > 0 ? 1 : 2}>
                              <Button onClick={() => handleRemoveFile(index)}>
                                <Delete style={{ fontSize: fontSize }} />
                              </Button>
                            </Grid>
                            <Grid item xs={4}>
                              {docInfo.length > 0 && (
                                <Typography
                                  style={{
                                    fontSize: fontSize,
                                    paddingLeft: '1vw',
                                    fontWeight: 'bold',
                                    color: docInfo[index] === 'C' ? 'green' :
                                      docInfo[index] === 'A' ? 'yellow' :
                                        docInfo[index] === 'N' ? 'yellow' :
                                          docInfo[index] === 'I' ? 'yellow' :
                                            docInfo[index] === 'E' ? 'red' : 'inherit'
                                  }}
                                >
                                  {docInfo[index] === 'C' ? ' - Upload Complete' :
                                    docInfo[index] === 'A' ? ' - File Already Exists' :
                                      docInfo[index] === 'N' ? ' - Empty File' :
                                        docInfo[index] === 'I' ? ' - Invalid Format' :
                                          docInfo[index] === 'E' ? ' - Error Occurred' : ''}
                                </Typography>
                              )}
                            </Grid>
                          </Grid>
                        </li>
                      ))}
                    </ul>
                  </Grid>
                </Container>
              )}
              {selectedFiles.length > 0 && (
                <Grid item>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: "center" }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleUpload}
                      disabled={loading}
                      style={{ fontSize: fontSize }}>
                      {loading ? 'Uploading...' : 'Upload'}
                    </Button>
                    <div>
                      {loading && <CircularProgress style={{ fontSize: fontSize * 0.7, marginLeft: '1vw' }} />}
                    </div>
                  </div>
                </Grid>
              )}
            </Grid>
          </Container>
        </div>
        {redirectPath && <Link to={redirectPath} style={{ display: 'none' }}></Link>}
      </div>
    </>
  );
}