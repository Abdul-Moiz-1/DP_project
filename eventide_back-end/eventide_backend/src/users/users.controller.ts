import { Controller, Get, Patch, Body, Post, UseGuards, ValidationPipe, UsePipes } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { CreateOrganizerProfileDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@GetUser('userId') userId: number) {
    return this.usersService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  updateProfile(@Body() updateUserDto: UpdateUserDto, @GetUser('userId') userId: number) {
    return this.usersService.updateProfile(userId, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(
    @Body() body: { currentPassword: string; newPassword: string },
    @GetUser('userId') userId: number,
  ) {
    return this.usersService.changePassword(userId, body.currentPassword, body.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('organizer-profile')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  updateOrganizerProfile(
    @Body() dto: CreateOrganizerProfileDto,
    @GetUser('userId') userId: number,
  ) {
    return this.usersService.updateOrganizerProfile(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('organizer')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  upgradeToOrganizer(@GetUser('userId') userId: number, @Body() orgData: CreateOrganizerProfileDto) {
    return this.usersService.upgradeToOrganizer(userId, orgData);
  }
}
