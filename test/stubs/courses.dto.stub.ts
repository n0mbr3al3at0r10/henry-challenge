import { CreateCourseDto } from 'src/courses/dto/create-course.dto';

export const CourseDTOStubs = (): CreateCourseDto[] => {
  return [
    {
      name: 'English for career development',
      description: 'Test description',
      level: 'Intermediate',
      language: 'English',
      keywords: ['English', 'Language', 'Carrer development'],
    },
    {
      name: 'Spanish for career development',
      description: 'Test description',
      level: 'Intermediate',
      language: 'Spanish',
      keywords: ['Spanish', 'Language', 'Carrer development'],
    },
  ];
};

export const RandomCourseDTOStub = (): CreateCourseDto => {
  return CourseDTOStubs()[Math.floor(Math.random() * CourseDTOStubs.length)];
};
