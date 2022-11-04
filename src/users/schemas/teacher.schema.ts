import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TeacherDocument = Teacher & Document;

@Schema()
export class Teacher {
  @Prop()
  title: string;

  @Prop()
  linkedin: string;
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher);
