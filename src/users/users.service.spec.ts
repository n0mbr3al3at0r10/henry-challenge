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
import { RandomCourseDTOStub } from '../../test/stubs/courses.dto.stub';
import { CoursesService } from '../courses/courses.service';
import {
  Course,
  CourseDocument,
  CourseSchema,
} from '../courses/schemas/course.schema';
import { CreateStudentDto } from './dto/create-student.dto';
import { RandomTeacherDTOStub } from '../../test/stubs/teachers.dto.stub';

let service: UsersService;
let courseService: CoursesService;
let mongod: MongoMemoryServer;
let mongoConnection: Connection;
let userModel: Model<User>;
let courseModel: Model<Course>;

// jest.setTimeout(10000);

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  mongoConnection = (await connect(uri)).connection;
  userModel = mongoConnection.model(User.name, UserSchema);
  courseModel = mongoConnection.model(Course.name, CourseSchema);
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      UsersService,
      { provide: getModelToken(User.name), useValue: userModel },
      CoursesService,
      { provide: getModelToken(Course.name), useValue: courseModel },
    ],
  }).compile();

  service = module.get<UsersService>(UsersService);
  courseService = module.get<CoursesService>(CoursesService);
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

describe('StudentDetails, TeacherDetails and Courses in progress/completed', () => {
  it('should return the user with student details', async () => {
    // Arrange
    const user = RandomUserDTOStub();

    // Act
    // Need to use CourseService in order to get course ids.
    const [activeCourse, completedCourse] = await Promise.all([
      courseService.create(RandomCourseDTOStub()) as Promise<CourseDocument>,
      courseService.create(RandomCourseDTOStub()) as Promise<CourseDocument>,
    ]);
    const studentDetails: CreateStudentDto = {
      activeCourseIds: [activeCourse._id],
      completedCourseIds: [completedCourse._id],
    };

    const createdUser = (await service.create(user)) as UserDocument;
    const updatedUser = await service.addStudentDetails(
      createdUser._id,
      studentDetails,
    );
    await new Promise((r) => setTimeout(r, 5)); // waiting a bit to let course.save() impact in DB.
    const searchedUser = (await service.findOne(
      createdUser._id,
    )) as UserDocument;

    // Assert
    expect(updatedUser.student.activeCourseIds.length).toBe(1);
    expect(updatedUser.student.completedCourseIds.length).toBe(1);
    expect(updatedUser.student.activeCourseIds[0]).toStrictEqual(
      activeCourse._id,
    );
    expect(updatedUser.student.completedCourseIds[0]).toStrictEqual(
      completedCourse._id,
    );
    expect(searchedUser.student.activeCourseIds.length).toBe(1);
    expect(searchedUser.student.completedCourseIds.length).toBe(1);
    expect(searchedUser.student.activeCourseIds[0]).toStrictEqual(
      activeCourse._id,
    );
    expect(searchedUser.student.completedCourseIds[0]).toStrictEqual(
      completedCourse._id,
    );
  });

  it('should return the user with teacher details', async () => {
    // Arrange
    const user = RandomUserDTOStub();
    const teacherDetails = RandomTeacherDTOStub();

    // Act
    const createdUser = (await service.create(user)) as UserDocument;
    const updatedUser = await service.addTeacherDetails(
      createdUser._id,
      teacherDetails,
    );
    await new Promise((r) => setTimeout(r, 5)); // waiting a bit to let course.save() impact in DB.
    const searchedUser = (await service.findOne(
      createdUser._id,
    )) as UserDocument;

    // Assert
    expect(updatedUser.teacher.title).toBe(teacherDetails.title);
    expect(searchedUser.teacher.title).toBe(teacherDetails.title);
  });

  it('should return the user with active course', async () => {
    // Arrange
    const user = RandomUserDTOStub();

    // Act
    // Need to use CourseService in order to get course ids.
    const [course] = await Promise.all([
      courseService.create(RandomCourseDTOStub()) as Promise<CourseDocument>,
    ]);

    const createdUser = (await service.create(user)) as UserDocument;
    const updatedUser = await service.addStartedCourse(
      createdUser._id,
      course._id,
    );
    const searchedUser = (await service.findOne(
      createdUser._id,
    )) as UserDocument;

    // Assert
    expect(updatedUser.student.activeCourseIds.length).toBe(1);
    expect(updatedUser.student.completedCourseIds.length).toBe(0);
    expect(updatedUser.student.activeCourseIds[0]).toStrictEqual(course._id);
    expect(searchedUser.student.activeCourseIds.length).toBe(1);
    expect(searchedUser.student.completedCourseIds.length).toBe(0);
    expect(searchedUser.student.activeCourseIds[0]).toStrictEqual(course._id);
  });

  it('should return the user with one active course when duplicated', async () => {
    // Arrange
    const user = RandomUserDTOStub();

    // Act
    // Need to use CourseService in order to get course ids.
    const [course] = await Promise.all([
      courseService.create(RandomCourseDTOStub()) as Promise<CourseDocument>,
    ]);

    const createdUser = (await service.create(user)) as UserDocument;
    const updatedUserBeforeDuplication = await service.addStartedCourse(
      createdUser._id,
      course._id,
    );
    const updatedUserAfterDuplication = await service.addStartedCourse(
      createdUser._id,
      course._id,
    );
    const searchedUser = (await service.findOne(
      createdUser._id,
    )) as UserDocument;

    // Assert
    expect(updatedUserBeforeDuplication.student.activeCourseIds.length).toBe(1);
    expect(updatedUserBeforeDuplication.student.completedCourseIds.length).toBe(
      0,
    );
    expect(
      updatedUserBeforeDuplication.student.activeCourseIds[0],
    ).toStrictEqual(course._id);
    expect(updatedUserAfterDuplication.student.activeCourseIds.length).toBe(1);
    expect(updatedUserAfterDuplication.student.completedCourseIds.length).toBe(
      0,
    );
    expect(
      updatedUserAfterDuplication.student.activeCourseIds[0],
    ).toStrictEqual(course._id);
    expect(searchedUser.student.activeCourseIds.length).toBe(1);
    expect(searchedUser.student.completedCourseIds.length).toBe(0);
    expect(searchedUser.student.activeCourseIds[0]).toStrictEqual(course._id);
  });

  it('should return the user with completed course', async () => {
    // Arrange
    const user = RandomUserDTOStub();

    // Act
    // Need to use CourseService in order to get course ids.
    const [course] = await Promise.all([
      courseService.create(RandomCourseDTOStub()) as Promise<CourseDocument>,
    ]);

    const createdUser = (await service.create(user)) as UserDocument;
    const updatedUserBeforeCompletion = await service.addStartedCourse(
      createdUser._id,
      course._id,
    );
    const updatedUserAfterCompletion = await service.completeStartedCourse(
      createdUser._id,
      course._id,
    );
    const searchedUser = (await service.findOne(
      createdUser._id,
    )) as UserDocument;

    // Assert
    expect(updatedUserBeforeCompletion.student.activeCourseIds.length).toBe(1);
    expect(updatedUserBeforeCompletion.student.completedCourseIds.length).toBe(
      0,
    );
    expect(
      updatedUserBeforeCompletion.student.activeCourseIds[0],
    ).toStrictEqual(course._id);
    expect(updatedUserAfterCompletion.student.activeCourseIds.length).toBe(0);
    expect(updatedUserAfterCompletion.student.completedCourseIds.length).toBe(
      1,
    );
    expect(
      updatedUserAfterCompletion.student.completedCourseIds[0],
    ).toStrictEqual(course._id);
    expect(searchedUser.student.activeCourseIds.length).toBe(0);
    expect(searchedUser.student.completedCourseIds.length).toBe(1);
    expect(searchedUser.student.completedCourseIds[0]).toStrictEqual(
      course._id,
    );
  });

  it('should return the user without completed course if not active course first', async () => {
    // Arrange
    const user = RandomUserDTOStub();

    // Act
    // Need to use CourseService in order to get course ids.
    const [course] = await Promise.all([
      courseService.create(RandomCourseDTOStub()) as Promise<CourseDocument>,
    ]);

    const createdUser = (await service.create(user)) as UserDocument;
    const updatedUser = await service.completeStartedCourse(
      createdUser._id,
      course._id,
    );
    const searchedUser = (await service.findOne(
      createdUser._id,
    )) as UserDocument;

    // Assert
    expect(updatedUser.student.activeCourseIds.length).toBe(0);
    expect(updatedUser.student.completedCourseIds.length).toBe(0);
    expect(searchedUser.student.activeCourseIds.length).toBe(0);
    expect(searchedUser.student.completedCourseIds.length).toBe(0);
  });

  it('should return the user with one completed course when duplicated', async () => {
    // Arrange
    const user = RandomUserDTOStub();

    // Act
    // Need to use CourseService in order to get course ids.
    const [course] = await Promise.all([
      courseService.create(RandomCourseDTOStub()) as Promise<CourseDocument>,
    ]);

    const createdUser = (await service.create(user)) as UserDocument;
    await service.addStartedCourse(createdUser._id, course._id);
    const updatedUserBeforeDuplication = await service.completeStartedCourse(
      createdUser._id,
      course._id,
    );
    const updatedUserAfterDuplication = await service.completeStartedCourse(
      createdUser._id,
      course._id,
    );
    const searchedUser = (await service.findOne(
      createdUser._id,
    )) as UserDocument;

    // Assert
    expect(updatedUserBeforeDuplication.student.activeCourseIds.length).toBe(0);
    expect(updatedUserBeforeDuplication.student.completedCourseIds.length).toBe(
      1,
    );
    expect(
      updatedUserBeforeDuplication.student.completedCourseIds[0],
    ).toStrictEqual(course._id);
    expect(updatedUserAfterDuplication.student.activeCourseIds.length).toBe(0);
    expect(updatedUserAfterDuplication.student.completedCourseIds.length).toBe(
      1,
    );
    expect(
      updatedUserAfterDuplication.student.completedCourseIds[0],
    ).toStrictEqual(course._id);
    expect(searchedUser.student.activeCourseIds.length).toBe(0);
    expect(searchedUser.student.completedCourseIds.length).toBe(1);
    expect(searchedUser.student.completedCourseIds[0]).toStrictEqual(
      course._id,
    );
  });

  it('should return the user with one active course after having it completed', async () => {
    // Arrange
    const user = RandomUserDTOStub();

    // Act
    // Need to use CourseService in order to get course ids.
    const [course] = await Promise.all([
      courseService.create(RandomCourseDTOStub()) as Promise<CourseDocument>,
    ]);

    const createdUser = (await service.create(user)) as UserDocument;
    const updatedUserBeforeCompletion = await service.addStartedCourse(
      createdUser._id,
      course._id,
    );
    const updatedUserAfterCompletion = await service.completeStartedCourse(
      createdUser._id,
      course._id,
    );
    const updatedUserAfterRestart = await service.addStartedCourse(
      createdUser._id,
      course._id,
    );
    const searchedUser = (await service.findOne(
      createdUser._id,
    )) as UserDocument;

    // Assert
    expect(updatedUserBeforeCompletion.student.activeCourseIds.length).toBe(1);
    expect(updatedUserBeforeCompletion.student.completedCourseIds.length).toBe(
      0,
    );
    expect(
      updatedUserBeforeCompletion.student.activeCourseIds[0],
    ).toStrictEqual(course._id);
    expect(updatedUserAfterCompletion.student.activeCourseIds.length).toBe(0);
    expect(updatedUserAfterCompletion.student.completedCourseIds.length).toBe(
      1,
    );
    expect(
      updatedUserAfterCompletion.student.completedCourseIds[0],
    ).toStrictEqual(course._id);
    expect(updatedUserAfterRestart.student.activeCourseIds.length).toBe(1);
    expect(updatedUserAfterRestart.student.completedCourseIds.length).toBe(0);
    expect(updatedUserAfterRestart.student.activeCourseIds[0]).toStrictEqual(
      course._id,
    );
    expect(searchedUser.student.activeCourseIds.length).toBe(1);
    expect(searchedUser.student.completedCourseIds.length).toBe(0);
    expect(searchedUser.student.activeCourseIds[0]).toStrictEqual(course._id);
  });
});
