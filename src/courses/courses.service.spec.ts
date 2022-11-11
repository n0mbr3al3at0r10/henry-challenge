import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connect, Connection, Model } from 'mongoose';
import { Request } from 'express';
import {
  CourseDTOStubs,
  RandomCourseDTOStub,
} from '../../test/stubs/courses.dto.stub';
import { RandomUserDTOStub } from '../../test/stubs/users.dto.stub';
import { ChapterDTOStubs } from '../../test/stubs/chapters.dto.stub';
import { CoursesService } from './courses.service';
import { Course, CourseDocument, CourseSchema } from './schemas/course.schema';
import { UpdateCourseDto } from './dto/update-course.dto';
import { User, UserDocument, UserSchema } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { ChapterDocument } from './schemas/chapter.schema';
import { CreateRankingDto } from './dto/create-ranking.dto';

let service: CoursesService;
let userService: UsersService;
let mongod: MongoMemoryServer;
let mongoConnection: Connection;
let courseModel: Model<Course>;
let userModel: Model<User>;

// jest.setTimeout(10000);

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  mongoConnection = (await connect(uri)).connection;
  courseModel = mongoConnection.model(Course.name, CourseSchema);
  userModel = mongoConnection.model(User.name, UserSchema);
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      CoursesService,
      { provide: getModelToken(Course.name), useValue: courseModel },
      UsersService,
      { provide: getModelToken(User.name), useValue: userModel },
    ],
  }).compile();

  service = module.get<CoursesService>(CoursesService);
  userService = module.get<UsersService>(UsersService);
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

  it('should return the saved course', async () => {
    // Arrange
    const course = RandomCourseDTOStub();

    // Act
    const createdCourse = await service.create(course);

    // Assert
    expect(createdCourse.name).toBe(course.name);
  });

  it('should return all the courses', async () => {
    // Arrange
    const courses = CourseDTOStubs();
    const request = { query: {} } as any as Request;

    // Act
    // it could be done with reduce, but it's clearer this way.
    for (const course of courses) {
      await service.create(course);
    }
    const searchedCourse = await service.findAll(request);

    // Assert
    expect(searchedCourse.length).toBe(courses.length);
  });

  it('should return only the course created using findAll', async () => {
    // Arrange
    const courses = CourseDTOStubs();
    const createdCourses: CourseDocument[] = [];
    const request = {
      query: { name: courses[0].name, language: courses[0].language },
    } as any as Request;

    // Act
    // it could be done with reduce, but it's clearer this way.
    for (const course of courses) {
      createdCourses.push((await service.create(course)) as CourseDocument);
    }
    const searchedCourses = (await service.findAll(
      request,
    )) as CourseDocument[];

    // Assert
    expect(searchedCourses.length).toBe(1);
    expect(searchedCourses[0].name).toBe(courses[0].name);
    expect(searchedCourses[0]._id).toStrictEqual(createdCourses[0]._id);
  });

  it('should return only the course created using findOne', async () => {
    // Arrange
    const courses = CourseDTOStubs();
    const createdCourses: CourseDocument[] = [];

    // Act
    // it could be done with reduce, but it's clearer this way.
    for (const course of courses) {
      createdCourses.push((await service.create(course)) as CourseDocument);
    }
    const searchedCourse = (await service.findOne(
      createdCourses[0]._id,
    )) as CourseDocument;

    // Assert
    expect(searchedCourse.name).toBe(courses[0].name);
    expect(searchedCourse._id).toStrictEqual(createdCourses[0]._id);
  });

  it('should return the updated course', async () => {
    // Arrange
    const course = RandomCourseDTOStub();
    const updateCourse: UpdateCourseDto = { level: 'Basic' };

    // Act
    const createdCourse = (await service.create(course)) as CourseDocument;
    const updatedCourse = await service.update(createdCourse._id, updateCourse);
    const searchedCourse = (await service.findOne(
      createdCourse._id,
    )) as CourseDocument;

    // Assert
    expect(updatedCourse.level).toBe(updateCourse.level);
    expect(searchedCourse.level).toBe(updateCourse.level);
  });

  it('should return inserted courses minus one after deleting one', async () => {
    // Arrange
    const courses = CourseDTOStubs();
    const createdCourses: CourseDocument[] = [];
    const request = {
      query: {},
    } as any as Request;

    // Act
    // it could be done with reduce, but it's clearer this way.
    for (const course of courses) {
      createdCourses.push((await service.create(course)) as CourseDocument);
    }
    await service.remove(createdCourses[0]._id);
    const searchedCourses = (await service.findAll(
      request,
    )) as CourseDocument[];

    // Assert
    expect(searchedCourses.length).toBe(courses.length - 1);
  });
});

