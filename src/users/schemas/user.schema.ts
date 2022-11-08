import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Student, StudentSchema } from './student.schema';
import { Teacher, TeacherSchema } from './teacher.schema';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  name: string;

  @Prop()
  mail: string;

  @Prop()
  password: string;

  @Prop()
  image: string;

  @Prop(StudentSchema)
  student: Student;

  @Prop(TeacherSchema)
  teacher: Teacher;
}

export const UserSchema = SchemaFactory.createForClass(User);
