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

const projectId     =   'stackdriver-kubernetes'; //TODO - modify to take environment variable specified in app.yaml
//TODO - make this take inputs
// sets up the things we want to fetch
const instanceName  =   'mysql-centos';
const metricType    =   'metric.type="compute.googleapis.com/instance/cpu/utilization"';
const myFilter      =   metricType + ' AND ' + 'metric.label.instance_name = ' + instanceName;
var metricValues    =   new Array();
var metricTimeStamps=   new Array();

// The name of the Cloud Bigtable instance
const INSTANCE_NAME =   'metrics';
// The name of the Cloud Bigtable table
const TABLE_NAME    =   'cpu';
const column1       =   'values';

//functions
const readF         =   require('./readTimeSeriesData.js');
const BT            =   require('./cloudBigTable.js');

// function to write values to Cloud BigTable
function writeValues() {
  console.log('writing to BigTable');
  BT.checkAndCreateTable(projectId, INSTANCE_NAME, TABLE_NAME);
  BT.checkAndCreateColumn(projectId, INSTANCE_NAME, TABLE_NAME, column1);
  BT.writeValues();
  return true;
}
// handle root request
app.get('/', (req, res) => {
    console.log(req.url);
    res.status(200).send('Hello, world!').end();
});

// handle metric request
app.get('/metric', (req, res) => {
    console.log('fetching metric');
    res.status(200).send('Metric value was fetched: ' + readF.readTimeSeriesData(projectId, myFilter, metricTimeStamps, metricValues) + ' metric value was written: ' + writeValues()).end();
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
