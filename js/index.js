tl = new TimelineMax({paused: true, delay: 2});

tl
  .from('.ziggy', 1, { opacity: 0 })
  .from('.ziggy1', 3, {delay: 3, opacity: 0 })
  .staggerFrom('.middle h1, .middle h2', 1, { y: 10, opacity: 0, delay: 3 }, 0.5)
  .from('.player', 1.5, { xPercent: '100%', delay: 3});

$('.player').on('click', function(){
  alert('click!');
});

paper.install(window);
var SQRT_3 = Math.pow(3, 0.5);
var D, mousePos, position;
var count = 150;

window.onload = function() {
  paper.setup('space');

  D = Math.max(paper.view.getSize().width, paper.view.getSize().height);

  mousePos = paper.view.center.add([view.bounds.width / 3, 100]);
  position = paper.view.center;

  // Draw the BG
  var background = new Path.Rectangle(view.bounds);
  background.fillColor = '#000';
  buildStars();

  paper.view.draw();

  paper.view.onFrame = function(event) {
    position = position.add( (mousePos.subtract(position).divide(10) ) );
    var vector = (view.center.subtract(position)).divide(10);
    moveStars(vector.multiply(1));
  };
  
  // Show years
  tl.play();
};



// ---------------------------------------------------
//  Helpers
// ---------------------------------------------------
window.onresize = function() {
  project.clear();
  D = Math.max(paper.view.getSize().width, paper.view.getSize().height);
  // Draw the BG
  var background = new Path.Rectangle(view.bounds);
  background.fillColor = '#000';
  buildStars();
};

var random = function(minimum, maximum) {
  return Math.round(Math.random() * (maximum - minimum) + minimum);
};

