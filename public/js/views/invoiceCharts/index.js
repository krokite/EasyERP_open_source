define([
    'text!templates/invoiceCharts/index.html',
    'collections/invoiceCharts/invoiceCharts',
    'dataService',
    'async',
    'custom',
    'moment',
    'constants'
], function (mainTemplate, InvoiceCharts, dataService, async, custom, moment, CONSTANTS) {
    "use strict";
    var View = Backbone.View.extend({
        el: '#content-holder',

        contentType: CONSTANTS.DASHBOARD_VACATION,

        template : _.template(mainTemplate),
        expandAll: false,

        events: {
            "click #byMonth": "byMonth",
            "click #byWeek" : "byWeek"
        },

        initialize: function (options) {
            var startWeek;
            var self = this;
            var year;
            var week;

            this.startTime = options.startTime;
            this.collection = options.collection || [];
            //this.filter = options.filter || custom.retriveFromCash('DashVacation.filter');

            year = moment().isoWeekYear();
            week = moment().isoWeek();

            this.dateByWeek = year * 100 + week;
            this.week = week;
            this.year = year;

            startWeek = self.week - 1;

            if (startWeek >= 0) {
                this.startWeek = startWeek;
            } else {
                this.startWeek = startWeek + 53;
                this.year -= 1;
            }

            this.render();
        },

        byWeek: function () {
            this.collection = new InvoiceCharts({byWeek: true});
            this.collection.on('reset', this.renderByFilter, this);
        },

        byMonth: function () {
            this.collection = new InvoiceCharts();
            this.collection.on('reset', this.renderByFilter, this);
        },

        renderByFilter: function () {
            $('#chart').empty();

            var $chartContainer = this.$el.find('#chartContainer');

            var WIDTH = $chartContainer.width();
            var HEIGH = $chartContainer.height();
            var data = this.collection.toJSON();
            var margin = {top: 20, right: 70, bottom: 30, left: 60};
            var width = WIDTH - margin.left - margin.right - 15;
            var height = HEIGH - margin.top - margin.bottom;
            var now = new Date();
            var max = data.length;

            var x = d3.scale.ordinal().rangeRoundBands([margin.left, width], 0.1);
            var y = d3.scale.linear().range([height - margin.top, margin.bottom]);

            var topChart = d3.select("#chart");

            topChart
                .append("g")
                .attr("width", width)
                .attr("height", height);

            x.domain(data.map(function (d) {
                return d.date;
            }));

            y.domain([0, d3.max(data.map(function (d) {
                return d.invoiced > d.paid ? d.invoiced : d.paid;
            }))]);

            topChart
                .selectAll("rect")
                .data(data)
                .enter()
                .append("svg:rect")
                .attr("x", function (datum, index) {
                    return (x(datum.date));
                })
                .attr("y", function (datum) {
                    return y(datum.invoiced);
                })
                .attr("height", function (datum) {
                    return height - y(datum.invoiced);
                })
                .attr("width", x.rangeBand())
                .attr("fill", "#66b5d4")
                .attr("opacity", 0.6)
                .on('mouseover', function (d) {
                   /* var current = d3.select(this);
                    var i = current.attr('data-index');
                    var svgToolTip = d3.select('#' + $scope.myid);

                    var value = (d[$scope.y[i - 1]] % 1) ? d[$scope.y[i - 1]].toFixed(2) : d[$scope.y[i - 1]];

                    var xPosition = parseFloat(current.attr("x")) + 60 + (x.rangeBand() - 200) / 2;
                    var yPosition = parseFloat(current.attr("y"));
                    if (xPosition < 10) {
                        xPosition = 10;
                    }
                    if ((width - xPosition) < 110) {
                        xPosition = width - 120;
                    }
                    if (yPosition > 300) {
                        yPosition = 300;
                    }
                    current.attr('class', 'mouseOverBar');
                    svgToolTip
                        .select("#tooltip")
                        .style("left", xPosition + "px")
                        .style("top", yPosition + "px")
                        .select(".value")
                        .text(/!* d[$scope.y[i - 1]] *!/value);
                    svgToolTip
                        .select(".lable")
                        .text($scope.lables[i - 1]);
                    svgToolTip
                        .select(".dateValue")
                        .text(
                            $scope.x == "date" ? moment(d[$scope.x]).format('dddd, MMMM Do YYYY') : d[$scope.x]);
                    svgToolTip
                        .select("#tooltip")
                        .classed("hidden", false);*/

                });

            topChart
                .selectAll("rect2")
                .data(data)
                .enter()
                .append("svg:rect")
                .attr("x", function (datum, index) {
                    return (x(datum.date));
                })
                .attr("y", function (datum) {
                    return y(datum.paid);
                })
                .attr("height", function (datum) {
                    return height - y(datum.paid);
                })
                .attr("width", x.rangeBand())
                .attr("fill", "white")
                .attr("opacity", 0.6);

            /*topChart.selectAll("text")
             .data(data)
             .enter()
             .append("svg:text")
             .attr('class', 'inBarText')
             .attr("x", function (datum, index) {
             return (x(datum._id) - barWidth / 2);
             })
             .attr("y", function (datum) {
             return y(datum.count);
             })
             .attr("dx", barWidth / 2)
             .attr("dy", "1.2em")
             .attr("text-anchor", "middle")
             .text(function (datum) {
             return datum.count
             })
             .attr("fill", "white");*/

            var xAxis = d3.svg.axis()
                .scale(x)
                .ticks(max)
                .tickSubdivide(true);

            var yAxis = d3.svg.axis()
                .scale(y)
                .orient('left')
                .ticks(0)
                .outerTickSize(0)
                .tickSubdivide(false);

            topChart.append('svg:g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + (height + 5) + ')')
                .call(xAxis);

            topChart.append('svg:g')
                .attr('class', 'y axis')
                .attr('transform', 'translate(' + (margin.left) + ', 5 )')
                .call(yAxis);

            /*topChart.append('svg:text')
             .attr("x", x.rangeBand() / 2)
             .attr("y", HEIGH - 5)
             .attr('class', 'axesName')
             .text('Date');*/

            topChart.append('svg:text')
                .attr("x", -(HEIGH / 2 + margin.bottom))
                .attr("y", margin.left - 10)
                .attr('class', 'axesName')
                .text('Number')
                .attr("transform", 'translate(0, 0) rotate(-90)');

            return this;
        },

        render: function (options) {
            var self = this;
            var $currentEl = this.$el;

            $currentEl.html(self.template({
                collection: self.collection
            }));

            this.renderByFilter();

            return this;
        }
    });

    return View;
});