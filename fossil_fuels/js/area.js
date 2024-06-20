   const color = ["#8ea0c2", "#887463", "#444545"];
   const strokeWidth = 1.5;
   // set the dimensions and margins of the graph
   var margin = {top: 30, right: 30, bottom: 80, left: 100},
       width = 1000 - margin.left - margin.right,
       height = 520 - margin.top - margin.bottom;
       
   // append the svg object to the body of the page
   var svg = d3.select("#chart")
     .append("svg")
       .attr("width", width + margin.left + margin.right)
       .attr("height", height + margin.top + margin.bottom)
     .append("g")
       .attr("transform",
             "translate(" + margin.left + "," + margin.top + ")");
             
   var timeFormat = d3.timeFormat("%Y"); 
   var numberFormat = d3.format(".1f");

   var tooltip = d3.select("#myTooltip")
     .style("opacity", 0)
     .attr("class", "tooltip")
     .style("background-color", "white")
     .style("border", "solid")
     .style("border-width", "1px")
     .style("border-radius", "5px")
     .style("padding", "10px");

   //Read the data
   d3.csv("../data/global_fossil_fuel_consumption.csv", 
   
     function(d){
       return { Year : d3.timeParse("%Y")(d.Year), gas : d.Gas, oil : d.Oil, coal : d.Coal }
       },

     function(data) {
       var mystack =d3.stack().keys(["gas", "oil", "coal"])
       var stackedValues = mystack(data)
       const stackedData = [];
       // Copy the stack offsets back into the data.
       stackedValues.forEach((layer, index) => {
       const currentStack = [];
       layer.forEach((d, i) => {
           currentStack.push({
           values: d,
           year: data[i].Year
           });
       });
       stackedData.push(currentStack);
       });

  

   // Create scales
   const yScale = d3
   .scaleLinear()
   .range([height, 0])
   .domain([0, d3.max(stackedValues[stackedValues.length - 1], dp => dp[1])]);

   const xScale = d3.scaleTime()
   .range([0, width])
   .domain(d3.extent(data, function(d) { return d.Year; }));


   const area = d3
   .area()
   .x(dataPoint => xScale(dataPoint.year))
   .y0(dataPoint => yScale(dataPoint.values[0]))
   .y1(dataPoint => yScale(dataPoint.values[1]));


   const series = svg
   .selectAll(".series")
   .data(stackedData)
   .enter()
   .append("g")
   .attr("class", "series");

   series
   .append("path")
   .attr("transform", `translate(0,0)`)
   .style("fill", (d, i) => color[i])
   .attr("stroke", "steelblue")
   .attr("stroke-linejoin", "round")
   .attr("stroke-linecap", "round")
   .attr("stroke-width", strokeWidth)
   .attr("d", d => area(d))
   .on("mouseover", function(d, i) {
     xpos = xScale.invert(d3.mouse(this)[0])
     xindex = d3.bisect(d, xpos)
     //console.log(xpos)
     const year_point = new Date(xpos).getFullYear(); 

     var theyear = data.map(function(d) { return year_point })
     //console.log(theyear, year_point)

     myrecord = [data.find(function(item) {
         therecord = new Date(item.Year).getFullYear() === year_point
         return therecord
     } )]

    //console.log("my record", myrecord)
     myrecord.map(function(d) {
         return mycoalValue = d["coal"]; 
       })
     myrecord.map(function(d) {
       return myoilValue = d["oil"]; 
     })
     myrecord.map(function(d) {
       return mygasValue = d["gas"]; 
     })
     const gasValue = numberFormat(mygasValue);
     const oilValue = numberFormat(myoilValue);
     const coalValue = numberFormat(mycoalValue); 

     const tooltipText = `<h4>Year: ${year_point}</h4>
                         <hr>
                         Coal: ${coalValue} TWh<br/>
                         Oil: ${oilValue} TWh <br/>
                         Gas: ${gasValue} TWh <br/>`


     tooltip.transition()
       .duration(200) 
       .style("opacity", 1);

     tooltip.html(tooltipText)
       .style("left", (d3.event.pageX + 10) + "px") 
       .style("top", (d3.event.pageY - 10) + "px"); 
   })
   .on("mouseout", function() {
     tooltip.transition()
       .duration(50)
       .style("opacity", 0);
   });


   // Add the X Axis
   svg
   .append("g")
   .attr("transform", "translate(0," + height + ")")
         .call(d3.axisBottom(xScale).tickFormat(timeFormat))
         .append('text')
         .attr('class', 'axis-label')
         .text('Year')
         .attr('x', margin.left + (width - margin.left - margin.right) / 2)
         .attr('y', 50); 

   // Add the Y Axis
   svg
   .append("g")
   .attr("transform", 'translate(0, 0)')
   .call(d3.axisLeft(yScale))
   .append('text')
         .attr('class', 'axis-label')
         .text('Fossil fuels consumed, in Terawatt Hour (TWh)')
         .attr('transform', 'rotate(-90)')
         .attr('x', -(margin.top + (height - margin.top - margin.bottom) / 2))
         .attr('y', -85) 
     
   // Add one rectangular in the legend for each name.
   var keys = ["Natural Gas", "Oil", "Coal"]
   var size = 40
   var wsize = 40
   var hsize = 30
   svg.selectAll("myrects")
     .data(keys)
     .enter()
     .append("rect")
       .attr("x", 40)
       .attr("y", function(d,i){ return 90 + -i*(size+5)}) 
       .attr("width", wsize)
       .attr("height", hsize)
       .style("fill", (d, i) => color[i])

   // Add one dot in the legend for each name.
   svg.selectAll("mylabels")
     .data(keys)
     .enter()
     .append("text")
       .attr("x", 40 + size*1.2)
       .attr("y", function(d,i){ return 90 + -i*(size+5) + (size/2)}) 
       .style("fill", "black")
       .text(function(d){ return d})
       .attr("text-anchor", "left")
       .style("alignment-baseline", "middle")

// Create the annotation purely with D3.js
const annotationX = 70;
const annotationY = 310;

const annotationText = "Oil and Gas consumptions started around 1880-1890.";

const annotationGroup = svg.append("g");

annotationGroup.append("rect")
  .attr("x", annotationX - 20)  
  .attr("y", annotationY - 15)  
  .attr("width", 433)  
  .attr("height", 60)  
  .attr("rx", 5)  
  .attr("ry", 5)
  .attr("fill", "#f5f5f5")
  .attr("stroke", "black")
  .attr("stroke-width", 1);

annotationGroup.append("text")
  .attr("x", annotationX-26)
  .attr("y", annotationY)  
  .attr("text-anchor", "left")
  .selectAll("tspan")
  .data(annotationText.split("\n")) 
  .enter()
  .append("tspan")
    .text(d => d)
    .attr("x", annotationX-15) 
    .attr("dy", "1.2em");

const lineConnector = d3.line()
  .x(d => d.x)
  .y(d => d.y);

//  console.log(data[2])
annotationGroup.append("path")
  .datum([{x: 315, y: 410}, {x:235, y: 355}]) 
  .attr("d", lineConnector)
  .attr("stroke", "gray")
  .attr("stroke-width", 1);
 })