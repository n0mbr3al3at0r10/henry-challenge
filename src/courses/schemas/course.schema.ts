import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema()
export class Course {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  level: string;

  @Prop()
  language: string;

  @Prop([String])
  keywords: string[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);