var map = function (n, start1, stop1, start2, stop2) {
  return (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
};

// ---------------------------------------------------
//  Stars (from paperjs.org examples section)
// ---------------------------------------------------
// window.onmousemove = function(event) {
//   mousePos.x = event.x;
//   mousePos.y = event.y;
// };

var buildStars = function() {
  // Create a symbol, which we will use to place instances of later:
  var path = new Path.Circle({
    center: [0, 0],
    radius: 3,
    fillColor: 'white',
    strokeColor: 'purple',
    strokeWidth: 2
  });

  var symbol = new Symbol(path);

  // Place the instances of the symbol:
  for (var i = 0; i < count; i++) {
    // The center position is a random point in the view:
    var center = Point.random().multiply(paper.view.size);
    var placed = symbol.place(center);
    placed.scale(i / count + 0.01);
    placed.data = {
      vector: new Point({
        angle: Math.random() * 360,
        length : (i / count) * Math.random() / 5
      })
    };
  }

  var vector = new Point({
    angle: 45,
    length: 0
  });
};

var keepInView = function(item) {
  var position = item.position;
  var viewBounds = paper.view.bounds;
  if (position.isInside(viewBounds))
    return;
  var itemBounds = item.bounds;
  if (position.x > viewBounds.width + 5) {
    position.x = -item.bounds.width;
  }

  if (position.x < -itemBounds.width - 5) {
    position.x = viewBounds.width;
  }

  if (position.y > viewBounds.height + 5) {
    position.y = -itemBounds.height;
  }

  if (position.y < -itemBounds.height - 5) {
    position.y = viewBounds.height
  }
};

var moveStars = function(vector) {
  // Run through the active layer's children list and change
  // the position of the placed symbols:
  var layer = project.activeLayer;
  for (var i = 1; i < count + 1; i++) {
    var item = layer.children[i];
    var size = item.bounds.size;
    var length = vector.length / 10 * size.width / 10;
    item.position = item.position.add( vector.normalize(length).add(item.data.vector));
    keepInView(item);
  }
};



























let rid = null; // request animation id
const SVG_NS = "http://www.w3.org/2000/svg";
const pathlength = shape.getTotalLength();

let t = 0; // at the begining of the path
let lengthAtT = pathlength * t;

let d = shape.getAttribute("d");

// 1. build the d array
let n = d.match(/C/gi).length; // how many times

let pos = 0; // the position, used to find the indexOf the nth C

class subPath {
  constructor(d) {
    this.d = d;
    this.get_PointsRy();
    this.previous = subpaths.length > 0 ? subpaths[subpaths.length - 1] : null;
    this.measurePath();
    this.get_M_Point(); //lastPoint
    this.lastCubicBezier;
    this.get_lastCubicBezier();
  }

  get_PointsRy() {
    this.pointsRy = [];
    let temp = this.d.split(/[A-Z,a-z\s,]/).filter(v => v); // remove empty elements
    temp.map(item => {
      this.pointsRy.push(parseFloat(item));
    }); //this.pointsRy numbers not strings
  }

  measurePath() {
    let path = document.createElementNS(SVG_NS, "path");
    path.setAttributeNS(null, "d", this.d);
    // no need to append it to the SVG
    // the lengths of every path in dry
    this.pathLength = path.getTotalLength();
  }

  get_M_Point() {
    if (this.previous) {
      let p = this.previous.pointsRy;
      let l = p.length;
      this.M_point = [p[l - 2], p[l - 1]];
    } else {
      let p = this.pointsRy;
      this.M_point = [p[0], p[1]];
    }
  }

  get_lastCubicBezier() {
    let lastIndexOfC = this.d.lastIndexOf("C");
    let temp = this.d
    .substring(lastIndexOfC + 1)
    .split(/[\s,]/)
    .filter(v => v);
    let _temp = [];
    temp.map(item => {
      _temp.push(parseFloat(item));
    });
    this.lastCubicBezier = [this.M_point];
    for (let i = 0; i < _temp.length; i += 2) {
      this.lastCubicBezier.push(_temp.slice(i, i + 2));
    }
  }
}

let subpaths = [];

// create new subPaths
for (let i = 0; i < n; i++) {
  // finds the of nth C in d
  let newpos = d.indexOf("C", pos + 1);
  if (i > 0) {
    // if it's not the first C
    let sPath = new subPath(d.substring(0, newpos));
    subpaths.push(sPath);
  }
  //change the value of the position pos
  pos = newpos;
}
// at the end add d to the subpaths array
subpaths.push(new subPath(d));

// 2. get the index of the bezierLengths where the point at t is
let index;
for (index = 0; index < subpaths.length; index++) {
  if (subpaths[index].pathLength >= lengthAtT) {
    break;
  }
}

function get_T(t, index) {
  let T;
  lengthAtT = pathlength * t;
  if (index > 0) {
    T =
    (lengthAtT - subpaths[index].previous.pathLength) /
    (subpaths[index].pathLength - subpaths[index].previous.pathLength);
  } else {
    T = lengthAtT / subpaths[index].pathLength;
  }
  //console.log(T)
  return T;
}

let T = get_T(t, index);

let newPoints = getBezierPoints(T, subpaths[index].lastCubicBezier);

drawCBezier(newPoints, partialPath, index);

function getBezierPoints(t, points) {
  let helperPoints = [];

  // helper points 0,1,2
  for (let i = 1; i < 4; i++) {
    //points.length must be 4 !!!
    let p = lerp(points[i - 1], points[i], t);
    helperPoints.push(p);
  }

  // helper points 3,4
  helperPoints.push(lerp(helperPoints[0], helperPoints[1], t));
  helperPoints.push(lerp(helperPoints[1], helperPoints[2], t));

  // helper point 5 is where the first Bézier ends and where the second Bézier begins
  helperPoints.push(lerp(helperPoints[3], helperPoints[4], t));

  // points for the dynamic bézier
  let firstBezier = [
  points[0],
  helperPoints[0],
  helperPoints[3],
  helperPoints[5]
  ];
  //console.log(firstBezier)
  return firstBezier;
}

function lerp(A, B, t) {
  // a virtual line from A to B
  // get the position of a point on this line
  // if(t == .5) the point in in the center of the line
  // 0 <= t <= 1
  let ry = [
    (B[0] - A[0]) * t + A[0], //x
    (B[1] - A[1]) * t + A[1] //y
    ];
    return ry;
  }

  function drawCBezier(points, path, index) {
    let d;

    if (index > 0) {
      d = subpaths[index].previous.d;
    } else {
      d = `M${points[0][0]},${points[0][1]} C`;
    }

  // points.length == 4
  for (let i = 1; i < 4; i++) {
    d += ` ${points[i][0]},${points[i][1]} `;
  }
  //console.log(d)
  partialPath.setAttributeNS(null, "d", d);
}

/*
_t.addEventListener("input", ()=>{
  t = _t.value;
  lengthAtT = pathlength*t;
  for(index = 0; index < subpaths.length; index++){
if(subpaths[index].pathLength >= lengthAtT){break; }  
}
  T = get_T(t, index); 
  newPoints = getBezierPoints(T,subpaths[index].lastCubicBezier);
  drawCBezier(newPoints, partialPath, index);
})*/

t = 0.025;
function Typing() {
  rid = window.requestAnimationFrame(Typing);
  if (t >= 1) {
    window.cancelAnimationFrame(rid);
    rid = null;
  } else {
    t += 0.0025;
  }

  lengthAtT = pathlength * t;
  for (index = 0; index < subpaths.length; index++) {
    if (subpaths[index].pathLength >= lengthAtT) {
      break;
    }
  }
  T = get_T(t, index);
  newPoints = getBezierPoints(T, subpaths[index].lastCubicBezier);
  drawCBezier(newPoints, partialPath, index);
}

Typing();
theSvg.addEventListener("click", () => {
  if (rid) {
    window.cancelAnimationFrame(rid);
    rid = null;
  } else {
    if (t >= 1) {
      t = 0.025;
    }
    rid = window.requestAnimationFrame(Typing);
  }
});

cb.addEventListener("input", () => {
  if (cb.checked) {
    useThePath.style.display = "block";
  } else {
    useThePath.style.display = "none";
  }
});
