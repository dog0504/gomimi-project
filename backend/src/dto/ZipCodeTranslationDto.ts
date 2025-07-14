import { Expose, Type } from 'class-transformer';
import { LanguageDto } from './LanguageDto';

export class ZipCodeTranslationDto {
    @Expose()
    id!: number;

    @Expose()
    city!: string;

    @Expose()
    ward!: string;

    @Expose()
    town!: string;

    @Expose()
    @Type(() => LanguageDto)
    language!: LanguageDto;
}