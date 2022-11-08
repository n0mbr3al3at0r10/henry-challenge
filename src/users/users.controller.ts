import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ParseObjectIdPipe } from 'src/utilities/parse-object-id-pipe.pipe';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { CreateTeacherDto } from './dto/create-teacher.dto';

@Controller('users')
@ApiTags('user')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(@Req() request: Request) {
    return this.usersService.findAll(request);
  }

  @Get(':id')
  findOne(@Param('id', ParseObjectIdPipe) id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.usersService.remove(id);
  }

  @Post(':id/student')
  async addStudent(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() student: CreateStudentDto,
  ) {
    return this.usersService.addStudentDetails(id, student);
  }

  @Post(':id/teacher')
  async addTeacher(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() teacher: CreateTeacherDto,
  ) {
    return this.usersService.addTeacherDetails(id, teacher);
  }

  @Post(':id/startCourse/:courseId')
  async addStartedCourse(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('courseId', ParseObjectIdPipe) courseId: string,
  ) {
    return this.usersService.addStartedCourse(id, courseId);
  }

  @Post(':id/completeCourse/:courseId')
  async completeStartedCourse(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('courseId', ParseObjectIdPipe) courseId: string,
  ) {
    return this.usersService.completeStartedCourse(id, courseId);
  }
}
