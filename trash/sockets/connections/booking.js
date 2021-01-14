module.exports = function (socket) {
  console.log("hello new file");
  socket.on("eventName1", function () {
    //...
  });

  socket.on("eventName2", function () {
    //...
  });
};
