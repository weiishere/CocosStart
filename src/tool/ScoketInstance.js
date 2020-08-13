let scoket_io;

module.exports = {
    scoket_io,
    setIo: (io) => {
        scoket_io = io;
    },
    getScoket: (soktId) => {
        return scoket_io.sockets.sockets[soktId];
    }
}