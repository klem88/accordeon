// Dépendence d3.js v5

// TEST //
accordeon(100, 600, 'https://www.scholarvox.com', ["10207436","10236404","88801261","88812296","88814404","10041558","10040354","10041573","10041671","10208890","10295020","45001392","10041681","45003640","88802579","999999999","45007613","9999999100","45006770","88819099","10208965","41000779","41000931","41001508","41001512","41001521","45006769","88801314","88803211","88813256","88815752","88819108","88820827","88832613","88840771","88848997","88809292","88813010","88813029","88813255","88816506","88817870","88833668","88836952","88840783","88842018","88870385","41000606","41000634","41000955"]);

function accordeon(width, height, platform, docidlist){

  let bookscover = {};

  coverurls();

	let divcanvases = d3.select('body').append('div').attr('id', 'canvases');
	
	divcanvases.append('canvas').attr('id', 'hiddencanvas').attr('width', width).attr('height', height);
	divcanvases.append('canvas').attr('id', 'maincanvas').attr('width', width).attr('height', height);

  function coverurls(){
    let count = 0;

  	docidlist.map(function(d){
      unitfetch(d);
    })

  	
      function unitfetch(docid){
        fetch(platform + '/sapi/info?docid=' + docid, {
          method: "GET",
          mode: "cors"
        })
        .then((response) => {
          //console.log(response);
          return response.json();
        })
        .then((res) => {
          //console.log(res);
          count += 1;
          if(res.success == 1) bookscover[docid] = res.result.coverimg;
          if(count == docidlist.length) drawprep();
        })
        .catch(function(error){
          count += 1;
          console.log(error);
        }); 
      }
      ;
  }


  function drawprep(){
  	initsizes();

  	cover = {};
  	erroredcovers = [];
  	tempcount = 0;

  	docidlist.map(function(d, i){

      let tempcover = bookscover[d].replace('68pix', '300pix');
      processimg(d, tempcover);

  /*docidlist.map(function(d, i){
    //console.log(typeof booktype[d]);
    if (booktype[d] == 'y') {
      tempcover = 'https://img.youtube.com/vi/' + books[d] + '/hqdefault.jpg';
      processimg(d, tempcover);
    } else if (booktype[d] == 'b'){
      tempcover = urlcovercyber + '300pix/' + books[d];
      processimg(d, tempcover);
    } else if (booktype[d] == 's'){
      getsccover(d, books[d]);
    };*/

  	});
  	//console.log(cover);
  };

  function initsizes(width, height, length){
    mouseXY = 0;  
    
    let orientation = (width >= height) ? 'h' : 'v';

    widthorheight = (orientation == 'h') ? width : height;
    let ratiowh = (orientation == 'h') ? height/width : width/height;
    let adj = (orientation == 'h') ? .5 : 2.2;

    let distorsionfactor = 4 * ratiowh * adj;
    //console.log(distorsionfactor);

    // UPDATE DISTORSION
    distorsion = length * distorsionfactor;
    //console.log(distorsion);

    // SLIDE BAR
    /*
    if(orientation() == 'h'){
      d3.select('#slidebar')
        .attr('x', 0)
        .attr('y', height - 50)
        .attr('width', width)
        .attr('height', 50);
    } else {
      d3.select('#slidebar')
        .attr('x', width - 50)
        .attr('y', 0)
        .attr('width', 50)
        .attr('height', height);
    };
    */
  };

  function processimg(d, tempcover){
  	//console.log('process : ' + d);
  	cover[d] = new Image();
  	cover[d].src = tempcover;
  	//console.log(tempcover);
  	cover[d].onerror = function(){
  		console.log('error with : ' + tempcover)
  		erroredcovers.push(d);
  		tempcount += 1;
  		if(tempcount == docidlist.length){ console.log(cover); };
  	};
  	cover[d].onload = function(){
  		tempcount += 1;
  		//console.log(tempcount);
  		if(tempcount == docidlist.length){ console.log(cover); };
  	};
  };

  function draw(){
  	mouseXY = Math.max(0, Math.min(mouseXY, widthorheight-1));
  	upddetailbtn();

  	goodcoverslength = docidlist.length - erroredcovers.length;
  	//console.log(goodcoverslength);

  	docidlist
  		.filter(function(d){ return !erroredcovers.includes(d); })
  		.map(function(d, i){
  			// VARIABLE
  			var a = fisheye(i * widthorheight / goodcoverslength, distorsion, mouseXY, widthorheight);
  			var b = fisheye((i + 1) * widthorheight / goodcoverslength, distorsion, mouseXY, widthorheight);
  			
  			if(orientation() == 'h'){
  				var picheight = height;
  				var picwidth = picheight * cover[d].width / cover[d].height;
  			} else {
  				var picwidth = width;
  				var picheight = picwidth * cover[d].height / cover[d].width;
  			};

  			// PRINT COVERS
  			context.save();
  			context.beginPath();
  			if (orientation() == 'h'){
  				context.rect(a, 0, b - a, picheight);
  			} else {
  				context.rect(0, a, picwidth, b - a);
  			}
  			context.fill()
  			context.clip();
  			if (orientation() == 'h'){
  				context.drawImage(cover[d], a - ((picwidth - (b - a)) / 2), 0, picwidth, picheight);
  				
  				if(mouseXY >= a & mouseXY < b){
  					d3.select('#favbtn')
  						/*.attr("transform", function() {
  							return "translate(" + (a + ((b - a)/2)) + ", 30)";
  						})*/
  						.attr('cx', function(){ return a + ((b - a)/2) })
  						.attr('cy', 15)
  						//.attr('fill', function(e){ return (favdocid.includes(d)) ? 'yellow' : 'white'; });
  						.attr('fill', function(e){ return (favdocid.includes(d)) ? 'url(#favimgred)' : 'url(#favimg)'; });

  					//context.drawImage(cover['fav'], a + ((b - a) / 2), 0, 40, 40);
  				};
  			} else {
  				context.drawImage(cover[d], 0, a - ((picheight - (b - a)) / 2), picwidth, picheight);

  				if(mouseXY >= a & mouseXY < b){
  					d3.select('#favbtn')
  						/*.attr("transform", function() {
  							return "translate(30, " + (a + ((b - a)/2)) + ")";
  						})*/					
  						.attr('cx', 15)
  						.attr('cy', function(){ return a + ((b - a)/2) })
  						//.attr('fill', function(e){ return (favdocid.includes(d)) ? 'yellow' : 'white'; });
  						.attr('fill', function(e){ return (favdocid.includes(d)) ? 'url(#favimgred)' : 'url(#favimg)'; });
  						
  					//context.drawImage(cover['fav'], 0, a + ((b - a) / 2), 40, 40);
  				};
  			};
  			context.restore();
  		});
  };

  function drawhidden(){
  	mouseXY = Math.max(0, Math.min(mouseXY, widthorheight-1));
  	
  	docidlist
  		.filter(function(d){ return !erroredcovers.includes(d); })
  		.map(function(d, i){
  			var a = fisheye(i * widthorheight / goodcoverslength, distorsion, mouseXY, widthorheight);
  			var b = fisheye((i + 1) * widthorheight / goodcoverslength, distorsion, mouseXY, widthorheight);
  			
  			if(orientation() == 'h'){
  				var picheight = height;
  			} else {
  				var picwidth = width;
  			};

  			hiddencontext.beginPath();
  			hiddencontext.fillStyle = datacolorassoc[d];
  			if(orientation() == 'h'){
  				hiddencontext.rect(a, 0, b - a, picheight);
  			} else {
  				hiddencontext.rect(0, a, picwidth, b - a);
  			};		
  			hiddencontext.fill();
  		});
  };



}