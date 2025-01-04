import React from 'react';
import './StockDetails.css'; // Ensure you have this CSS file for styling

const StockDetails = ({ stock, historyLog }) => {
  if (!stock) {
    return <div>No stock details available.</div>;
  }

  const formatPrice = (price) => (price ? price.toFixed(2) : 'N/A');

  return (
    <div className="stock-details-container">
      <h2>{stock.productName || 'Product Details'}</h2>
      <div className="stock-details">
        <h4>Product Information</h4>
        <p>Category: {stock.productCategory || 'N/A'}</p>
        <p>Sale Price: ${formatPrice(stock.salePrice)}</p>
        <p>Opening Stock: {stock.openingStock || 'N/A'}</p>
        <p>Stock Value: ${formatPrice(stock.stockValue)}</p>
        <p>Date: {stock.date || 'N/A'}</p>
      </div>

      <div className="history-log">
        <h3>Stock History Log</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Notes</th>
              <th>Stock Balance</th>
            </tr>
          </thead>
          <tbody>
            {historyLog.length === 0 ? (
              <tr>
                <td colSpan="6">No history available.</td>
              </tr>
            ) : (
              historyLog.map((log, index) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor:
                      log.type === 'Stock In' ? 'rgba(70, 190, 96, 0.2)' : 'rgba(190, 70, 70, 0.2)',
                  }}
                >
                  <td>{log.date}</td>
                  <td>{log.type}</td>
                  <td>{log.quantity}</td>
                  <td>${formatPrice(log.price)}</td>
                  <td>{log.notes || 'N/A'}</td>
                  <td>${formatPrice(log.stockBalance)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockDetails;
