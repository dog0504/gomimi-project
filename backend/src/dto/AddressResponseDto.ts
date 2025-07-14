import { Expose, Type } from 'class-transformer';
import { ZipCodeDto } from './ZipCodeDto';

export class AddressResponseDto {
    @Expose()
    addressId!: number;

    // @Expose()
    // zip!: string;

    // @Expose()
    // city!: string;

    // @Expose()
    // ward!: string;

    // @Expose()
    // town?: string;

    @Expose()
    chom?: string;

    @Expose()
    street?: string;

    @Expose()
    inf?: string;

    @Expose()
    @Type(() => ZipCodeDto)
    zipCode!: ZipCodeDto;
}