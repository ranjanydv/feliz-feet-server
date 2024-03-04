const successResponse = ({ res, statusCode, message, count, resData, token, }) => {
  return res.status(statusCode).json({
    success: true,
    data: {
      message: message,
      statusCode: statusCode,
      count: count,
      data: resData,
      token,
    },
  });
};

const errorResponse = ({ res, statusCode, message, resData }) => {
  return res.status(statusCode).json({
    success: false,
    data: {
      message: message,
      statusCode: statusCode,
      data: resData,
    },
  });
};

module.exports = { successResponse, errorResponse };
