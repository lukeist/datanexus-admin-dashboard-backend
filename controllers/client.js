import Product from "../models/Product.js";
import User from "../models/User.js";
import ProductStat from "../models/ProductStat.js";
import Transaction from "../models/Transaction.js";
import getCountryIso3 from "country-iso-2-to-3";

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    const productsWithStats = await Promise.all(
      products.map(async (product) => {
        // get productStat of each product
        const stat = await ProductStat.find({
          productId: product._id,
        });
        return {
          ...product._doc, // return product info
          stat, // then combine all stat info
        };
      })
    );

    res.status(200).json(productsWithStats);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "user" }).select("-password"); // make sure don't include password when we send it to the front end
    res.status(200).json(customers);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    // sort should look like this: ***{'field': 'userId', 'sort': 'desc'}
    const { page = 1, pageSize = 20, sort = null, search = "" } = req.query;

    // formatted sort should look like {userId: -1}
    const generateSort = () => {
      const sortParsed = JSON.parse(sort); // parse the string *** into an object
      const sortFormatted = {
        [sortParsed.field]: (sortParsed.sort = "asc" ? 1 : -1),
      };
      return sortFormatted;
    };

    // if sort exists, we generate : dont do anything
    const sortFormatted = Boolean(sort) ? generateSort() : {};

    // set up transaction search
    const transactions = await Transaction.find({
      // we check for cost field
      // $or allows to search for multiple fields
      // https://youtube.com/watch?v=0cPCMIuDk2I&si=EnSIkaIECMiOmarE&t=12891
      $or: [
        { cost: { $regex: new RegExp(search, "i") } },
        { userId: { $regex: new RegExp(search, "i") } },
      ],
    })
      .sort(sortFormatted) // provide the query of sorting along side this search
      .skip(page * pageSize) // allow to skip to the proper page & page size we need
      .limit(pageSize); // limit to the page size of how many result we need

    // total amount of query
    const total = await Transaction.countDocuments(
      // give us number of document exists in the dbs
      {
        name: { $regex: search, $options: "i" },
      }
    );

    // send info to the front end:
    res.status(200).json({
      transactions,
      total,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getGeography = async (req, res) => {
  try {
    const users = await User.find();
    const mappedLocations = users.reduce(
      (acc, { country }) => {
        // https://youtube.com/watch?v=0cPCMIuDk2I&si=EnSIkaIECMiOmarE&t=15119
        // for every single user, grab the country value -> convert to ISO3 format
        const countryISO3 = getCountryIso3(country);
        if (!acc[countryISO3]) {
          // if it doesnt exist -> add into an object -> set it to 0
          acc[countryISO3] = 0;
        }
        // then increase that value
        acc[countryISO3]++;
        // return the object
        return acc;
      },
      {} // in the end, we have an object that lists all countries as keys and values = # of users in that country
    );

    // final formatting:
    const formattedLocations = Object.entries(mappedLocations).map(
      ([country, count]) => {
        return { id: country, value: count };
      }
    );

    res.status(200).json(formattedLocations);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
