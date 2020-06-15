// Get json data URL
url = "./data/data.json";

//function to build metadata panel
function buildMetadata(sample) {

    //get json output with d3 and build panel
    d3.json(url).then((data)=> {

        //use d3 to select the panel with id of #sample-metadata
        var panel = d3.select("#sample-metadata");

        //Filter data for the selected sample
        var metadata = data.metadata.filter(d => d.id == sample);

        //save wfreq - scrub frequency
        var wfreq = metadata[0]['wfreq'];

        //clear any existing metadata
        panel.html("");

        //use object.entries to add each key and value pair to the panel
        Object.entries(metadata[0]).forEach(([key, value]) => {
            //append a paragraph tag
            var entryTag = panel.append("p");

            //write text for the tag
            entryTag.text(`${key}: ${value}`);
        });

        //build the gauge chart
         buildGauge(wfreq);
    });
}

//function to build the bubble and bar charts
function buildCharts(sample) {
    
    //get json output with d3 and build plots
    d3.json(url).then(function(data) {

        //Filter data for the selected sample
        var samples = data.samples.filter(d => d.id == sample);

        //build bubble chart
        //save arrays
        var otu_ids = samples[0]['otu_ids'];
        var sample_values = samples[0]['sample_values'];
        var otu_labels = samples[0]['otu_labels'];

        //slice for first ten of each
        var otu_ids_10 = otu_ids.slice(0, 10).reverse();
        var sample_values_10 = sample_values.slice(0, 10).reverse();
        var otu_labels_10 = otu_labels.slice(0, 10).reverse();

        //build trace and data
        var trace1 = {
            x: otu_ids,
            y: sample_values,
            mode: "markers",
            marker: {
                size: sample_values,
                color: otu_ids,
            },
            text: otu_labels,
            //type: 'scatter'
        };
        var data1 = [trace1];

        //build bubble plot layout
        var layout1 = {
            showlegend: false,
            title: `All Data for Sample ${sample}`,
            xaxis: {title: "OTU ID"},
            yaxis: {title: "Value"}
        };

        //plot bubble plot
        Plotly.newPlot("bubble", data1, layout1);
        
        //build pie chart with top ten entries (already sorted in response)
        //Generate Y axis lables
        var ylable =[];
        otu_ids_10.forEach((name) => {
            ylable.push(`OTU ${name}`);
        });

        console.log(ylable)
        console.log(sample_values_10)
        //build data
        var bdata = [{
            y: ylable,
            x: sample_values_10,
            type: 'bar',
            orientation: 'h'
        }];

        var layout = {
            height: 650,
            width: 450,
            //yaxis=dict(autorange="reversed"),
            title: `First Ten Measurements for Sample ${sample}`
        };

        Plotly.newPlot("bar", bdata, layout);
    });
}

function buildGauge(wfreq){
 // Enter a speed between 0 and 180
 var level0 = wfreq;
 var level = level0 * 20

 // Trig to calc meter point
 var degrees = 180 - level,
     radius = .5;
 var radians = degrees * Math.PI / 180;
 var x = radius * Math.cos(radians);
 var y = radius * Math.sin(radians);

 // Path: may have to change to create a better triangle
 var mainPath = 'M -.0 -0.065 L .0 0.0125 L ',
     pathX = String(x),
     space = ' ',
     pathY = String(y),
     pathEnd = ' Z';
 var path = mainPath.concat(pathX, space, pathY, pathEnd);

 var data = [{
     type: 'scatter',
     x: [0], y: [0],
     marker: { size: 15, color: '850000' },
     showlegend: false,
     name: 'Washing Frequency',
     text: level0,
     hoverinfo: 'text+name'
 },
 {
    values: [20, 20, 20, 20, 20,20, 20, 20,20,180],

     rotation: 90,
     text: ["8-9", "7-8", "6-7", "5-6", "4-5","3-4","2-3", "1-2", "0-1",""],
     textinfo: 'text',
     textposition: 'inside',
     marker: {
        colors: ["rgba(29, 170, 70, 0.5)", "rgba(29, 170, 70, 0.4)", 
                 "rgba(29, 170, 33, 0.3)","rgba(100, 130, 10, 0.4)",         
                 "rgba(150, 150, 10, 0.4)","rgba(255, 230, 40, 0.3)",
                 "rgba(245, 240, 110, 0.3)","rgba(255, 2255, 160, 0.3)",
                 "rgba(255, 255, 175, 0.2)", "white"]
      },
      labels: ["8-9", "7-8", "6-7", "5-6", "4-5","3-4","2-3", "1-2", "0-1",""],
     hoverinfo: 'label',
     hole: .5,
     type: 'pie',
     showlegend: false
 }];

 var layout = {
     shapes: [{
         type: 'path',
         path: path,
         fillcolor: '850000',
         line: {
             color: '850000'
         }
     }],
     title: '<b>Belly Button Washing Frequency</b> <br> Scrubs Per Week ',
     height: 600,
     width: 525,
     xaxis: {
         zeroline: false, showticklabels: false,
         showgrid: false, range: [-1, 1]
     },
     yaxis: {
         zeroline: false, showticklabels: false,
         showgrid: false, range: [-1, 1]
     }
 };

 Plotly.newPlot('gauge', data, layout);
}


//function to initiate plots
function init() {
    //grab a reference to the dropdown select
    var selector = d3.select("#selDataset");

    //use the list of sample names to populate the select options
    d3.json(url).then((sNames) => {
        sNames.names.forEach((name) => {
            selector.append("option").text(name).property("value", name);
        });

        //use the first sample from list to build the initial plots
        const firstSample = sNames.names[0];

        buildCharts(firstSample);
        buildMetadata(firstSample);
    });
}

//function to change charts when a new sample is selected
function optionChanged(newSample) {
    //fetch new data and build charts
    buildCharts(newSample);
    buildMetadata(newSample);
}

//Initialize the dashboard
init();