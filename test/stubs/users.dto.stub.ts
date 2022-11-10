import { CreateUserDto } from '../../src/users/dto/create-user.dto';

export const UserDTOStubs = (): CreateUserDto[] => {
  return [
    {
      name: 'Agustín Prado',
      mail: 'n0mbr3al3at0r10@gmail.com',
      password: 'hash1234',
      image: 'https://avatars.githubusercontent.com/u/86616429',
    },
    {
      name: 'Agus Prado',
      mail: 'n0mbr3al3at0r10@gmail.com',
      password: 'hash5678',
      image: 'https://avatars.githubusercontent.com/u/86616429',
    },
  ];
};

export const RandomUserDTOStub = (): CreateUserDto => {
  return UserDTOStubs()[Math.floor(Math.random() * UserDTOStubs.length)];
};
