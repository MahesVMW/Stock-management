import asyncHandler from 'express-async-handler';
import StockModel from '../models/Stockmodel.js'; 

// Controller for creating a new stock entry
const stockentry = asyncHandler(async (req, res) => {
  const { productname, productCategory, salePrice, openingStock, lowStock, purchasePrice, stockValue, notes } = req.body;

  if (!productname || !productCategory || !salePrice || !openingStock || !lowStock || !purchasePrice) {
    res.status(400);
    throw new Error("Please fill in all required fields");
  }

  const computedStockValue = stockValue || (purchasePrice * openingStock);

  const stock = await StockModel.create({
    productname,
    productCategory,
    salePrice,
    openingStock,
    actualStock: openingStock,  // Add actualStock field
    lowStock,
    purchasePrice,
    stockValue: computedStockValue,
    notes
  });

  if (stock) {
    res.status(201).json(stock);
  } else {
    res.status(400);
    throw new Error("Failed to create stock entry");
  }
});

const stockIn = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { quantity, purchasePrice, notes } = req.body;
  
    try {
      const stock = await StockModel.findById(id);
      if (!stock) {
        return res.status(404).json({ message: 'Stock not found' });
      }
  
      // Update actual stock and stock value
      stock.actualStock += parseInt(quantity, 10);
      stock.stockValue += parseFloat(quantity) * parseFloat(purchasePrice);
  
      // Add entry to history
      stock.history.push({
        type: 'in',
        date: new Date(),
        notes,
        quantity: parseInt(quantity, 10),
        price: parseFloat(purchasePrice),
        stockBalance: stock.actualStock // Balance after update
      });
  
      const updatedStock = await stock.save();
  
      res.json(updatedStock);
    } catch (error) {
      console.error('Error updating stock:', error);
      res.status(500).json({ message: 'Error updating stock' });
    }
  });  
  
  

  const stockOut = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { quantity, salePrice, notes } = req.body;
  
    try {
      const stock = await StockModel.findById(id);
      if (!stock) {
        return res.status(404).json({ message: 'Stock not found' });
      }
  
      if (stock.actualStock < parseInt(quantity, 10)) {
        return res.status(400).json({ message: 'Insufficient stock to perform this operation' });
      }
  
      // Update actual stock and stock value
      stock.actualStock -= parseInt(quantity, 10);
      stock.stockValue -= parseFloat(quantity) * parseFloat(salePrice);
  
      // Add entry to history
      stock.history.push({
        type: 'out',
        date: new Date(),
        notes,
        quantity: parseInt(quantity, 10),
        price: parseFloat(salePrice),
        stockBalance: stock.actualStock // Balance after update
      });
  
      const updatedStock = await stock.save();
  
      res.json(updatedStock);
    } catch (error) {
      console.error('Error updating stock:', error);
      res.status(500).json({ message: 'Error updating stock' });
    }
  });  
  
  
  const deleteStock = async (req, res) => {
    try {
      const stockId = req.params.id;
      console.log('Stock ID to delete:', stockId);  // Log the stock ID being deleted
  
      // Attempt to delete stock
      const deletedStock = await StockModel.findByIdAndDelete(stockId);
  
      if (!deletedStock) {
        // Log if the stock was not found
        console.log('Stock not found for deletion');
        return res.status(404).json({ message: 'Stock not found' });
      }
  
      console.log('Deleted Stock:', deletedStock);  // Log the deleted stock for confirmation
      return res.status(200).json({ message: 'Stock deleted successfully', deletedStock });
    } catch (error) {
      console.error('Error deleting stock:', error);
      return res.status(500).json({ message: 'Error deleting stock', error });
    }
  };
   
  
  
  
  
  
  
export { stockentry, stockIn, stockOut,deleteStock};
