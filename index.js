import nano from 'nano';


class NanoWrapper {
  constructor(databaseName) {
    this.db = nano.db.use(databaseName);
  }

  async insert(doc) {
    const res = await this.db.insert(doc);
    return res;
  }

  async find(query) {
    const res = await this.db.find(query);
    return res.docs;
  }

  Schema = class Schema {
    constructor(schema) {
      this.schema = schema;
      this.validate = this.validate.bind(this);
    }

    validate(doc) {
      // Check that the document has all the required fields
      const missingFields = Object.keys(this.schema).filter(field => !doc.hasOwnProperty(field));
      if (missingFields.length > 0) {
        throw new Error(`Missing required field(s): ${missingFields.join(', ')}`);
      }

      // Check that the data types of the fields match the schema
      for (const [field, type] of Object.entries(this.schema)) {
        const isArray = Array.isArray(type);
        const baseType = isArray ? type[0] : type;
        const value = doc[field];
        const valueType = Array.isArray(value) ? 'array' : typeof value;

        if (isArray) {
          if (!Array.isArray(value)) {
            throw new Error(`Field "${field}" should be an array of ${baseType}s, but got "${valueType}"`);
          }
          value.forEach(item => {
            if (typeof item !== baseType) {
              throw new Error(`Field "${field}" should be an array of ${baseType}s, but got an array containing a "${typeof item}"`);
            }
          });
        } else if (valueType !== baseType) {
          throw new Error(`Field "${field}" should be of type "${baseType}", but got "${valueType}"`);
        }
      }
    }

    async insert(doc) {
      this.validate(doc);
      const res = await nano.db.use(doc._id).insert(doc);
      return res;
    }

    async find(query) {
      const res = await nano.db.use(query.selector._id).find(query);
      return res.docs;
    }
  }
}

// Create a new instance of the NanoWrapper class, passing in the database name
const db = new NanoWrapper('mydb');

// Define a schema for users
const UserSchema = new db.Schema({
  _id: 'string',
  name: 'string',
  age: 'number',
  email: 'string',
  interests: ['string'],
});

// Insert a new user, passing in a document that matches the schema
await UserSchema.insert({
  _id: 'john',
  name: 'John Doe',
  age: 30,
  email: 'john@example.com',
  interests: ['programming', 'music'],
});

// This will throw an error because the "age" field is not a number
await UserSchema.insert({
  _id: 'jane',
  name: 'Jane Smith',
  age: '30',
  email: 'jane@example.com',
  interests: ['sports', 'reading'],
});

// Find all users
const users = await UserSchema.find({
  selector: {
    _id: {
      $gte: null,
    },
  },
});
console.log(users);

