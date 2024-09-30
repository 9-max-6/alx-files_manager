import { MongoClient } from 'mongodb';
import 'dotenv/config';

class DBClient {
  constructor() {
    const HOST = process.env.DB_HOST || 'localhost';
    const PORT = process.env.DB_PORT || '27017';
    const DATABASE = process.env.DB_DATABASE || 'files_manager';

    const uri = `mongodb://${HOST}:${PORT}`;
    this.mongoClient = new MongoClient(uri, { useUnifiedTopology: true });
    this.isOpen = false;

    this.mongoClient
      .connect()
      .then(() => {
        this.db = this.mongoClient.db(DATABASE);
        this.isOpen = true;
        console.log('Connected to MongoDB server');
      })
      .catch((err) => {
        console.error(
          'Error when connecting to MongoDB server:',
          err.toString()
        );
      });
  }

  isAlive() {
    return this.isOpen; // Now references the correct property
  }

  async nbUsers() {
    if (!this.isOpen) {
      console.error('Database connection is not open');
      return 0;
    }

    try {
      const userCollection = this.db.collection('users');
      const allUsers = await userCollection.find({}).toArray();
      return allUsers.length;
    } catch (e) {
      console.error('Error in nbUsers():', e.toString());
      return 0;
    }
  }

  async nbFiles() {
    if (!this.isOpen) {
      console.error('Database connection is not open');
      return 0;
    }

    try {
      const fileCollection = this.db.collection('files');
      const allFiles = await fileCollection.find({}).toArray();
      return allFiles.length;
    } catch (e) {
      console.error('Error in nbFiles():', e.toString());
      return 0;
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
