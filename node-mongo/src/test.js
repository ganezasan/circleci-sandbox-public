import mongoose from 'mongoose';
import axios from 'axios';
import MongoMemoryServer from 'mongodb-memory-server';

// May require additional time for downloading MongoDB binaries
jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
const url = 'https://raw.githubusercontent.com/ozlerhakan/mongodb-json-files/master/datasets/products.json';
let mongoUri = 'mongodb://localhost:27017/new_db' // default
let mongoServer;

const opts = { useNewUrlParser: true }; // remove this option if you use mongoose 5 and above

const getData = async url => {
  const response = await axios.get(url);
  console.log(response);
  return response.data;
};

beforeAll(async () => {
  if (!process.env.CI) {
    mongoServer = new MongoMemoryServer();
    mongoUri = await mongoServer.getConnectionString();
  }

  await mongoose.connect(mongoUri, opts, (err) => {
    if (err) console.error(err);
  });
});

afterAll(() => {
  mongoose.disconnect();
  if (!process.env.CI) mongoServer.stop();
});

describe('products', () => {
  const products = mongoose.model('products', new mongoose.Schema({ name: String }));

  beforeAll(async () => {
    if (process.env.CI) return false;
    const response = await axios(url, { responseType: 'arraybuffer', transformResponse: undefined })
      .then(response => {
          const buffer = new Buffer(response.data, 'binary');
          const textdata = buffer.toString(); // for string
          return `[${textdata.replace(/\r?\n/g, ',').slice(0,-1)}]`;
      });

    const data = JSON.parse(response).map(d => { return {name: d.name}});
    await products.insertMany(data);
  });

  it("products count", async () => {
    const cnt = await products.count();
    expect(cnt).toEqual(11);
  });
});
