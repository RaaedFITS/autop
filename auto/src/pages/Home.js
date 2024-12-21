// src/pages/Home.js
import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Modal,
  Spinner,
} from 'react-bootstrap';
import AuthContext from '../contexts/AuthContext'; // Import AuthContext
import axios from 'axios'; // Import Axios for API calls

const Home = () => {
  // Access AuthContext
  const { user, token } = useContext(AuthContext);

  // State Variables
  const [flowNames, setFlowNames] = useState([]);
  const [loadingFlows, setLoadingFlows] = useState(true); // For flow fetching state
  const [flowError, setFlowError] = useState(''); // For flow fetching errors
  const [selectedFlow, setSelectedFlow] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', variant: '' });
  const [showLoading, setShowLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  // Refs
  const fileInputRef = useRef(null);
  const dropzoneRef = useRef(null);

  // Fetch User Flows
  useEffect(() => {
    const fetchUserFlows = async () => {
      if (!user || !user.id) {
        setFlowError('User not authenticated.');
        setLoadingFlows(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/public/users/${user.id}/flows`, {
          headers: {
            // Include Authorization header if the route is protected
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data && response.data.flows) {
          const fetchedFlows = response.data.flows.map(flow => flow.name);
          setFlowNames(fetchedFlows);
        } else {
          setFlowError('No flows found for the user.');
        }
      } catch (error) {
        console.error('Error fetching user flows:', error);
        setFlowError(
          error.response?.data?.message || 'Failed to fetch user flows.'
        );
      } finally {
        setLoadingFlows(false);
      }
    };

    fetchUserFlows();
  }, [user, token]);

  // Handlers
  const handleFlowChange = (e) => {
    setSelectedFlow(e.target.value);
    updateOkButtonState(e.target.value, selectedFile);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    validateAndSetFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropzoneRef.current.classList.add('border-success');
  };

  const handleDragLeave = () => {
    dropzoneRef.current.classList.remove('border-success');
  };

  const handleFilePickerClick = () => {
    fileInputRef.current.click();
  };

  const validateAndSetFile = (file) => {
    if (
      file &&
      (file.type === 'text/csv' ||
        file.name.endsWith('.xls') ||
        file.name.endsWith('.xlsx'))
    ) {
      setSelectedFile(file);
      setAlert({ show: false, message: '', variant: '' });
    } else {
      setSelectedFile(null);
      setAlert({
        show: true,
        message: 'Please upload a valid CSV or Excel file.',
        variant: 'danger',
      });
    }
    updateOkButtonState(selectedFlow, file);
  };

  const updateOkButtonState = (flow, file) => {
    // This function can be used to enable/disable the OK button based on flow and file
    // Currently handled by the 'disabled' prop in the OK button
  };

  const showAlertMessage = (message, variant) => {
    setAlert({ show: true, message, variant });
  };

  const handleOkClick = async () => {
    if (!selectedFlow || !selectedFile) {
      showAlertMessage('Please select both a flow and a file.', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('flowName', selectedFlow);

    try {
      setLoadingMessage('Processing your request...');
      setShowLoading(true);

      // Trigger Python script
      const response = await axios.post('/api/trigger-python', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // Authorization header is already set globally via AuthContext
        },
      });

      if (response.data) {
        showAlertMessage(response.data.message || 'Flow processed successfully.', 'success');
      } else {
        showAlertMessage('Flow processed successfully.', 'success');
      }
    } catch (error) {
      console.error('Error:', error);
      showAlertMessage(error.response?.data?.message || 'Failed to trigger Python script.', 'danger');
    } finally {
      setShowLoading(false);
    }
  };

  const handleCancelClick = async () => {
    try {
      setLoadingMessage('Cancelling operation...');
      setShowLoading(true);

      // Assuming there's an API endpoint to cancel the Python script
      const response = await axios.post('/api/cancel-python-script', {}, {
        headers: {
          'Content-Type': 'application/json',
          // Authorization header is already set globally via AuthContext
        },
      });

      if (response.data) {
        showAlertMessage(response.data.message || 'Operation cancelled successfully.', 'info');
      } else {
        showAlertMessage('Operation cancelled successfully.', 'info');
      }
    } catch (error) {
      console.error('Error:', error);
      showAlertMessage('Failed to cancel Python script.', 'danger');
    } finally {
      setShowLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <div className="text-center">
        <h1 className="display-4 mb-4">Parabola Automation</h1>
      </div>

      <Card className="shadow-lg">
        <Card.Header className="bg-primary text-white text-center">
          <h5 className="mb-0">Upload Your CSV or Excel File</h5>
        </Card.Header>
        <Card.Body>
          {/* Dropdown for selecting the flow */}
          <Form.Group className="mb-4" controlId="flowSelection">
            <Form.Label className="fw-bold">Select the Flow:</Form.Label>
            {loadingFlows ? (
              <div className="d-flex align-items-center">
                <Spinner animation="border" size="sm" className="me-2" />
                <span>Loading flows...</span>
              </div>
            ) : flowError ? (
              <Alert variant="danger">{flowError}</Alert>
            ) : (
              <Form.Select
                value={selectedFlow}
                onChange={handleFlowChange}
                required
              >
                <option value="" disabled>
                  Choose a flow
                </option>
                {flowNames.map((name, index) => (
                  <option key={index} value={name}>
                    {name}
                  </option>
                ))}
              </Form.Select>
            )}
          </Form.Group>

          {/* Drag-and-drop area for CSV/Excel file upload */}
          <div
            ref={dropzoneRef}
            id="dropzone"
            className="border border-primary rounded p-4 text-center"
            style={{ backgroundColor: '#f8f9fa', cursor: 'pointer' }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={handleFilePickerClick}
          >
            <p className="mb-2 fw-bold">Drag and drop your CSV or Excel file here</p>
            <p className="text-muted">or</p>
            <Button variant="primary" onClick={handleFilePickerClick}>
              Choose File
            </Button>
            <Form.Control
              type="file"
              ref={fileInputRef}
              accept=".csv, .xlsx, .xls"
              className="d-none"
              onChange={handleFileChange}
            />
          </div>

          {/* Feedback for the uploaded file */}
          <div className="mt-3 text-muted">
            {selectedFile ? `Selected file: ${selectedFile.name}` : 'No file selected.'}
          </div>

          {/* OK button to trigger the Python code */}
          <div className="mt-4 text-center">
            <Button
              variant="success"
              size="lg"
              className="px-4"
              onClick={handleOkClick}
              disabled={!selectedFile || !selectedFlow}
            >
              OK
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Alert Messages */}
      {alert.show && (
        <Alert
          variant={alert.variant}
          onClose={() => setAlert({ show: false, message: '', variant: '' })}
          dismissible
          className="mt-4"
        >
          {alert.message}
        </Alert>
      )}

      {/* Loading Screen */}
      <Modal
        show={showLoading}
        onHide={() => {}}
        backdrop="static"
        keyboard={false}
        centered
      >
        <Modal.Body className="text-center">
          <Spinner animation="border" role="status" className="mb-3">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="fs-5">{loadingMessage}</p>
          <Button variant="danger" onClick={handleCancelClick} className="mt-3">
            Cancel
          </Button>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Home;
