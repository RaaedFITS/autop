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
import { io } from 'socket.io-client'; // Import Socket.io client
import './Home.css'; // Import custom CSS if using custom classes

const Home = () => {
  // Access AuthContext
  const { user } = useContext(AuthContext);

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

  // Socket.io instance
  const [socket, setSocket] = useState(null);

  // Setup Socket.io connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket'],
    });

    setSocket(newSocket);

    // Join room based on user ID
    if (user && user.id) {
      newSocket.emit('joinRoom', 'test-user'); // Replace 'test-user' with dynamic user ID if available
    }

    // Cleanup on unmount
    return () => newSocket.close();
  }, [user]);

  // Listen for Socket.io events
  useEffect(() => {
    if (!socket) return;

    socket.on('scriptStarted', (data) => {
      console.log('Event: scriptStarted', data);
      setLoadingMessage(data.message);
      setShowLoading(true);
      setAlert({ show: false, message: '', variant: '' });
    });

    socket.on('scriptSuccess', (data) => {
      console.log('Event: scriptSuccess', data);
      setShowLoading(false);
      setAlert({ show: true, message: data.message, variant: 'success' });
    });

    socket.on('scriptFailure', (data) => {
      console.log('Event: scriptFailure', data);
      setShowLoading(false);
      setAlert({ show: true, message: data.message, variant: 'danger' });
    });

    socket.on('scriptError', (data) => {
      console.log('Event: scriptError', data);
      setShowLoading(false);
      setAlert({ show: true, message: data.message, variant: 'danger' });
    });

    socket.on('scriptCancelled', (data) => {
      console.log('Event: scriptCancelled', data);
      setShowLoading(false);
      setAlert({ show: true, message: data.message, variant: 'info' });
    });

    // Cleanup listeners on unmount
    return () => {
      socket.off('scriptStarted');
      socket.off('scriptSuccess');
      socket.off('scriptFailure');
      socket.off('scriptError');
      socket.off('scriptCancelled');
    };
  }, [socket]);

  // Fetch User Flows
  useEffect(() => {
    const fetchUserFlows = async () => {
      if (!user || !user.id) {
        setFlowError('User not identified.');
        setLoadingFlows(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/public/users/${user.id}/flows`, {
          headers: {
            'x-user-id': 'test-user', // Use a fixed identifier for testing; replace with dynamic ID
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
  }, [user]);

  // Handlers
  const handleFlowChange = (e) => {
    setSelectedFlow(e.target.value);
    // No need for updateOkButtonState as it's handled by the 'disabled' prop
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log('handleFileChange called with file:', file);
    validateAndSetFile(file);
    // Reset the file input's value to allow selecting the same file again if needed
    e.target.value = null;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    console.log('handleDrop called with file:', file);
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
    console.log('handleFilePickerClick called');
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
      console.log('File is valid:', file);
      setAlert({ show: false, message: '', variant: '' });
    } else {
      setSelectedFile(null);
      console.log('Invalid file type:', file);
      setAlert({
        show: true,
        message: 'Please upload a valid CSV or Excel file.',
        variant: 'danger',
      });
    }
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
      // Trigger Python script
      await axios.post('http://localhost:5000/api/trigger-python', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-user-id': 'test-user', // Use a fixed identifier for testing; replace with dynamic ID
        },
      });

      // The response and alerts are handled via Socket.io events
    } catch (error) {
      console.error('Error:', error);
      showAlertMessage(error.response?.data?.message || 'Failed to trigger Python script.', 'danger');
      setShowLoading(false);
    }
  };

  const handleCancelClick = async () => {
    try {
      // Cancel Python script
      await axios.post('http://localhost:5000/api/cancel-python-script', {}, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'test-user', // Use a fixed identifier for testing; replace with dynamic ID
        },
      });
  
      // The response and alerts are handled via Socket.io events
    } catch (error) {
      console.error('Error:', error);
      showAlertMessage('Failed to cancel Python script.', 'danger');
      setShowLoading(false);
    }
  };

  return (
    <>
      {/* Alert Messages Positioned at the Top */}
      {alert.show && (
        <Alert
          variant={alert.variant}
          onClose={() => setAlert({ show: false, message: '', variant: '' })}
          dismissible
          className="fixed-top m-3 w-100"
          style={{ zIndex: 1050, top: '0', left: '0', right: '0', borderRadius: '0' }}
        >
          <Container>
            {alert.message}
          </Container>
        </Alert>
      )}

      <Container className="mt-5">
        <div className="text-center mb-4">
          <h1 className="display-4">Parabola Automation</h1>
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
              <Button
                variant="primary"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent the event from bubbling up to the dropzone
                  handleFilePickerClick();
                }}
              >
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
      </Container>

      {/* Loading and Status Modal */}
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
    </>
  );
};

export default Home;