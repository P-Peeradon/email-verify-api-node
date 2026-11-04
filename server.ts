import express,  { type Request, type Response, type NextFunction } from "express";
import bodyParser from "body-parser";

const PORT = process.env.PORT || 3000;
const app = express();
app.use(bodyParser.json());

/*
1. Accept email address
2. Validate the format
3. Resolve the MX record for the domain name
4. Connect to SMTP and evaluate inbox.
*/

app.get("/", (req: Request, res: Response, next: NextFunction) => {
    if (!req.body?.email) {
        res.status(400).json({ error: "Missing email." });
        return next();
    }

    const { email } = req.body;
    
    res.send({ hello: "world" });
    next();
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});