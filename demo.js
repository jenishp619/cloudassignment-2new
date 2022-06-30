
console.log("app is running...");
var AWS = require("aws-sdk");
var axios = require("axios");
var express = require("express");
var bodyParser = require("body-parser");
var fs = require("fs");
var app = express();
var ip = require("ip");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const s3 = new AWS.S3({
  accessKeyId: "ASIASAMRWUJ4SZEC5KFY",
  secretAccessKey: "B6nYeTiaC9h/r678Ew+/z49fI9Fm9x3IKHu7RCS9",
  sessionToken:
    "FwoGZXIvYXdzECAaDJRSopz2XAUG646HMCLAAW0mxW6gvdQO3SdVhJ5cmN+sxUpsvbAR3pclH1pCA70giJOMD0ZVw0TicvO1T2BqRzPXmP9kPfgs2dTWl+RHqUb/rSDAjlvBLVHx+D5x3gZ/X+bHKbehuywO4bOaHLITJLogn3oeF5fB0Jv6TnYyv/ZGsl1hl6OkJ9dR/1CaQkIBuC1QN6F/49sa0LVsynon7LzUw/EEsWmzcF+VUo0CZ4cP41Byt4zl/yX+ii1id/nonYQYNaoWmrkga3BLfbbsFSil1/iVBjItl6Z5ii10Q7t+FCUQ9/I25G62OV/aDyCSo4Z/UE1sPAIRFpoBZUZ2Dbv32Oso",
});

var bucketname = "b00897765-data";


axios.post('http://52.23.207.11:8081/start', {
    banner : "B00897765",
    ip : ip.address()
});

// app.post("/start",(request,response)=>{
//   response.setHeader('Content-Type', 'application/json');
//      var body = request.body;
//      console.log(body);
//   }
// );

app.post("/storedata", function (req, res) {
  var body = req.body;
  console.log(body);
  const fileName = "summerdevil.txt";

  fs.writeFile(fileName, body.data.toString(), function (err) {
    if (err) throw err;
    console.log("Saved!");
  });

  if (!body.data) {
    res.send(
      JSON.stringify({
        file: null,
        error: "Invalid JSON input.",
      })
    );
  } else {
    const params = {
      Bucket: "b00897765-data",
      Key: `${fileName}`,
      Body: body.data,
    };
    s3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
      }
      console.log(`Successfully uploaded package.${data.Location}`);
      res.setHeader("Content-Type", "application/json");
      return res.status(200).send(
        JSON.stringify({
          file: fileName,
          s3uri: `https://${bucketname}.s3.amazonaws.com/${fileName}`,
          Success: "Data written on s3 successfully uploaded.",
          statusCode: 200,
        })
      );
    });
  }
});

app.post("/appenddata", function (req, res) {
  var body = req.body.data;
  const fileName = "summerdevil.txt";
  const Bucketname = "b00897765-data";
  console.log(body);
  const getParams = {
    Bucket: Bucketname,
    Key: `${fileName}`
}

s3.getObject(getParams, function (err, reqdata) {
        if (err) {
            console.log(err);
        } else {
            data = reqdata.Body.toString().concat(" ",body);
            const params2 = {
                Bucket: Bucketname,
                Key: `${fileName}`,
                Body: data
            }

            s3.upload(params2, function (err, data){
                res.setHeader("Content-type","application/JSON");
                res.status(200).send;
                res.send(JSON.stringify({
                    s3uri : data.Location
                }));
            });
        }
});
});

app.post("/deletefile", function (req, res) {
  var body = req.body;
  const fileName = "summerdevil.txt";
  var params = {
    Bucket: bucketname,
    Key: fileName,
  };
  s3.deleteObject(params, function (err, data) {
    if (err) {
      console.log(err, err.stack); // an error occurred
    } else {
      console.log(`Successfully deleted file from s3`);
      console.log("File not found...");
      res.setHeader("Content-Type", "application/json");
      return res.status(200).send(
        JSON.stringify({
          file: fileName,
          s3uri: `https://${bucketname}.s3.amazonaws.com/${fileName}`,
          Success: `${fileName} successfully deleted on s3 `,
          statusCode: 200,
        })
      );
    }
  });
});

app.listen(5000, () => {
  console.log("Started on PORT 5000");
});
