const express = require('express')
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tthwvj5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        await client.connect();

        const categoryCollection = client.db('libraryManage').collection('category')
        const booksCollection = client.db('libraryManage').collection('books')
        const borrowCollection = client.db('libraryManage').collection('borrow')

        // jwt related api
        // app.post('/jwt', async (req, res) => {
        //     const user = req.body
        //     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
        //     res.send({ token });
        // })

        // get all books data in db
        app.get('/books', async (req, res) => {
            const result = await booksCollection.find().toArray();
            res.send(result);
        })

        // get category data in db
        app.get('/category', async (req, res) => {
            const result = await categoryCollection.find().toArray();
            res.send(result);
        })

        // single category data in db
        app.get('/books/:category', async (req, res) => {
            const category = req.params.category;
            const query = { category: (category) }
            const sortedCate = await booksCollection.find(query).toArray();
            res.send(sortedCate);
        })

        // save a book data in db
        app.post('/book', async (req, res) => {
            const bookData = req.body;
            const result = await booksCollection.insertOne(bookData)
            res.send(result);
        })

        // get book based on id
        app.get('/book/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await booksCollection.findOne(query)
            res.send(result);
        })

        // save a borrow data in db
        app.post('/borrow', async (req, res) => {
            const borrowData = req.body;
            const result = await borrowCollection.insertOne(borrowData)

            // change book availability in db
            // const borrowId = borrowData.borrowId
            // const query = {_id: new ObjectId(borrowId)}
            // const updateDoc = {
            //     $set: {
            //         borrow: true
            //     }
            // }
            // const updateBook = await booksCollection.updateOne(query, updateDoc)
            // console.log(updateBook);
            res.send(result);
        })

        // update borrow book info in db
        app.patch('/book/status/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body.status
            const query = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    borrow: status
                }
            }
            const result = await booksCollection.updateOne(query, updateDoc)
            res.send(result)
        })

        // get a borrow book in db
        app.get('/borrowBooks', async (req, res) => {
            const result = await borrowCollection.find().toArray();
            res.send(result);
        })

        // get borrow book in db
        app.get('/borrow-book/:email', async (req, res) => {
            const email = req.params.email
            const query = { email: email }
            const result = await borrowCollection.find(query).toArray();
            res.send(result);
        })

        // delete borrow data
        app.delete('/borrow/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await borrowCollection.deleteOne(query)
            res.send(result);
        })

        // update a single book
        app.get('/book/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await booksCollection.findOne(query);
            res.send(result);
        })

        // update Book
        app.put('/book/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedBook = req.body;
            const book = {
                $set: {
                    name: updatedBook.name,
                    image: updatedBook.image,
                    quantity: updatedBook.quantity,
                    category: updatedBook.category,
                    author: updatedBook.author,
                    rating: updatedBook.rating,
                    description: updatedBook.description
                }
            }

            const result = await booksCollection.updateOne(filter, book, options);
            res.send(result);

        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('library management is running')
})

app.listen(port, () => {
    console.log(`library management is running on port ${port}`);
})