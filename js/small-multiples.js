async function getData() {
    const data = await d3.csv('https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/us_state_vaccinations.csv')

    console.log(data[0])
    // Set up date parsing function
    const dateParser = d3.timeParse('%Y-%m-%d')
    
    // Set up accessor functions
    const xAccessor = d => dateParser(d.date)
    const yAccessor = d => d.people_vaccinated_per_hundred
    const state = d => d.location

    //  Create a nested version of the data, sorted by location
  const nested = d3.nest()
        .key(d=> d.location)
        .entries(data)

    // Get state names
    const states = nested.map(d => d.key)
        
    // Set dimensions
    const width = 200 //window.innerWidth * 0.8
    const dimensions = { 
        width,
        height: 200,
        margins: {
            top: 20, 
            bottom: 20, 
            left: 40,
            right: 10
        }
    }
    dimensions.boundedWidth = dimensions.width
        - dimensions.margins.left
        - dimensions.margins.right
    dimensions.boundedHeight = dimensions.height
        - dimensions.margins.top
        - dimensions.margins.bottom

    // Set up wrappers for
    const wrapper = d3.select("#small-multiples").append('svg')
        .attr('height', dimensions.height)
        .attr("width", dimensions.width)

    // Set up bounds
    const bounds = wrapper.append('g')
        .style('transform', `translate(${dimensions.margins.left}px, ${dimensions.margins.top}px)`)

    // Create scales
    // x scale
    const xScale = d3.scaleTime()
        .domain(d3.extent(data, xAccessor))
        .range([0, dimensions.boundedWidth])
        .nice()
    
    // y scale
    const yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([dimensions.boundedHeight, 0])
        .nice()

    // Create a line generator 
    const lineGenerator = d3.line()
        .defined(d => d.people_vaccinated_per_hundred != 0)
        .x(d => xScale(xAccessor(d)))
        .y(d => yScale(yAccessor(d)))
    
   
    // Draw lines
    const lines = bounds.selectAll('path')
        .data(nested)
    
    lines.enter()
        .append('path')
        .attr('d', d => lineGenerator(d.values))
        .attr("fill", 'none')
        .attr('stroke', 'black')
    
    lines.append("path")
        .attr("class", "line")
        .attr("d", d => lineGenerator(d.values))
        .style("stroke", 'black');

    // create circles
    // const circle = bounds.selectAll('circle')
    //     .data(newVar)

    // circle.enter()
    //     .append('circle')
    //     .attr("cx", d => xScale(xAccessor(d)))
    //     .attr("cy", d => yScale(yAccessor(d)))
    //     .attr("r", 5)
    //     .attr("fill", "black")

    // Create x axis
    const xAxisGenerator = d3.axisBottom(xScale)
    const xAxis = bounds.append('g')
        .style("transform", `translateY(${dimensions.boundedHeight}px)`)
        .call(xAxisGenerator)

    // Create y axisBottom
    const yAxisGenerator = d3.axisLeft(yScale)
    const yAxis = bounds.append('g')
        .call(yAxisGenerator)
}

getData()