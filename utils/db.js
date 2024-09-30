import { MongoClient } from 'mongodb';

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
    return this.isOpen;
  }

  async nbUsers() {
    if (!this.isOpen) {
      console.error('Database connection is not open');
      return 0;
    }

    try {
      const userCollection = await this.db.collection('users');
      return userCollection.countDocuments();
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
      const fileCollection = await this.db.collection('files');
      return fileCollection.countDocuments();
    } catch (e) {
      console.error('Error in nbFiles():', e.toString());
      return 0;
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
