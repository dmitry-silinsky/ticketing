import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
  var signIn: (userId?: string) => string[];
}

jest.mock('../NatsWrapper');

process.env.STRIPE_KEY = 'sk_test_lZsXiKDaJzc6Z1rZPwU5RvrT';

let mongo: any;

beforeAll(async () => {
  jest.clearAllMocks();

  process.env.JWT_KEY = 'super_secure_jwt_key';

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }

  await mongoose.connection.close();
});

global.signIn = (id?: string) => {
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com',
  };

  const token = jwt.sign(payload, process.env.JWT_KEY!);

  const sessionJson = JSON.stringify({ jwt: token });

  const base64 = Buffer.from(sessionJson).toString('base64');

  return [`session=${base64}`];
};
