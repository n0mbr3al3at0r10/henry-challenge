import { ApiProperty } from '@nestjs/swagger';
export class CreateTeacherDto {
  @ApiProperty({
    example: 'Software Engineer',
  })
  readonly title: string;

  @ApiProperty({
    example: 'https://www.linkedin.com/in/agustinprado/',
  })
  readonly linkedin: string;
}
