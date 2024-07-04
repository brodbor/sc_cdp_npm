/**
 * Converts a readable stream to a buffer.
 * @param {stream.Readable} readableStream - The readable stream to convert.
 * @returns {Promise<Buffer>} A promise that resolves with the converted buffer.
 */
async function streamToBuffer(readableStream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on('data', (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on('error', reject);
    });
}

/**
 * Azure Function entry point.
 * @param {Object} context - The Azure Function context object.
 * @param {Object} req - The HTTP request object.
 */
module.exports = async function (context, req) {
    context.log(req.rawBody);

    const blob_conn = process.env.blob_conn;

    const json = req.rawBody;
    const obj = JSON.parse(json);

    const blobName = obj.blobName;
    const md5 = obj.md5;
    const url = obj.url;

    const containerName = "cdp";
    const blobServiceClient = BlobServiceClient.fromConnectionString(blob_conn);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const blobClient = containerClient.getBlockBlobClient(blobName);

    const downloadResponse = await blobClient.download();
    const downloaded = await streamToBuffer(downloadResponse.readableStreamBody);

    var request = require('request');
    const requestPromise = util.promisify(request);
    var options = {
        'method': 'PUT',
        'url': url,
        'headers': {
            'content-md5': md5,
            'x-amz-server-side-encryption': 'AES256',
            'Content-Type': 'text/plain'
        },
        body: downloaded
    };

    try {
        const response = await requestPromise(options);
        console.log(response.body);
        context.res = {
            body: response.body
        };
    } catch (error) {
        throw new Error(error.body);
    }
}