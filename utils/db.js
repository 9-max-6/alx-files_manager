/* eslint-disable consistent-return */
import { MongoClient, ObjectId } from 'mongodb';

/**
 * class DBClient to interface with the application
 * and the MongoDB server
 */
class DBClient {
  /**
   * creates the mongoClient and provides a mechanism
   * for checking when the client is connected.
   */
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

  /**
   * Means to check if the client is connected.
   * @returns true when the client is connected
   * to the server
   * False when it's not
   */
  isAlive() {
    return this.isOpen;
  }

  /**
   * Counts number of documents in a collection
   * @returns the number of documents in the users
   * collection
   */
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

  /**
   * Counts number of documents in a collection
   * @returns the number of documents in the files
   * collection
   */
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

  /**
   *
   * @param {email of the user} email
   * @param {password of the user after hashing} hashedP
   * @returns id if the user was added successfully
   */
  async addNewUser(email, hashedP) {
    try {
      const exists = await this.findUser({ email });

      if (exists) {
        return false;
      }
      const result = await this.db.collection('users').insertOne({
        email,
        password: hashedP,
      });
      return result.insertedId;
    } catch (e) {
      console.log('Error when inserting new user:', e.toString());
    }
  }

  /**
   *
   * @param {email of the user to lookup} email
   * @returns returns the user who exists
   * otherwise returns false
   */
  async findUser(obj) {
    try {
      const user = await this.db.collection('users').findOne(obj);
      if (!user) {
        return false;
      }
      return user;
    } catch (e) {
      console.log('findUser:', e.toString());
    }
  }

  /**
   *
   * @param {the id of the file to find} id
   * @returns the file as saved in the db else
   * false when the file is not found or when an error
   * occurs
   */
  async findFile(id) {
    try {
      const file = await this.db
        .collection('files')
        .findOne({ _id: new ObjectId(id) });

      if (file) {
        return file;
      }
      return false;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
  async findFile(obj) {
    try {
      const file = await this.db.collection('files').findOne(obj);

      if (file) {
        return file;
      }
      return false;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  /**
   *
   * @param {obj containing the details of the file} obj
   * @returns true if the file was saved successfully
   */
  async addFile(obj) {
    try {
      const result = await this.db.collection('files').insertOne(obj);
      if (!result) {
        return false;
      }
      return result;
    } catch (e) {
      return false;
    }
  }

  async findFiles(pagesToSkip, pageSize, obj) {
    try {
      const files = await this.db
        .collection('files')
        .aggregate([
          { $match: obj },
          { $skip: pagesToSkip },
          { $limit: pageSize },
        ])
        .toArray();

      return files;
    } catch (e) {
      console.log(e.toString());
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
