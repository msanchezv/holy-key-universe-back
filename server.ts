import * as mongodb from "mongodb";
import app from "./index";

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

    const PORT = process.env.PORT || 8080
    app.listen(PORT, function () {
        console.log("App now running on port", PORT);
    });
});
