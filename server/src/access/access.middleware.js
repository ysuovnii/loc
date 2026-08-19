const validateAccessCode = (req, res, next) => {
  const { accessCode } = req.body;

  if (!accessCode) {
    return res.status(400).json({
      success: false,
      message: "Access Code is required",
    });
  }

  next();
};

export default validateAccessCode;
