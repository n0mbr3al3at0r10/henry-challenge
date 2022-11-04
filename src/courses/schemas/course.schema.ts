import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { Chapter, ChapterSchema } from './chapter.schema';
import { Ranking, RankingSchema } from './ranking.schema';

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

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  teacherId: User;

  @Prop([ChapterSchema])
  chapters: Chapter[];

  @Prop([RankingSchema])
  rankings: Ranking[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);
