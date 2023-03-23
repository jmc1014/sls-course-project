import AWS from "aws-sdk";

const ses = new AWS.SES({ region: "ap-southeast-1" });

async function sendMail(event, context) {
  const params = {
    Source: "sender@yopmail.com", // Email that registered & verified in Amazon SES
    Destination: {
      ToAddresses: ["test@yopmail.com"],
    },
    Message: {
      Body: {
        Text: {
          Data: "Hello from Coding James",
        },
      },
      Subject: {
        Data: "Test Mail Subject",
      },
    },
  };

  try {
    const result = await ses.sendEmail(params).promise();
    console.log(result);
    return result;
  } catch (error) {
    console.error(error);
  }
}

export const handler = sendMail;
