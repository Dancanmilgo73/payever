/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Avatar extends Document {
  @Prop()
  userId: string;

  @Prop()
  hash: string;

  @Prop()
  base64: string;
}

export const AvatarSchema = SchemaFactory.createForClass(Avatar);
