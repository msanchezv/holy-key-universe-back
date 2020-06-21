import {MongoClient} from "mongodb"

const url = process.env.MONGO_URI || "mongodb://localhost:27017/santaTeclaDB";
let _db;

export function connectToServer(callback) {
    let client = new MongoClient(url);
    client.connect(function (err, client) {
        if (!err) {
            _db = client.db();
        }
        return callback(err);
    });
}

export function getDb() {
    return _db;
}
