import { IDailyStepsRepository } from '../../domain/interfaces/IDailyStepsRepository';
import { StepsNotFoundError } from '../../shared/errors/StepsErrors';

export class DeleteSteps {
    constructor(private readonly stepsRepository: IDailyStepsRepository) { }

    async execute(id: string, userId: string): Promise<void> {
        try {
            await this.stepsRepository.deleteSteps(id, userId);
        } catch (error: any) {
            if (error.code === 'P2025' || error.message.includes('Record to delete does not exist')) {
                throw new StepsNotFoundError();
            }
            throw error;
        }
    }
}
