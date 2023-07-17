const express = require("express");
const app = express();
const multer = require('multer');
const csvtojson = require('csvtojson');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT | 4000;

const upload = multer({ dest: 'uploads/' });
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
            // Connect the client to the server	(optional starting in v4.7)
            // await client.connect();
            const cartsCollection = client.db("everythingMart").collection('cartData');



            app.post('/data/upload', upload.single('file'), async (req, res) => {
                  try {
                        // Convert the uploaded CSV file to JSON
                        const data = await csvtojson().fromFile(req.file.path);
                        const result = await cartsCollection.insertMany(data);
                        res.sendStatus(200);

                  } catch (error) {
                        res.sendStatus(500);
                  }
            });

            app.get('/customer_info/:id',async(req,res)=>{
                  const id = req.params.id;
                  const query= {'Order ID':id}
                  const result = await cartsCollection.find(query).toArray()
                  console.log(result);
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
                    console.error('Error retrieving customer info:', error);
                    res.status(500).json({ error: 'Internal Server Error' });
                  }
                });


            // Send a ping to confirm a successful connection
            await client.db("admin").command({ ping: 1 });
            console.log("Pinged your deployment. You successfully connected to MongoDB!");
      } finally {
            // Ensures that the client will close when you finish/error
            // await client.close();
      }
}
run().catch(console.dir);


//mongoDB


app.listen(port, () => {
      console.log(`Server running at port ${port}`);
})

// everythingMart
// 8Sog63v2MyWO5ERS