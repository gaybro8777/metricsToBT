// functions necessary to interact with BigTable

module.exports  = {
    checkAndCreateTable: async function (projectID, instanceID, tableID) {
    
    // Imports the Google Cloud client library
        const Bigtable      =   require('@google-cloud/bigtable');
        const bigtableOptions = {
            projectId: projectID,
          };
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
    }, // end table exists

    // function to make sure columns exist
    checkAndCreateColumn: async function (projectID, instanceID, tableID, columnName) {
        // Imports the Google Cloud BT library
        const Bigtable      =   require('@google-cloud/bigtable');
        const bigtableOptions = {
            projectId: projectID,
            };
        const bigtable = Bigtable(bigtableOptions);
        const instance = bigtable.instance(instanceID);
        const table = instance.table(tableID);
        const column = table.column(columnName);
        return true;
    }, // end column check and create

    // write values
    writeValues: async function() {
        return true;
    } // end write values

}; //end module