/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const express       =   require('express');
const app           =   express();
// Imports the Google Cloud client library
const monitoring    =   require('@google-cloud/monitoring');
// Creates a client
const client        =   new monitoring.MetricServiceClient();
//specify GCP Project ID
const projectId     = 'stackdriver-kubernetes'; //TODO - modify to take environment variable specified in app.yaml
const metricValue   = 0;
//TODO - make this take inputs 
const metricType    = 'metric.type="compute.googleapis.com/instance/cpu/utilization"'; 
const resourceName  = '';

// function to read metric from monitoring API
// original - https://github.com/googleapis/nodejs-monitoring/blob/master/samples/metrics.js

function readTimeSeriesData(projectId, metricType) {

    const request = {
      name: client.projectPath(projectId),
      //TOD - combine multiple inputs to get the right metric against the right resource
      filter: metricType,
      interval: {
        startTime: {
          // Limit results to the last 20 minutes
          seconds: Date.now() / 1000 - 60 * 20,
        },
        endTime: {
          seconds: Date.now() / 1000,
        },
      },
    };
  
    // Writes time series data
    client
      .listTimeSeries(request)
      .then(results => {
        const timeSeries = results[0];
        //TODO - pick the target we're after instead of listing all?
        timeSeries.forEach(data => {
          console.log(`${data.metric.labels.instance_name}:`);
          data.points.forEach(point => {
            console.log(JSON.stringify(point.value));
            console.log(JSON.stringify(point.d))
            //TODO - write to BigTable
          });
        });
      })
      .catch(err => {
        console.error('ERROR:', err);
      });
  }

// handle root request
app.get('/', (req, res) => {
    console.log(req.url);
    res.status(200).send('Hello, world!').end();
});

// handle metric request
app.get('/metric', (req, res) => {
    console.log('fetching metric');
    readTimeSeriesData(projectId, metricType)
    res.status(200).send('Metric value is ' + metricValue).end();
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
