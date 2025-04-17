import singularityql from "@singularityql/resolver";
import express, { Express, Request, Response } from "express";
import https from "https";
import http from "http";
import { SingularityQLStatus } from "../../shared";

export type ServerOptions = {
    port: number;
    configureApp?: (app: Express) => void;
    https?: {
        key: string;
        cert: string;
    };
}

function createServer(options: ServerOptions) {
    const app = express();

    app.use(express.json()); 

    if (options.configureApp) {
        options.configureApp(app);
    }

    app.post("/sgql", async (request: Request, response: Response) => {
        const sgql = request.body.sgql;

        if (!sgql || !sgql.query || !sgql.placeholders) {
            response.status(400).json({
                status: 400,
                error: "Invalid SGQL request posted, fields `query` and `placeholders` are required"
            });
            return;
        }

        try {
            const result = await singularityql.resolve(sgql.query, sgql.placeholders);
            response.status(result.error ? 400 : 200).json(result);
        } catch (err) {
            console.error("Error resolving SGQL:", err);
            response.status(500).json({
                status: SingularityQLStatus.Error,
                error: "Internal Server Error"
            });
        }
    });

    const server = options.https ? https.createServer({ key: options.https.key, cert: options.https.cert }, app) : http.createServer(app);

    server.listen(options.port, () => {
        const proto = options.https ? "https" : "http";
        console.log(`SingularityQL server started on port ${proto}://localhost:${options.port}`);
    });
}

export { createServer };
