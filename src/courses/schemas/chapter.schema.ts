import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChapterDocument = Chapter & Document;

@Schema()
export class Chapter {
  @Prop()
  number: number;

  @Prop()
  name: string;

  @Prop()
  media: string;
}

export const ChapterSchema = SchemaFactory.createForClass(Chapter);
