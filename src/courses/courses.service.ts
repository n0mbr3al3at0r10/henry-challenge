import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from 'express';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course, CourseDocument } from './schemas/course.schema';
import { User } from 'src/users/schemas/user.schema';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { CreateRankingDto } from './dto/create-ranking.dto';

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
  ) {}

  async create(course: CreateCourseDto): Promise<Course> {
    return this.courseModel.create(course);
  }

  async findAll(request: Request): Promise<Course[]> {
    return this.courseModel
      .find(request.query)
      .populate('teacherId', '-student') // matches with userId in User and displays its details.
      .setOptions({ sanitizeFilter: true })
      .exec();
  }

  async findOne(id: string): Promise<Course> {
    return this.courseModel
      .findOne({ _id: id })
      .populate('teacherId', '-student') // matches with userId in User and displays its details.
      .exec();
  }

  async update(id: string, course: UpdateCourseDto): Promise<Course> {
    return this.courseModel
      .findOneAndUpdate({ _id: id }, course, {
        new: true,
      })
      .populate('teacherId', '-student'); // matches with userId in User and displays its details.
  }

  async remove(id: string) {
    return this.courseModel
      .findByIdAndRemove({ _id: id })
      .populate('teacherId', '-student') // matches with userId in User and displays its details.
      .exec();
  }

  async assignTeacher(id: string, teacherId: User) {
    const course: CourseDocument = await this.courseModel.findById(id);
    course.teacherId = teacherId;
    course.save();
    return course.populate('teacherId', '-student'); // matches with userId in User and displays its details.
  }

  async addChapter(id: string, chapter: CreateChapterDto) {
    const course: CourseDocument = await this.courseModel.findById(id);
    course.chapters.push(chapter);
    course.save();
    return course.populate('teacherId', '-student'); // matches with userId in User and displays its details.
  }

  async updateChapter(
    id: string,
    chapterId: string,
    chapter: CreateChapterDto,
  ): Promise<Course> {
    // Updating a subdocument generates a new id, so passing old id to have consistency.
    return this.courseModel
      .findOneAndUpdate(
        { _id: id, 'chapters._id': chapterId },
        { $set: { 'chapters.$': { _id: chapterId, ...chapter } } },
        { new: true },
      )
      .populate('teacherId', '-student'); // matches with userId in User and displays its details.
  }

  async addRanking(id: string, ranking: CreateRankingDto) {
    const course: CourseDocument = await this.courseModel.findById(id);
    course.rankings.push(ranking);
    course.save();
    return course.populate('teacherId', '-student'); // matches with userId in User and displays its details.
  }
}
