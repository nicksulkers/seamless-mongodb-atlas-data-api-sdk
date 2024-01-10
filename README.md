# Seamless MongoDB Atlas Data API SDK

**SDK for the MongoDB Atlas Data API, similar in use to the official MongoDB Node.js driver.**

## Introduction

This SDK provides a seamless way to communicate with the MongoDB Atlas Data API, especially for projects that already use the official MongoDB Node.js driver or may want to switch at some point.
I built it specifically after i had to migrate a project to a serverless platform where connection pooling effectively impossible. Rather than refactor the entire codebase as other SDK's would require me to do, I in this SDK attempted to match the interfaces of the official nodejs driver as much as possible, and in specifically also emulates the FindCursor, so that my original codebase would remain intact.
Should pricing, traffic, etc. make another choice preferable later on, I can now also easily switch back.

_Disclaimer: This is a work in progress with still plenty to do. I've added the most important methods and features based on my own requirements. Not every feature of the official driver is available (yet) and also the Atlas Data Api doesn't support every feature a regular connection would.
I'll add more as I come to need it or as features get requested. I'm also open to pull requests should you wish to contribute._

## Installation

```bash
npm install seamless-mongodb-atlas-data-api-sdk
```

## Usage

### Initialization

```js
import { MongoClient } from "seamless-mongodb-atlas-data-api-sdk";

const client = new MongoClient({
	instance: "Cluster0",
	endpoint: "https://REGION.PROVIDER.data.mongodb-api.com/app/data-ovfml/endpoint/data/v1",
	apiKey: "your-API-key"
});

const db = client.db("your-db-name");
const collection = db.collection("your-collection-name");
```

### CRUD Operations

#### Insert a Document

Use the **insertMany** method to add three documents to the **documents** collection.

```js
const insertResult = await collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }]);
console.log("Inserted documents =>", insertResult);
```

The **insertMany** command returns an object with information about the insert operations.

#### Find All Documents

Add a query that returns all the documents.

```js
const findResult = await collection.find({}).toArray();
console.log("Found documents =>", findResult);
```

This query returns all the documents in the **documents** collection.
If you add this below the insertMany example you'll see the document's you've inserted.

#### Find Documents with a Query Filter

Add a query filter to find only documents which meet the query criteria.

```js
const filteredDocs = await collection.find({ a: 3 }).toArray();
console.log("Found documents filtered by { a: 3 } =>", filteredDocs);
```

Only the documents which match `'a' : 3` should be returned.

#### Update a document

The following operation updates a document in the **documents** collection.

```js
const updateResult = await collection.updateOne({ a: 3 }, { $set: { b: 1 } });
console.log("Updated documents =>", updateResult);
```

The method updates the first document where the field **a** is equal to **3** by adding a new field **b** to the document set to **1**. `updateResult` contains information about whether there was a matching document to update or not.

#### Remove a document

Remove the document where the field **a** is equal to **3**.

```js
const deleteResult = await collection.deleteMany({ a: 3 });
console.log("Deleted documents =>", deleteResult);
```

### About the Cursor

At a glance, the Cursor in this SDK appears to function similarly to the one in the native MongoDB Node.js driver. It offers many of the same methods and can be used in a way that feels almost identical. This is by design, to ensure developers have a hopefully seamless experience transitioning or integrating this SDK into existing projects.

Internally it maintains an array with documents returned. If no limit was given it will default to a certain value and re-fetch more data as you iterate through it.

## Contributing

If you'd like to contribute feel free to send a message? Create a pull request.

## License

This project is licensed under a MIT license. See the LICENSE file for exact details.
