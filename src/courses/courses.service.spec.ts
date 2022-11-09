import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import { Request } from 'express';
import { CourseDTOStub } from '../../test/stubs/courses.dto.stub';
import { CoursesService } from './courses.service';
import { Course, CourseDocument, CourseSchema } from './schemas/course.schema';

describe('CoursesService', () => {
  let service: CoursesService;
  let mongod: MongoMemoryServer;
  let mongoConnection: Connection;
  let courseModel: Model<Course>;

  // jest.setTimeout(10000);

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    mongoConnection = (await connect(uri)).connection;
    courseModel = mongoConnection.model(Course.name, CourseSchema);
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoursesService,
        { provide: getModelToken(Course.name), useValue: courseModel },
      ],
    }).compile();

    service = module.get<CoursesService>(CoursesService);
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the saved course', async () => {
    // Arrange
    const course = CourseDTOStub();

    // Act
    const createdCourse = await service.create(course);

    // Assert
    expect(createdCourse.name).toBe(course.name);
  });

  it('should return all the courses', async () => {
    // Arrange
    const course = CourseDTOStub();
    const request = { query: {} } as any as Request;

    // Act
    await service.create(course);
    await service.create(course);
    await service.create(course);
    await service.create(course);
    const searchedCourse = await service.findAll(request);

    // Assert
    expect(searchedCourse.length).toBe(4);
  });

  it('should return only the course created using findAll', async () => {
    // Arrange
    const course = CourseDTOStub();
    const request = { query: { name: course.name } } as any as Request;

    // Act
    const createdCourse = (await service.create(course)) as CourseDocument;
    const searchedCourse = (await service.findAll(request)) as CourseDocument[];

    // Assert
    expect(searchedCourse.length).toBe(1);
    expect(searchedCourse[0].name).toBe(course.name);
    expect(searchedCourse[0]._id).toStrictEqual(createdCourse._id);
  });

  it('should return only the course created using findOne', async () => {
    // Arrange
    const course = CourseDTOStub();

    // Act
    const createdCourse = (await service.create(course)) as CourseDocument;
    const searchedCourse = (await service.findOne(
      createdCourse._id,
    )) as CourseDocument;

    // Assert
    expect(searchedCourse.name).toBe(course.name);
    expect(searchedCourse._id).toStrictEqual(createdCourse._id);
  });
});
