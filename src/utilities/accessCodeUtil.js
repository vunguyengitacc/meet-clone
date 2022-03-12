const { default: Room } = require('db/models/room');

export const getAccessCode = async () => {
  try {
    //97 - 122
    let flag = false;
    let temp = '';
    while (!flag) {
      temp = '';
      for (let i = 0; i < 10; ++i) {
        let char = Math.floor(Math.random() * (122 - 97)) + 97;
        if (i === 4 || i === 7) temp += '-';
        temp += String.fromCharCode(char);
      }
      let checker = await Room.findOne({ accessCode: temp }).lean();
      if (!checker) flag = true;
    }
    return temp;
  } catch (error) {}
};
