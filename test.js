import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import NanoWrapper from './NanoWrapper';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('NanoWrapper', () => {
  let db;

  before(() => {
    // Create a new instance of the NanoWrapper class, passing in the database name
    db = new NanoWrapper('mydb');
  });

  describe('insert()', () => {
    it('should insert a document into the database', async () => {
      // Define a schema for users
      const UserSchema = new db.Schema({
        _id: 'string',
        name: 'string',
        age: 'number',
        email: 'string',
        interests: ['string'],
      });

      // Insert a new user, passing in a document that matches the schema
      const res = await UserSchema.insert({
        _id: 'john',
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
        interests: ['programming', 'music'],
      });

      expect(res).to.have.property('ok').that.equals(true);
    });

    it('should throw an error if the document does not match the schema', async () => {
      // Define a schema for users
      const UserSchema = new db.Schema({
        _id: 'string',
        name: 'string',
        age: 'number',
        email: 'string',
        interests: ['string'],
      });

      // This should throw an error because the "age" field is not a number
      await expect(UserSchema.insert({
        _id: 'jane',
        name: 'Jane Smith',
        age: '30',
        email: 'jane@example.com',
        interests: ['sports', 'reading'],
      })).to.eventually.be.rejectedWith('Field "age" should be of type "number", but got "string"');
    });
  });

  describe('find()', () => {
    before(async () => {
      // Define a schema for users
      const UserSchema = new db.Schema({
        _id: 'string',
        name: 'string',
        age: 'number',
        email: 'string',
        interests: ['string'],
      });

      // Insert some test data
      await UserSchema.insert({
        _id: 'john',
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
        interests: ['programming', 'music'],
      });
      await UserSchema.insert({
        _id: 'jane',
        name: 'Jane Smith',
        age: 25,
        email: 'jane@example.com',
        interests: ['sports', 'reading'],
      });
    });

    it('should find all users', async () => {
      // Define a schema for users
      const UserSchema = new db.Schema({
        _id: 'string',
        name: 'string',
        age: 'number',
        email: 'string',
        interests: ['string'],
      });

      // Find all users
      const users = await UserSchema.find({
        selector: {
          _id: {
            $gte: null,
          },
        },
      });

      expect(users).to.be.an('array').that.has.lengthOf(2);
      expect(users[0]).to.deep.include({
        _id: 'john',
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
        interests: ['programming', 'music'],
      });
      expect(users[1]).to.deep
    }
  }
});
