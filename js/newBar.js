async function drawBar() {
   let data = await d3.json("https://raw.githubusercontent.com/simprisms/vaccination-data/main/data/_us_historical.json")

    data = data['vaccination_trends_data']
        
    delete data.runid
   
    const newData = data.filter(d => {
        return d.date_type === "Admin"
    }).filter(d => d.LongName === "United States")

    const lineArray = []
    for (let i =0; i < newData.length; i++) {
      lineArray.push(_.pick(newData[i], ['Date', 'Administered_7_Day_Rolling_Average']))
    }

    console.log(lineArray)

     // Set up date parsing function
    const dateParser = d3.timeParse('%Y-%m-%d')
    let formatTime = d3.timeFormat("%B %d");
    let numberFormatter = d3.format(",.4r") 
    
    // Createaccessor functions
    const xAccessor = d => dateParser(d.Date)
    const yAccessor = d => d.Administered_Daily
    const rollAverage = d => d.Administered_7_Day_Rolling_Average

    // Set dimensions
    const width = 900
    const dimensions = {
        width,
        height: 400,
        margins: {
            top: 60, 
            bottom: 40, 
            left: 30, 
            right: 10
        } 
    }
    dimensions.boundedHeight = dimensions.height 
        - dimensions.margins.top
        - dimensions.margins.top
    dimensions.boundedWidth = dimensions.width 
        - dimensions.margins.left
        - dimensions.margins.right

    // Create wrapper
    const wrapper = d3.select("#chart-area").append("svg")
        .attr("height", dimensions.height)
        .attr("width", dimensions.width)

    // Create bounds
    const bounds = wrapper.append('g')
        .style("transform", `translate(${dimensions.margins.left}px, ${dimensions.margins.top}px)`)
        
    // Create scales
    const xScale = d3.scaleTime()
        .domain(d3.extent(data, xAccessor))
        .range([0, dimensions.boundedWidth])
        
    const yScale = d3.scaleLinear()
        .domain(d3.extent(data, yAccessor))
        .range([dimensions.boundedHeight, 0])
        .nice()

   // Create axes generators and axes
   const xAxisGenerator = d3.axisBottom(xScale)
        .ticks(5)
        .tickSizeOuter(0)
        .tickFormat(d3.timeFormat("%B"))

    const xAxis = bounds.append("g")
        .attr("class", "x-axis")
        .style("transform", `translate(0, ${dimensions.boundedHeight}px)`)
        .call(xAxisGenerator)

    const yAxisGenerator = d3.axisLeft(yScale)
        .ticks(3)
        .tickFormat(d3.format(".1s"))
        .tickSize(-dimensions.boundedWidth)
    const yAxis = bounds.append("g")
        .attr("class", "y-axis")
        .call(yAxisGenerator)
        .select(".domain").remove()

    // Create tooltip
    const chartTip = d3.tip()
    .attr("class", "d3-tip")
    .html(d => {
        let chartText = `<strong><p id="date">${formatTime(xAccessor(d))}</strong></p><br>`
        chartText += `<p id="number">Vaccinations: ${numberFormatter(yAccessor(d))}</p>`
        return chartText
    })
    bounds.call(chartTip)

    // Draw bars
    const rects = bounds.selectAll('rect')
        .data(newData)
    
    rects.exit().remove()

   rects.enter()
        .append("rect")
        .attr("x", d => xScale(xAccessor(d)))
        .attr("y", d => yScale(yAccessor(d)))
        .attr("width", "5px")
        .attr("height", d => dimensions.boundedHeight - yScale(yAccessor(d)))
        .attr("fill", "#99d1b3")
        .on("mouseover", chartTip.show)
        .on("mouseleave", chartTip.hide)
   
        // Draw averge line
    // const lineGenerator = d3.line()
    //     .x(d => xScale(xAccessor(d)))
    //     .y(d => yScale(rollAverage(d)))

    // const line = bounds.append('path')
    //     .attr("d", lineGenerator(lineArray))
    //     .attr("fill", "none")
    //     .attr("stroke", "black")

    // const circles = bounds.selectAll('circle')
    //     .data(newData)

    // circles.exit().remove()

    // circles.enter()
    // .append('circle')
    //     .attr("cx", d => xScale(xAccessor(d)))
    //     .attr("cy", d => yScale(rollAverage(d)))
    //     .attr("r", 3)

    const chartTitle = wrapper.append("text")
        .attr("class", "title-text")
        .attr("x", 12)
        .attr("y", 20)
        .text("New doses per day")

    const chartSubtitle = wrapper.append("text")
        .attr("x", 12)
        .attr("y", 40)
        .attr("opacity", "0.6")
        .text("Rollout has accelerated since late February")
}

drawBar()