/**
 * Converts a base64 encoded string to a hexadecimal string.
 * @param {Object} context - The Azure Function context object.
 * @param {Object} req - The Azure Function request object.
 */
module.exports = async function (context, req) {

    /**
     * The base64 encoded string to be converted.
     * @type {string}
     */
    const md5 = (req.body);

    /**
     * The buffer containing the decoded base64 string.
     * @type {Buffer}
     */
    const buffer = Buffer.from(md5, 'base64');

    /**
     * The hexadecimal string representation of the decoded base64 string.
     * @type {string}
     */
    const bufString = buffer.toString('hex');

    // Set the response body to the hexadecimal string
    context.res = {
        body: bufString
    };
}