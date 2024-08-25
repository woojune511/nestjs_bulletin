import { PartialType } from '@nestjs/mapped-types';
import { CreateUserspaceDto } from './create-userspace.dto';

export class UpdateUserspaceDto extends PartialType(CreateUserspaceDto) {}
