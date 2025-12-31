 const responseFormatter = (req, res, next) => {
  const original = res.json;

res.json = function (payload) {
  if (payload?.error)
    return original.call(this, { success: false, message: payload.error });

  if (payload?.message)
    return original.call(this, { success: true, message: payload.message });

  return original.call(this, { success: true, data: payload });
};


  next();
};

export default responseFormatter