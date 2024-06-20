// set the dimensions and margins of the graph
var margin = {top: 10, right: 110, bottom: 80, left: 100},
    width = 1000 - margin.left - margin.right,
    height = 480 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

const mapToObject = (map = new Map) => Array.from(
map.entries(), 
([k, v]) => ({
    "key": k,
    "values": v instanceof Map ? mapToObject(v) : v
})
);

var tooltip = d3.select("#myTooltip")
.style("opacity", 0)
.attr("class", "tooltip")
.style("background-color", "white")
.style("border", "solid")
.style("border-width", "1px")
.style("border-radius", "5px")
.style("padding", "10px");

//Read the data
d3.csv('../data/fossil_fuels.csv', function(data) {

data = data.filter(function (d) {
    return d.Entity == 'United States' || d.Entity == 'Canada' || d.Entity == 'Japan' || d.Entity == 'Italy' || d.Entity == 'France' || d.Entity == 'United Kingdom' || d.Entity == 'Germany';
})
  // group the data: I want to draw one line per group
  var nested_data = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.Entity;})
    .entries(data);

//console.log(nested_data)
  // Add X axis --> it is a date format
  var x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return d.Year; }))
    .range([ 0, width ]);
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format("d")) )
    .append('text')
    .attr('class', 'axis-label')
    .text('Year')
    .attr('x', margin.left + (width - margin.left - margin.right) / 2)
    .attr('y', 50) // Relative to the x axis.

  // Add Y axis
  var y = d3.scaleLinear()
    //.domain([0, d3.max(data, function(d) { return +d.percent_electricity; })])
    .domain([0,100])
    .range([ height, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y))          
    .append('text')
    .attr('class', 'axis-label')
    .text('% of primary energy consumption')
    .attr('transform', 'rotate(-90)')
    .attr('x', -(margin.top + (height - margin.top - margin.bottom) / 2))
    .attr('y', -50) 

  // color palette
  var res = nested_data.map(function(d){ return d.key }) // list of group names
  var color = d3.scaleOrdinal()
    .domain(res)
    .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#2c2e3a','#a65628'])

const xScale = d3.scaleTime().range([0,width]);
const yScale = d3.scaleLinear().rangeRound([height, 0]);

  const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute");

    // // Draw the line
    // svg.selectAll(".line")
    //     .data(nested_data)
    //     .enter()
    //     .append("path")
    //     .attr("fill", "none")
    //     .attr("stroke", function(d){ return color(d.key) })
    //     .attr("stroke-width", 1.5)
    //     .attr("d", function(d){
    //         return d3.line()
    //         .x(function(d) { return x(d.Year); })
    //         .y(function(d) { return y(+d.percent_electricity); })
    //         (d.values)
    //    })

        // Draw the line
        var line = svg.selectAll(".line")
        .data(nested_data)
        .enter()
        .append("g")
        .attr("class", "line");

    line.append("path")
        .attr("fill", "none")
        .attr("stroke", function(d){ return color(d.key) })
        .attr("stroke-width", 1.5)
        .attr("d", function(d){
          return d3.line()
            .x(function(d) { return x(d.Year); })
            .y(function(d) { return y(+d.percent_electricity); })
            (d.values)
        });

        line.selectAll("circle")
        .data(function(d) { return d.values; })
        .enter()
        .append("circle")
        .attr("cx", function(d) { return x(d.Year); })
        .attr("cy", function(d) { return y(+d.percent_electricity); })
        .attr("r", 3)
        .style("fill", function(d, i, nodes) {
            return color(nodes[i].parentNode.__data__.key);
        });


    // Add country name at the end of each line
    svg.selectAll(".country-label")
      .data(nested_data)
      .enter()
      .append("text")
        .attr("class","country-label")
        .attr("transform", function(d) {
          var last = d.values[d.values.length - 1];
          return "translate(" + x(last.Year) + "," + y(last.percent_electricity) + ")";
        })
        .attr("x", 8)
        .attr("dy", ".35em")
        .style("font-family", "Arial, sans-serif")
        .style("font-weight", "bold")
        .style("font-size", "13px")
        .style("fill", function(d){ return color(d.key); })
        .style("text-anchor", "start")
        .style("text-shadow", "2px 2px 2px grey")
        .text(function(d) { return d.key; });


    var numberFormat = d3.format(".1f");

    //Add tooltip
    svg.selectAll("circle")
    .on("mouseover", function (d) {  
        tooltip.transition()
          .duration(100)
          .style("opacity", 0.9);

        var xPos = d3.event.pageX;
        var yPos = d3.event.pageY;
        tooltip.html("<b>"+d.Entity+"</b>" + "<hr>Year: " + d.Year + "<br/>Percentage: " + numberFormat(d.percent_electricity))
          .style("left", (d3.event.pageX + 5) + "px")

        tooltip.style("left", xPos + "px")
        .style("top", yPos + "px");
    })
    .on("mouseout", function() {
        tooltip.transition()
          .duration(200)
          .style("opacity", 0);
      });


})

