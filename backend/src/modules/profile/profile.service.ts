import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile() {
    let profile = await this.prisma.profile.findUnique({
      where: { id: 'default-profile' },
    });

    if (!profile) {
      profile = await this.prisma.profile.create({
        data: { id: 'default-profile' },
      });
    }

    return profile;
  }

  async updateProfile(dto: UpdateProfileDto) {
    return this.prisma.profile.upsert({
      where: { id: 'default-profile' },
      update: dto,
      create: {
        id: 'default-profile',
        ...dto,
      },
    });
  }
}
