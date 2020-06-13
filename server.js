const express = require("express");
const bodyParser = require("body-parser");
const mongodb = require("mongodb");

const app = express();
app.use(bodyParser.json());

let db;

mongodb.MongoClient.connect(process.env.MONGO_URI || "mongodb://localhost:27017/santaTeclaDB", function (err, client) {
    if (err) {
        console.log(err);
        process.exit(1);
    }

    db = client.db();
    console.log("Database connection ready");

    app.get('/', function(req, res) {
        res.send('Welcome to Holy Key Universe');
    });

    const server = app.listen(process.env.PORT || 8080, function () {
        const port = server.address().port;
        console.log("App now running on port", port);
    });
});