import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateProjectDto {
  @IsString({ message: 'O título deve ser um texto.' })
  @IsNotEmpty({ message: 'O título do projeto é obrigatório.' })
  title: string;

  @IsString({ message: 'A categoria deve ser um texto.' })
  @IsNotEmpty({ message: 'A categoria é obrigatória.' })
  category: string;

  @IsString({ message: 'A descrição deve ser um texto.' })
  @IsNotEmpty({ message: 'A descrição é obrigatória.' })
  description: string;

  @IsString({ message: 'A URL do projeto deve ser um texto.' })
  @IsNotEmpty({ message: 'A URL do projeto é obrigatória.' })
  url: string;

  @IsOptional()
  @IsString()
  image?: string;
}
