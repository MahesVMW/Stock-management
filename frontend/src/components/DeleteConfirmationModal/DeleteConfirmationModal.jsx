// DeleteConfirmationModal.jsx
import React from 'react';
import './DeleteConfirmationModal.css'; // Style the modal as needed
import { assets } from '../../assets/assets';

const DeleteConfirmationModal = ({ stock, onDelete, onCancel }) => {
  return (
    <div className="delete-modal">
      <div className="delete-modal-content">
        <img src={assets.delete_icon} alt={stock.productName} className="delete-modal-image" />
        <h3>Are you sure you want to delete stock {stock.productname}?</h3>
        <div className="delete-modal-actions">
          <button className="btn btn-danger" onClick={onDelete}>
            Delete
          </button>
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
