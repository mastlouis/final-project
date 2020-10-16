const setup = function() {
    let rtcConnected = false,
        Peer = SimplePeer,
        p = null;

    const socketReady = new Promise( (resolve, reject) => {
      ws = new WebSocket(`ws://${window.location.host}`);

      ws.onopen = () => {

        ws.onmessage = __msg => {
          const msg = JSON.parse( __msg.data )
          if( msg.address === 'connect' )  {
            resolve( msg.initiator )
          }else{
            p.signal( msg );
          }
        };
      };
    });

    const makeConnection = function(initiator) {
      console.log("making connection");
      ws.send( initiator );
    };

    Promise.all( [connectUserMedia(), socketReady] ).then( values => {
      const stream = values[0];
      connectStreamToVideo(stream, document.querySelector("#myVideo"));

      p = new Peer({
        initiator: values[1],
        trickle: false,
        stream
      });

      p.on("signal", data => {
        makeConnection( JSON.stringify(data) );
      });

      p.on("stream", stream => {
        // got remote video stream, now let's show it in a video tag
        connectStreamToVideo(stream, document.querySelector("#peerVideo"));
      })
    })
}

const connectUserMedia = function() {
    // Returns a promise
    return navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
    });
}

const connectStreamToVideo = function(stream, video) { 
    if ("srcObject" in video) {
        video.srcObject = stream;
      } else {
        video.src = window.URL.createObjectURL(stream);
    }
    video.play();
}

window.onload = function onload() {
    setup();
}