describe('Teacher, Chapter and Ranking', () => {
  it('should return the course with teacher', async () => {
    // Arrange
    const course = RandomCourseDTOStub();
    const teacher = RandomUserDTOStub();

    // Act
    // Need to use UserService in order to get teacher details through populate.
    const createdUser = await userService.create(teacher);
    const createdCourse = (await service.create(course)) as CourseDocument;
    const updatedCourse = await service.assignTeacher(
      createdCourse._id,
      createdUser,
    );
    await new Promise((r) => setTimeout(r, 5)); // waiting a bit to let course.save() impact in DB.
    const searchedCourse = (await service.findOne(
      createdCourse._id,
    )) as CourseDocument;

    // Assert
    expect(updatedCourse.teacherId.name).toBe(teacher.name);
    expect(searchedCourse.teacherId.name).toBe(teacher.name);
  });

  it('should return the course with chapters', async () => {
    // Arrange
    const course = RandomCourseDTOStub();
    const chapters = ChapterDTOStubs();

    // Act
    const createdCourse = (await service.create(course)) as CourseDocument;
    for (const chapter of chapters) {
      service.addChapter(createdCourse._id, chapter);
      await new Promise((r) => setTimeout(r, 5)); // waiting a bit to let course.save() impact in DB.
    }
    const searchedCourse = (await service.findOne(
      createdCourse._id,
    )) as CourseDocument;

    // Assert
    expect(searchedCourse.chapters.length).toBe(chapters.length);
    expect(searchedCourse.chapters[0].number).toBe(chapters[0].number);
    expect(searchedCourse.chapters[1].number).toBe(chapters[1].number);
    expect(searchedCourse.chapters[2].number).toBe(chapters[2].number);
  });

  it('should return the course with updated chapters', async () => {
    // Arrange
    const course = RandomCourseDTOStub();
    const chapters = ChapterDTOStubs();
    const secondChapter = chapters[1];
    let courseBeforeUpdate: CourseDocument;

    // Act
    const createdCourse = (await service.create(course)) as CourseDocument;
    for (const chapter of chapters) {
      courseBeforeUpdate = await service.addChapter(createdCourse._id, chapter);
      await new Promise((r) => setTimeout(r, 5)); // waiting a bit to let course.save() impact in DB.
    }
    const firstChapter = courseBeforeUpdate.chapters[0] as ChapterDocument;
    const courseAfterUpdate = await service.updateChapter(
      createdCourse._id,
      firstChapter._id,
      secondChapter,
    );
    const searchedCourse = (await service.findOne(
      createdCourse._id,
    )) as CourseDocument;

    // Assert
    expect(searchedCourse.chapters.length).toBe(chapters.length);
    expect(searchedCourse.chapters.length).toBe(
      courseBeforeUpdate.chapters.length,
    );
    expect(searchedCourse.chapters.length).toBe(
      courseAfterUpdate.chapters.length,
    );
    expect(courseBeforeUpdate.chapters[0].number).toBe(chapters[0].number);
    expect(courseAfterUpdate.chapters[0].number).toBe(chapters[1].number);
    expect(courseAfterUpdate.chapters[0].number).toBe(secondChapter.number);
  });

  it('should return the course with ranking', async () => {
    // Arrange
    const course = RandomCourseDTOStub();
    const user = RandomUserDTOStub();

    // Act
    // Need to use UserService in order to get teacher details through populate.
    const createdUser = (await userService.create(user)) as UserDocument;
    const createdCourse = (await service.create(course)) as CourseDocument;
    const ranking: CreateRankingDto = { userId: createdUser._id, score: 5 };
    service.addRanking(createdCourse._id, ranking);
    await new Promise((r) => setTimeout(r, 5)); // waiting a bit to let course.save() impact in DB.
    const searchedCourse = (await service.findOne(
      createdCourse._id,
    )) as CourseDocument;

    // Assert
    expect(searchedCourse.rankings.length).toBe(1);
    expect(searchedCourse.rankings[0].score).toBe(5);
    expect(searchedCourse.rankings[0].userId).toStrictEqual(createdUser._id);
  });
});
