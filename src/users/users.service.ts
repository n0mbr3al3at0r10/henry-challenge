import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { Request } from 'express';
import { Student } from './schemas/student.schema';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { Course } from '../../src/courses/schemas/course.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.userModel.create(createUserDto);
  }

  async findAll(request: Request): Promise<User[]> {
    return this.userModel
      .find(request.query)
      .setOptions({ sanitizeFilter: true })
      .exec();
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findOne({ _id: id }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return this.userModel.findOneAndUpdate({ _id: id }, updateUserDto, {
      new: true,
    });
  }

  async remove(id: string) {
    return this.userModel.findByIdAndRemove({ _id: id }).exec();
  }

  async addStudentDetails(id: string, student: CreateStudentDto) {
    const user: UserDocument = await this.userModel.findById(id);
    user.student = student;
    user.save();
    return user;
  }

  async addTeacherDetails(id: string, teacher: CreateTeacherDto) {
    const user: UserDocument = await this.userModel.findById(id);
    user.teacher = teacher;
    user.save();
    return user;
  }

  async addStartedCourse(id: string, courseId: Course) {
    const user: UserDocument = await this.userModel.findById(id);
    this.checkOrCreateStudent(user);
    this.checkOrCreateActiveCourse(user, courseId);
    return this.userModel.findByIdAndUpdate(id, user, {
      new: true,
    });
  }

  async completeStartedCourse(id: string, courseId: Course) {
    const user: UserDocument = await this.userModel.findById(id);
    this.checkOrCreateStudent(user);
    this.checkOrCompleteActiveCourse(user, courseId);
    return this.userModel.findByIdAndUpdate(id, user, {
      new: true,
    });
  }

  checkOrCreateStudent(user: UserDocument) {
    // Validations.
    if (user.student) {
      return;
    }

    // Actions.
    user.student = new Student();
  }

  checkOrCreateActiveCourse(user: UserDocument, courseId: Course) {
    // Validations.
    if (user.student.activeCourseIds.includes(courseId)) {
      return;
    }

    // Actions.
    // User can start watching a course again after it's already completed.
    if (user.student.completedCourseIds.includes(courseId)) {
      this.removeElementFromArray(user.student.completedCourseIds, courseId);
    }
    user.student.activeCourseIds.push(courseId);
  }

  checkOrCompleteActiveCourse(user: UserDocument, courseId: Course) {
    // Validations.
    if (!user.student.activeCourseIds.includes(courseId)) {
      return;
    }
    if (user.student.completedCourseIds.includes(courseId)) {
      return;
    }

    // Actions.
    this.removeElementFromArray(user.student.activeCourseIds, courseId);
    user.student.completedCourseIds.push(courseId);
  }

  removeElementFromArray(arrayElements: any[], element: any) {
    arrayElements.splice(
      arrayElements.findIndex((e) => e == element),
      1,
    );
  }
}
