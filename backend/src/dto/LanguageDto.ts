import { Expose } from 'class-transformer';

export class LanguageDto {
    @Expose()
    id!: number;

    @Expose()
    code!: string;

    @Expose()
    name!: string;
}