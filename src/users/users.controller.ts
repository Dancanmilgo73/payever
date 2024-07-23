import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    // user details and avatar
    return this.usersService.createUser(createUserDto);
  }

  @Get(':id/avatar')
  getUserAvatar(@Param('id') id: string) {
    // Retrive base 64 image
    return this.usersService.getUserAvatar(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    // return a user from reqres
    return this.usersService.getUser(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    // remove user and image blob or avatar
    return this.usersService.remove(id);
  }
}
