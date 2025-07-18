import { Expose, Type } from 'class-transformer';
import { LanguageDto } from './LanguageDto';
import { GarbageTypeDto } from './GarbageTypeDto';

export class GarbageTypeTranslationDto {
    @Expose()
    id!: number;

    @Expose()
    name!: string;

    @Expose()
    @Type(() => GarbageTypeDto)
    garbageType!: GarbageTypeDto;

    @Expose()
    @Type(() => LanguageDto)
    language!: LanguageDto;
}