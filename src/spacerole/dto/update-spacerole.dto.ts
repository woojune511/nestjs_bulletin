import { PartialType } from '@nestjs/mapped-types';
import { CreateSpaceroleDto } from './create-spacerole.dto';

export class UpdateSpaceroleDto extends PartialType(CreateSpaceroleDto) {}
