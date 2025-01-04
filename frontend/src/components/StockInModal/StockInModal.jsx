import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import './StockInModal.css';

const StockInModal = ({ show, handleClose, stock, handleStockIn }) => {
  const url = "https://stock-management-backend-z6jh.onrender.com"; // Base URL
  const [quantity, setQuantity] = useState(stock.openingStock || 0);
  const [purchasePrice, setPurchasePrice] = useState(stock.salePrice || 0);
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async () => {
    if (quantity && purchasePrice) {
      const formattedDate = new Date(date).toLocaleDateString();
      const stockId = stock._id;
    
      try {
        await axios.put(`${url}/api/stock/${stockId}/in`, {
          quantity: parseInt(quantity, 10),  // Convert to number
          purchasePrice: parseFloat(purchasePrice),  // Convert to number
          notes,
          date: formattedDate,
        });
  
        handleStockIn(quantity, purchasePrice, notes, stockId, formattedDate);
        handleClose();
        console.log("date:"+date);
      } catch (error) {
        console.error('Error updating stock:', error);
        alert('Failed to update stock. Please try again.');
      }
    } else {
      alert('Please fill in all fields.');
    }
  };  

  return (
    <Modal show={show} onHide={handleClose} centered size="md">
      <Modal.Header closeButton>
        <Modal.Title>Stock In</Modal.Title>
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
          <Form.Group controlId="formQuantity" className="mt-3">
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
            />
          </Form.Group>
          <Form.Group controlId="formPurchasePrice" className="mt-3">
            <Form.Label>Purchase Price</Form.Label>
            <Form.Control
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
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
        <Button variant="primary" onClick={handleSubmit}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default StockInModal;
