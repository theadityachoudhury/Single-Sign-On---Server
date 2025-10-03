class DIContainer {
    private services = new Map<string, any>();
    private singletons = new Map<string, any>();

    // Register a service factory
    register<T>(key: string, factory: () => T, singleton: boolean = true): void {
        this.services.set(key, { factory, singleton });
    }

    // Resolve a service
    resolve<T>(key: string): T {
        const service = this.services.get(key);
        if (!service) {
            throw new Error(`Service ${key} not registered`);
        }

        if (service.singleton) {
            if (!this.singletons.has(key)) {
                this.singletons.set(key, service.factory());
            }
            return this.singletons.get(key);
        }

        return service.factory();
    }

    // Clear all services (useful for testing)
    clear(): void {
        this.services.clear();
        this.singletons.clear();
    }
}

// Create container instance
export const container = new DIContainer();

// // Register repositories
// container.register<IUserRepository>('userRepository', () =>
//     RepositoryFactory.getUserRepository()
// );

// // Register services
// container.register<UserService>('userService', () =>
//     new UserService(container.resolve<IUserRepository>('userRepository'))
// );