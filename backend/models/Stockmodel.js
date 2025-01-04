import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
  productname: { type: String, required: [true,"Please add a product name"] },
  productCategory: { type: String, required: [true,"Please select a product"] },
  salePrice: { type: Number, required: [true,"Please add a sale price"] },
  openingStock: { type: Number, required: [true,"Please add opening stock"] },
  lowStock: { type: Number, required: [true,"Please add low stock"] },
  purchasePrice: { type: Number, required: [true,"Please add a purchase price"] },
  actualStock: { type: Number, default: 0 },
  stockValue: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
  notes: { type: String },
  
  // Add history array
  history: [{
    type: { type: String }, // "in" or "out"
    date: { type: Date, default: Date.now },
    notes: { type: String },
    quantity: { type: Number },
    price: { type: Number }, // salePrice or purchasePrice
    stockBalance: { type: Number } // actualStock after the transaction
  }]
});

const StockModel = mongoose.model('Stock', stockSchema);

export default StockModel;
