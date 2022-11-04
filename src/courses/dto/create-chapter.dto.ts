import { ApiProperty } from '@nestjs/swagger';
export class CreateChapterDto {
  @ApiProperty({
    example: 1,
  })
  readonly number: number;

  @ApiProperty({
    example: 'Intro',
  })
  readonly name: string;

  @ApiProperty({
    example: 'https://www.youtube.com/watch?v=QNydgNRgGS4',
  })
  readonly media: string;
}
