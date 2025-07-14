import { Expose, Type } from 'class-transformer';
import { ZipCodeTranslationDto } from './ZipCodeTranslationDto';

export class ZipCodeDto {
    @Expose()
    zip_code!: string;

    @Expose()
    @Type(() => ZipCodeTranslationDto)
    translations!: ZipCodeTranslationDto[];
}