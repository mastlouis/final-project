# WebRTC w/ SimplePeer

This demo automatically makes a WebRTC peer-to-peer connection between the 
first two clients that connect to the server. It is intended as a simple demo only;
for production you'd need to use usernames or some othe type of data to initialize
connections.

The [SimplePeer](https://github.com/feross/simple-peer) library is downloaded via CDN, all client-side JavaScript is in the
index.html file. The server is a basic Express server with a WebSocket server to handle
passing WebRTC signalling informaton between clients.

Please fork this project before trying it out, otherwise you might send your camera feed to
some other weirdo connected to this project. Open it up in two different windows / tabs, preferably on
differrent devices. After giving permission to use the camera/mic in both windows, you should see the
associated video feeds appear.