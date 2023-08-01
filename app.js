const WAMS = require("wams"); 
const path = require("node:path");

/*

This demo shows how the viewScale (zoom) will change relative client size and desired viewing canvas size.
The viewing canvas size will always be in view of the client at that scale.

Included are two objects, one in absolute generation terms and the other in relative terms.
You can move objects between clients by dragging them to the far right edge. 

The third client and on will be zoomed in at twice the regular zoom.

*/

const { image } = WAMS.predefined.items;
const { drag } = WAMS.predefined.actions;
const { LineLayout } = WAMS.predefined.layouts;

// Intended viewing canvas dimension. It will scale to the proper size for all devices in one dimension (either x or y)
const mWidth = 1000; 
const mHeight = 1100;

// configure client-client interaction
const overlap = 0; //amount of overlap between each client's screen.
const line = new LineLayout(overlap);

const app = new WAMS.Application({
  //status: true, // delete the comment syntax to create debug info on top left of client. 
  color: 'white',
  title: "WAMS scale solution",
});

app.addStaticDirectory(path.join(__dirname, './src'))

// Elmo absolute image (reference)
const elmo = app.spawn(
  image('elmo.png', {
    width: 953,
    height: 1004,
    x: 0,
    y: 150,
  })
);
elmo.on('drag', drag)

// Example of dynamic positioning
const seagal = app.spawn(
  image('steven_seagal.jpg', {
    width: 400,
    height: 267,
    x: mWidth*0.75, // Don't recommended setting multiplier <1 as canvas size is dictated by the smallest main/dimension ratio
    y: mHeight*0.5,
  })
);
seagal.on('drag', drag)


// The following code handles client-server connection
const viewGroup = app.createViewGroup();

function handleConnect({ view, device}) {  // Handles incoming connectiosn to server

  // Determines the ratio between the object size and browser size. It then sets the value to the limiting dimension, so that the image doesn't spillover.
  const scaleRatio = Math.min(device.width / mWidth, device.height / mHeight); 
  console.log(scaleRatio) //logs the ratio in server console of each user.

  view.scale = scaleRatio; //sets the client zoom to our intended canvas size, no matter the client browser dimension.

  viewGroup.add(view); // adds all clients to one unified canvas
  line.layout(view, device); // adds all new clients to the right of the one preceeding it.

  if (view.index > 1) {
    view.scale = scaleRatio*2;
  }
}

app.on('connect', handleConnect); // Function handleConnect() runs after each new device enters, and won't change 
app.listen(8080);