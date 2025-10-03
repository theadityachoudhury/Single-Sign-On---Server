import { Router } from "express";
import { container } from "../container/dependency-injection";
import { UserService } from "../services/user.service";

const app = Router();


app.get('/users/:id', async (req, res) => {
    try {
        const userService = container.resolve<UserService>('userService');
        const user = await userService.getUserById(req.params.id);

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json(user);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
            return;
        }
        res.status(500).json({ error: 'Internal server error' });
        return;
    }
});

app.post('/users', async (req, res) => {
    try {
        const userService = container.resolve<UserService>('userService');
        const user = await userService.createUser(req.body);

        res.status(201).json(user);
        return;
    } catch (error: any) {
        res.status(400).json({ error: error.message });
        return;
    }
});