import * as winston from 'winston';
declare const log: {
    child: (options: Record<string, any>) => winston.Logger;
};
export { log };
