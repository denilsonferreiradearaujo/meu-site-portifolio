import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile() {
    return this.profileService.getProfile();
  }

  @UseGuards(JwtAuthGuard)
  @Put()
  async updateProfile(@Body() updateDto: UpdateProfileDto) {
    return this.profileService.updateProfile(updateDto);
  }
}
