async function getData() {
    const data = await d3.csv('https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/us_state_vaccinations.csv')

    console.log(data[0])
    // Set up date parsing function
    const dateParser = d3.timeParse('%Y-%m-%d')
    
    // Set up accessor functions
    const xAccessor = d => dateParser(d.date)
    const yAccessor = d => d.people_vaccinated_per_hundred

    //  Create a nested version of the data, sorted by location
    const nested = d3.nest()
        .key(d=> d.location)
        .entries(data)

    // Get state names
    const states = nested.map(d => d.key)
        
    // Set dimensions
    const width = 120 //window.innerWidth * 0.8
    const dimensions = { 
        width,
        height: 120,
        margins: {
            top: 20, 
            bottom: 30, 
            left: 30,
            right: 20
        }
    }
    dimensions.boundedWidth = dimensions.width
        - dimensions.margins.left
        - dimensions.margins.right
    dimensions.boundedHeight = dimensions.height
        - dimensions.margins.top
        - dimensions.margins.bottom

    const filteredData = nested.filter(d => d.key !== 'Bureau of Prisons').filter(
        d => d.key !== 'Dept of Defense').filter(
        d => d.key !== 'Federated States of Micronesia').filter(
        d => d.key !== 'Guam').filter(
        d => d.key !== 'Indian Health Svc').filter(
        d => d.key !== 'Long Term Care').filter(
        d => d.key !== 'Marshall Islands').filter(
        d => d.key !== 'Puerto Rico').filter(
        d => d.key !== 'Republic of Palau').filter(
        d => d.key !== 'Veterans Health').filter(
        d => d.key !== 'Virgin Islands').filter(
        d => d.key !== 'Northern Mariana Islands').filter(
        d => d.key !== 'American Samoa').filter(
        d => d.key !== 'United States')

    const nationalAv = data.filter(d => d.location === 'United States')
    
    const wrapper = d3.select("#small-multiples").selectAll('uniqueChart')
        .data(filteredData)
        .enter()
        .append('svg')
            .attr('width', dimensions.width)
            .attr("height", dimensions.height)
            
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

    bounds.append("rect")
        .attr("width", "58%")
        .attr("height", "60%")
        .attr("fill", "#F5F5F5");

    // Create x axis
    const xAxisGenerator = d3.axisBottom(xScale)
        .ticks(2)
        .tickSizeOuter(0)
        // .tickValues(['January', 'April', 'July'])
        
    const xAxis = bounds.append('g')
        .attr('class', 'axis')
        .style("transform", `translateY(${dimensions.boundedHeight}px)`)
        .call(xAxisGenerator)

    // Create y axis
    // const yAxisGenerator = d3.axisLeft(yScale)
    //     .ticks(0)
    //     .tickSizeOuter(0)
    // const yAxis = bounds.append('g')
    //     .attr('class', 'axis')
    //     .call(yAxisGenerator)
    
    
    // Get last date
     const lastDay = d3.max(data, xAccessor)  
     const formatter = d3.timeFormat("%Y-%m-%d") 
     const date = formatter(new Date(lastDay))
     const finalData = nationalAv.filter(d => d.date === date)
     const lastPoint =  finalData[0].people_fully_vaccinated_per_hundred
   
    // Create a line generator 
    const lineGenerator = d3.line()
        .defined(d => d.people_vaccinated_per_hundred != 0)
        .x(d => xScale(xAccessor(d)))
        .y(d => yScale(yAccessor(d)))

    bounds.append('path')
        .attr('fill', 'none')
        .attr('stroke-width', '3px')
        .attr('stroke', function(d) { 
            const last = d.values.find(d => d.date === date)
            if (last.people_vaccinated_per_hundred > lastPoint) {
                return "#1a9754"
            } else {
                return "#a01300"
            }
        })
        .attr('d', d => lineGenerator(d.values))

    bounds
        .append("text")
        .attr("text-anchor", "start")
        .attr("y", -5)
        .attr("x", 2)
        .attr('font-size', '11.5px')
        .text(function(d){ return(d.key)})

    bounds
        .append('text')
        .attr('x', dimensions.boundedWidth)
        .attr('y', function(d) {
            const last = d.values.find(d => d.date === date)
            return yScale(last.people_vaccinated_per_hundred -5 )
        })
        .attr('font-size', '9px')
        .text(function(d) {
            const last = d.values.find(d => d.date === date)
            
            return Math.trunc(last.people_vaccinated_per_hundred)
        })

        document.getElementById('percentage').textContent = Math.trunc(lastPoint)
}

getData()