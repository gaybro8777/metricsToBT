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

const projectId     =   'stackdriver-kubernetes';
//TODO - modify to take environment variable specified in app.yaml
//TODO - make this take inputs
// sets up the things we want to fetch
const instanceName  =   'mysql-centos';
const metricType    =   'metric.type="compute.googleapis.com/instance/cpu/utilization"';
var myFilter        =   metricType + ' AND ' + 'metric.label.instance_name = ' + instanceName;
const monitoring    =   require('@google-cloud/monitoring');
const client        =   new monitoring.MetricServiceClient();
const request = {
  name:       client.projectPath(projectId),
  filter:     myFilter,
  interval: {
    startTime: {
      // Limit results to the last 5 minutes
      seconds: Date.now() / 1000 - 60 * 5,
    },
    endTime: {
      seconds: Date.now() / 1000,
    },
  },
};

// The name of the Cloud Bigtable instance
const INSTANCE_NAME =   'metrics';
// The name of the Cloud Bigtable table
const TABLE_NAME    =   'cpu';
// the name of the column family
const COLUMN_NAME   =   'values';
const BT = require('./cloudBigTable.js');


// handle root request
app.get('/', (req, res) => {
    console.log(req.url);
    res.status(200).send('Hello, world!').end();
});

// handle metric request
app.get('/metric', (req, res) => {
  console.log('/metric requested');
  client
    .listTimeSeries(request)
    .then(results => {
      var timeSeries = results[0];
      timeSeries.forEach(data => {
        console.log(`instance name is: ${data.metric.labels.instance_name}`);
        console.log('got ' + data.points.length + ' data points');
        data.points.forEach(point => {
          const timestamp = JSON.parse(point.interval.startTime.seconds);
          const metricValue = JSON.stringify(point.value.doubleValue);
          console.log('timestamp: ' + JSON.parse(point.interval.startTime.seconds));
          console.log('value: ' + JSON.stringify(point.value.doubleValue));  
          BT.writeValues(projectId, INSTANCE_NAME, TABLE_NAME, COLUMN_NAME, metricValue);  
        }); //data.points.foreach      
      }); //timeseries.foreach
    }); // then
    res.status(200).send('Done');
  });

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
  // create the BT table
  console.log('checking and creating table');
  BT.checkAndCreateTable(projectId, INSTANCE_NAME, TABLE_NAME);
  // create the column
  console.log('checking and creating column');
  BT.checkAndCreateColumn(projectId, INSTANCE_NAME, TABLE_NAME, COLUMN_NAME);
});
