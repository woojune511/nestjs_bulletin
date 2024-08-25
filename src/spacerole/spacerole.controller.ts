import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SpaceroleService } from './spacerole.service';
import { CreateSpaceroleDto } from './dto/create-spacerole.dto';
import { UpdateSpaceroleDto } from './dto/update-spacerole.dto';

@Controller('spacerole')
export class SpaceroleController {
    constructor(private readonly spaceroleService: SpaceroleService) {}
}
