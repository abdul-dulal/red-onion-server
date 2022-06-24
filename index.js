const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 4000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const cors = require("cors");
app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://redOnion:ff7rq0uKM0kL9zMm@cluster0.meqez.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    const mealCollection = client.db("redOnion").collection("meal");
    const cartCollection = client.db("redOnion").collection("cart");
    const lunchCollection = client.db("redOnion").collection("lunch");
    const dinnerCollection = client.db("redOnion").collection("dinner");

    //payment intenet

    app.post("/create-payment-intent", async (req, res) => {
      const service = req.body;

      const price = service.price;
      const amount = price * 100;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.send({ clientSecret: paymentIntent.client_secret });
    });

    app.get("/meal", async (req, res) => {
      const meal = await mealCollection.find().toArray();
      res.send(meal);
    });
    app.get("/get-lunch", async (req, res) => {
      const lunch = await lunchCollection.find().toArray();
      res.send(lunch);
    });
    app.get("/get-dinnger", async (req, res) => {
      const dinner = await dinnerCollection.find().toArray();
      res.send(dinner);
    });

    app.get("/breakfast/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await mealCollection.findOne(query);

      res.send(result);
    });
    app.get("/lunch/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await lunchCollection.findOne(query);

      res.send(result);
    });
    app.get("/dinner/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await dinnerCollection.findOne(query);
      res.send(result);
    });

    // put cart
    app.post("/addCart", async (req, res) => {
      const cart = req.body;

      const query = {
        name: cart.name,
        email: cart.email,
      };
      const exist = await cartCollection.findOne(query);
      if (exist) {
        return res.send({ success: false, addcart: exist });
      }
      const result = await cartCollection.insertOne(cart);
      res.send({ success: true, result });
    });

    app.get("/order", async (req, res) => {
      const email = req.query.email;

      const query = { email: email };
      const result = await cartCollection.find(query).toArray();

      res.send(result);
    });

    // delete order
    app.delete("/deleteorder/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await cartCollection.deleteOne(filter);
      res.send(result);
    });
    //payment
    app.get("/breakfist-payment/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const paymentResult = await mealCollection.findOne(filter);
      res.send(paymentResult);
    });
    app.get("/lunch-payment/:id", async (req, res) => {
      const id = req.params.id;

      const filter = { _id: ObjectId(id) };
      const paymentResult = await lunchCollection.findOne(filter);
      res.send(paymentResult);
    });
    app.get("/dinner-payment/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const paymentResult = await dinnerCollection.findOne(filter);
      res.send(paymentResult);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
