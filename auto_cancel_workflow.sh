#!/bin/bash

while true; do
  json=$(curl -s -H 'Accept: application/json' -X GET https://circleci.com/api/v2/workflow/$CIRCLE_WORKFLOW_ID/job?circle-token=$CIRCLECI_TOKEN)
  is_failed=$(echo $json | jq '.items | any(.status == "failed")')
  is_pending=$(echo $json | jq '.items | any(.status == "running")')

  if [ "$is_failed" == "true" ]; then
    echo "Cancel workflow"
    curl -s -H 'Accept: application/json' -X POST https://circleci.com/api/v2/workflow/$CIRCLE_WORKFLOW_ID/cancel?circle-token=$CIRCLECI_TOKEN
    exit 0
  elif [ "$is_pending" == "false" ]; then
    echo "other jobs finished"
    exit 0
  else
    echo "waiting other jobs"
  fi
  sleep 10
done
