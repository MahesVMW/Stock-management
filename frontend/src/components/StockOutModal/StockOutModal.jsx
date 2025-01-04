import axios from 'axios';
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const StockOutModal = ({ show, handleClose, stock = {}, handleStockOut }) => {
  const url = "https://stock-management-backend-9q3a.onrender.com"; // Base URL
  const [quantity, setQuantity] = useState(stock.openingStock || 0);
  const [salePrice, setSalePrice] = useState(stock.salePrice || 0);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);


  const handleSubmit = async () => {
    if (quantity && salePrice) {
      const formattedDate = new Date(date).toLocaleDateString();
      const stockId = stock._id;
      setLoading(true); // Start loading
      try {
        await axios.put(`${url}/api/stock/${stockId}/out`, {
          quantity,
          salePrice,
          notes,
          date, // Use the date state variable directly
        });
        handleStockOut(quantity, salePrice, notes, stockId,formattedDate);
        handleClose();
      } catch (error) {
        console.error('Error updating stock:', error);
        alert('Failed to update stock.');
      } finally {
        setLoading(false); // Stop loading
      }
    } else {
      alert('Please fill in all fields.');
    }
  };
  
  return (
    <Modal show={show} onHide={handleClose} centered size="md">
      <Modal.Header closeButton>
        <Modal.Title>Stock Out</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
        <Form.Group controlId="formDate">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="formQuantity">
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
            />
          </Form.Group>
          <Form.Group controlId="formSalePrice" className="mt-3">
            <Form.Label>Sale Price</Form.Label>
            <Form.Control
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              min="0.01"
              step="0.01"
            />
          </Form.Group>
          <Form.Group controlId="formNotes" className="mt-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit}disabled={loading}>
        {loading ? 'Processing...' : 'Submit'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StockOutModal;
