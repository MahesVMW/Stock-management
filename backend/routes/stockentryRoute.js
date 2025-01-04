import express from 'express';
import { deleteStock, stockentry, stockIn, stockOut } from '../controllers/stockentryController.js'; // Adjust the path based on your project structure

const router = express.Router();

// POST route to handle stock entry
router.post('/stock', stockentry);

// PUT route to handle stock in by ID
router.put('/:id/in', stockIn);  

// PUT route to handle stock out by ID
router.put('/:id/out', stockOut); 

// DELETE route to remove stock by ID
router.delete('/:id/delete', deleteStock);


export default router;
