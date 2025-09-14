import { PartialType } from '@nestjs/mapped-types';
import { CreateExamTitleDto } from './create-exam-title.dto';

export class UpdateExamTitleDto extends PartialType(CreateExamTitleDto) {}