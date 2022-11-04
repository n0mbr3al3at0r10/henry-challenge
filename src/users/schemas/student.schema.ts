import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Course } from 'src/courses/schemas/course.schema';

export type StudentDocument = Student & Document;

@Schema()
export class Student {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Course' })
  activeCourseIds: Course[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Course' })
  completedCourseIds: Course[];
}

export const StudentSchema = SchemaFactory.createForClass(Student);
