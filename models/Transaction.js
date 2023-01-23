import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  userId: String,
  cost: String, // should have been Number
  products: {
    type: [mongoose.Types.ObjectId],
    of: Number,
  },
});

const Transaction = mongoose.model("Transaction", TransactionSchema);

export default Transaction;
