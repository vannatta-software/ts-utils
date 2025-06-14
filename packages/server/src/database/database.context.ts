import { Mediator } from "../mediator.service"; // Corrected path
import { ILogger } from "../common/logger"; // Use ILogger

export class DatabaseContext {
    private readonly logger: ILogger;

    constructor(
        mediator: Mediator,
        logger: ILogger
    ) {
        this.logger = logger;
        this.logger.log("Initialized repositories");
    }
}
