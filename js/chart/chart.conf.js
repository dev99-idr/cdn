/*
 Name:    highcharts config script
 Version: 1.0.1 (2010-01-19)
 Author:  IDR
 Support: IDR@idrgroup.co.kr
*/

var seriesType;
var title;
var sdata;

var series;
var xAxis;
var yAxis;
HighConf = function()
{
	this.xAxis = new XgroupAxis();
	this.yAxis = new YgroupAxis();
	this.series = new Series();

	this.getSeriesType = function()
	{
		return this.seriesType;
	}

	this.setSeriesType = function(val)
	{
		this.seriesType = val;
	}

	this.getTitle = function()
	{
		return this.title;
	}

	this.setTitle = function(val)
	{
		this.title = val;
	}

	this.getSdata = function()
	{
		return this.sdata;
	}

	this.setSdata = function(val)
	{
		this.sdata = val;
	}

	this.clear = function()
	{
		//chart clear - 이딴식으로 초기화히기.
		document.getElementById('container').innerHTML = '';
	}

}

var xTitle;
var xCategory;
XgroupAxis = function()
{
	this.getXcategory = function()
	{
		return this.xCategory;
	}

	this.setXcategory = function(val)
	{
		this.xCategory = val;
	}

	this.getXtitle = function()
	{
		return this.xTitle;
	}

	this.setXtitle = function(val)
	{
		this.xTitle = val;
	}
}


var yTitle;
YgroupAxis = function()
{
	this.getYtitle = function()
	{
		return this.xYitle;
	}

	this.setYtitle = function(val)
	{
		this.xYitle = val;
	}
}

Series =function()
{
	this.addSeries = function(A, B)
	{
		var cnt = this.sdata.length;

		var _B = new Array();

		for(i=0; i<B.length; i++)
		{
			_B[i] = B[i]*1;
		}

		this.sdata[cnt] = ({name: A, data: _B});
	}

	this.getSeries = function()
	{
		return this.sdata;
	}

	this.seriesInit = function()
	{
		this.sdata = null;

		this.sdata = new Array();
	}
}


function drawHighChart(highConf)
{
	$(document).ready(function() {
     	var chart = new Highcharts.Chart({
		   chart: {
		      renderTo: 'container',
		      defaultSeriesType: highConf.getSeriesType()
		   },
		   title: {
		      text: highConf.getTitle()
		   },
		   xAxis: {
		      categories: highConf.xAxis.getXcategory(),
		      title: {
		         text: highConf.xAxis.getXtitle()
		      }
		   },
		   yAxis: {
		      title: {
		         text: ''
		      }
		   },
		   plotOptions: {
		      line: {
		         dataLabels: {
		            enabled: false
		         }
		      }
		   },
		   series: highConf.series.getSeries()
		});
	});
}
