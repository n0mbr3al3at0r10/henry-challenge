import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import { Request } from 'express';
import {
  RandomUserDTOStub,
  UserDTOStubs,
} from '../../test/stubs/users.dto.stub';
import { User, UserDocument, UserSchema } from './schemas/user.schema';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

let service: UsersService;
let mongod: MongoMemoryServer;
let mongoConnection: Connection;
let userModel: Model<User>;

// jest.setTimeout(10000);

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  mongoConnection = (await connect(uri)).connection;
  userModel = mongoConnection.model(User.name, UserSchema);
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      UsersService,
      { provide: getModelToken(User.name), useValue: userModel },
    ],
  }).compile();

  service = module.get<UsersService>(UsersService);
});

afterAll(async () => {
  await mongoConnection.dropDatabase();
  await mongoConnection.close();
  await mongod.stop();
});

afterEach(async () => {
  const collections = mongoConnection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

describe('CRUD', () => {
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the saved user', async () => {
    // Arrange
    const user = RandomUserDTOStub();

    // Act
    const createdUser = await service.create(user);

    // Assert
    expect(createdUser.name).toBe(user.name);
  });

  it('should return all the users', async () => {
    // Arrange
    const users = UserDTOStubs();
    const request = { query: {} } as any as Request;

    // Act
    // it could be done with reduce, but it's clearer this way.
    for (const user of users) {
      await service.create(user);
    }
    const searchedUser = await service.findAll(request);

    // Assert
    expect(searchedUser.length).toBe(users.length);
  });

  it('should return only the user created using findAll', async () => {
    // Arrange
    const users = UserDTOStubs();
    const createdUsers: UserDocument[] = [];
    const request = {
      query: { name: users[0].name, language: users[0].mail },
    } as any as Request;

    // Act
    // it could be done with reduce, but it's clearer this way.
    for (const user of users) {
      createdUsers.push((await service.create(user)) as UserDocument);
    }
    const searchedUsers = (await service.findAll(request)) as UserDocument[];

    // Assert
    expect(searchedUsers.length).toBe(1);
    expect(searchedUsers[0].name).toBe(users[0].name);
    expect(searchedUsers[0].mail).toBe(users[0].mail);
    expect(searchedUsers[0]._id).toStrictEqual(createdUsers[0]._id);
  });

  it('should return only the user created using findOne', async () => {
    // Arrange
    const users = UserDTOStubs();
    const createdUsers: UserDocument[] = [];

    // Act
    // it could be done with reduce, but it's clearer this way.
    for (const user of users) {
      createdUsers.push((await service.create(user)) as UserDocument);
    }
    const searchedUser = (await service.findOne(
      createdUsers[0]._id,
    )) as UserDocument;

    // Assert
    expect(searchedUser.name).toBe(users[0].name);
    expect(searchedUser._id).toStrictEqual(createdUsers[0]._id);
  });

  it('should return the updated user', async () => {
    // Arrange
    const user = RandomUserDTOStub();
    const updateUser: UpdateUserDto = { password: 'hash2022' };

    // Act
    const createdUser = (await service.create(user)) as UserDocument;
    const updatedUser = await service.update(createdUser._id, updateUser);
    const searchedUser = (await service.findOne(
      createdUser._id,
    )) as UserDocument;

    // Assert
    expect(updatedUser.password).toBe(updateUser.password);
    expect(searchedUser.password).toBe(updateUser.password);
  });

  it('should return inserted users minus one after deleting one', async () => {
    // Arrange
    const users = UserDTOStubs();
    const createdUsers: UserDocument[] = [];
    const request = {
      query: {},
    } as any as Request;

    // Act
    // it could be done with reduce, but it's clearer this way.
    for (const user of users) {
      createdUsers.push((await service.create(user)) as UserDocument);
    }
    await service.remove(createdUsers[0]._id);
    const searchedCourses = (await service.findAll(request)) as UserDocument[];

    // Assert
    expect(searchedCourses.length).toBe(users.length - 1);
  });
});
