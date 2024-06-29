
    // set the dimensions and margins of the graph
    var margin = {top: 30, right: 30, bottom: 150, left: 100},
        width = 1000 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;
    
    // append the svg object to the body of the page
    var svg = d3.select("#chart")
      .append("svg")
        .attr("width", width + margin.left + margin.right-20)
        .attr("height", height + margin.top + margin.bottom+25)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    // const tooltip = d3.select("body").append("div")
    //   .attr("class", "tooltip")
    //   .style("opacity", 0)
    //   .style("position", "absolute");
    
    //Read the data
    d3.csv("../data/coal_prep.csv", 
    
      function(d){
      return { Country: d.Country, Year : d.Year, Reserve : d.Reserve }
      },

      function(data) {

        // data = data.filter(function (d) {
        //    return d.Year == 2022
        // })

        console.log(data)
      // X axis
      var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(data.map(function(d) { return d.Country; }))
        .padding(0.2);
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end")
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .append('text')
          .attr('class', 'axis-label')
          .text('Country')
          .attr('x', margin.left + (width - margin.left - margin.right) / 2)
          .attr('y', 130); 

      function make_x_gridlines() {		
        return d3.axisBottom(x)
            .ticks(15)
      }

      function make_y_gridlines() {		
        return d3.axisLeft(y)
            .ticks(10)
      }  

      // Add Y axis
      var y = d3.scaleLinear()
        .domain([0, 276000])
        .range([ height, 0]);
      svg.append("g")
      .attr("class", "grid")
          .call(make_y_gridlines()
              .tickSize(-width)
              .tickFormat("")
          )
      svg.append("g")
        .call(d3.axisLeft(y))
        .append('text')
          .attr('class', 'axis-label')
          .text('Reserve, in Million metric tons (Mst)')
          .attr('transform', 'rotate(-90)')
          .attr('x', -(margin.top + (height) / 2))
          .attr('y', -85) 


        var numberFormat = d3.format(",.0f");

        //Bars
        svg.selectAll("myRect")
          .data(data)
          .enter()
          .append("rect")
          .attr("x", function(d) { return x(d.Country); })
          .attr("y", function(d) { return y(d.Reserve); })
          .attr("width",  x.bandwidth)
          .attr("height", function(d) { return height - y(d.Reserve); } )
          .attr("fill", "#444545")


        .on("mouseover", function (d) {  
        tooltip.transition()
          .duration(100)
          .style("opacity", 0.9);

        var xPos = d3.event.pageX;
        var yPos = d3.event.pageY;
        tooltip.html("<b>"+d.Country+"</b>" + ": " + numberFormat(d.Reserve) + " Mst.")
          .style("left", (d3.event.pageX + 5) + "px")

        tooltip.style("left", xPos + "px")
        .style("top", yPos + "px");
        })

        .on("mouseout", function() {
            tooltip.transition()
              .duration(200)
              .style("opacity", 0);
          });

    // Create the annotation purely with D3.js
    const annotationX = 650;
    const annotationY = 20;

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

    })