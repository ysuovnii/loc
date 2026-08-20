export const ACCESS_CODE_REGEX = /^[A-F0-9]{8}$/;

const validateAccessCode = (req, res, next) => {
  const { accessCode } = req.body;

  if (typeof accessCode !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Access Code is required',
    });
  }

  const trimmed = accessCode.trim();

  if (!ACCESS_CODE_REGEX.test(trimmed)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid access code format',
    });
  }

  req.body.accessCode = trimmed.toUpperCase();

  next();
};

export default validateAccessCode;
