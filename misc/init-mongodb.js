'use strict';

const { MongoClient } = require('mongodb');

const config = require('../config');
const {
    storage: {
        url,
        options: {
            db: dbName,
            collections,
        },
    },
} = config;

const client = new MongoClient(url, { useUnifiedTopology: true });

try {
    console.log('Preparing MongoDB.');

    client.connect(async err => {
        if (err) console.error('Error on connecting to MongoDB: ' + err);
    
        console.log('Connected to MongoDB.');
    
        const db = client.db(dbName);
    
        const existingCollections = (await db.collections(collections)).map(c => c.collectionName);
    
        for (let collection of collections) {
            if (!existingCollections.includes(collection)) {
                console.log('Creating a collection: ' + collection);
    
                await db.createCollection(collection);
            }
        }
    
        console.log('MongoDB is prepared.');
    
        process.exit(0);
    });
} catch (error) {
    console.error('Error on preparing MongoDB: ' + error);
    process.exit(1);
}
