import {
  Req,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { User } from 'src/users/schemas/user.schema';
import { ParseObjectIdPipe } from 'src/utilities/parse-object-id-pipe.pipe';
import { CoursesService } from './courses.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { CreateRankingDto } from './dto/create-ranking.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('courses')
@ApiTags('course')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  findAll(@Req() request: Request) {
    return this.coursesService.findAll(request);
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.coursesService.update(id, updateCourseDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.coursesService.remove(id);
  }

  @Post(':id/teacher/:teacherId')
  async addTeacher(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('teacherId', ParseObjectIdPipe) teacher: User,
  ) {
    return this.coursesService.assignTeacher(id, teacher);
  }

  @Post(':id/chapter')
  async addChapter(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() chapter: CreateChapterDto,
  ) {
    return this.coursesService.addChapter(id, chapter);
  }

  @Post(':id/ranking')
  async addRanking(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() ranking: CreateRankingDto,
  ) {
    return this.coursesService.addRanking(id, ranking);
  }
}
