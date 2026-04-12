import { Controller, Get, Patch, Body, Post, Delete, Param, ParseIntPipe, UseGuards, ValidationPipe, UsePipes } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { CreateOrganizerProfileDto } from './dto/user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Follow } from 'src/entities/follow.entity';
import { UserPreference } from 'src/entities/user-preference.entity';
import { Category } from 'src/entities/category.entity';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(Follow) private followRepo: Repository<Follow>,
    @InjectRepository(UserPreference) private prefRepo: Repository<UserPreference>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
  ) {}

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

  @UseGuards(JwtAuthGuard)
  @Post('follow/:organizerId')
  async followOrganizer(
    @GetUser('userId') userId: number,
    @Param('organizerId', ParseIntPipe) organizerId: number,
  ) {
    const existing = await this.followRepo.findOne({
      where: { follower: { id: userId }, organizer: { id: organizerId } },
    });
    if (existing) return { message: 'Already following' };

    await this.followRepo.save(
      this.followRepo.create({ follower: { id: userId } as any, organizer: { id: organizerId } as any }),
    );
    return { message: 'Followed successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('follow/:organizerId')
  async unfollowOrganizer(
    @GetUser('userId') userId: number,
    @Param('organizerId', ParseIntPipe) organizerId: number,
  ) {
    await this.followRepo.delete({ follower: { id: userId }, organizer: { id: organizerId } });
    return { message: 'Unfollowed successfully' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('following')
  async getFollowing(@GetUser('userId') userId: number) {
    const follows = await this.followRepo.find({
      where: { follower: { id: userId } },
      relations: ['organizer', 'organizer.organizerProfile'],
    });
    return follows.map(f => ({
      id: f.organizer.id,
      name: f.organizer.name,
      organizationName: f.organizer.organizerProfile?.organizationName,
    }));
  }

  @UseGuards(JwtAuthGuard)
  @Post('preferences')
  async updatePreferences(
    @GetUser('userId') userId: number,
    @Body('categoryIds') categoryIds: number[],
  ) {
    await this.prefRepo.delete({ user: { id: userId } });

    if (categoryIds && categoryIds.length > 0) {
      const categories = await this.categoryRepo.findByIds(categoryIds);
      const prefs = categories.map(cat =>
        this.prefRepo.create({ user: { id: userId } as any, category: cat }),
      );
      await this.prefRepo.save(prefs);
    }

    return { message: 'Preferences updated' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('preferences')
  async getPreferences(@GetUser('userId') userId: number) {
    const prefs = await this.prefRepo.find({
      where: { user: { id: userId } },
      relations: ['category'],
    });
    return prefs.map(p => ({ id: p.category.id, name: p.category.name }));
  }
}
