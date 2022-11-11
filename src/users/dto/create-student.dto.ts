import { ApiProperty } from '@nestjs/swagger';
import { Course } from '../../../src/courses/schemas/course.schema';
export class CreateStudentDto {
  constructor() {
    this.activeCourseIds = [];
    this.completedCourseIds = [];
  }
  @ApiProperty({
    example: ['6364778c8cba791005e71785'],
  })
  readonly activeCourseIds: Course[];

  @ApiProperty({
    example: ['6364778c8cba791005e71784'],
  })
  readonly completedCourseIds: Course[];
}
