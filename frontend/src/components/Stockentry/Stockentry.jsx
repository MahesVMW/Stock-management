import React, { useState, useContext } from 'react';
import { StockContext } from '../../Context/StockContext';
import { useNavigate } from 'react-router-dom';
import './Stockentry.css';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

const StockEntryModal = ({ show, handleClose }) => {
  const { addStock } = useContext(StockContext);
  const navigate = useNavigate();
  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('Pieces-PCS');
  const [salePrice, setSalePrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [openingStock, setOpeningStock] = useState('');
  const [lowStock, setLowStock] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newStock = {
      productname: productName,
      productCategory,
      salePrice: parseFloat(salePrice),
      purchasePrice: parseFloat(purchasePrice),
      openingStock: parseInt(openingStock),
      lowStock: parseInt(lowStock),
      stockValue: parseFloat(salePrice) * parseInt(openingStock),
      date,
      notes
    };
    addStock(newStock);
    setProductName('');
    setProductCategory('');
    setSalePrice('');
    setPurchasePrice('');
    setOpeningStock('');
    setLowStock('');
    setDate('');
    setNotes('');
    navigate('/dashboard');
    handleClose();
  };

  return (

    <Modal show={show} onHide={handleClose} centered size="md">
    <Modal.Header closeButton>
      <Modal.Title>Stock Entry</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form>
        <Form.Group controlId="ProductName">
          <Form.Label>Product Name</Form.Label>
          <Form.Control
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
          />
        </Form.Group>
        
        <Row className="mt-3">
          <Col>
            <Form.Group controlId="productCategory">
              <Form.Label>Category</Form.Label>
              <Form.Select 
                value={productCategory} 
                onChange={(e) => setProductCategory(e.target.value)}
              >
                <option value="" disabled>Select Category</option>
                <option value="Pieces-PCS">Pieces-PCS</option>
                <option value="Kilograms-KGS">Kilograms-KGS</option>
                <option value="Bottles-BTL">Bottles-BTL</option>
                <option value="Bags-BAG">Bags-BAG</option>
                <option value="Numbers-NOS">Numbers-NOS</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="SalePrice">
              <Form.Label>Sale Price</Form.Label>
              <Form.Control
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                min="0.01"
                step="0.01"
              />
            </Form.Group>
          </Col>
        </Row>
  
        <Row className="mt-3">
          <Col>
            <Form.Group controlId="PurchasePrice">
              <Form.Label>Purchase Price</Form.Label>
              <Form.Control
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="openingStock">
              <Form.Label>Opening Stock</Form.Label>
              <Form.Control
                type="number"
                value={openingStock}
                onChange={(e) => setOpeningStock(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
  
        <Row className="mt-3">
          <Col>
            <Form.Group controlId="lowStock">
              <Form.Label>Low Stock</Form.Label>
              <Form.Control
                type="number"
                value={lowStock}
                onChange={(e) => setLowStock(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="Date">
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
  
        <Form.Group controlId="Notes" className="mt-3">
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
        Save
      </Button>
    </Modal.Footer>
  </Modal>
  );
};

export default StockEntryModal;
