import * as AWS from 'aws-sdk';

import config from '../config';

AWS.config.update({
    region: config.aws.region,
});

export const SQS = new AWS.SQS({
    endpoint: config.aws.endpoint ? config.aws.endpoint : undefined,
});
