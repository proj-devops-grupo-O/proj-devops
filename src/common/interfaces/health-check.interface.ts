import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckResponse {
  @ApiProperty({
    example: 'ok',
    description: 'Health status of the application',
    enum: ['ok', 'error'],
  })
  status: 'ok' | 'error';

  @ApiProperty({
    example: '2024-01-15T10:30:00.000Z',
    description: 'Timestamp when the health check was performed',
  })
  timestamp: string;
}
