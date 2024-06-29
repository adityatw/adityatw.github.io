var margin = { top: 30, right: 30, bottom: 150, left: 100 },
width = 1000 - margin.left - margin.right,
height = 475 - margin.top - margin.bottom;

var svg = d3.select("#chart")
.append("svg")
.attr("width", width + margin.left + margin.right - 20)
.attr("height", height + margin.top + margin.bottom)
.attr("fill", "white") // Set background color
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


d3.csv("../data/coal_prep_map.csv", function(d) {
return { Country: d.Country, Year: d.Year, Reserve: +d.Reserve };
}, function(data) {

var projection = d3.geoMercator()
  .scale(130)
  .translate([width / 2.2, height / 1.4]);

d3.json("../js/world.topojson", function(error, world) {
  if (error) return console.error(error);
  var countries = topojson.feature(world, world.objects.ne_110m_admin_0_countries); // get the geometries
  console.log(countries)

    var joinedData = [];
    data.forEach(d => {
      var countryFeature = countries.features.find(f => f.properties.name === d.Country);
      if (countryFeature) {
        joinedData.push({ feature: countryFeature, data: d });
      }
    });

    // console.log(data)
    // console.log(joinedData)
    var colorScale = d3.scaleQuantize()
    .domain([d3.min(data, d => d.Reserve), d3.max(data, d => d.Reserve)])
    .range(["#DCDEDE", "#C2C4C4", "#909191", "#5D5E5E", "#444545"]);

    var tooltip = svg.append("g")
    .attr("class", "tooltip")
    .style("opacity", 0); // Initially hidden

    var numberFormat = d3.format(",.0f");

    svg.append("g")
    .selectAll("path")
    .data(joinedData)
    .enter()
    .append("path")
    //.attr("d", d3.geoPath().projection(projection))
    .attr("d", d => d3.geoPath().projection(projection)(d.feature)) 
    .attr("stroke", "gray") // Add temporary stroke for debugging
    .attr("stroke-width", 0.3)
    .attr("fill", d => d.data.Reserve === 0 ? "lightgray" : colorScale(d.data.Reserve))
    .attr("opacity", d => d.data.Reserve === 0 ? 0.3 : 1) // Set opacity for country with no Reserve

    .on("mouseover", function (d) {  
    // Show tooltip and update content
      var tooltip = d3.select(".tooltip");
 
      tooltip.html(function() {
        return "<b>" + d.data.Country +": </b>" + numberFormat(d.data.Reserve) + "<b> Mst.</b>";
      });
      tooltip.style("opacity", 1);
    })

    .on("mouseout", function() {
      var tooltip = d3.select(".tooltip");
          tooltip.style("opacity", 0);
    })

    .on("mousemove", function(d) {
      var xPosition = d3.event.pageX + 10; // Adjust offset as needed
      var yPosition = d3.event.pageY + 10; // Adjust offset as needed
      d3.select(".tooltip")
        .style("left", xPosition + "px")
        .style("top", yPosition + "px");
    });

    // .each(function(d) {
    //   console.log("Country:", d.data.Country, "Reserve:", d.data.Reserve, "Color:", this.getAttribute("fill"));
    // })
    // .attr("stroke", "white")
    // .attr("stroke-width", 0.5);


    // Create the annotation purely with D3.js
    const annotationX = 330;
    const annotationY = 310;

    const annotationText = "Coal";

    const annotationGroup = svg.append("g");

    annotationGroup.append("rect")
    .attr("x", annotationX - 20)  
    .attr("y", annotationY - 15)  
    .attr("width", 80)  
    .attr("height", 60)  
    .attr("rx", 5)  
    .attr("ry", 5)
    .attr("fill", "#f5f5f5")
    .attr("stroke", "black")
    .attr("stroke-width", 1);

    annotationGroup.append("text")
    .attr("x", annotationX-10)
    .attr("y", annotationY)  
    .attr("text-anchor", "middle")
    .selectAll("tspan")
    .data(annotationText.split("\n")) 
    .enter()
    .append("tspan")
        .text(d => d)
        .attr("x", annotationX+20) 
        .attr("dy", "1.2em");


 });
});