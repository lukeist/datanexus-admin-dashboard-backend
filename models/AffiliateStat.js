import mongoose from "mongoose";

const AffiliateStatSchema = new mongoose.Schema({
  // 1 to 1 relationship: 1 userId = 1 affiliateStat
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  // 1 to many relationship: 1 userId -> array of transaction
  affiliateSales: {
    type: [mongoose.Types.ObjectId],
    ref: "Transaction",
  },
});

const AffiliateStat = mongoose.model("AffiliateStat", AffiliateStatSchema);

export default AffiliateStat;
