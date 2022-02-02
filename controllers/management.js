import mongoose from "mongoose";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";
export const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password");
    res.status(200).json(admins);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getUserPerformance = async (req, res) => {
  try {
    // grab info about specific user
    // grab user id from params
    const { id } = req.params;
    //// another approach compare to /controllers/client.js -> faster + better practice with aggregate
    //// using aggregate call to combine current user's normal info + affiliate stat info
    const userWithStats = await User.aggregate([
      //  convert the id above into correct format then find one that match,
      //// matching our current user using id === _id
      { $match: { _id: new mongoose.Types.ObjectId(id) } }, //
      ,
      {
        //
        $lookup: {
          // https://youtube.com/watch?v=0cPCMIuDk2I&si=EnSIkaIECMiOmarE&t=21427
          //// look up the 'affiliatestats' table
          // grab info from affiliatestat model
          from: "affiliatestats",
          ////   compare _id of current user with
          // use the localfield of _id
          localField: "_id",
          //// with the userId in the 'affiliatestats' table
          // then compare to the foreing field userId
          foreignField: "userId",
          // then display the info as affiliateStats
          //// save that info in the property 'affiliateStats'
          as: "affiliateStats",
        },
      },
      //// flatten the array
      { $unwind: "$affiliateStats" },
    ]);

    const saleTransactions = await Promise.all(
      userWithStats[0].affiliateStats.affiliateSales.map((id) => {
        return Transaction.findById(id);
      })
    );

    const filteredSaleTransactions = saleTransactions.filter(
      (transaction) => transaction !== null
    );
    res
      .status(200)
      .json({ user: userWithStats[0], sales: filteredSaleTransactions });
  } catch {
    res.status(404).json({ message: error.message });
  }
};
