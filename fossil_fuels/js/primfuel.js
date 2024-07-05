
    // set the dimensions and margins of the graph
    var margin = {top: 30, right: 30, bottom: 80, left: 100},
        width = 1000 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    
    // append the svg object to the body of the page
    var svg = d3.select("#chart")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");
    
    //Read the data
    d3.csv("../data/fossil_fuels.csv", 
    
      function(d){
      return { Entity: d.Entity, Year : d3.timeParse("%Y")(d.Year), primary_energy : d.percent_electricity }
      },

      function(data) {

        // List of countries pulled from the data
        var all_countries = d3.map(data, function(d){return(d.Entity)}).keys() // the countries to populate the dropdown

        var dropdownGroup = svg.append("g")
          .attr("transform", "translate(" + margin.left+ "," + margin.top + ")");
        var dropdownSelection = dropdownGroup.append("select")
          .attr("class", "dropdown")
          .attr("id", "selectCountryDropdown");
    
        // console.log(all_countries)

        // This is where the PARAMETER and TRIGGER work together to change the scene
        d3.select("#selectCountryDropdown")
          .selectAll('theCountries')
        //dropdownSelection.selectAll("option")
            .data(all_countries)
            .enter()
            .append('option')
          .text(function (d) { return d; }) // the country displayed on the dropdown - this is the PARAMETER value for the TRIGGER
          .attr("value", function (d) { return d; }) // the actual values corresponding to the country selected in the dropdown
          .style("visibility", "visible");
    
        // A color scale: one color for each group
        var myColor = d3.scaleOrdinal()
          .domain(all_countries)
          .range(d3.schemeSet2);
    
        // Add X axis --> it is a date format
        var x = d3.scaleTime()
          .domain(d3.extent(data, function(d) { return d.Year; }))
          //.domain([d3.min(data, function(d) { return d.Year - 1; }), d3.max(data, function(d) { return d.Year + 1; })])
          .range([ 0, width ]);

      function make_x_gridlines() {		
        return d3.axisBottom(x)
            .ticks(15)
      }

      function make_y_gridlines() {		
        return d3.axisLeft(y)
            .ticks(15)
      }   
        xAxis = svg.append("g")
        //xAxis = (label) => (g) => g
          // add the grid lines (does not work with zooming)
          // .attr("class", "grid")
          // .attr("transform", "translate(0," + height + ")")
          // .call(make_x_gridlines()
          //   .tickSize(-height)
          //  .tickFormat("")
          // )
          // svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x))
        xAxis.append('text')
          .attr('class', 'axis-label')
          .text('Year')
          .attr('x', margin.left + (width - margin.left - margin.right) / 2)
          .attr('y', 50) // Relative to the x axis.
     ;

        // Add Y axis
        var y = d3.scaleLinear()
          .domain([0, d3.max(data, function(d) { return +d.primary_energy; })+10])
          .range([ height, 0 ]);

        yAxis = 
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
          .text('% of primary energy consumption from fossil fuels')
          .attr('transform', 'rotate(-90)')
          .attr('x', -(margin.top + (height - margin.top - margin.bottom) / 2))
          .attr('y', -50) 

    
          var clip = svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", width )
            .attr("height", height )
            .attr("x", 0)
            .attr("y", 0);

        // Add brushing
        var brush = d3.brushX()                   
            .extent( [ [0,0], [width,height] ] )  
            .on("end", updateChart)               // Each time the brush selection changes, we trigger the 'updateChart' function
            
        var numberFormat = d3.format(".1f");

        // Create the line variable: where both the line and the brush take place
        var dataFilter = data.filter(function(d){return d.Entity==all_countries[0]})

        var line = svg.append('g')
          .attr("clip-path", "url(#clip)")
            // Initialize line with first group of the list
          line.append("path")
                .datum(dataFilter)
                // console.log(data.filter(function(d){return d.Entity==all_countries[0]}))
                .attr("class", "line")
                .attr("d", d3.line()
                  .x(function(d) { return x(+d.Year) })
                  .y(function(d) { return y(+d.primary_energy) })
                )
                .attr("stroke", function(d){ return myColor("valueA") })
                .style("stroke-width", 4)
                .style("fill", "none")


        var circleGroup = line.append("g");
        circleGroup.selectAll("circle")
          .data(dataFilter)
          .enter()
          .append("circle")
          .attr("cx", function(d) { return x(d.Year); })
          .attr("cy", function(d) { return y(d.primary_energy); })
          .attr("r", 3) // Adjust radius for circle size

        var textGroup = line.append("g");
        textGroup.selectAll("text")
          .data(dataFilter.filter(function(d,i) { return i % 2 === 0; }))
          .enter()
          .append("text")
          .attr("class", "text2")
          .attr("x", function(d) { return x(d.Year) + 5; }) // Adjust X position
          .attr("y", function(d) { return y(d.primary_energy) - 5; }) // Adjust Y position
          .text(function(d) { return numberFormat(d.primary_energy); }) // Access data value

        // Add the brushing
        line
          .append("g")
            .attr("class", "brush")
            .call(brush);   

        // Function tho update the chart
        function update(selectedCountry) {

          // Create new data with the selection
          var dataFilter = data.filter(function(d){return d.Entity==selectedCountry});
          // console.log(dataFilter)
          // Give these new data to update line

          line
          .call(brush)
              .select('path')            
              .datum(dataFilter)
              .transition()
              .duration(300)
              .attr("d", d3.line()
                .x(function(d) { return x(d.Year) })
                .y(function(d) { return y(+d.primary_energy) })
              )
              .attr("stroke", function(d){ return myColor(selectedCountry) })
              .style("fill", "none")

          circleGroup.selectAll("circle")
            .data(dataFilter)
            .enter()
            .append("circle")
            .transition()
            .duration(500)
            .attr("cx", function(d) { return x(d.Year); })
            .attr("cy", function(d) { return y(d.primary_energy); })
            .attr("r", 3) // Adjust radius for circle size
            .attr("fill", "black") // Adjust fill color
            .attr("opacity", 0.7) // Adjust opacity (optional)

          // add text
          textGroup.selectAll("text")
            .data(dataFilter.filter(function(d,i) { return i % 2 === 0; }))
            //.data(dataFilter)
            .enter()
            .append("text")
            .attr("class", "text2")
            .attr("x", function(d) { return x(d.Year) + 15; }) // Adjust X position
            .attr("y", function(d) { return y(d.primary_energy) - 5; }) // Adjust Y position
            .text(function(d) { return numberFormat(d.primary_energy); }) // Access data value

          // Add the brushing
          line
            .append("g")
              .attr("class", "brush")
              .call(brush);

          // If user double click, reinitialize the chart
          svg.on("dblclick",function(){
            x.domain(d3.extent(data, function(d) { return d.Year; }))
            xAxis.transition().call(d3.axisBottom(x))
            line
              .select('.line')
              .transition()
              .attr("d", d3.line()
                .x(function(d) { return x(d.Year) })
                .y(function(d) { return y(d.primary_energy) })
            )

            circleGroup
            .selectAll("circle")
            .transition()
            .duration(500)
            .attr("cx", function(d) { return x(d.Year); })
            .attr("cy", function(d) { return y(d.primary_energy); })
            .attr("r", 3) // Adjust radius for circle size
            .attr("fill", "black") // Adjust fill color
            .attr("opacity", 0.7) // Adjust opacity (optional)

          // add text
          textGroup.selectAll("text")
          .transition()
            .duration(500)
            .attr("class", "text2")
            .attr("x", function(d) { return x(d.Year) + 15; }) // Adjust X position
            .attr("y", function(d) { return y(d.primary_energy) - 5; }) // Adjust Y position
            .text(function(d) { return numberFormat(d.primary_energy); }) // Access data value


    });
        }
    
        // THIS IS A TRIGGER - When the button is changed, run the update function to update the scene
        d3.select("#selectCountryDropdown").on("change", function(d) {
            // recover the option that has been chosen
            circleGroup.selectAll("circle").remove()
            textGroup.selectAll("text").remove();
            var selectedOption = d3.select(this).property("value")
            // run the updateChart function with this selected option
            x.domain(d3.extent(data, function(d) { return d.Year; }))
            xAxis.transition().call(d3.axisBottom(x))
            line
              .select('.line')
              .transition()
              .attr("d", d3.line()
                .x(function(d) { return x(d.Year) })
                .y(function(d) { return y(d.primary_energy) })
            )
            update(selectedOption)
        })



    // A function that set idleTimeOut to null
    var idleTimeout
    function idled() { idleTimeout = null; }

    // A function that update the chart for given boundaries
    function updateChart() {

      // What are the selected boundaries?
      extent = d3.event.selection
        // If no selection, back to initial coordinate. Otherwise, update X axis domain
      if(!extent){
        if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
        x.domain([ 4,8])
      } else { 
        x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
        console.log(x.invert(extent[0]), x.invert(extent[1]))
        line.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
      }
    
      // Update axis and line position
      xAxis.transition().duration(1000).call(d3.axisBottom(x))
      console.log(xAxis)
      line
          .select('.line')
          .transition()
          .duration(1000)
          .attr("d", d3.line()
            .x(function(d) { return x(d.Year) })
            .y(function(d) { return y(d.primary_energy) })
          )

      circleGroup
            .selectAll("circle")
            .transition()
            .duration(500)
            .attr("cx", function(d) { return x(d.Year); })
            .attr("cy", function(d) { return y(d.primary_energy); })
            .attr("r", 3) // Adjust radius for circle size
            .attr("fill", "black") // Adjust fill color
            .attr("opacity", 0.7) // Adjust opacity (optional)

          // add text
          textGroup.selectAll("text")
          .transition()
            .duration(500)
            .attr("class", "text2")
            .attr("x", function(d) { return x(d.Year) + 15; }) // Adjust X position
            .attr("y", function(d) { return y(d.primary_energy) - 5; }) // Adjust Y position
            .text(function(d) { return numberFormat(d.primary_energy); }) // Access data value

    }

    // If user double click, reinitialize the chart
    svg.on("dblclick",function(){
      x.domain(d3.extent(data, function(d) { return d.Year; }))
      xAxis.transition().call(d3.axisBottom(x))
      line
        .select('.line')
        .transition()
        .attr("d", d3.line()
          .x(function(d) { return x(d.Year) })
          .y(function(d) { return y(d.primary_energy) })
        )

      circleGroup
            .selectAll("circle")
            .transition()
            .duration(500)
            .attr("cx", function(d) { return x(d.Year); })
            .attr("cy", function(d) { return y(d.primary_energy); })
            .attr("r", 3) // Adjust radius for circle size
            .attr("fill", "black") // Adjust fill color
            .attr("opacity", 0.7) // Adjust opacity (optional)

          // add text
          textGroup.selectAll("text")
          .transition()
            .duration(500)
            .attr("class", "text2")
            .attr("x", function(d) { return x(d.Year) + 15; }) // Adjust X position
            .attr("y", function(d) { return y(d.primary_energy) - 5; }) // Adjust Y position
            .text(function(d) { return numberFormat(d.primary_energy); }) // Access data value

    });

    })
    