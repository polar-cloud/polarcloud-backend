># ContactRouter Lambda
*`ContactRouter`* is an `AWS Lambda` function written in `node.js`. Upon putting an object to `S3`, the function tranfers JSON formated contacts from s3://{bucket}/contacts/web to `Pinpoint` as endpoints for marketing and analytics. The function then leverages `Pinpoint` to broadcast notifications to polarCloud Consulting along email and SMS channels when new contacts are registered.
<br><br>
># Instructions for initializing and running the website on AWS
Follow the setup instructions here: https://github.com/polar-cloud/polarcloud-web/blob/master/README.md

The ContactRouter's infrastructural components include:
* `GitHub`
* `IAM`
* `S3`
* `Pinpoint`
* `AWS CodePipelines`
* `AWS CloudFormation`
<br><br>

># For this GitHub repository
Fork this repository on GitHub as updates need to be made for new AWS accounts
<br><br>

># Update Source
Update `index.js` to your own email address:
``` javascript
Addresses: {
    'your-email-address':{
    ChannelType: 'EMAIL'
    }
},
```

Update `index.js` to your phone number:
``` javascript
params.MessageRequest.Addresses = { 'your-phone-number': {ChannelType: 'SMS'} };
```
<br><br>

># Create a Amazon Pinpoint Project
In the AWS console, navigate to the Pinpoint service and create a project.

Once created, click 'All Projects' to see your Pinpoint Project ID.

In the `Setting` for your project, setup `Email` and `SMS and voice` channels to receive notifications from `ContactRouter`.
<br><br>

># Environment Variables
Add the following environment variable.

## Windows
``` cmd
SET PINPOINTV1 `{your-pinpoint-project-id}`
```

## Linux/Mac
``` terminal
PINPOINTV1=`{your-pinpoint-project-id}`
```
<br><br>

># Run The Code
Test the code with either the `AWS Serverless Application Model(AWS SAM)`, or with a javascript debugger.
<br><br>

># Configure CodePipeline
Create a new pipene with the following inputs:

Pipeline name: `polarCloud-Backend-Pipeline`

Service role: `New Service Role`

`Next`

Source: `GitHub`

`Next`

Build provider: `AWS CodeBuild`

`Create project`

Project name: `polarCloud-Backend-Deploy`

Environment image: `Managed image`

Operating system: `Ubuntu`

Runtime(s): `Standard`

Image: `aws/codebuild/standard:2.0`

Service role: `New service role`

`Continue to CodePipeline`

`Add environment variable`

Name `PINPOINTV1`

Value: {your pinpoint application id}

`Next`

Deploy provider: `AWS CloudFormation`

Action mode: `Create or updae a stack`

Stack name: `polarCloud-Backend-Stack`

Template: `BuildArtifact`

File name: `template.yaml`

Capabilities: `CAPABILITY_IAM`

Create a new role in `IAM`. Attach the `AWSCodeDeployRule` and `AmazonS3FullAccess` policies. Name the role: `polarCloud-Pipeline-Backend-Deploy`

Add the following trust relationship:
``` javascript
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": [
          "codedeploy.amazonaws.com",
          "s3.amazonaws.com"
        ]
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

Copy the servivce role `ARN`.

Back in `CodePipeline` paste the role `ARN` in Role name.

Output file name: `polarCloud-Backend-Deploy`

`Next`

`Create Pipeline`

Watch the deployment.
<br><br>

># Configure the Lammbda
Open the `Lambda` console and navigate to `ContactRouter`. Add an `S3` trigger:
Bucket: {bucket-name}
Prefix: `/contacts/web`

># Deployment
A push to `GitHub` triggers a build in `CodePipeline` which downloads the repository and runs the `buildspec.yml` build instructions. This in turns launches the `Lambda function` and it's code via `CloudFormation`.

Create a new pipeline in `CodePipeline` with `GitHub` as it's source. Use the defaults for build. Set a deployment action up with a target for `CloudFormation`. Perform a push to `GitHub` and examine the deployment in `CodePipeline` console.

You can test the `ContactRouter` by submitting the Contact form on the landing page of the website. `S3` will have a JSON contact artifact in {bucket-name}/contacts/web. In `Pinpoint`, you can create a target `Segment` with 1 `endpoint`. You should also receive an email and SMS notification.




