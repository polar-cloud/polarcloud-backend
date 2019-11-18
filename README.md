># ContactRouter Lambda

*`ContactRouter`* is an `AWS Lambda` function written in `node.js`. Upon putting an object to `S3`, the function tranfers JSON formated contacts from s3://{bucket}/contacts/web to `Pinpoint` as endpoints for marketing and analytics. The function then leverages `Pinpoint` to broadcast notifications to polarCloud Consulting along email and SMS channels when new contacts are registered.

># Instructions on and asset for initializing and running the website on AWS
Follow the setup instructions here: https://github.com/polar-cloud/polarcloud-web/blob/master/README.md

The infrastructural components include:
* `GitHub`
* `Visual Studio Code`
* `IAM`
* `S3`
* `Pinpoint`
* `AWS CodeDeploy`
* `AWS CodePipelines`
* `AWS CloudFormation`

># Deployment
A push to `GitHub` triggers a build in `CodePipeline` which downloads the repository and runs the `buildspec.yml` build instructions. This in turns launches the `Lambda function` and it's code via `CloudFormation`.




