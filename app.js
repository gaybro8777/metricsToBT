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
//specify GCP Project ID
const projectId     =   'stackdriver-kubernetes'; //TODO - modify to take environment variable specified in app.yaml
const metricValue   =   0;
//TODO - make this take inputs 
// sets up the things we want to fetch
const instanceName  =   'mysql-centos';
const metricType    =   'metric.type="compute.googleapis.com/instance/cpu/utilization"'; 
const myFilter      =   metricType + ' AND ' + 'metric.label.instance_name = ' + instanceName;
var metricValues    =   new Array();
var metricTimeStamps=   new Array();

//set up BigTable
// Imports the Google Cloud client library
const Bigtable      =   require('@google-cloud/bigtable');
// The name of the Cloud Bigtable instance
const INSTANCE_NAME =   'metrics';
// The name of the Cloud Bigtable table
const TABLE_NAME    =   'cpu';
const bigtableOptions = {
  projectId: projectId,
};
const column1       =   'timestamp';
const column2       =   'value';

//functions
const readF         =   require('./readTimeSeriesData.js');


// function to make sure BT table exists
// TODO - move this into separate file
async function checkAndCreateTable(instanceID, tableID) {
  const bigtable = Bigtable(bigtableOptions);
  const instance = bigtable.instance(instanceID);
  const table = instance.table(tableID);

  // Check if table exists
  console.log();
  console.log('Checking if table exists...');
  let tableExists;
  try {
    [tableExists] = await table.exists();
  } catch (err) {
    console.error(`Error checking if table exists:`, err);
    return;
  }

  if (!tableExists) {
    try {
      // Create table if does not exist
      console.log(`Table does not exist. Creating table ${tableID}`);
      // Creating table
      await table.create();
    } catch (err) {
      console.error(`Error creating table:`, err);
      return;
    }
  } else {
    console.log(`Table exists.`);
  }
} // end table exists

// function to make sure columns exist
// TODO - move this to separate file
async function checkAndCreateColumns(funColumn1, funColumn2) {
  return true;
}

// function to write values to Cloud BigTable
// TODO - move this to separate file
function writeValues() {
  console.log('writing to BigTable');
  checkAndCreateTable(INSTANCE_NAME, TABLE_NAME);
  checkAndCreateColumns(column1, column2);
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
