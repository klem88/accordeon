function accordeon(divContainerID, inwidth, inheight, platform){

  let width = inwidth;
  let height = inheight;

  let bookscover = {};
  let cover = {};
  let datacolorassoc = {};
  let docidlist = [];
  let mouseXY = 0;
  let orientation;
  let widthorheight, distorsion, distorsionfactor;
  let transitionxyflag = true;
  let slideThickness = 25;

  let context, hiddencontext;
  let maincanvas, hiddencanvas, mainsvg, slidebar, detailbtn;
 
  initDom();
  initSizes();

  this.upd = function(newDocidlist){
    docidlist = [];
    docidlist = newDocidlist;
    
    coverurls();
  }

  this.resize = function(inwidth, inheight){ 
    width = inwidth;
    height = inheight;

    initSizes(); 
    draw(); 
  }

  function initDom(){
    let divcontainer = d3
      .select('#' + divContainerID)
      .append('div')
      .attr('id', divContainerID)
      //.style('top', '50px')
      .style('position', 'fixed');
    
    // CREATE CANVASES
    hiddencanvas = divcontainer
      .append('canvas')
      .attr('id', 'hiddencanvas_' + divContainerID)
      .style('position', 'absolute');
    
    maincanvas = divcontainer
      .append('canvas')
      .attr('id', 'maincanvas_' + divContainerID)
      .style('position', 'absolute');

    // CREATE SVG
    mainsvg = divcontainer
      .append('svg')
      .attr('id', 'mainsvg_' + divContainerID)
      .style('position', 'absolute')
      .style('pointer-events', 'none');

    // SLIDE BAR
    slidebar = mainsvg
      .append('rect')
      .attr('id', 'slidebar_' + divContainerID)
      .attr('fill', 'white')
      .attr('opacity', 0.5)
      .style('pointer-events', 'all');

    // BOUTON DETAILS
    detailbtn = mainsvg
      .append('circle')
      .attr('id', 'detailbtn_' + divContainerID)
      .attr('fill', 'red');

    // GET CONTEXTS
    context = maincanvas.node().getContext("2d");
    hiddencontext = hiddencanvas.node().getContext("2d");

    // SETUP THE EVENT HANDLER ON THE MAIN CANVAS
    maincanvas
      .call(d3.drag()
        .touchable(function(){ return true; })
        .on("start", dragstartaccordion)
        .on("drag", dragwhileaccordion)
        .on("end", dragendaccordion)
      )
      .on('mouseenter', dragstrat)
      .on('mousemove', dragwhile)
      .on('mouseleave', dragend)
      .on('click', function(d){ clickaction(this); })

    // SETUP THE EVENT HANDLER ON THE MAIN CANVAS
    slidebar
      .call(d3.drag()
        .touchable(function(){ return true; })
        .on("start", dragstrat)
        .on("drag", dragwhile)
        .on("end", dragend)
      );
  };

  function initSizes(){
    
    hiddencanvas
      .attr('width', width)
      .attr('height', height);

    maincanvas
      .attr('width', width)
      .attr('height', height);

    mainsvg
      .attr('width', width)
      .attr('height', height);
    
    orientation = (width >= height) ? 'h' : 'v';

    widthorheight = (orientation == 'h') ? width : height;
    
    let ratiowh = (orientation == 'h') ? height/width : width/height;
    let adj = (orientation == 'h') ? .5 : 2.2;

    distorsionfactor = 4 * ratiowh * adj;
    //console.log(distorsionfactor);

    // SLIDE BAR

    if(orientation == 'h'){
      slidebar 
        .attr('x', 0)
        .attr('y', height - slideThickness)
        .attr('width', width)
        .attr('height', slideThickness);
    } else {
      slidebar
        .attr('x', width - slideThickness)
        .attr('y', 0)
        .attr('width', slideThickness)
        .attr('height', height);
    };
  };

  function dragstrat() {
    targetXY = d3.mouse(this)[(orientation=='h')?0:1];
    transitionxy();
    //transitionincanvas();
    event.stopPropagation();
    event.preventDefault();
  };

  function dragwhile() { 

    if(transitionxyflag){
      mouseXY = d3.mouse(this)[(orientation=='h')?0:1];
      draw();
    } else {targetXY = d3.mouse(this)[(orientation=='h')?0:1];};
    event.stopPropagation();
    event.preventDefault();
  };

  function dragend() {
    /*event.stopPropagation();
    event.preventDefault();*/
  };

  function dragstartaccordion(){
    //if(typeof t != 'undefined'){ t.stop() };
    /*event.stopPropagation();
    event.preventDefault();*/
  }

  function dragwhileaccordion(){
    //console.log(d3.event);
    let tempdXY = d3.event[(orientation=='h')?'dx':'dy'] / (docidlist.length / 6);
    mouseXY -= tempdXY;
    draw();
    
    //event.stopPropagation();
    //event.preventDefault();
  };  

  function dragendaccordion(){
    /*t = d3.timer(function(elapsed) {
      //console.log(elapsed);
      mouseXY -= (tempdXY) / (elapsed/100);
      draw();
      if (elapsed > 1500) t.stop();
    }, 0);
    */
    //event.stopPropagation();
    //event.preventDefault();
  };

  function clickaction(that){
    //t.stop();
    drawhidden();
    var mouseX = d3.mouse(that)[0];
    var mouseY = d3.mouse(that)[1];
    var col = hiddencontext.getImageData(mouseX, mouseY, 1, 1).data;
    var colString = "rgb(" + col[0] + "," + col[1] + ","+ col[2] + ")";

    hiddencontext.clearRect(0, 0, width, height);
    currentbookselected = Number(datacolorassoc[colString]);

    //console.log(currentbookselected);

    that.dispatchEvent(new CustomEvent('clickAccordeonEvent', {detail : currentbookselected}));
    /*event.stopPropagation();
    event.preventDefault();*/
  };

  function transitionxy(){
    transitionxyflag = false;
    maincanvas
      .transition()
      .duration(1000)
      .ease(d3.easeQuadInOut)
      .tween('', function(){
        return function(t){
          mouseXY = d3.interpolateNumber(mouseXY, targetXY)(t);
          draw();
        }
      })
      .on('end', function(){ transitionxyflag = true; });
  };

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
          console.log(error);
          
          count += 1;
          if(count == docidlist.length) drawprep();
        }); 
      }
      ;
  }

  function drawprep(){
    
    // UPDATE DISTORSION
    distorsion = docidlist.length * distorsionfactor;
    //console.log(distorsion);

    erroredcovers = [];
    tempcount = 0;
    let test = 0;

    // REMOVE DOCID WITH NO COVERIMG + KEEP THE SAME ORDER
    docidlist.map(function(d, i){
      if(bookscover[d] == undefined) docidlist.splice(i, 1);
    })


    docidlist.map(function(d, i){

      // SETUP A LOCAL DATACOLOR ASSOC
      // WORK AS LONG AS docidlist.length < 255
      datacolorassoc[d] = "rgb(" + i + "," + i + ","+ i + ")";
      datacolorassoc[datacolorassoc[d]] = d;

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
    //console.log(datacolorassoc);
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
      if(tempcount == Object.keys(bookscover).length){ draw(); };
    };
    cover[d].onload = function(){
      tempcount += 1;
      //console.log(tempcount);
      if(tempcount == Object.keys(bookscover).length){ draw(); };
    };
  };

  function draw(){
    mouseXY = Math.max(0, Math.min(mouseXY, widthorheight-1));
    upddetailbtn();

    goodcoverslength = docidlist.length - erroredcovers.length;

    docidlist
      .filter(function(d){ return !erroredcovers.includes(d); })
      .map(function(d, i){
        // VARIABLE
        var a = fisheye(i * widthorheight / goodcoverslength, distorsion, mouseXY, widthorheight);
        var b = fisheye((i + 1) * widthorheight / goodcoverslength, distorsion, mouseXY, widthorheight);

        if(orientation == 'h'){
          var picheight = height;
          var picwidth = picheight * cover[d].width / cover[d].height;
        } else {
          var picwidth = width;
          var picheight = picwidth * cover[d].height / cover[d].width;
        };

        // PRINT COVERS
        context.save();
        context.beginPath();
        if (orientation == 'h'){
          context.rect(a, 0, b - a, picheight);
        } else {
          context.rect(0, a, picwidth, b - a);
        }
        context.globalCompositeOperation='destination-out';
        context.fill()
        context.globalCompositeOperation='source-over';
        context.clip();
        if (orientation == 'h'){
          context.drawImage(cover[d], a - ((picwidth - (b - a)) / 2), 0, picwidth, picheight);      
        } else {
          context.drawImage(cover[d], 0, a - ((picheight - (b - a)) / 2), picwidth, picheight);
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
        
        if(orientation == 'h'){
          var picheight = height;
        } else {
          var picwidth = width;
        };

        hiddencontext.beginPath();
        hiddencontext.fillStyle = datacolorassoc[d];
        if(orientation == 'h'){
          hiddencontext.rect(a, 0, b - a, picheight);
        } else {
          hiddencontext.rect(0, a, picwidth, b - a);
        };    
        hiddencontext.fill();
      });
  }; 

  function upddetailbtn(){
    if (orientation=='h') {
      detailbtn
        .attr('cx', mouseXY)
        .attr('cy', height - slideThickness/2) 
        .attr('r', slideThickness/2)
    } else {
      detailbtn
        .attr('cx', width - slideThickness/2)
        .attr('cy', mouseXY)
        .attr('r', slideThickness/2)
    };    
  };

  function fisheye(x, disto, mousecoord, max){
    var left = x < mousecoord;

    var min = 0;

    var offset = left ? mousecoord - min : max - mousecoord;
    let distfrommouse = Math.abs(x - mousecoord);
    let rightorleft = left ? -1 : 1;
    //if (offset == 0) offset = max - min;
    return Number(mousecoord) + Number(rightorleft * offset * (disto + 1) / (disto + (offset / distfrommouse)));
  };

}