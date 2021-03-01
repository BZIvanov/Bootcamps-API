const TYPES = ['info', 'success', 'warning'];

module.exports = (type, message, err = '') => {
  if (!TYPES.includes(type) || !message) {
    return console.log('Incorrect message format.');
  }

  const logs = {
    info: () => console.log(message.cyan.underline, err),
    success: () => console.log(message.green.underline.bold, err),
    warning: () => console.log(message.red.underline.bold, err),
  };

  return logs[type]();
};
