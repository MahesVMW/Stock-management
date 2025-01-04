import React, { useContext, useState, useEffect, useRef } from 'react';
import { StockContext } from '../../Context/StockContext';
import { assets } from '../../assets/assets';
import './Dashboard.css';
import StockInModal from '../StockInModal/StockInModal';
import StockOutModal from '../StockOutModal/StockOutModal';
import { useSnackbar } from 'notistack';
import DeleteConfirmationModal from '../DeleteConfirmationModal/DeleteConfirmationModal';
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS styles
import { gsap } from 'gsap';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Snowfall from 'react-snowfall';
import StockEntry from '../Stockentry/Stockentry';
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const Dashboard = () => {

  const { stocks = [],historyLog,setHistoryLog,updateStock,removeStock,token } = useContext(StockContext);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [stockToDelete, setStockToDelete] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [modalType, setModalType] = useState('');
  const [expandedStockIndex, setExpandedStockIndex] = useState(null);
  const [totalSales, setTotalSales] = useState(0); // Total sales value
  const [totalCost, setTotalCost] = useState(0);   // Total cost of stock
  const [profitLoss, setProfitLoss] = useState(0); // Profit/Loss
  const { enqueueSnackbar } = useSnackbar();
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showProfitLossModal, setShowProfitLossModal] = useState(false);
  const [historyStock, setHistoryStock] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // For Lottie animation
  const [showAnimation,setshowAnimation] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);

  

  const [totalStockValue, setTotalStockValue] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStocks, setFilteredStocks] = useState(stocks);
  const animationContainerRef = useRef(null);
  useEffect(() => {
    const tl = gsap.timeline();
    // Animate the container of the Lottie animation
    tl.fromTo(
      animationContainerRef.current,
      { x: 0, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, ease: 'bounce.out' }
    ); 
  }, []);
  
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStocks(stocks);
      setshowAnimation(false); 
    } else {
      const lowerCaseSearch = searchTerm.toLowerCase();
      const filtered = stocks.filter(
        (stock) =>
          stock.productname?.toLowerCase().includes(lowerCaseSearch) || 
          stock.stockValue?.toString().includes(searchTerm) ||
          stock.purchasePrice?.toString().includes(searchTerm)  ||
          stock.salePrice?.toString().includes(searchTerm) ||       
          stock.notes?.toString().includes(searchTerm) 
      );
      setFilteredStocks(filtered);
  
      // Show animation only when no results are found
      setshowAnimation(filtered.length === 0);
    }
  }, [searchTerm, stocks]);    
  
  useEffect(() => {
    AOS.init({ duration: 1000 }); // Initialize AOS with custom options
  }, []);

  useEffect(() => {
    const totalValue = stocks.reduce((acc, stock) => acc + (stock.stockValue || 0), 0);
    const lowStockItemsCount = stocks.filter(stock => stock.openingStock <= stock.lowStock).length;

    setTotalStockValue(totalValue);
    setLowStockCount(lowStockItemsCount);
  }, [stocks]); 
  useEffect(() => {
    const tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-toggle="tooltip"]')
    );
    const tooltipList = tooltipTriggerList.map(
      (tooltipTriggerEl) => new window.bootstrap.Tooltip(tooltipTriggerEl)
    );
  
    // Cleanup tooltips on unmount
    return () => {
      tooltipList.forEach((tooltip) => tooltip.dispose());
    };
  }, []);  
  useEffect(() => {
    const savedIndex = localStorage.getItem('expandedStockIndex');
    if (savedIndex !== null) {
      setExpandedStockIndex(savedIndex !== '' ? parseInt(savedIndex, 10) : null);
    }
  }, []);
  useEffect(() => {
    const profit = calculatePerStockProfitLoss();
    setProfitLoss(profit);
  }, [stocks, historyLog]); // Recalculate per-stock profit/loss
  
  const openHistoryModal = (stock) => {
    setHistoryStock(stock);
    setShowHistoryModal(true);
  };
  const calculatePerStockProfitLoss = () => {
    return stocks.map((stock) => {
      const logs = historyLog.filter((log) => log.stockId === stock._id); // Filter logs for the current stock.
      let inventory = []; // LIFO inventory tracking
      let profitLoss = 0; // Total profit/loss for this stock
  
      logs.forEach((log) => {
        if (log.type === 'Stock In') {
          // Only track stock quantity and price in inventory
          inventory.push({ quantity: log.quantity, price: log.price });
        } else if (log.type === 'Stock Out') {
          let remainingQuantity = log.quantity; // Quantity to sell
  
          // Process the stock out using LIFO logic
          while (remainingQuantity > 0 && inventory.length > 0) {
            const currentStock = inventory[inventory.length - 1]; // Get the last stock in inventory
  
            if (currentStock.quantity <= remainingQuantity) {
              // Use all of the current stock
              const costPrice = currentStock.quantity * currentStock.price; // Total cost of the current stock
              const saleValue = currentStock.quantity * log.price; // Total sale value of the current stock
              profitLoss += saleValue - costPrice; // Calculate profit or loss
              remainingQuantity -= currentStock.quantity; // Reduce remaining quantity to sell
              inventory.pop(); // Remove the current stock from inventory
            } else {
              // Use part of the current stock
              const costPrice = remainingQuantity * currentStock.price; // Total cost for the remaining quantity
              const saleValue = remainingQuantity * log.price; // Total sale value for the remaining quantity
              profitLoss += saleValue - costPrice; // Calculate profit or loss
              currentStock.quantity -= remainingQuantity; // Update the remaining quantity in the current stock
              remainingQuantity = 0; // All required quantity has been sold
            }
          }
        }
      });
  
      return {
        stockName: stock.productname || 'Unnamed Stock', // Return stock name or a default name
        profitLoss, // Total profit/loss for this stock
      };
    });
  };  
  

  const handleStockIn = async (quantity, purchasePrice, notes, stockId, selectedDate) => {
    const newQuantity = parseInt(quantity, 10);
    const stockToUpdate = stocks.find(stock => stock._id === stockId);
  
    const stockCost = newQuantity * parseFloat(purchasePrice);
  
    // Update cost incrementally
    setTotalCost(prevCost => prevCost + stockCost);
  
    const updatedStock = {
      ...stockToUpdate,
      openingStock: stockToUpdate.openingStock + newQuantity,
      actualStock: (parseInt(stockToUpdate.actualStock, 10) || stockToUpdate.openingStock) + newQuantity,
      stockValue: stockToUpdate.stockValue + stockCost,
    };
  
    await updateStock(stockId, updatedStock);
    addToHistoryLog('Stock In', newQuantity, purchasePrice, notes, updatedStock, stockId, selectedDate);
    enqueueSnackbar('Stock added successfully!', { variant: 'success' });
    handleCloseModal();
  };
  
  const handleStockOut = async (quantity, salePrice, notes, stockId, selectedDate) => {
    const newQuantity = parseInt(quantity, 10);
    console.log("quantity:"+newQuantity);
    const stockToUpdate = stocks.find(stock => stock._id === stockId);
  
    if (!stockToUpdate || quantity > stockToUpdate.openingStock) {
      enqueueSnackbar("Quantity exceeds available stock.", { variant: 'error' });
      return;
    }
  
    const salesValue = newQuantity * parseFloat(salePrice);
  
    // Update sales incrementally
    setTotalSales(prevSales => prevSales + salesValue);
  
    const updatedStock = {
      ...stockToUpdate,
      actualStock: stockToUpdate.actualStock - newQuantity,
      openingStock: stockToUpdate.openingStock - newQuantity,
      stockValue: stockToUpdate.stockValue - salesValue,
    };
  
    await updateStock(stockId, updatedStock);
    addToHistoryLog('Stock Out', newQuantity, salePrice, notes, updatedStock, stockId, selectedDate);
    enqueueSnackbar('Stock Out successfully!', { variant: 'info' });
    handleCloseModal();
  };  

  const handleDelete = (index) => {
    const stockToDelete = stocks[index];
    setStockToDelete(stockToDelete);  // Set the stock to be deleted
    setShowDeleteModal(true);         // Show confirmation modal
  };
  
  const confirmDelete = () => {
    if (stockToDelete) {
      setIsDeleting(true); // Show animation immediately
  
      setTimeout(() => {
        // Perform deletion
        removeStock(stockToDelete._id);
  
        const stockValue = stockToDelete.stockValue || 0;
        const stockSales = stockToDelete.salesValue || 0;
  
        // Clean up associated logs
        const updatedHistoryLog = historyLog.filter(log => log.stockId !== stockToDelete._id);
        setHistoryLog(updatedHistoryLog);
        localStorage.setItem('historyLog', JSON.stringify(updatedHistoryLog)); // Save to localStorage
  
        // Update totalCost and totalSales
        setTotalCost(prevCost => prevCost - stockValue);
        setTotalSales(prevSales => prevSales - stockSales);
  
        setShowDeleteModal(false);
        setStockToDelete(null); // Clear stockToDelete after deletion
  
        // Update filteredStocks after deletion
        const updatedStocks = filteredStocks.filter(
          (stock) => stock !== stockToDelete
        );
        setFilteredStocks(updatedStocks);
  
        setIsDeleting(false); // Hide animation
        enqueueSnackbar('Stock deleted successfully!', { variant: 'success' });
      }, 4000); // Match this with the animation duration
    }
  };  
  

