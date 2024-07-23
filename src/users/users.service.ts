import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import axios from 'axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { Avatar } from './schemas/avatar.schema';
import * as amqp from 'amqplib';
import * as fs from 'fs';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Avatar.name) private avatarModel: Model<Avatar>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    await createdUser.save();

    // Dummy email sending
    console.log('Sending email...');

    // Dummy RabbitMQ event
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue('user_created');
    channel.sendToQueue(
      'user_created',
      Buffer.from(JSON.stringify(createdUser)),
    );
    console.log('RabbitMQ event sent...');

    return createdUser;
  }

  async getUser(id: string) {
    const response = await axios.get(`https://reqres.in/api/users/${id}`);
    return response.data.data;
  }

  async remove(id: string) {
    await this.deleteUserAvatar(id);
    return `This action removes a #${id} user`;
  }

  async getUserAvatar(userId: string): Promise<string> {
    const avatarEntry = await this.avatarModel.findOne({ userId });
    if (avatarEntry) {
      return avatarEntry.base64;
    }

    const user = await this.getUser(userId);
    const avatarUrl = user.avatar;
    const response = await axios.get(avatarUrl, {
      responseType: 'arraybuffer',
    });
    const buffer = Buffer.from(response.data, 'binary');
    const base64 = buffer.toString('base64');

    const hash = crypto.createHash('md5').update(buffer).digest('hex');
    const avatar = new this.avatarModel({ userId, hash, base64 });
    await avatar.save();

    fs.writeFileSync(`./avatars/${hash}.jpg`, buffer);

    return base64;
  }

  async deleteUserAvatar(userId: string): Promise<void> {
    const avatarEntry = await this.avatarModel.findOne({ userId });
    if (avatarEntry) {
      fs.unlinkSync(`./avatars/${avatarEntry.hash}.jpg`);
      await this.avatarModel.deleteOne({ userId });
    }
  }
}
