import { Expose, Type } from 'class-transformer';

export class BinDayDto {
    @Expose()
    id!: number;

    @Expose()
    type!: string;

    @Expose()
    dayOfWeek!: string;

    @Expose()
    time!: string | null;
}