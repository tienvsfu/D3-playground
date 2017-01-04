console.log('hello!');

var data = require('./flare.js');
var d3 = require('d3');
require('./styles.css');

// set the dimensions and margins of the graph
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// parse the date / time
var parseTime = d3.timeParse("%d-%b-%y");

// set the ranges
var xx = d3.scaleTime().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);

var xs = [];
var ys = [];

// define the line
var valueline = d3.line()
    .x(function(d) {
      xs.push(xx(d.date));
      return xx(d.date);
    })
    .y(function(d) {
      ys.push(y(d.close));
      return y(d.close);
    });

console.log(xs);
console.log(ys);

// append the svg obgect to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  data.forEach(function(d) {
      d.date = parseTime(d.date);
      d.close = +d.close;
  });

  // Scale the range of the data
  xx.domain(d3.extent(data, function(d) { return d.date; }));
  y.domain([0, d3.max(data, function(d) { return d.close; })]);

  // Add the valueline path.
  svg.append("path")
      .data([data])
      .attr("class", "line")
      .attr("d", valueline);

  // Add the X Axis
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xx));

  // Add the Y Axis
  svg.append("g")
      .call(d3.axisLeft(y));

module.exports = "fuqthis";
