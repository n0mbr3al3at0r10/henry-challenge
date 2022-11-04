import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from 'express';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course, CourseDocument } from './schemas/course.schema';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
  ) {}

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
