import {json} from "https://cdn.skypack.dev/d3-fetch"

const width = 900;
const height = 400;
const padding = 30;

const svg = d3.select("#chart")
            .append("svg")
            .attr("viewBox","0,0,1050,620")       
            .attr("maintainAspectRatio","xMidYMid")

//Run in both JSON files using the d3-fetch method
Promise.all([
  json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"),
  json("https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json")
]).then(([map,data]) => {
  
const projection = d3.geoMercator()
  
const path = d3.geoPath()  

//create a key value pair object with IDs and the index of those IDs in the other file - means this operation only has to happen once and saves massively on I/O performance 
  const countyData = data
  
  let countyDataLookup = {}
  data.map((elem, index) => { 
     countyDataLookup[elem.fips] = index
  })
       

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute");

  const mousemove = (event, d) => {
    let pageX = event.pageX;
    let pageY = event.pageY;

    const text = d3
      .select("#tooltip")
       .attr("data-education", countyData[countyDataLookup[d.id]].bachelorsOrHigher)
      .html("<p>" + countyData[countyDataLookup[d.id]]["area_name"] + ", " + countyData[countyDataLookup[d.id]].state + "<br>" +countyData[countyDataLookup[d.id]].bachelorsOrHigher + "% " + "</p>")
      .style("left", pageX + "px")
      .style("top", pageY + "px");
  };

//converts topojson to geojson and plots the path, colours the polygons using a 5 point colour scale                                   
svg
    .append('g')
    .selectAll('path')
    .data(topojson.feature(map, map.objects.counties).features)
    .enter()
    .append('path')
    .attr('class', 'county')
    .attr('d', path)
    .attr("data-fips",(d,i) => countyData[countyDataLookup[d.id]].fips)
    .attr("data-education",(d,i) => countyData[countyDataLookup[d.id]].bachelorsOrHigher)
   .attr("fill",(d,i,data) => {
    if(countyData[countyDataLookup[d.id]].bachelorsOrHigher >=0 && countyData[countyDataLookup[d.id]].bachelorsOrHigher <= 15) {return d3.interpolatePurples(0.2)}
  else if(countyData[countyDataLookup[d.id]].bachelorsOrHigher >=15.01 && countyData[countyDataLookup[d.id]].bachelorsOrHigher <= 30) {return d3.interpolatePurples(0.4)}
  else if(countyData[countyDataLookup[d.id]].bachelorsOrHigher >=30.01 && countyData[countyDataLookup[d.id]].bachelorsOrHigher <= 45) {return d3.interpolatePurples(0.6)}
  else if(countyData[countyDataLookup[d.id]].bachelorsOrHigher >=45.01 && countyData[countyDataLookup[d.id]].bachelorsOrHigher <=60) {return d3.interpolatePurples(0.8)}
  else if(countyData[countyDataLookup[d.id]].bachelorsOrHigher >=60.01 && countyData[countyDataLookup[d.id]].bachelorsOrHigher <=80) {return d3.interpolatePurples(1)}
})
    .attr("stroke", "purple")
    .on("mouseover", (d, i) => d3.select("#tooltip").style("opacity", "1"))
    .on("mouseleave", (d, i) => d3.select("#tooltip").style("opacity", "0"))
    .on("mousemove", mousemove);

  
  svg
    .append('g')
    .attr('class', 'states')
    .selectAll('path')
    .data(topojson.feature(map, map.objects.states).features)
    .enter()
    .append('path')
    .attr('class', 'states')
    .attr('d', path)
    .attr("fill","none")
    .attr("stroke", "mediumspringgreen")
  
let scaleX = d3.scaleLinear().domain([2.6, 75.1]).rangeRound([600, 860]);  
  
  var legend = svg
      .append('g')
      .attr('id', 'legend')
      
  
 let keys = ["0 to 15%","15 to 30%","30 to 45%","45 to 60%","60 to 75%"]
    let color = d3.scaleOrdinal()
  .domain(keys)
  .range([d3.interpolatePurples(0.2),d3.interpolatePurples(0.4),d3.interpolatePurples(0.6),d3.interpolatePurples(0.8),,d3.interpolatePurples(1.0)])

  legend
    .selectAll("rect")
    .data(keys)
  .enter()
  .append("rect")
    .attr("id","legend")
    .attr("x", 1000)
    .attr("y", function(d,i){ return 200 + i*25}) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("width", 25)
    .attr("height",25)
    .style("fill", function(d){ return color(d)})
  
  
  legend.selectAll("text")
    
    .data(keys)
    .enter()
    .append("text")
    .attr("x", 1040)
    .attr("y", function(d,i){ return 200 + (i*25)+15}).text(function(d){ return d}).attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
  
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")
  .style("font-family", "monospace")


  

      
});
