import app from "./server";
import config from "./config/config";


const PORT = config.app.PORT;

    app.listen(PORT, () => {
        console.log(`Server is listening on port ${PORT}`)
    })
