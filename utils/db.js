import { MongoClient } from 'mongodb';
import 'dotenv/config';

class DBClient {
  constructor() {
    const HOST = process.env.DB_HOST || 'localhost';
    const PORT = process.env.DB_PORT || '27017';
    const DATABASE = process.env.DB_DATABASE || 'files_manager';

    const url = `mongodb://${HOST}:${PORT}`;
    this.mongoClient = new MongoClient(url);
    let isOpen = false;

    this.mongoClient
      .connect()
      .then(() => {
        this.db = this.mongoClient.db(DATABASE);
        isOpen = true;
      })
      .catch((err) => {
        console.log('Error when connecting to MongoDB server:', err.toString());
      });
  }

  isAlive() {
    return this.isOpen;
  }

  async nbUser() {
    const userCollection = this.db.collection('users');
    try {
      const allUsers = await userCollection.find({}).toArray();
      return allUsers.length;
    } catch (e) {
      console.log('Error in nbUser():', err.toString());
    }
  }

  async nbFiles() {
    const userCollection = this.db.collection('files');
    try {
      const allUsers = await userCollection.find({}).toArray();
      return allUsers.length;
    } catch (e) {
      console.log('Error in nbUser():', err.toString());
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
