import { DocumentBuilder } from '@nestjs/swagger';

export function getSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('API autorization')
    .setDescription('The API description')
    .setVersion('1.0')
    .build();
}
