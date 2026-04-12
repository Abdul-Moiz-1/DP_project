import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { OrganizerProfile } from 'src/entities/organizer-profile.entity';
import { Follow } from 'src/entities/follow.entity';
import { UserPreference } from 'src/entities/user-preference.entity';
import { Category } from 'src/entities/category.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, OrganizerProfile, Follow, UserPreference, Category]),
    ],
    providers: [UsersService],
    controllers: [UsersController],
    exports: [UsersService],
})
export class UsersModule {}
