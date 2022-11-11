import { CreateChapterDto } from 'src/courses/dto/create-chapter.dto';

export const ChapterDTOStubs = (): CreateChapterDto[] => {
  return [
    {
      number: 1,
      name: 'Intro',
      media: 'https://www.youtube.com/watch?v=QNydgNRgGS4',
    },
    {
      number: 2,
      name: 'Chapter 2',
      media: 'https://www.youtube.com/watch?v=QNydgNRgGS4',
    },
    {
      number: 3,
      name: 'Chapter 3',
      media: 'https://www.youtube.com/watch?v=QNydgNRgGS4',
    },
  ];
};

export const RandomChapterDTOStub = (): CreateChapterDto => {
  return ChapterDTOStubs()[Math.floor(Math.random() * ChapterDTOStubs.length)];
};
