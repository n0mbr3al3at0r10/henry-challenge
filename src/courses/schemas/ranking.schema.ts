import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';

export type RankingDocument = Ranking & Document;

@Schema()
export class Ranking {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: User;

  @Prop()
  score: number;
}

export const RankingSchema = SchemaFactory.createForClass(Ranking);
