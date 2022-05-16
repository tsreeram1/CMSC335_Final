let path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, 'credentials/.env') })

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const dbName = process.env.MONGO_DB_NAME;
const collectionName = process.env.MONGO_COLLECTION;

const { MongoClient, ServerApiVersion } = require('mongodb');
const { name } = require("ejs");

const databaseAndCollection = {db: dbName, collection: collectionName};
const uri = `mongodb+srv://${userName}:${password}@cluster0.7hqzy.mongodb.net/${dbName}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function insertApplication(variables) {
    try {
        await client.connect();
        await client.db(databaseAndCollection.db)
                    .collection(databaseAndCollection.collection)
                    .insertOne(variables);
    } catch (e) {
        console.log("ERROR: " + e);
    } finally {
        await client.close();
    }
}

async function getAll() {
    let filter = {};
    try {
        await client.connect();
        const cursor = await client.db(databaseAndCollection.db)
                    .collection(databaseAndCollection.collection)
                    .find(filter);
        const result = await cursor.toArray();
        return result;
    } catch (e) {
        console.log("ERROR: " + e);
    } finally {
        await client.close();
    }
}

async function deleteActivities(activities, deleteAllActivities) {
    let count = 0
    try {
        await client.connect();
        let result = ""
        if (deleteAllActivities == "on") {
            result = await client.db(databaseAndCollection.db)
                    .collection(databaseAndCollection.collection)
                    .deleteMany({})
            count = result.deletedCount;
        } else if (activities != null) {
            if (Array.isArray(activities)) {
                for (const act of activities) {
                    await client.db(databaseAndCollection.db)
                        .collection(databaseAndCollection.collection)
                        .deleteOne({name: act})
                }
                count = activities.length;
            } else {
                await client.db(databaseAndCollection.db)
                        .collection(databaseAndCollection.collection)
                        .deleteOne({name: activities});
                count = 1;
            }
        }
        return count;
    } catch (e) {
        console.log(e);
    } finally {
        await client.close();
    }
}

module.exports = {insertApplication, getAll, deleteActivities}