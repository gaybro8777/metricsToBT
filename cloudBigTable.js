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
        // const column = table.column(columnName);
        
        // Define the GC rule to retain data with max age of 5 days
        const maxAgeRule = {
            rule: {
            age: {
                // Value must be atleast 1 millisecond
                seconds: 60 * 60 * 24 * 5,
                nanos: 0,
            },
            },
        };
        try {
            const [family, apiResponse] = await table.createFamily(columnName, maxAgeRule);
            console.log(`Created column family ${family.id}`);
        } catch (err) {
            console.error(`Error creating column family:`, err);
            return;
        }
        // [END bigtable_create_family_gc_max_age]

        return true;
    }, // end column check and create

    // write values
    writeValues: function(values, column) {
        // [START writing_rows]
        console.log('writing ' + values.length + 'values');
        for (var i = 0; i<values.length; i++) {
            console.log('writing ' + i + 'th value');
            const rowsToInsert = {
                key: new Date(),
                data: {
                    [column]: {
                        value: values[i]
                    }
                }
            }
            console.log('writing value: ' + i + ': ' + rowsToInsert);
            table.insert(rowsToInsert);
        }
        return true;
    } // end write values

}; //end module