const express = require("express");
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT | 4000;


app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
      res.send("Server is Running");
})

//mongoDB



const uri = "mongodb+srv://everythingMart:8Sog63v2MyWO5ERS@cluster0.hf0dtbg.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
      serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true,
      }
});

async function run() {
      try {

            const cartsCollection = client.db("everythingMart").collection('cartData');



            app.post('/data/upload', async (req, res) => {
                  try {
                        const data = req.body;
                        const result = await cartsCollection.insertMany(data);
                        console.log(result);
                        res.sendStatus(200);

                  } catch (error) {
                        res.sendStatus(500);
                  }
            });

            app.get('/customer_info/:id', async (req, res) => {
                  const id = req.params.id;
                  const query = { 'Order ID': id }
                  const result = await cartsCollection.find(query).toArray()

                  res.send(result)
            })

            app.get('/customer_info', async (req, res) => {
                  try {
                        const result = await cartsCollection.aggregate([
                              {
                                    $addFields: {
                                          Quantity: { $toDouble: "$Quantity" },
                                          "Unit Price": { $toDouble: "$Unit Price" }
                                    }
                              },
                              {
                                    $group: {
                                          _id: "$Customer",
                                          ID: { $first: "$Order ID" },
                                          customerName: { $first: "$Customer" },
                                          totalAmount: { $sum: { $multiply: ["$Quantity", "$Unit Price"] } },

                                          orderDate: { $first: "$Order Date" }
                                    }
                              }
                        ]).toArray();

                        res.json(result);
                  } catch (error) {

                        res.status(500).json({ error: 'Internal Server Error' });
                  }
            });



            await client.db("admin").command({ ping: 1 });
            console.log("Pinged your deployment. You successfully connected to MongoDB!");
      } finally {

      }
}
run().catch(console.dir);


//mongoDB


app.listen(port, () => {
      console.log(`Server running at port ${port}`);
})

// everythingMart
// 8Sog63v2MyWO5ERS