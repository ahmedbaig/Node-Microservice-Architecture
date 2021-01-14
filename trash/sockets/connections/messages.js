const { chatRoomsData, createMessageData } = require("../Models/chat.model");
const notification = require("../../push_notifications/sendMsg");

module.exports = function (client) {
    console.log("message------");
    let conversation 
   
    client.on("filter-messages", async function ({userId,skip, limit, conversationId, userData}) {
        conversation = await chatRoomsData.findOne({
          userId
        });
        if(!conversation) {
          if(userData) {
            const room =  new chatRoomsData({userId, userData})
           conversation = await room.save()
          } else {
            const room =  new chatRoomsData({userId})
            conversation = await room.save()
          }
        }

        const chat = await createMessageData.find({conversationId: conversationId || conversation._id}).sort({_id: -1}).skip(skip || 0).limit(limit || 10);
        client.emit("getMessage", chat)

    })

    client.on("messages-user", async function (msg) {

      const obj = {
        ...msg,
        conversationId: conversation._id
      }
          
             const msgData =  new createMessageData(obj)
             const chat = await msgData.save()
             client.emit("newMessage", chat)
             notification.sendMsgNoti(chat);
    })
   
    client.on('all-chatRoooms', async () => {
      const allchatRooms = await chatRoomsData.find()
      client.emit('get-chatRooms', allchatRooms)

    })
  };
  