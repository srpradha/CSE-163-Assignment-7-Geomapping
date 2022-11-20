
// button toggle boundary
var toggleB = false;

function borders() {
    if (toggleB) {
        toggleB = false;
    } else {
        toggleB = true;
    }
}

var width = 900;
var height = 500;

var svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

function update(toggle) {
    if (toggleB) {
        toggleB = false;
    } else {
        toggleB = true;
    }
    
    svg.selectAll("*").remove();

    var g = svg.append("g");

    var color = d3.scaleThreshold()
        .domain([1, 10, 50, 200, 500, 1000, 2000, 4000])
        .range(d3.schemeOrRd[9]);

    var x = d3.scaleSqrt()
        .domain([0, 4500])
        .rangeRound([440, 950]);

    g.append("g")
        .attr("class", "key")
        .attr("transform", "translate(0,40)");

    g.selectAll("rect")
      .data(color.range().map(function(d) {
          d = color.invertExtent(d);
          if (d[0] == null) d[0] = x.domain()[0];
          if (d[1] == null) d[1] = x.domain()[1];
          return d;
        }))
      .enter().append("rect")
        .attr("height", 8)
        .attr("x", function(d) { return x(d[0]); }) // RANSKATAL
        .attr("width", function(d) { return x(d[1]) - x(d[0]); })
        .attr("fill", function(d) { return color(d[0]); });

    g.append("text")
        .attr("class", "caption")
        .attr("x", x.range()[0])
        .attr("y", -10)
        .attr("fill", "#000")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .text("Population per square mile");

    g.call(d3.axisBottom(x)
        .tickSize(13)
        .tickValues(color.domain()))
        .attr("transform", "translate(-400,20)")
      .select(".domain")
        .remove();

    function findDensity(data, name) {
        var adder = " County";
        var newName = name.concat(adder);

        for (var i = 0; i < data.length; i++) {
            if (data[i].county === newName) {
                return data[i].density;
            }
        }

        return -1;
    }

    d3.json("iowa.json", function(error, ia) {
        if (error) throw error;

        console.log(ia);

        d3.csv("popdensity.csv", function(error, data) {
            if (error) throw error;

            console.log(data);

            // tooltip functions
            function mmo (d) {
                tooltip
                    .style("opacity", 1);
            }
            function mmv (d) {
                console.log(d);
                tooltip
                    .html("County Name: " + d.properties.NAME + " Country<br>Population Density: " + findDensity(data, d.properties.NAME));
            }
            function mml (d) {
                tooltip
                  .style("opacity", 0);
            }
            
            // go thru each csv element
            var cArr = [["placeholder", -1]];
            for (var i = 0; i < data.length; i++) {
                var csvCounty = data[i].county;
                var csvDensity = data[i].density;

                cArr.push([csvCounty, csvDensity])
            }
            cArr.shift();
            //console.log(cArr);

            var subunits = topojson.feature(ia, ia.objects.cb_2015_iowa_county_20m);

            var projection = d3.geoAlbersUsa()
                            .scale([7000])
                            .translate([width/2,height*1.35]);

            var path = d3.geoPath().projection(projection);

            g.append("g")
                .attr("class", "counties")
                .selectAll("path")
                .data(topojson.feature(ia, ia.objects.cb_2015_iowa_county_20m).features)
                .enter().append("path")
                .attr("fill", function(d) { return color(findDensity(data, d.properties.NAME)); })
                .attr("d", path)
            .on("mouseover", function(d) {mmo(d);})
                    .on("mousemove", function(d) {mmv(d);})
                    .on("mouseout", function(d) {mml(d);});;
            

            if (toggleB) {
                g.append("path")
                    .attr("class", "county-borders")
                    .datum(topojson.mesh(ia, ia.objects.cb_2015_iowa_county_20m, function(a, b) {return a != b}))
                    .attr("d", path);
                    
            }
        });
    });

}

// define tooltip
var tooltip = d3.select("body").append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");

update();