const cancelDelete = () => {
  setShowDeleteModal(false);
  setStockToDelete(null);
};
const addToHistoryLog = (type, quantity, price, notes, updatedStock, stockId, date) => {
  const newLog = {
      date: date || new Date().toISOString(),
      type: type,
      productName: updatedStock.productName,
      quantity: quantity,
      price: price,
      notes: notes,
      stockBalance: updatedStock.openingStock,
      stockId: stockId,
  };
  
  setHistoryLog(prevLogs => {
      const updatedLogs = [...prevLogs, newLog];
      window.localStorage.setItem('historyLog', JSON.stringify(updatedLogs)); // Save to localStorage
      return updatedLogs;
  });
};



  

  const handleShowModal = (stock, type) => {
    setSelectedStock(stock);
    setModalType(type);
    setShowModal(true);
  };
  const handleAddStockEntryModal = () => {
    setSelectedStock(stocks);
    setModalType('Add');
    setShowEntryModal(true);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setShowEntryModal(false);
    setSelectedStock(null);
  };
  
  const renderStockRow = (stock) => {
    const formattedDate = stock.date ? new Date(stock.date).toLocaleDateString('en-GB') : 'N/A';
  
    return (
      <tr key={stock._id}>
        <td>{stock.productCategory || 'N/A'}</td>
        <td>{stock.productname || 'N/A'}</td>
        <td>{stock.actualStock || stock.openingStock}</td>
        <td>${Math.round(stock.stockValue || 0)}</td>
        <td>{formattedDate}</td> 
        <td>{stock.purchasePrice}</td>
        <td>{stock.salePrice}</td>
        <td>{stock.notes}</td>
      </tr>
    );
  };

  const handleExport = (stock, historyLog, format) => {
    // Prepare stock details
    const stockDetails = {
      Category: stock.productCategory,
      "Stock Name": stock.productname,
      "Stock Value": stock.stockValue,
      "Current Stock": stock.actualStock,
      Date: new Date(stock.date).toLocaleDateString(),
      Cost: stock.purchasePrice,
      Sale: stock.salePrice,
      Notes: stock.notes,
    };
  
    // Prepare history log
    const filteredLogs = historyLog.filter((log) => log.stockId === stock._id);
    const historyDetails = filteredLogs.map((log) => ({
      Date: new Date(log.date).toLocaleDateString(),
      Type: log.type,
      Quantity: log.quantity,
      Price: log.price,
      "Stock Balance": log.stockBalance,
    }));
  
    if (format === "csv") {
      // Prepare CSV data with headings
      let csvData = "Stock Details\n";
      csvData += Object.keys(stockDetails).join(",") + "\n";
      csvData += Object.values(stockDetails).join(",") + "\n\n";
  
      csvData += "History Log Details\n";
      if (historyDetails.length > 0) {
        csvData += Object.keys(historyDetails[0]).join(",") + "\n";
        csvData += historyDetails
          .map((row) => Object.values(row).join(","))
          .join("\n");
      } else {
        csvData += "No history available.";
      }
  
      // Save as CSV
      const blob = new Blob([csvData], { type: "text/csv" });
      saveAs(blob, `${stock.productname}_details.csv`);
    } else if (format === "excel") {
      // Prepare data for Excel
      const worksheetData = [["Stock Details"]];
      worksheetData.push(Object.keys(stockDetails));
      worksheetData.push(Object.values(stockDetails));
      worksheetData.push([]);
      worksheetData.push(["History Log Details"]);
  
      if (historyDetails.length > 0) {
        worksheetData.push(Object.keys(historyDetails[0]));
        historyDetails.forEach((row) => {
          worksheetData.push(Object.values(row));
        });
      } else {
        worksheetData.push(["No history available."]);
      }
  
      // Create worksheet and workbook
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Stock Details");
  
      // Save as Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
      saveAs(blob, `${stock.productname}_details.xlsx`);
    } else if (format === "txt") {
      // Prepare plain text data with headings
      const stockText = `
  Stock Details:
  Category: ${stock.productCategory}
  Stock Name: ${stock.productname}
  Stock Value: ${stock.stockValue}
  Current Stock: ${stock.actualStock}
  Date: ${new Date(stock.date).toLocaleDateString()}
  Cost: ${stock.purchasePrice}
  Sale: ${stock.salePrice}
  Notes: ${stock.notes}
  `;
  
      const historyText = filteredLogs.length > 0
        ? filteredLogs
            .map(
              (log) =>
                `Date: ${new Date(log.date).toLocaleDateString()}, Type: ${log.type}, Quantity: ${log.quantity}, Price: $${log.price}, Stock Balance: ${log.stockBalance}`
            )
            .join("\n")
        : "No history available.";
  
      const exportData = `${stockText}\nHistory Log:\n${historyText}`;
      const blob = new Blob([exportData], { type: "text/plain" });
      saveAs(blob, `${stock.productname}_details.txt`);
    }
  };
  
  const renderHistoryLog = (stock) => {
    const filteredLogs = historyLog.filter(log => log.stockId === stock._id);
    return filteredLogs.length > 0 ? (
      <table className="table table-responsive table-bordered table-striped table-hover">
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Stock Balance</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((log, index) => {
            const formattedDate = log.date ? new Date(log.date).toLocaleDateString('en-GB').trim() : 'N/A';
            return (
              <tr key={index}>
                <td>{formattedDate}</td>
                <td>{log.type}</td>
                <td>{log.quantity}</td>
                <td>{log.price ? parseFloat(log.price).toFixed(2) : 'N/A'}</td>
                <td>{log.stockBalance}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    ) : (
      <div className="no-history-animation">
        <DotLottieReact
          src="https://lottie.host/f35dcbe7-8e02-42be-b75e-1d3f6f131aaf/aQJOgzYWOo.lottie"
          style={{ width: 150, height: 150 }}
          loop
          autoplay
        />
        <p className="no-history-text">No history available</p>
      </div>
    );
};
  
  return (
    <div style={{ height: '100vh', position: 'relative'}}>
    <Snowfall 
      color="#7DF9FF" // Customize snowflake color
      snowflakeCount={100} // Number of snowflakes
      style={{ zIndex: -1 }} // Ensures it stays in the background
    />
    <div className="containerr mt-4">
       <div className="header d-flex flex-wrap justify-content-between align-items-center mt-5">
  <h3 className="stock-dashboard-title">Stock Dashboard</h3>
  <div className="search-container">
    <div className="search-bar d-flex align-items-center">
      <input
        type="text"
        placeholder="Search by name or amount..."
        className="search-text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <i className="search-btn fa-solid fa-magnifying-glass"></i>
    </div>
      <button  onClick = {handleAddStockEntryModal} className="btn btn-primary"><i className="fa-solid fa-plus"></i>AddEntry</button>
  </div>
</div>
      <div className="total-stock d-flex mb-1 mt-0">
    
      <div className="total-card d-flex flex-row mt-3" data-aos="fade-right">
    <div className="stock-value d-flex flex-column">
      <h5 className="stock-value-text">Total Stock Value</h5>
      <h5 className="stock-value-amount">${Math.round(totalStockValue)}</h5>
      <p className="additional-text">Additional info about stock value.</p> {/* Additional text */}
    </div>
    <div className="icon-container" ref={animationContainerRef}>
    <DotLottieReact
              src="https://lottie.host/f8ea4b78-7a0c-4e00-b9f5-5fe2f43a8493/4qkvWg7BUf.lottie"
              loop
              autoplay
            />
    </div>
  </div>
  
  <div className="low-stock-count d-flex flex-row justify-content-between align-items-start mt-3" data-aos="fade-right">
    <div className="low-stock-value d-flex flex-column">
      <h5 className="low-stock-text">Low Stock Items</h5>
      <h5 className="low-stock-amount">{lowStockCount}</h5>
      <p className="low-stock-description">Items running low on stock.</p> {/* Additional text */}
    </div>
    <div className="icon-container" ref={animationContainerRef}>
    <DotLottieReact
              src="https://lottie.host/6683f53a-d432-4d3c-93e7-efdead415c60/HK1xdo0RJj.lottie"
              loop
              autoplay
            />
    </div>
  </div>
  <div className='profit-loss-percent d-flex flex-row justify-content-between align-items-start mt-3' data-aos="fade-down-right">
  <div className="profit-loss-value d-flex flex-column">
    <h5 className="profit-loss-text">Profit/Loss Report</h5>
    <div className="button-wrapper mt-2">
  <button
    type="button"
    className="btn btn-report"
    onClick={() => setShowProfitLossModal(true)}
    title="view Report"
    data-toggle="tooltip" data-placement="left"
  >
    <i className="fa-solid fa-newspaper"></i>
  </button>
  </div>
  </div>
  <div className="icon-container" ref={animationContainerRef}>
    <DotLottieReact
      src="https://lottie.host/6df7a81f-27f8-4c2d-8dfa-381dd25105e7/Wo1igkWhE1.lottie"
      loop
      autoplay
    />
  </div>
</div>
      </div>
  
      <div className="dashboard-container">
  {Array.isArray(stocks) && stocks.length > 0 ? (
    filteredStocks.map((stock, index) => (
      <div key={index} className="stock-item-wrapper">
        <div className="glass-card" data-aos="zoom-in">
          <div className="image-container">
            <img
              src={stock.productImage || assets.parcel_icon}
              alt={stock.productName}
              className="product-image"
            />
          </div>
          <div className="scrollable-table-container">
            <div className="stock-details">
              <h4>{stock.productName}</h4>
              <table className="table table-responsive table-striped table-hover">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>StockName</th>
                    <th>Currentstock</th>
                    <th>StockValue</th>
                    <th>Date</th>
                    <th>Cost$</th>
                    <th>Sale$</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>{renderStockRow(stock)}</tbody>
              </table>
              {stock.openingStock <= stock.lowStock && (
                <div className="low-stock-alert">Low Stock Alert!</div>
              )}
            </div>
          </div>
          <div className="button-wrapper mt-2">
            <button
              type="button"
              className="btn btn-add-stock"
              onClick={() => handleShowModal(stock, 'in')}
              title="Add Stock"
              data-toggle="tooltip"
              data-placement="left"
            >
              <i className="fa-solid fa-plus"></i>
            </button>

            <button
              type="button"
              className="btn btn-remove-stock ml-2"
              onClick={() => handleShowModal(stock, 'out')}
              title="Remove Stock"
              data-toggle="tooltip"
              data-placement="left"
            >
              <i className="fa-solid fa-minus"></i>
            </button>

            <button
              type="button"
              className="btn btn-view-history ml-2"
              onClick={() => openHistoryModal(stock)}
              title={expandedStockIndex === index ? 'Hide History' : 'View History'}
              data-toggle="tooltip"
              data-placement="left"
            >
              {expandedStockIndex === index ? (
                <i className="fa-regular fa-eye-slash"></i>
              ) : (
                <i className="fa-regular fa-eye"></i>
              )}
            </button>

            <button
              type="button"
              className="btn btn-export-txt ml-2"
              onClick={() => handleExport(stock, historyLog, 'txt')}
              title="Export as TXT"
              data-toggle="tooltip"
              data-placement="left"
            >
              <i className="fa-solid fa-file-export"></i>
            </button>

            <button
              type="button"
              className="btn btn-export-csv ml-2"
              onClick={() => handleExport(stock, historyLog, 'csv')}
              title="Export as CSV"
              data-toggle="tooltip"
              data-placement="left"
            >
              <i className="fa-solid fa-file-export"></i>
            </button>

            <button
              type="button"
              className="btn btn-export-excel ml-2"
              onClick={() => handleExport(stock, historyLog, 'excel')}
              title="Export as Excel"
              data-toggle="tooltip"
              data-placement="left"
            >
              <i className="fa-solid fa-file-export"></i>
            </button>

            <button
              type="button"
              className="btn btn-delete-stock ml-2"
              onClick={() => handleDelete(index)}
              title="Delete Stock"
              data-toggle="tooltip"
              data-placement="left"
            >
              <i className="fa-solid fa-trash"></i>
            </button>
          </div>
          {expandedStockIndex === index && (
            <div className="history-log slide-in">{renderHistoryLog(stock)}</div>
          )}
        </div>

        {/* Render Modal Outside */}
        {showDeleteModal && (
          <DeleteConfirmationModal
            stock={stockToDelete}
            onDelete={confirmDelete}
            onCancel={cancelDelete}
          />
        )}
        {/* Lottie Animation */}
        {isDeleting && (
          <div className="lottie-overlay">
            <DotLottieReact
              src="https://lottie.host/f35dcbe7-8e02-42be-b75e-1d3f6f131aaf/aQJOgzYWOo.lottie"
              style={{ width: 300, height: 300 }}
              loop
              autoplay
            />
          </div>
        )}
      </div>
    ))
  ) : (
    <div className="no-stocks-container">
      <DotLottieReact
        src="https://lottie.host/1aff5bb2-8ad0-45db-beb0-80665519f264/Z8Dimj5Jcg.lottie"
        style={{ width: 300, height: 300 }}
        loop
        autoplay
      />
      <p>No stocks available. Add new stock items to get started.</p>
    </div>
  )}
</div>

{showAnimation&& (
         <div className="no-search-animation">
         <DotLottieReact
                   src="https://lottie.host/53b4cc1e-f20e-489e-be0d-c25787029eee/YojruzbLdX.lottie"
                   style={{ width: 300, height: 300 }}
                   loop
                   autoplay
                 />
         </div>
      )}
{showHistoryModal && historyStock && (
  <div className="history-modal-overlay">
    <div className="history-modal-content">
      <div className="history-modal-header">
        <h4>History Log - {historyStock.productname}</h4>
        <button className="btn btn-danger" onClick={() => setShowHistoryModal(false)}>
          Close
        </button>
      </div>
      <div className="history-log">
        <div className="scrollable-content">
          {historyLog.filter((log) => log.stockId === historyStock._id).length > 0 ? (
            <>
              <table className="table table-responsive table-striped table-hover">
                <thead>
                  <tr>
                    <th>Stock Name</th> {/* Corrected to 'Stock Name' */}
                    <th>Date</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Stock Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {historyLog
                    .filter((log) => log.stockId === historyStock._id)
                    .map((log, index) => (
                      <tr key={index}>
                        <td>{historyStock.productname}</td> {/* Using the correct historyStock */}
                        <td>{new Date(log.date).toLocaleDateString()}</td>
                        <td>
                          {log.type === "Stock In" && (
                            <i className="fa-solid fa-arrow-up" style={{ color: "green" }}></i>
                          )}
                          {log.type === "Stock Out" && (
                            <i className="fa-solid fa-arrow-down" style={{ color: "red" }}></i>
                          )}
                        </td>
                        <td>{log.quantity}</td>
                        <td>${log.price}</td>
                        <td>{log.stockBalance}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
              <div className="history-modal-footer">
                <button className="btn btn-success">Export</button>
              </div>
            </>
          ) : (
            <div className="no-history-animation">
              <DotLottieReact
                src="https://lottie.host/8b10db5c-5e40-4ed7-b625-d80c9cd1c34c/RhHgZmPfKD.lottie"
                style={{ width: 200, height: 200 }}
                loop
                autoplay
              />
              <p className="no-history-text">No history available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)}


{/* profit/loss report */}
{showProfitLossModal && (
  <div className="profit-loss-modal-overlay">
    <div className="profit-loss-modal-content">
      <div className="profit-loss-modal-header">
        <h4>Detailed Profit/Loss Report</h4>
        <button 
          className="btn btn-danger" 
          onClick={() => setShowProfitLossModal(false)} // Close only this modal
        >
          Close
        </button>
      </div>
      <div className="profit-loss-table">
        {calculatePerStockProfitLoss().length > 0 ? (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Stock Name</th>
                <th>Profit/Loss</th>
              </tr>
            </thead>
            <tbody>
            {profitLoss.map((report, index) => (
  <tr key={index}>
  <td>{report.stockName}</td>
  <td style={{ color: report.profitLoss >= 0 ? 'green' : 'red' }}>
    {report.profitLoss >= 0 
      ? `Profit: $${report.profitLoss.toFixed(2)}`
      : `Loss: $${Math.abs(report.profitLoss).toFixed(2)}`
    }
  </td>
</tr>
))}
            </tbody>
          </table>
        ) : (
          <div className="no-history-animation">
            <DotLottieReact
              src="https://lottie.host/8b10db5c-5e40-4ed7-b625-d80c9cd1c34c/RhHgZmPfKD.lottie"
              style={{ width: '100%', height: '100%' }}
              loop
              autoplay
            />
            <p className="no-history-text">No profit or loss data available</p>
          </div>
        )}
      </div>
    </div>
  </div>
)}


      {/* Stock In Modal */}
      {showModal && modalType === 'in' && (
         <StockInModal
         show={showModal}
         handleClose={handleCloseModal}
         stock={selectedStock}
         handleStockIn={handleStockIn} // Pass handleStockIn function here
       />
      )}
      {showEntryModal && (
        <StockEntry
          show={showEntryModal}
          stock={selectedStock}
          handleClose={handleCloseModal}
        />
      )}
  
      {/* Stock Out Modal */}
      {showModal && modalType === 'out' && (
        <StockOutModal
          show={showModal}
          handleClose={handleCloseModal}
          stock={selectedStock}
          handleStockOut={handleStockOut}
        />
      )}
    </div>
    </div>
    
  );  
};

export default Dashboard;  