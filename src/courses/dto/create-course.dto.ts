import { ApiProperty } from '@nestjs/swagger';
export class CreateCourseDto {
  @ApiProperty({
    example: 'English for career development',
  })
  readonly name: string;

  @ApiProperty({
    example:
      'In this course, you will learn about the job search, application, and interview process in the United States, while comparing and contrasting the same process in your home country. This course will also give you the opportunity to explore your global career path, while building your vocabulary and improving your language skills to achieve your professional goals.',
  })
  readonly description: string;

  @ApiProperty({
    example: 'Intermediate',
  })
  readonly level: string;

  @ApiProperty({ example: 'English' })
  readonly language: string;

  @ApiProperty({ example: ['English', 'Language', 'Carrer development'] })
  readonly keywords: string[];
}
