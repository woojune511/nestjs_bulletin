import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UserspaceService } from './userspace.service';
import { CreateUserspaceDto } from './dto/create-userspace.dto';
import { UpdateUserspaceDto } from './dto/update-userspace.dto';
import { JwtAccessAuthGuard } from 'src/auth/jwt-access.guard';
import { Space } from 'src/space/entities/space.entity';

@Controller('userspace')
export class UserspaceController {}