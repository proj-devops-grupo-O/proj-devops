import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EmailJobData } from './interfaces';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

@Processor('charges')
export class ChargeProcessor extends WorkerHost {
  private readonly logger = new Logger(ChargeProcessor.name);
  private readonly from: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    super();
    this.from =
      this.configService.get<string>('EMAIL_FROM') ||
      'Acme <onboarding@resend.dev>';
    this.logger.log('Charge Worker initialized');
  }

  async process(job: Job<EmailJobData, any, string>): Promise<any> {
    this.logger.log(
      `Processing job: ${job.name} | ID: ${job.id} | Attempt: ${job.attemptsMade + 1}`,
    );

    if (job.name === 'send-charge-email') {
      const {
        customerEmail,
        chargeId,
        amount,
        customerName,
        dueDate,
        planName,
      } = job.data;

      try {
        this.logger.log(
          `Enviando cobrança para: ${customerEmail} | Invoice: ${chargeId}`,
        );

        const payload = {
          from: this.from,
          to: [customerEmail],
          subject: `Cobrança #${chargeId}`,
          html: `
            <h1>Detalhes da sua cobrança</h1>
            <p>Olá, ${customerName || 'Cliente'},</p>
            <p>Segue a cobrança referente ao ID <b>${chargeId}</b> para o plano <b>${planName}</b>.</p>
            <p>Valor: R$ ${amount}</p>
            <p>Vencimento: ${new Date(dueDate).toLocaleDateString('pt-BR')}</p>
            <p>Se você tiver alguma dúvida, entre em contato conosco.</p>
          `,
        };

        const response: AxiosResponse<any> = await firstValueFrom(
          this.httpService.post(
            'https://email-service-2.vercel.app/send-email',
            payload,
          ),
        );

        this.logger.log(
          `E-mail enviado com sucesso! ID: ${response.data?.id || 'N/A'}`,
        );
        return {
          success: true,
          emailSent: true,
          responseId: response.data?.id,
        };
      } catch (error: any) {
        this.logger.error(
          `Erro ao processar job ${job.id}: ${error.response?.data?.message || error.message}`,
        );
        throw new Error(
          `Failed to send email: ${error.response?.data?.message || error.message}`,
        );
      }
    } else {
      this.logger.warn(`Unknown job: ${job.name}`);
    }
  }
}
