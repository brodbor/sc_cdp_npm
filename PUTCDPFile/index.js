const stream = require('stream');
const { BlobServiceClient } = require('@azure/storage-blob');
const util = require('util')
const containerName ='fssyn';




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

 
module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');



const body =req.body;



const list = body.split('|||');

url = list[0];
md5= list[1];
blobName= list[2];
    //const md5 = (req.query.md5 || (req.body && req.body.md5));
    //const blobName = (req.query.blobName || (req.body && req.body.blobName));



  //  url ="https://boxever-batch-service-production-eu-west-1.s3.eu-west-1.amazonaws.com/psfu6uh05hsr9c34rptlr06dn864cqrx/f0e968a1-5107-4c4f-845e-a6406d8e8621/import.gz?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEgaCWV1LXdlc3QtMSJHMEUCIFhTOnASBzmk5mApEs7sWXtVFSwI%2BO%2FTL8gO3Y%2Fla9Q%2FAiEA7dvm4SaLptAaAsj5BHJaW0cenWe%2FO58dZ%2FgdTHTFGgwq1QQIgf%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw0OTM0MDM5NjkwNjYiDOXk97HpbisgT4oVOyqpBFBRHg2qmuuKZBNteFhLV68r%2FkRpjymLPGTca6IGLxcU4t1FsSDbq5LMBFbRbK7ISTlCJf1kB7OUvHVcmZdv%2BFhk6MX9IjfcJDyfHbIAuwHyIhxidFzhuctxSkKiMODwQs9nhpfPvZ7fBudCoyaR41CYl%2BkA9K3lJ78A%2BcCmT%2Fqm%2BSnhQqpl3yXo1DvPDg30Nt56bw0DdpcM1WSlxGfWstwfvPijH1ua4WMtYL9Q3w4xKvIxTG2AnirE8PzQI3NJazLWXzMhmwi1%2FptPrqIoFC8Q8y9qLCR%2B7WGNS4J8SdDv316JpGVGoZo66O0ChMa1guHSclZ9JO73JyF45GGB1Aps1l%2Fglq3cQkbBpcQ%2BBQiTP1plgHnaUHmFg92CCQRMRNQYjDQhqZRzmGG8OqPrpUn44kY3D5nE7YIOJsodSiZUmS6bV80bdP1JjwbMdXki7%2FLryiGHOIWW0UwVXYmMtpu%2BkT0eg6O%2B8ovB9vJi2sNpcBCVY98Cxj8eOR7pW2BehVEDMdORM1XyLHTriDk5LxmlLmTCq%2BjPEqAsL02OOzOv9yR%2BmhtZFVYRfduqNU5UW9c%2BfhMwVfDPR9Qu85I8TQ0F4niIujGpdMPL93q6XsrFTc2g51iKNHTYXdVPFLvJqrgZpE9c0MRhSD7PK9%2Bj0L63Oak%2Bj9gmK5dxOT8%2BQRWo48mneGkgjk5uLSSy3Bc8FPoShVg9zCgXX1grepxp%2FZnzSCpuutYsUBgwyIqJnQY6qQHhC7vMqNS51XVswuOGUTtqkkG6mfeN4AzDqDYG637GM7q7kcxif0iG8xY99x3GE5iiNpTzsZsOmSAMz6fskN0X6k3WX9hubvaLzpR5t7Gg1pF5i4SwEL7C9dPo%2BdWMDUssEylvd1jEs40knidH%2BLqAzQwIOL3fPl00utyFJjEIXXtmjbs8XkyYYyFsWuMBclRCunOmMtm95CVspmwrNNNLD7jYDjysHUhv&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20221221T004023Z&X-Amz-SignedHeaders=content-md5%3Bhost%3Bx-amz-server-side-encryption&X-Amz-Expires=3600&X-Amz-Credential=ASIAXFYJLCYVHGXYFNUL%2F20221221%2Feu-west-1%2Fs3%2Faws4_request&X-Amz-Signature=7232eb6a3dc88afa610f4a843c83e706c2c5328f0ff1b637b72ed4f944a9f124";
  //md5="bbZInHSs2fBo6TfUXx7OSg==";
  //blobName="cdp_19122022052549.json.gz";

    const containerName ="fssyn";
    const connectionString = "DefaultEndpointsProtocol=https;AccountName=accntsyn;AccountKey=JLbX21NLaSeNFp1JeeJpKEPPSbYtLd4b5piBtuwoRWZdDnapdoxP09vLA2oilWs0Lme4eXkUR/CB+AStXXey6Q==;EndpointSuffix=core.windows.net";
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  // create container client
  const containerClient =  blobServiceClient.getContainerClient(containerName);




  const blobClient =  containerClient.getBlockBlobClient(blobName);


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
      body:downloaded
    
    };


    try {
        const response = await requestPromise(options);
        console.log(response.body);
        context.res = {
            //status: 200, /* Defaults to 200 */
            body: response.body
        };
    } catch (error) {
        // Handle your error here
        throw new Error(error);
    }
    
    


}