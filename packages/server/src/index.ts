import singularityql from "@singularityql/resolver";
import express from "express";

const app = express();

app.use(express.json());

function listen(port: number) {
    app.post("/sgql", async (request, response) => {
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
            response.status(200).json(result);
        } catch (err) {
            console.error("Error resolving SGQL:", err);
            response.status(500).json({
                status: 500,
                error: "Internal Server Error"
            });
        }
    });

    app.listen(port, () => {
        console.log(`SingularityQL server started on port ${port}`);
    });
}

export { app, listen };
