import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from 'express';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course, CourseDocument } from './schemas/course.schema';
import { User } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
  ) {}

  // Injecting usersService so I can look for the teacher and add it to the course.
  @Inject(UsersService)
  private readonly usersService: UsersService;

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    return this.courseModel.create(createCourseDto);
  }

  async findAll(request: Request): Promise<Course[]> {
    return this.courseModel
      .find(request.query)
      .populate({ path: 'teacherId' })
      .setOptions({ sanitizeFilter: true })
      .exec();
  }

  async findOne(id: string): Promise<Course> {
    return this.courseModel
      .findOne({ _id: id })
      .populate({ path: 'teacherId' })
      .exec();
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    return this.courseModel.findOneAndUpdate({ _id: id }, updateCourseDto, {
      new: true,
    });
  }

  async remove(id: string) {
    return this.courseModel.findByIdAndRemove({ _id: id }).exec();
  }

  async addTeacher(id: string, teacherId: string) {
    const course: CourseDocument = await this.courseModel.findById(id);
    const user: User = await this.usersService.findOne(teacherId);
    course.teacherId = user;
    course.save();
    return course;
  }

  async addChapter(id: string, chapter: any) {
    const course: CourseDocument = await this.courseModel.findById(id);
    course.chapters.push(chapter);
    course.save();
    return course;
  }

  async addRanking(id: string, ranking: any) {
    const course: CourseDocument = await this.courseModel.findById(id);
    course.rankings.push(ranking);
    course.save();
    return course;
  }
}
