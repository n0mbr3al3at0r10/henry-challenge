import { CreateTeacherDto } from '../../src/users/dto/create-teacher.dto';

export const TeacherDTOStubs = (): CreateTeacherDto[] => {
  return [
    {
      title: 'Software Engineer',
      linkedin: 'https://www.linkedin.com/in/agustinprado/',
    },
    {
      title: 'Professor',
      linkedin: 'https://www.linkedin.com/in/agustinprado/',
    },
  ];
};

export const RandomTeacherDTOStub = (): CreateTeacherDto => {
  return TeacherDTOStubs()[Math.floor(Math.random() * TeacherDTOStubs.length)];
};
