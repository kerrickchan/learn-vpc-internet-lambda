import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as WeatherLambda from '../lib/learn-vpc-internet-lambda-stack';

describe('LearnVpcInternetLambdaStack', () => {
  let app: cdk.App;
  let stack: WeatherLambda.LearnVpcInternetLambdaStack;
  let template: Template;

  beforeEach(() => {
    app = new cdk.App();
    stack = new WeatherLambda.LearnVpcInternetLambdaStack(app, 'MyTestStack');
    template = Template.fromStack(stack);
  });

  test('VPC Created', () => {
    template.resourceCountIs('AWS::EC2::VPC', 1);
    template.hasResourceProperties('AWS::EC2::VPC', {
      CidrBlock: '10.0.0.0/16',
      EnableDnsHostnames: true,
      EnableDnsSupport: true,
      InstanceTenancy: 'default',
      Tags: [
        { Key: 'Name', Value: 'MyTestStack/WeatherVPC' },
      ],
    });
  });

  test('Lambda Function Created', () => {
    template.resourceCountIs('AWS::Lambda::Function', 1);
    template.hasResourceProperties('AWS::Lambda::Function', {
      Handler: 'index.handler',
      Runtime: 'nodejs20.x',
      Environment: {
        Variables: {
          OPENWEATHERMAP_API_KEY: '89afa2bcea3e53e276752562f91f6372',
        },
      },
    });
  });

  test('Lambda Function in VPC', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      VpcConfig: {
        SecurityGroupIds: [
          {
            'Fn::GetAtt': [
              'WeatherLambdaFunctionSecurityGroup6A1B5B66',
              'GroupId',
            ],
          },
        ],
        SubnetIds: [
          {
            Ref: 'WeatherVPCPrivateSubnet1Subnet02ECA406',
          },
          {
            Ref: 'WeatherVPCPrivateSubnet2SubnetACF24B49',
          },
        ],
      },
    });
  });

  test('NAT Gateway Created', () => {
    template.resourceCountIs('AWS::EC2::NatGateway', 1);
  });

  test('Internet Gateway Created', () => {
    template.resourceCountIs('AWS::EC2::InternetGateway', 1);
  });

  test('Lambda Function Output Created', () => {
    template.hasOutput('WeatherLambdaArn', {
      Description: 'The ARN of the Weather Lambda function',
    });
  });
});
