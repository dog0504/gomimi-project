import { Expose } from 'class-transformer';

export class GarbageTypeDto {
    @Expose()
    id!: number;
}