import { createConsola, LogLevels } from 'consola';

export const consola = createConsola({
    level: LogLevels.info,
    formatOptions: {
        colors: true,
        date: true,
        compact: false,
    },
});

consola.wrapAll();
