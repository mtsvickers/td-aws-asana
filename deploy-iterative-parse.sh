#!/bin/bash

## script needs to be run from inside this directory ##
THIS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $THIS_DIR

SFN_NAME='iterative-parse';
if [[ ! -f "$SFN_NAME.json" ]]; then
	echo "File Does Not Exist!"
	echo "$SFN_NAME.json"
	exit 1
fi

source deployenv.sh
if [[ -z $AWS_ACCOUNT_ID ]]; then
	echo 'AWS_ACCOUNT_ID not defined in deployenv.sh'
	exit 1
fi
if [[ -z $REGION ]]; then
	echo 'REGION not defined in deployenv.sh'
	exit 1
fi

REGION=$DEV_REGION # Dev Region
ACCOUNT_ID=$AWS_ACCOUNT_ID # AWS Account ID
VERSION_NUMBER='0.0.1'

if [[ "$1" != 'skip-serverless' ]]; then
	echo "Deploying to dev on $REGION"
	npm install
	serverless deploy
fi

aws stepfunctions create-state-machine \
--name "$SFN_NAME"-v"$VERSION_NUMBER" \
--region "$REGION" \
--role-arn arn:aws:iam::"$ACCOUNT_ID":role/service-role/StatesExecutionRole-"$REGION" \
--definition "$(cat $SFN_NAME.json)"

exit
# TODO: When Deploying to Production, Remove Exit and Run Below

REGION='us-east-2'
echo "Deploying to production on $REGION"
serverless deploy --region $REGION --stage production

cp $SFN_NAME.json production_sfn.json
sed -i '' 's|us-west-2|us-east-2|g' production_sfn.json
sed -i '' 's|-dev-|-production-|g' production_sfn.json

aws stepfunctions create-state-machine \
--name "$SFN_NAME"-v"$VERSION_NUMBER" \
--region "$REGION" \
--role-arn arn:aws:iam::"$ACCOUNT_ID":role/service-role/StatesExecutionRole-"$REGION" \
--definition "$(cat production_sfn.json)"

rm production_sfn.json