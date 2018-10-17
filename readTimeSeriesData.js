
module.exports = {

  readTimeSeriesData: function (projectId, filter, timeArray, valuesArray) {
    
    const monitoring    =   require('@google-cloud/monitoring');
    const client        =   new monitoring.MetricServiceClient();
    const request = {
      name: client.projectPath(projectId),
      filter: filter,
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
  
    // Writes time series data
    client
      .listTimeSeries(request)
      .then(results => {
        const timeSeries = results[0];
        timeSeries.forEach(data => {
          console.log(`${data.metric.labels.instance_name}:`);
          data.points.forEach(point => {
            timeArray.push(JSON.parse(point.interval.startTime.seconds));
            valuesArray.push(JSON.stringify(point.value.doubleValue))
            console.log('data point: ');
            console.log('timestamp: ' + JSON.parse(point.interval.startTime.seconds));
            console.log('value: ' + JSON.stringify(point.value.doubleValue));
          });
        });
      })
      .catch(err => {
        console.error('ERROR:', err);
      });
    return true;
  } //end function

}; //end module