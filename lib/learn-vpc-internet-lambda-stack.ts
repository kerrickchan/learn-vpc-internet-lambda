import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export class LearnVpcInternetLambdaStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a VPC
    const vpc = new ec2.Vpc(this, 'WeatherVPC', {
      maxAzs: 2,
      natGateways: 1,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    // Create a Lambda function
    const weatherLambda = new lambda.Function(this, 'WeatherLambdaFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'lambda')),
      vpc: vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      environment: {
        OPENWEATHERMAP_API_KEY: '89afa2bcea3e53e276752562f91f6372',
      },
    });

    // Allow the Lambda function to access the internet
    weatherLambda.connections.allowToAnyIpv4(ec2.Port.tcp(443));

    // Output the Lambda function ARN
    new cdk.CfnOutput(this, 'WeatherLambdaArn', {
      value: weatherLambda.functionArn,
      description: 'The ARN of the Weather Lambda function',
    });
  }
}
