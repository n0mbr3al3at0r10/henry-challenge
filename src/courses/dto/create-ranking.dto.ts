import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/schemas/user.schema';
export class CreateRankingDto {
  @ApiProperty({
    example: '6364778c8cba791005e71785',
  })
  readonly userId: User;

  @ApiProperty({
    example: 5,
  })
  readonly score: number;
}
