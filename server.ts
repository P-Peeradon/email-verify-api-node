import express,  { type Request, type Response, type NextFunction } from "express";
import bodyParser from "body-parser";
import { verifyEmailFormat } from "./service/verifyEmailFormat.service";
import { resolveRecord } from "./service/resolveRecord.service";

const PORT = process.env.PORT || 3000;
const app = express();
app.use(bodyParser.json());

/*
1. Accept email address
2. Validate the format
3. Resolve the MX record for the domain name
4. Connect to SMTP Host and evaluate inbox.
*/

app.get("/", async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body?.email) {
        res.status(400).json({ error: "Missing email." });
        return next();
    }

    const { email } = req.body;
    const isvalidEmailFormat = verifyEmailFormat(email);
    
    if (!isvalidEmailFormat) {
        res.status(400).json({ error: "Invalid email format." });
        return next();
    }

    const emailDomain = email.split("@")[1];
    const mxRecords = await resolveRecord(emailDomain);
    const sortedMxRecords = mxRecords.sort((a, b) => a.priority - b.priority);
    console.log(sortedMxRecords);

    res.send({ isvalidEmailFormat, sortedMxRecords });
    next();
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});