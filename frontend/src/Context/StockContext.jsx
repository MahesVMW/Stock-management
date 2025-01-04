import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const StockContext = createContext();

export const StockProvider = ({ children }) => {
  const [stocks, setStocks] = useState([]);
  const [token, setToken] = useState("");
  const [historyLog, setHistoryLog] = useState([]);
  const url = "https://stock-management-backend-z6jh.onrender.com"; 

  useEffect(() => {
    const savedStocks = JSON.parse(localStorage.getItem('stocks')) || []; 
    setStocks(savedStocks);
  }, []);  
  
  // Sync stocks and historyLogs with localStorage
  useEffect(() => {
    window.localStorage.setItem('stocks', JSON.stringify(stocks));
  }, [stocks]);  
  useEffect(() => {
    const storedHistory = JSON.parse(window.localStorage.getItem('historyLog'));
    if (storedHistory) {
      setHistoryLog(storedHistory);
    }
  }, []);

  // Add new history to the log (example)
  const addHistory = (newEntry) => {
    setHistoryLog((prev) => [...prev, newEntry]);
  };

  // Store the history log in localStorage whenever it updates
  useEffect(() => {
    window.localStorage.setItem('historyLog', JSON.stringify(historyLog));
  }, [historyLog]);

  // useEffect(() => {
  //   fetchStocks(); // Fetch stocks on component mount
  // }, []);
   

  useEffect(() => {
    if (localStorage.getItem("token")) {
      const token = localStorage.getItem("token");
      setToken(token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Set token for Axios
    }
  }, []);  

  const fetchStocks = async () => {
    try {
      const response = await axios.get(`${url}/api/stock`);
      setStocks(response.data);
    } catch (error) {
      console.error('Failed to fetch stocks', error);
    }
  };

  const updateStock = (stockId, updatedStock) => {
    setStocks(prevStocks =>
      prevStocks.map(stock => (stock._id === stockId ? updatedStock : stock))
    );
  };

  const addStock = async (stock) => {
    try {
      stock.quantity = Number(stock.quantity);
      const response = await axios.post(`${url}/api/stock/stock`, stock);
      setStocks(prevStocks => [...prevStocks, response.data]);
    } catch (error) {
      console.error('Failed to add stock', error);
    }
  };

  const handleStockIn = async (quantity, purchasePrice, notes, stockId, date) => {
    try {
      const response = await axios.put(`${url}/api/stock/${stockId}/in`, {
        quantity,
        purchasePrice,
        notes,
        date,
      });
      const updatedStock = response.data;
  
      setStocks((prevStocks) =>
        prevStocks.map((stock) =>
          stock._id === updatedStock._id ? updatedStock : stock
        )
      );
  
      localStorage.setItem('stocks', JSON.stringify(
        stocks.map((stock) => (stock._id === updatedStock._id ? updatedStock : stock)))
      );
  
      const newLog = {
        type: 'in',
        stockId,
        quantity,
        price: purchasePrice,
        notes,
        date,
      };
      setHistoryLog((prevLogs) => {
        const updatedLogs = [...prevLogs, newLog];
        localStorage.setItem('historyLogs', JSON.stringify(updatedLogs)); // Update localStorage
        return updatedLogs;
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock');
    }
  };
  
  const handleStockOut = async (quantity, salePrice, notes, stockId, date) => {
    try {
      const response = await axios.put(`${url}/api/stock/${stockId}/out`, {
        quantity,
        salePrice,
        notes,
        date,
      });
      const updatedStock = response.data;
  
      setStocks((prevStocks) =>
        prevStocks.map((stock) =>
          stock._id === updatedStock._id ? updatedStock : stock
        )
      );
  
      localStorage.setItem('stocks', JSON.stringify(
        stocks.map((stock) => (stock._id === updatedStock._id ? updatedStock : stock)))
      );
  
      const newLog = {
        type: 'out',
        stockId,
        quantity,
        price: salePrice,
        notes,
        date,
      };
      setHistoryLog((prevLogs) => {
        const updatedLogs = [...prevLogs, newLog];
        localStorage.setItem('historyLogs', JSON.stringify(updatedLogs)); // Update localStorage
        return updatedLogs;
      });
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Failed to update stock');
    }
  };

  const removeStock = async (id) => {
    try {
      await axios.delete(`${url}/api/stock/${id}/delete`);
      setStocks((prevStocks) => {
        const updatedStocks = prevStocks.filter((stock) => stock._id !== id);
        return updatedStocks;
      });
    } catch (error) {
      console.error('Error deleting stock from backend:', error);
      setStocks((prevStocks) => {
        const updatedStocks = prevStocks.filter((stock) => stock._id !== id);
        return updatedStocks;
      });
      alert('Stock not found in the database, removed from local storage.');
    }
  };

  return (
    <StockContext.Provider value={{ token, setToken, stocks, url, historyLog, setHistoryLog, addHistory, addStock, updateStock, fetchStocks, handleStockIn, handleStockOut, removeStock }}>
      {children}
    </StockContext.Provider>
  );  
};
