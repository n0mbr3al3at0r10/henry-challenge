import { CreateCourseDto } from 'src/courses/dto/create-course.dto';

export const CourseDTOStub = (): CreateCourseDto => {
  return {
    name: 'English for career development',
    description: 'Test description',
    level: 'Intermediate',
    language: 'English',
    keywords: ['English', 'Language', 'Carrer development'],
  };
};
