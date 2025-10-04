import { databaseConfig } from '@/config/database.config';
import { container } from '../container/dependency-injection';
import { IUserRepository } from './interfaces/user.repository.interface';
import { UserMongoRepository } from './mongodb/user.mongo.repository';

export class RepositoryFactory {
    private static userRepository: IUserRepository;

    static getUserRepository(): IUserRepository {
        if (!this.userRepository) {
            switch (databaseConfig.type) {
                case 'mongodb':
                    this.userRepository = new UserMongoRepository();
                    break;
                default:
                    throw new Error(`Unsupported database type: ${databaseConfig.type}`);
            }
        }
        return this.userRepository;
    }

    // Add more repositories as needed
    // static getOrderRepository(): IOrderRepository { ... }
    // static getProductRepository(): IProductRepository { ... }
}

container.register<IUserRepository>('userRepository', () => RepositoryFactory.getUserRepository(), true);