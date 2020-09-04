function accordeon(divContainerID, platform/*, inwidth, inheight*/){

/*  let width = inwidth;
  let height = inheight;*/

  let bookscover = {};
  let cover = {};
  let datacolorassoc = {};
  let docidlist = [];
  let erroredcovers = [];
  let mouseXY = 0;
  let orientation;
  let widthorheight, distorsion, distorsionfactor, oneCoverDistance;
  let transitionxyflag = true;
  let coverInAccCount = 0;

  let width, height;
  let context, hiddencontext;
  let divcontainer, maincanvas, hiddencanvas, mainsvg, slidebar, detailbtn;

  let animToDelete, flagMoved, speed, speedScale;

  const slideThickness = 25;
  const btnThickness = 50;
  const speedRange = [.05, 2.5];
  const onHoldThreshold = 200;
  const animWhileWaitingDuration1 = 1500;
  const animWhileWaitingDuration2 = 2000;

  let requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  let cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

  initDom();
  initSizes();

  this.upd = function(newDocidlist){
    bookscover = {};
    cover = {};
    datacolorassoc = {};
    erroredcovers = [];
    mouseXY = 0;
    coverInAccCount = 0;

    docidlist = [];
    docidlist = newDocidlist;
    
    coverurls();
  }

  this.anim = function(){
    animWhileWaiting();
  };

  this.resize = function(/*inwidth, inheight*/){ 
  /*  let width = inwidth;
    let height = inheight;*/
    width = divcontainer.node().clientWidth;
    height = divcontainer.node().clientHeight;
    console.log('width : ' + width);
    console.log('height : ' + height);
    
    initSizes(); 
    draw(); 
  }

  function animWhileWaiting(){
    let startTime = 0;

    animToDelete = requestAnimationFrame(function(timestamp){
      startTime = timestamp;
      step(timestamp)
    });

    console.log(d3.easePolyInOut(0.1));
    console.log(d3.easePolyInOut(0.5));
    console.log(d3.easePolyInOut(0.9));

    function step(timestamp){
      /*console.log(timestamp);
      console.log(startTime);*/
      let duration = timestamp - startTime;

      //console.log(duration);
      
      if(duration < animWhileWaitingDuration1) {
        //mouseXY += .01 * duration;
        mouseXY = d3.easePolyIn(duration / animWhileWaitingDuration1) * widthorheight;
        drawAnim();
        animToDelete = requestAnimationFrame(step);
      } else if(duration >= animWhileWaitingDuration1 & duration < (animWhileWaitingDuration1 + animWhileWaitingDuration2)) {
        //mouseXY += .01 * duration;
        mouseXY = d3.easePolyIn(1 - ((duration - animWhileWaitingDuration1) / animWhileWaitingDuration2)) * widthorheight;
        draw();
        animToDelete = requestAnimationFrame(step);
      } else {
        cancelAnimationFrame(animToDelete);
        mouseXY = 0
      };
    };

  };

  function drawAnim(timestamp){
    upddetailbtn();
    context.clearRect(0, 0, width, height);

    docidlist
      .map(function(d, i){
        var a = fisheye(i * widthorheight / docidlist.length, distorsion, mouseXY, widthorheight);
        var b = fisheye((i + 1) * widthorheight / docidlist.length, distorsion, mouseXY, widthorheight);
        
        if(orientation == 'h'){
          var picheight = height;
        } else {
          var picwidth = width;
        };

        context.beginPath();
        context.fillStyle =  d3.interpolateRainbow(i/docidlist.length);
        if(orientation == 'h'){
          context.rect(a, 0, b - a, picheight);
        } else {
          context.rect(0, a, picwidth, b - a);
        };
        context.fill();
        context.strokeStyle = 'white';
        context.lineWidth = 5;
        context.stroke();
      });
  };

  function initDom(){
    divcontainer = d3
      .select('#' + divContainerID)
      /*.append('div')
      .attr('id', divContainerID)
      //.style('top', '50px')
      .style('position', 'fixed');*/

    width = divcontainer.node().clientWidth;
    height = divcontainer.node().clientHeight;
    console.log('width : ' + width);
    console.log('height : ' + height);
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

    // CONTROL BUTTON RIGHT / DOWN
    ctrlBtnRight = mainsvg
      .append('rect')
      .attr('id', 'ctrlBtnRight_' + divContainerID)
      .attr('fill', 'black')
      .attr('opacity', 0.5)
      .style('pointer-events', 'all');

    // CONTROL BUTTON LEFT / UP
    ctrlBtnLeft = mainsvg
      .append('rect')
      .attr('id', 'ctrlBtnLeft_' + divContainerID)
      .attr('fill', 'black')
      .attr('opacity', 0.5)
      .style('pointer-events', 'all');

    // BOUTON DETAILS
    detailbtn = mainsvg
      .append('circle')
      .attr('id', 'detailbtn_' + divContainerID)
      .attr('fill', 'red')
      .attr('r', slideThickness/2)
      .style('pointer-events', 'all');

    // GET CONTEXTS
    context = maincanvas.node().getContext("2d");
    hiddencontext = hiddencanvas.node().getContext("2d");

    //
    // SETUP THE EVENT HANDLERS
    //
    maincanvas
      .call(d3.drag()
        .touchable(function(){ return true; })
        //.on("start", dragstartaccordion)
        .on("drag", dragwhileaccordion)
        //.on("end", dragendaccordion)
      )
      //.on('mouseenter', dragstrat)
      //.on('mousemove', dragwhile)
      //.on('mouseleave', dragend)
      .on('click', function(d){ clickaction(this); })

    slidebar
      .call(d3.drag()
        .touchable(function(){ return true; })
        .on("start", dragstrat)
        //.on("drag", dragwhile)
        //.on("end", dragend)
      );

    detailbtn
      .call(d3.drag()
        .touchable(function(){ return true; })    
        .on("drag", dragWhileBtnDetail)
      )
      .on('mouseover touchstart', function(){
        d3.select(this)
          .transition(500)
          .attr('r', slideThickness);
      })
      .on('mouseout touchend', function(){
        d3.select(this)
          .transition(500)
          .attr('r', slideThickness/2);
      });

    ctrlBtnRight
      .call(d3.drag()
        .touchable(function(){ return true; })
        .on('start', function(){ dragStartBtnRight(this, 'forward') })
        .on('drag', dragWhileBtnRight)
        .on('end', function(){ dragEndBtnRight('forward') })
      )

    ctrlBtnLeft
      .call(d3.drag()
        .touchable(function(){ return true; })
        .on('start', function(){ dragStartBtnRight(this, 'backward') })
        .on('drag', dragWhileBtnRight)
        .on('end', function(){ dragEndBtnRight('backward') })
      )      
  };

  function dragStartBtnRight(that, dir){
    speed = speedScale(d3.mouse(that)[(orientation=='h')?1:0]);
    let startTime = 0;

    animToDelete = requestAnimationFrame(function(timestamp){
      startTime = timestamp;
      step(timestamp)
    });

    function step(timestamp){
      /*console.log(timestamp);
      console.log(startTime);*/
      let duration = timestamp - startTime;
      if(duration > onHoldThreshold) moveForward(speed);
      animToDelete = requestAnimationFrame(step);
    };

    function moveForward(speed){
      flagMoved = true;
      if(dir == 'forward') { mouseXY += speed } else { mouseXY -= speed };
      coverInAccCount = Math.round(mouseXY / oneCoverDistance);
      draw();
    };    
  };

  function dragWhileBtnRight(){
    speed = speedScale(d3.mouse(this)[(orientation=='h')?1:0]);
  };

  function dragEndBtnRight(dir){
    cancelAnimationFrame(animToDelete);

    if(!flagMoved) ctrlBtnEvent(dir);
    flagMoved = false;
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

    // SLIDE BAR AND ACTION BUTTONS

    if(orientation == 'h'){
      slidebar 
        .attr('x', 0)
        .attr('y', height - slideThickness)
        .attr('width', width)
        .attr('height', slideThickness);

       ctrlBtnRight
        .attr('x', width - btnThickness)
        .attr('y', 0)
        .attr('width', btnThickness)
        .attr('height', height - slideThickness);

       ctrlBtnLeft
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', btnThickness)
        .attr('height', height - slideThickness);
        
    } else {
      slidebar
        .attr('x', width - slideThickness)
        .attr('y', 0)
        .attr('width', slideThickness)
        .attr('height', height);

       ctrlBtnRight
        .attr('x', 0)
        .attr('y', height - btnThickness)
        .attr('width', width - slideThickness)
        .attr('height', btnThickness);

       ctrlBtnLeft
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width - slideThickness)
        .attr('height', btnThickness);
    };

    speedScale = d3
      .scaleLinear()
      .range(speedRange)
      .domain([(orientation == 'h') ? height : width, 0])
      .clamp(true);
  };

  function dragstrat() {
    let targetXY = d3.mouse(this)[(orientation=='h')?0:1];
    coverInAccCount = Math.round(targetXY / oneCoverDistance);
    transitionxy(targetXY);

    //transitionincanvas();
    event.stopPropagation();
    event.preventDefault();
  };

  function dragwhile() { 

    if(transitionxyflag){
      mouseXY = d3.mouse(this)[(orientation=='h')?0:1];
      coverInAccCount = Math.round(mouseXY / oneCoverDistance);
      draw();
    } else {
      let targetXY = d3.mouse(this)[(orientation=='h')?0:1];
      coverInAccCount = Math.round(targetXY / oneCoverDistance);
    };
    /*event.stopPropagation();
    event.preventDefault();*/
  };

  function dragend() {
    let targetXY = d3.mouse(this)[(orientation=='h')?0:1];
    transitionxy(targetXY);
    event.stopPropagation();
    event.preventDefault();
  };

  function dragWhileBtnDetail(){
    mouseXY = d3.mouse(this)[(orientation=='h')?0:1];
    coverInAccCount = Math.round(mouseXY / oneCoverDistance);
    draw();
  };

  function dragstartaccordion(){
    //if(typeof t != 'undefined'){ t.stop() };
    /*event.stopPropagation();
    event.preventDefault();*/
  };

  function dragwhileaccordion(){
    //console.log(d3.event);
    let tempdXY = d3.event[(orientation=='h')?'dx':'dy'] / (docidlist.length / 6);
    mouseXY -= tempdXY;
    coverInAccCount = Math.round(mouseXY / oneCoverDistance);
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

  function ctrlBtnEvent(dir){
    if(dir == 'forward' & coverInAccCount < docidlist.length) coverInAccCount += 1; 
    if(dir == 'backward' & coverInAccCount >= 1) coverInAccCount -= 1;
    mouseXY = (oneCoverDistance * coverInAccCount); // - (oneCoverDistance / 2);
    //console.log(mouseXY);
    draw();
  };

  function transitionxy(targetXY){
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
          if(res.success == 1) bookscover[docid] = res.result.coverimg.replace('static.cyberlibris.fr', 'static2.cyberlibris.com');
          if(count == docidlist.length) drawprep();
        })
        .catch(function(error){
          console.log(error);
          
          count += 1;
          if(count == docidlist.length) drawprep();
        }); 
      }
      ;
  };

  function drawprep(){
    
    // UPDATE DISTORSION
    distorsion = docidlist.length * distorsionfactor;
    //console.log(distorsion);

    erroredcovers = [];
    tempcount = 0;
    let test = 0;

    // REMOVE DOCID WITH NO COVERIMG + KEEP THE SAME ORDER
    docidlist = docidlist.filter(function(d){
      return typeof bookscover[d] != 'undefined';
    })

    oneCoverDistance = widthorheight / docidlist.length;

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
      if(tempcount == Object.keys(bookscover).length){ 
        //draw(); 
      };
    };
    cover[d].onload = function(){
      tempcount += 1;
      //console.log(tempcount);
      if(tempcount == Object.keys(bookscover).length){ 
        //draw(); 
      };
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
    } else {
      detailbtn
        .attr('cx', width - slideThickness/2)
        .attr('cy', mouseXY)
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