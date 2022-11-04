import { ApiProperty } from '@nestjs/swagger';
export class CreateUserDto {
  @ApiProperty({
    example: 'Agustín Prado',
  })
  readonly name: string;

  @ApiProperty({
    example: 'n0mbr3al3at0r10@gmail.com',
  })
  readonly mail: string;

  @ApiProperty({
    example: 'hash1234',
  })
  readonly password: string;

  @ApiProperty({ example: 'https://avatars.githubusercontent.com/u/86616429' })
  readonly image: string;
}
