***S3-to-Pinpoint-Lambda***

*S3-to-Pinpoint-Lambda is a node.js Lambda function that, upon putting an object to S3, tranfers JSON formated contacts from s3://polarcloud/contacts/web to Pinpoint as endpoints via pinpoint.updateEndpoint() method.

*Instructions on and asset for initializing and running the website on AWS:*

The infrastructural components include GitHub, CodeDeploy, CodePipelines, CloudFormation, S3, Pinpoint and IAM. A check-in to GitHub triggers a build in CodePipeline which downloads the repository and runs the `buildspec.yml` build instructions. This in turns launches the lambda and it's code via CloudFormation.

Again, check-ins to this repository go through a CICD pipeline, deploying top production in minutes. 

This repository is split into two parts. AWS CLI setup scripts and the Lambda code.


