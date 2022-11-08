import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { Request } from 'express';
import { Student } from './schemas/student.schema';

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

  async addStudentDetails(id: string, student: any) {
    const user: UserDocument = await this.userModel.findById(id);
    user.student = student;
    user.save();
    return user;
  }

  async addTeacherDetails(id: string, teacher: any) {
    const user: UserDocument = await this.userModel.findById(id);
    user.teacher = teacher;
    user.save();
    return user;
  }

  async addStartedCourse(id: string, courseId: any) {
    const user: UserDocument = await this.userModel.findById(id);
    this.checkOrCreateStudent(user.student);
    this.checkOrCreateActiveCourse(user.student, courseId);
    return this.userModel.findByIdAndUpdate(id, user, {
      new: true,
    });
  }

  async completeStartedCourse(id: string, courseId: any) {
    const user: UserDocument = await this.userModel.findById(id);
    this.checkOrCreateStudent(user.student);
    this.checkOrCompleteActiveCourse(user.student, courseId);
    return this.userModel.findByIdAndUpdate(id, user, {
      new: true,
    });
  }

  checkOrCreateStudent(student: Student) {
    // Validations.
    if (student) {
      return;
    }

    // Actions.
    student = new Student();
  }

  checkOrCreateActiveCourse(student: Student, courseId: any) {
    // Validations.
    if (student.activeCourseIds.includes(courseId)) {
      return;
    }

    // Actions.
    // User can start watching a course again after it's already completed.
    if (student.completedCourseIds.includes(courseId)) {
      this.removeElementFromArray(student.completedCourseIds, courseId);
    }
    student.activeCourseIds.push(courseId);
  }

  checkOrCompleteActiveCourse(student: Student, courseId: any) {
    // Validations.
    if (!student.activeCourseIds.includes(courseId)) {
      return;
    }
    if (student.completedCourseIds.includes(courseId)) {
      return;
    }

    // Actions.
    this.removeElementFromArray(student.activeCourseIds, courseId);
    student.completedCourseIds.push(courseId);
  }

  removeElementFromArray(arrayElements: any[], element: any) {
    arrayElements.splice(
      arrayElements.findIndex((e) => e == element),
      1,
    );
  }
}
