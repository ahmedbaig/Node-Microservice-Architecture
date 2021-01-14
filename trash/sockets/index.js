const express = require("express");
var router = express.Router();
const short = require('short-uuid');
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom,
} = require("./settings/users.settings");
module.exports = function(app) {
    app.io.on('connect', (socket) => {
        console.log(`✔️ Socket Connected`, socket.id);
        socket.on('join', ({ data, room }, callback) => {
            addUser({ socket: socket.id, data, room }).then(({ user }) => {
                socket.join(user.room);
                socket.emit('message', { user: '🛈', text: `${user.data.name}, welcome to chat room.`, userData: user, t: Date.now(), i: true, id: user._id });
                socket.broadcast.to(user.room).emit('message', { user: '🛈', text: `${user.data.name} has joined!`, t: Date.now(), i: true, id: user._id });
                userInRoom(user.room).then(users => {
                    io.to(user.room).emit('roomData', { room: user.room, users });
                })
                callback();
            }).catch(({ error }) => {
                if (error) return callback(error);
            });
        });
        socket.on('room', () => {
            getUser(socket.id).then(user => {
                userInRoom(user.room).then(users => {
                    io.to(user.room).emit('roomData', { room: user.room, users });
                })
            }).catch(error => {
                socket.emit('message', { user: '🛈', text: `You can't send messages`, error, i: true });
            });
        })
        socket.on('disconnect', () => {
            removeUser(socket.id).then((user) => {
                if (user) {
                    io.to(user.room).emit('message', { user: '🛈', text: `${user.data.name} has left.`, i: true });
                    userInRoom(user.room).then(users => {
                        io.to(user.room).emit('roomData', { room: user.room, users });
                    })
                }
            });
        })
        socket.on('sendMessage', ({ message, streamTime }) => {
            if (message != socket.id) {
                getUser(socket.id).then(user => {
                    if (message == null && message == undefined) {
                        socket.emit('message', { user: '🛈', text: `${user.data.name}, you can't send blank messages to chat room.`, userData: user, i: true });
                    } else {
                        if (user.hasOwnProperty('room')) {
                            io.to(user.room).emit('message', { id: short.generate(), user: user.data.name, text: message, userData: user, t: Date.now(), i: false });
                            // ADD MESSAGE TO DATABASE AND KEEP SHORT UUID USED IN MESSAGE EMIT IN DATABASE
                            // addMessage({ socket: socket.id, message, streamTime })
                        }
                    }
                }).catch(error => {
                    socket.emit('message', { user: '🛈', text: `You can't send messages`, error, i: true });
                });
            }
        });
        socket.on('removeMessage', ({ message }) => { // message is an index/id that will be propogated
            if (message != socket.id) {
                getUser(socket.id).then(user => {
                    if (message == null && message == undefined) {
                        socket.emit('message', { user: '🛈', text: `${user.data.name}, you can't delete blank messages from chat room.`, userData: user, i: true });
                    } else {
                        if (user.hasOwnProperty('room')) {
                            // EMIT TO LISTENERS THAT A MESSAGE FROM A USER WAS REMOVED FOR REALTIME MESSAGE DELETING
                            io.to(user.room).emit('messageUpdate', { message, user, type: "remove" });
    
                            // REMOVE MESSAGE FROM DATABASE AND SET 'MESSAGE REMOVED' TEXT
                            // removeMessage({ socket: socket.id, message, streamTime })
                        }
                    }
                }).catch(error => {
                    socket.emit('message', { user: '🛈', text: `You can't send messages`, error, i: true });
                });
            }
        });
        socket.on('removeMessage', ({ id, message }) => { // id is an index/id that will be propogated
            if (message != socket.id) {
                getUser(socket.id).then(user => {
                    if (message == null && message == undefined) {
                        socket.emit('message', { user: '🛈', text: `${user.data.name}, you can't update blank messages from chat room.`, userData: user, i: true });
                    } else {
                        if (user.hasOwnProperty('room')) {
                            // EMIT TO LISTENERS THAT A MESSAGE FROM A USER WAS UPDATED FOR REALTIME MESSAGE UPDATING
                            io.to(user.room).emit('messageUpdate', { id, message, user, type: "update" });
    
                            // UPDATE MESSAGE FROM DATABASE AND SET 'MESSAGE' TEXT
                            // updateMessage({ socket: socket.id, message, streamTime })
                        }
                    }
                }).catch(error => {
                    socket.emit('message', { user: '🛈', text: `You can't send messages`, error, i: true });
                });
            }
        });
    });
}