//Determines size of the map.
let w = 1000
let h = 600

//Variables the fetched data files are stored in.
let genMap
let eduData

//Dimensions of the legend.
let legendw = 200
let legendh = 30
let legendPadding = 10

//Values for the legend.
let legendVal= [0, 10, 20, 30, 40, 50, 60]


//Matches bachelors attainment to color.
let eduColors = [
  {
    "floor": 10,
    "bgFill": '#ccffff'
  },
  {
    "floor": 20,
    "bgFill": '#b3e6ff'
  },
  {
    "floor": 30,
    "bgFill": '#66ccff'
  },
  {
    "floor": 40,
    "bgFill": '#0099ff'
  },
  {
    "floor": 50,
    "bgFill": '#0066cc'
  },
  {
    "floor": 60,
    "bgFill": '#003399'
  },
  {
    "floor": 70,
    "bgFill": '#000000'
  },
  {
    "floor": 100,
    "bgFill": '#000000'
  }
]

//The svg the map is displayed in.
const svg = d3.select("#graph")
              .append("svg")
              .attr("id", "chloropleth")
              .attr("viewBox", "0 0 " + w + " " + h)


//Creates tooltip that hovers over the mouse.
let tooltip = d3.select("#graph")
              .append("div")              
              .attr("id", "tooltip")
              .style("visibility", "hidden")
              .style("position", "absolute")
  
//Creates the legend matching values to colors.
const legend = d3.select("#graph")
                .append("svg")
                .attr("id", "legend")
                .attr("w", legendw)
                .attr("h", legendh)
                .attr("x", legendPadding)

  //Makes tooltip visible when mouse is over an area.
  const mouseover = () => {
    tooltip.style("visibility", "visible")
  }
  
  //Makes tooltip invisible when mouse leaves the area.
  const mouseleave = () => {
    tooltip.style("visibility", "hidden")
  }
  
  //Changes text of the tooltip when mouse moves over an area, additionally matches tooltip to the mouse's location.
  function mousemove (info, pos) {
    tooltip.text(info.area_name + ", " + info.state + ": " + info.bachelorsOrHigher + "%")
            .style("left", (pos[0]) + "px")
            .style("top", (pos[1]) + "px")
            .attr("data-education", info.bachelorsOrHigher)
            
  }


//Fetches data file for education data per county.
fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json")
              .then(response => response.json())
              .then(content => {

                //Stores fetched data into local variable.
                eduData = content
              })

//Fetches data file telling topojson how to draw the map.
fetch("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json")
.then(response => response.json())
.then(content => {

  //Stores fetched data into local variable.
  genMap = topojson.feature(content, content.objects.counties);
  
  //Sequence for drawing the items on the document.
  drawChart()
  drawLegend()
})



function drawChart() {

  //Draws the chart, colors it, and assigns data values per area.
  svg.selectAll("path")
      .data(genMap.features)
      .enter()
      .append("path")
      .attr("d", d3.geoPath())
      .attr("class", "county")
      .attr("id", (d) => "i" + d.id)
      .attr("data-fips", (d) => eduData.find((o) => o.fips == d.id).fips)
      .attr("data-education", (d) => eduData.find((o) => o.fips == d.id).bachelorsOrHigher)
      .attr("fill", (d) => assignColor(eduData.find((o) => o.fips == d.id).bachelorsOrHigher))
      .on("mousemove", (d) => mousemove(eduData.find((o) => o.fips == d.id), [d3.event.pageX, d3.event.pageY]))
      .on("mouseleave", mouseleave)
      .on("mouseover", mouseover)
    }

function drawLegend() {
  //Creates the scale the legend axis uses for values.
  let legendScale = d3.scaleLinear()
                .domain([d3.min(legendVal), d3.max(legendVal)])
                .range([0, legendw])

  //Creates and formats the legend axis.
  let legendAxis = d3.axisBottom(legendScale)
                      .tickValues([...legendVal, 70])
                      .tickFormat(d => d + "%")

  //Appends colored squares to the legend div and sizes them.
  legend.selectAll("rect")
        .data(legendVal)
        .enter()
        .append("rect")
        .attr("width", legendw / (legendVal.length - 1) + "px")
        .attr("height", legendh)
        .attr("x", (d, i) => i * legendw / (legendVal.length - 1) + legendPadding)
        .attr("fill", (d) => assignColor(d))

  //Appends the axis the legend uses and gives squares meaning.
  legend.append("g")
        .attr("id", "legend-axis")
        .attr("width", legendw)
        .attr("transform", "translate(10, " + legendh + ")")
        .call(legendAxis)
}

  //Returns the color matched to a given value (education for a county).
function assignColor(education) {
  return eduColors.find((o) => o.floor > education).bgFill
}