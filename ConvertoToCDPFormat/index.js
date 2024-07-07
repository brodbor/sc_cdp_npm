const { BlobServiceClient } = require("@azure/storage-blob");
const { v1: uuidv1 } = require("uuid");
require("dotenv").config();
const zlib = require('zlib');


/**
 * Converts data to CDP format and uploads it to Azure Blob Storage.
 * @param {object} context - The Azure Function context object.
 * @param {object} req - The Azure Function request object.
 */
module.exports = async function (context, req) {
    try {

        const json = req.rawBody;
        const obj = JSON.parse(json);
    
        const blobName = obj.blobName;
        const fname = obj.source;
        const gfname = obj.destination;





        const blob_conn = process.env.blob_conn;
        const blobServiceClient = BlobServiceClient.fromConnectionString(blob_conn);
        const containerClient = blobServiceClient.getContainerClient("cdp");
        const blobClient = containerClient.getBlobClient(fname);

        let result;
        const downloadBlockBlobResponse = await blobClient.download(0);
        const downloaded = await streamToString(downloadBlockBlobResponse.readableStreamBody);

        context.log(downloaded);
        result = JSON.parse(downloaded);


        let sJSON = "";
        for (const reader of result) {
            const ext = [];
            const ext1 = { name: "ext1", key: "default" };

            for (const e of reader.Preferences) {
                
                ext1[e.Product] = JSON.stringify(e) ;
       
            }
            ext.push(ext1);

            const jsonObject = {
                reff: uuidv1(),
                schema: "guest",
                mode: "upsert",
                value: {
                    guestType: "customer",
                    firstName: reader.FirstName,
                    lastName: reader.LastName,
                    email: reader.Email,
                    identifiers: [{ provider: "email", id: reader.Email }],
                    extensions: ext
                }
            };
            sJSON += JSON.stringify(jsonObject) + "\n";
        }

        context.log(sJSON);

       // const blob1Client = containerClient.getBlobClient(gfname);
        // Get a block blob client
      const blockBlobClient = containerClient.getBlockBlobClient(gfname);
        const buffer = Buffer.from(sJSON, "utf-8");
        const compressed = zlib.gzipSync(buffer);
        await blockBlobClient.upload(compressed, compressed.length, {
            blobHTTPHeaders: { blobContentType: "application/x-gzip" }
        });


        context.res = { body: "Ok" };
    } catch (ex) {
        context.log.error(ex.message, ex.message);
        context.res = { status: 500, body: ex.message };
    }
};

/**
 * Converts a readable stream to a string.
 * @param {stream.Readable} stream - The readable stream to convert.
 * @returns {Promise<string>} - A promise that resolves to the converted string.
 */
async function streamToString(stream) {
    const chunks = [];
    return new Promise((resolve, reject) => {
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
        stream.on("error", reject);
    });
}